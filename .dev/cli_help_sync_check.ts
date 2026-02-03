// deno-lint-ignore-file no-console

/**
 * CLI Help Sync Checker
 *
 * Verifies that CLI help text in bin/cli.ts (printHelp function)
 * is synchronized with actual API methods and their parameters from Valibot schemas.
 *
 * Usage: deno run -A .dev/cli_help_sync_check.ts
 */

import * as path from "jsr:@std/path@1";

// =============================================================================
// TYPES
// =============================================================================

/** Valibot schema structure */
interface ValibotSchema {
  type?: string;
  entries?: Record<string, ValibotSchema>;
  options?: ValibotSchema[]; // v.variant, v.union
  allOf?: ValibotSchema[]; // v.intersect (internal representation)
  wrapped?: ValibotSchema; // v.optional, v.nullable, etc.
}

/** Parsed parameter */
interface Param {
  name: string;
  required: boolean;
}

/** Parsed method */
interface Method {
  name: string;
  params: Map<string, Param>;
}

/** Sync error */
interface SyncError {
  methodName: string;
  endpoint: string;
  errorType: string;
  details: string;
  filePath: string;
}

/** API endpoint configuration */
interface ApiEndpoint {
  name: string;
  methodsDir: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Endpoints to check */
const API_ENDPOINTS: ApiEndpoint[] = [
  { name: "info", methodsDir: "src/api/info/_methods" },
  { name: "exchange", methodsDir: "src/api/exchange/_methods" },
];

/** CLI file path */
const CLI_PATH = "bin/cli.ts";

// =============================================================================
// VALIBOT SCHEMA PARSING
// =============================================================================

/** Valibot object schema types that have `entries` property */
const OBJECT_SCHEMA_TYPES = new Set([
  "object",
  "loose_object",
  "strict_object",
  "object_with_rest",
]);

/** Convert method name to schema name (e.g., "order" -> "OrderRequest") */
function toSchemaName(methodName: string, suffix: string): string {
  return methodName.charAt(0).toUpperCase() + methodName.slice(1) + suffix;
}

/** Check if a Valibot schema is an object type with entries */
function isObjectSchema(schema: ValibotSchema): boolean {
  return schema?.type !== undefined && OBJECT_SCHEMA_TYPES.has(schema.type);
}

/** Check if a Valibot schema is optional (parameter can be omitted) */
function isOptionalSchema(schema: ValibotSchema): boolean {
  // v.optional() - parameter can be omitted
  // v.exactOptional() - parameter can be omitted (but doesn't accept explicit undefined)
  // v.nullish() - parameter can be omitted or null
  // v.nullable() - parameter is required but can be null (NOT optional!)
  // v.undefinedable() - parameter is required but can be undefined (NOT optional!)
  return schema?.type === "optional" ||
    schema?.type === "exact_optional" ||
    schema?.type === "nullish";
}

/** Extract parameters from a Valibot object schema entries */
function extractParamsFromEntries(
  entries: Record<string, ValibotSchema>,
  excludeFields?: Set<string>,
): Map<string, Param> {
  const params = new Map<string, Param>();

  for (const [name, schema] of Object.entries(entries)) {
    if (excludeFields?.has(name)) continue;

    params.set(name, {
      name,
      required: !isOptionalSchema(schema),
    });
  }

  return params;
}

/** Extract parameters from v.variant/v.union options (all params are optional since they're mutually exclusive) */
function extractParamsFromVariantOrUnion(
  options: ValibotSchema[],
  excludeFields?: Set<string>,
): Map<string, Param> {
  const params = new Map<string, Param>();

  for (const option of options) {
    if (!isObjectSchema(option) || !option.entries) continue;

    for (const name of Object.keys(option.entries)) {
      if (excludeFields?.has(name)) continue;
      if (params.has(name)) continue;

      // All variant/union params are optional (mutually exclusive choices)
      params.set(name, {
        name,
        required: false,
      });
    }
  }

  return params;
}

/** Extract parameters from v.intersect options (merges all entries, keeps strictest required status) */
function extractParamsFromIntersect(
  options: ValibotSchema[],
  excludeFields?: Set<string>,
): Map<string, Param> {
  const params = new Map<string, Param>();

  for (const option of options) {
    if (!isObjectSchema(option) || !option.entries) continue;

    for (const [name, schema] of Object.entries(option.entries)) {
      if (excludeFields?.has(name)) continue;

      const isRequired = !isOptionalSchema(schema);

      if (params.has(name)) {
        // If param exists, it's required if ANY schema marks it required
        const existing = params.get(name)!;
        if (isRequired && !existing.required) {
          existing.required = true;
        }
      } else {
        params.set(name, {
          name,
          required: isRequired,
        });
      }
    }
  }

  return params;
}

/** Parse excluded fields from v.omit() call in source code */
function parseOmitFields(sourceCode: string, schemaName: string): Set<string> | null {
  // Look for pattern: const SchemaName = ... v.omit(..., ["field1", "field2", ...])
  const omitPattern = new RegExp(
    `const\\s+${schemaName}\\s*=.*?v\\.omit\\([^,]+,\\s*\\[([^\\]]+)\\]`,
    "s",
  );
  const match = sourceCode.match(omitPattern);
  if (!match) return null;

  // Extract field names from the array
  const fieldsStr = match[1];
  const fields = new Set<string>();
  const fieldPattern = /["'](\w+)["']/g;
  let fieldMatch;
  while ((fieldMatch = fieldPattern.exec(fieldsStr)) !== null) {
    fields.add(fieldMatch[1]);
  }

  return fields.size > 0 ? fields : null;
}

/** Load and parse API methods from _methods directory */
async function loadApiMethods(endpoint: ApiEndpoint): Promise<Map<string, Method>> {
  const methods = new Map<string, Method>();
  const projectRoot = Deno.cwd();
  const methodsDir = path.join(projectRoot, endpoint.methodsDir);

  // Read directory
  for await (const entry of Deno.readDir(methodsDir)) {
    if (!entry.isFile || !entry.name.endsWith(".ts")) continue;
    // Skip _base directory files
    if (entry.name.startsWith("_")) continue;

    const methodName = entry.name.replace(".ts", "");
    const filePath = path.join(methodsDir, entry.name);

    try {
      // Read source code for parsing v.omit() fields
      const sourceCode = await Deno.readTextFile(filePath);

      // Dynamically import the module
      const module = await import("file://" + filePath);

      // Find the *Request schema
      const requestSchemaName = toSchemaName(methodName, "Request");
      const requestSchema = module[requestSchemaName] as ValibotSchema | undefined;

      if (!requestSchema || !isObjectSchema(requestSchema) || !requestSchema.entries) {
        console.warn(`Warning: ${requestSchemaName} not found or is not an object schema in ${entry.name}`);
        continue;
      }

      // Parse excluded fields from *Parameters v.omit() call
      const paramsSchemaName = toSchemaName(methodName, "Parameters");
      const excludeFields = parseOmitFields(sourceCode, paramsSchemaName) ?? new Set<string>(["type"]);

      let params: Map<string, Param>;

      if (endpoint.name === "exchange") {
        // Exchange: params are in action schema
        const actionSchema = requestSchema.entries.action;

        if ((actionSchema?.type === "variant" || actionSchema?.type === "union") && actionSchema.options) {
          // v.variant/v.union: collect params from all options (mutually exclusive)
          params = extractParamsFromVariantOrUnion(actionSchema.options, excludeFields);
        } else if (actionSchema?.type === "intersect" && actionSchema.options) {
          // v.intersect: merge params from all options
          params = extractParamsFromIntersect(actionSchema.options, excludeFields);
        } else if (isObjectSchema(actionSchema) && actionSchema?.entries) {
          // v.object/v.looseObject/v.strictObject/v.objectWithRest: params directly in entries
          params = extractParamsFromEntries(actionSchema.entries, excludeFields);
        } else {
          console.warn(`Warning: action schema not found or unsupported type in ${entry.name}`);
          continue;
        }
      } else {
        // Info: check if params are in "req" sub-object (special case) or directly in entries
        const entries = requestSchema.entries;
        if (entries.req && isObjectSchema(entries.req) && entries.req.entries) {
          params = extractParamsFromEntries(entries.req.entries, excludeFields);
        } else {
          params = extractParamsFromEntries(entries, excludeFields);
        }
      }

      methods.set(methodName, { name: methodName, params });
    } catch (error) {
      console.warn(`Warning: Failed to load ${entry.name}: ${error}`);
    }
  }

  return methods;
}

// =============================================================================
// CLI HELP PARSING
// =============================================================================

/** Parse methods from CLI help text */
function parseHelpMethods(helpText: string, endpoint: string): Map<string, Method> {
  const methods = new Map<string, Method>();

  // Find the section for this endpoint
  const sectionHeader = endpoint === "info" ? "INFO ENDPOINT METHODS" : "EXCHANGE ENDPOINT METHODS";

  const sectionStart = helpText.indexOf(sectionHeader);
  if (sectionStart === -1) {
    console.warn(`Warning: Section "${sectionHeader}" not found in help text`);
    return methods;
  }

  // Skip the header line and the ===... line below it
  const afterHeader = helpText.slice(sectionStart + sectionHeader.length);
  // Find the first newline (end of header), then find next ===... line
  const firstNewline = afterHeader.indexOf("\n");
  // Skip the ===... line that follows the header
  const afterFirstLine = afterHeader.slice(firstNewline + 1);
  const secondNewline = afterFirstLine.indexOf("\n");
  const contentStart = sectionStart + sectionHeader.length + firstNewline + 1 + secondNewline + 1;

  // Find the end of this section (next ===... line after content starts)
  const contentText = helpText.slice(contentStart);
  const nextSectionMatch = contentText.match(/\n=+\n/);
  const sectionEnd = nextSectionMatch ? contentStart + (nextSectionMatch.index ?? contentText.length) : helpText.length;

  const sectionText = helpText.slice(contentStart, sectionEnd);

  // Split into lines and parse
  const lines = sectionText.split("\n");
  let currentMethod: { name: string; paramsText: string } | null = null;

  for (const line of lines) {
    // Skip headers and empty lines
    if (line.startsWith("=") || line.trim() === "") {
      continue;
    }

    // Skip category headers (lines ending with ":" that don't have "--")
    if (line.trim().endsWith(":") && !line.includes("--")) {
      continue;
    }

    // Check if this is a method line (starts with 2 spaces then a word character)
    const methodMatch = line.match(/^\s{2}(\w+)\s+(.*)$/);
    if (methodMatch) {
      // Save previous method if exists
      if (currentMethod) {
        methods.set(currentMethod.name, parseMethodParams(currentMethod.name, currentMethod.paramsText));
      }
      currentMethod = { name: methodMatch[1], paramsText: methodMatch[2].trim() };
    } else if (currentMethod && line.match(/^\s+\[?--/)) {
      // Continuation line with more params (starts with spaces and optional [ then --)
      currentMethod.paramsText += " " + line.trim();
    }
  }

  // Save last method
  if (currentMethod) {
    methods.set(currentMethod.name, parseMethodParams(currentMethod.name, currentMethod.paramsText));
  }

  return methods;
}

/** Parse parameters from method params text */
function parseMethodParams(methodName: string, paramsText: string): Method {
  const params = new Map<string, Param>();

  if (paramsText !== "(no params)" && paramsText !== "") {
    // Parse parameters
    // Patterns:
    //   --param <type>           - required
    //   [--param <type>]         - optional
    //   --param <type|type>      - required with union type
    const paramPattern = /(\[)?--(\w+(?:-\w+)*)\s+<[^>]+>(\])?/g;
    let paramMatch;

    while ((paramMatch = paramPattern.exec(paramsText)) !== null) {
      const isOptional = paramMatch[1] === "[" && paramMatch[3] === "]";
      const paramName = paramMatch[2];

      // Convert kebab-case to camelCase for comparison
      const camelCaseName = paramName.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

      params.set(camelCaseName, {
        name: camelCaseName,
        required: !isOptional,
      });
    }
  }

  return { name: methodName, params };
}

/** Extract printHelp function content from CLI file */
async function extractHelpText(cliPath: string): Promise<string> {
  const projectRoot = Deno.cwd();
  const fullPath = path.join(projectRoot, cliPath);
  const content = await Deno.readTextFile(fullPath);

  // Find printHelp function and extract the template literal
  const helpMatch = content.match(/function printHelp\(\)[\s\S]*?console\.log\(`([\s\S]*?)`\)/);
  if (!helpMatch) {
    throw new Error("Could not find printHelp function in CLI file");
  }

  return helpMatch[1];
}

// =============================================================================
// COMPARISON
// =============================================================================

/** Compare API methods with CLI help methods */
function compareMethods(
  apiMethods: Map<string, Method>,
  helpMethods: Map<string, Method>,
  endpoint: ApiEndpoint,
): SyncError[] {
  const errors: SyncError[] = [];
  const projectRoot = Deno.cwd();

  // Check for methods in API but not in help
  for (const [methodName, apiMethod] of apiMethods) {
    const helpMethod = helpMethods.get(methodName);
    const filePath = path.join(projectRoot, endpoint.methodsDir, `${methodName}.ts`);

    if (!helpMethod) {
      errors.push({
        methodName,
        endpoint: endpoint.name,
        errorType: "method missing in help",
        details: `Method "${methodName}" exists in API but is not documented in CLI help`,
        filePath,
      });
      continue;
    }

    // Compare parameters
    // Check for params in API but not in help
    for (const [paramName, apiParam] of apiMethod.params) {
      const helpParam = helpMethod.params.get(paramName);

      if (!helpParam) {
        errors.push({
          methodName,
          endpoint: endpoint.name,
          errorType: "param missing in help",
          details: `Parameter "${paramName}" exists in API but is not documented in CLI help`,
          filePath,
        });
        continue;
      }

      // Check required/optional mismatch
      if (apiParam.required !== helpParam.required) {
        errors.push({
          methodName,
          endpoint: endpoint.name,
          errorType: "param required mismatch",
          details: `Parameter "${paramName}" is ${apiParam.required ? "required" : "optional"} in API but ${
            helpParam.required ? "required" : "optional"
          } in CLI help`,
          filePath,
        });
      }
    }

    // Check for params in help but not in API
    for (const paramName of helpMethod.params.keys()) {
      if (!apiMethod.params.has(paramName)) {
        errors.push({
          methodName,
          endpoint: endpoint.name,
          errorType: "param missing in api",
          details: `Parameter "${paramName}" is documented in CLI help but does not exist in API schema`,
          filePath,
        });
      }
    }
  }

  // Check for methods in help but not in API
  for (const methodName of helpMethods.keys()) {
    if (!apiMethods.has(methodName)) {
      errors.push({
        methodName,
        endpoint: endpoint.name,
        errorType: "method missing in api",
        details: `Method "${methodName}" is documented in CLI help but does not exist in API`,
        filePath: path.join(projectRoot, CLI_PATH),
      });
    }
  }

  return errors;
}

// =============================================================================
// MAIN
// =============================================================================

async function main(): Promise<void> {
  const allErrors: SyncError[] = [];

  // Extract help text from CLI file
  let helpText: string;
  try {
    helpText = await extractHelpText(CLI_PATH);
  } catch (error) {
    console.error(`Error: ${error}`);
    Deno.exit(1);
  }

  // Process each endpoint
  for (const endpoint of API_ENDPOINTS) {
    // Load API methods from Valibot schemas
    const apiMethods = await loadApiMethods(endpoint);

    // Parse help methods from CLI help text
    const helpMethods = parseHelpMethods(helpText, endpoint.name);

    // Compare and collect errors
    const errors = compareMethods(apiMethods, helpMethods, endpoint);
    allErrors.push(...errors);
  }

  // Success
  if (allErrors.length === 0) {
    console.log("All CLI help documentation is synchronized with API schemas.");
    Deno.exit(0);
  }

  // Print errors
  for (const error of allErrors) {
    console.log(`[ERROR] ${error.endpoint}.${error.methodName}: ${error.errorType}`);
    console.log(`  ${error.details.split("\n").join("\n  ")}`);
    console.log(`  File: ${error.filePath}`);
    console.log("");
  }

  console.log(`Found ${allErrors.length} error(s)`);
  Deno.exit(1);
}

// Entry point
main();
