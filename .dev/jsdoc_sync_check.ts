// deno-lint-ignore-file no-console

/**
 * JSDoc Sync Checker
 *
 * Verifies that JSDoc comments in class methods (client.ts)
 * are synchronized with JSDoc comments in standalone functions (_methods/*.ts).
 *
 * Usage: deno run -A .dev/jsdoc_sync_check.ts
 */

import ts from "npm:typescript@5";
import * as path from "jsr:@std/path@1";

// =============================================================================
// TYPES
// =============================================================================

/** Parsed JSDoc data structure */
interface ParsedJSDoc {
  description: string | undefined;
  tags: Map<string, string[]>;
}

/** API endpoint configuration */
interface ApiEndpoint {
  name: string;
  clientPath: string;
  methodsDir: string;
  className: string;
}

/** Comparison error */
interface SyncError {
  methodName: string;
  className: string;
  errorType: string;
  details: string;
  filePath: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Endpoints to check for JSDoc synchronization */
const API_ENDPOINTS: ApiEndpoint[] = [
  {
    name: "info",
    clientPath: "src/api/info/client.ts",
    methodsDir: "src/api/info/_methods",
    className: "InfoClient",
  },
  {
    name: "exchange",
    clientPath: "src/api/exchange/client.ts",
    methodsDir: "src/api/exchange/_methods",
    className: "ExchangeClient",
  },
  {
    name: "subscription",
    clientPath: "src/api/subscription/client.ts",
    methodsDir: "src/api/subscription/_methods",
    className: "SubscriptionClient",
  },
];

// =============================================================================
// JSDOC EXTRACTION
// =============================================================================

/**
 * Extract raw JSDoc comment text from a node.
 * JSDoc is located in "trivia" (whitespace/comments before the node).
 */
function getRawJSDocText(node: ts.Node, sourceFile: ts.SourceFile): string | undefined {
  const fullText = sourceFile.getFullText();
  const nodeText = fullText.slice(node.getFullStart(), node.getStart(sourceFile));
  const match = nodeText.match(/\/\*\*\s*([\s\S]*?)\s*\*\//);
  return match?.[1];
}

/** Clean JSDoc lines by removing leading asterisk prefixes */
function cleanJSDocLines(rawText: string): string[] {
  return rawText
    .split("\n")
    .map((line) => line.replace(/^\s*\*\s?/, ""));
}

/** Parse JSDoc text into structured data */
function parseJSDoc(rawText: string): ParsedJSDoc {
  const lines = cleanJSDocLines(rawText);
  const result: ParsedJSDoc = {
    description: undefined,
    tags: new Map(),
  };

  let currentTag: string | null = null;
  let currentTagContent: string[] = [];
  const descriptionLines: string[] = [];

  /** Save accumulated tag content to result and reset state */
  function saveCurrentTag(): void {
    if (!currentTag) return;

    const content = currentTagContent.join("\n").trim();
    // Always save tag, even with empty content (e.g., @deprecated without text)
    const existing = result.tags.get(currentTag);
    if (existing) {
      existing.push(content);
    } else {
      result.tags.set(currentTag, [content]);
    }

    currentTag = null;
    currentTagContent = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();

    // New @tag starts - save previous and start new
    if (trimmed.startsWith("@")) {
      saveCurrentTag();

      // Extract tag name and initial content
      const tagMatch = trimmed.match(/^@(\w+)(?:\s+(.*))?$/);
      if (tagMatch) {
        currentTag = tagMatch[1];
        currentTagContent = tagMatch[2] ? [tagMatch[2]] : [];
      }
      continue;
    }

    // Continuation line - add to current tag or description
    if (currentTag) {
      currentTagContent.push(line);
    } else {
      descriptionLines.push(trimmed);
    }
  }

  saveCurrentTag();

  const description = descriptionLines.join(" ").trim();
  if (description) {
    result.description = description;
  }

  return result;
}

/**
 * Check if JSDoc is incomplete (missing essential documentation).
 * Essential: description, @param, @returns, or @throws.
 */
function isIncompleteJSDoc(jsdoc: ParsedJSDoc): boolean {
  if (jsdoc.description) return false;
  if ((jsdoc.tags.get("param")?.length ?? 0) > 0) return false;
  if ((jsdoc.tags.get("returns")?.length ?? 0) > 0) return false;
  if ((jsdoc.tags.get("throws")?.length ?? 0) > 0) return false;
  return true;
}

// =============================================================================
// AST PARSING
// =============================================================================

/** Check if a node has export modifier */
function isExported(node: ts.Node): boolean {
  if (!ts.canHaveModifiers(node)) return false;
  const modifiers = ts.getModifiers(node);
  return modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
}

/** Parse exported function JSDoc from a file */
function parseFunctionJSDoc(filePath: string): Map<string, ParsedJSDoc> {
  const result = new Map<string, ParsedJSDoc>();

  try {
    const sourceText = Deno.readTextFileSync(filePath);
    const sourceFile = ts.createSourceFile(
      filePath,
      sourceText,
      ts.ScriptTarget.Latest,
      true,
    );

    // Find all exported function declarations
    ts.forEachChild(sourceFile, (node) => {
      if (ts.isFunctionDeclaration(node) && node.name && isExported(node)) {
        const funcName = node.name.getText(sourceFile);
        const rawJSDoc = getRawJSDocText(node, sourceFile);
        if (rawJSDoc) {
          result.set(funcName, parseJSDoc(rawJSDoc));
        }
      }
    });
  } catch {
    // File not found or parse error - caller handles as "function missing JSDoc"
  }

  return result;
}

/** Parse class method JSDoc from client file */
function parseClassMethodsJSDoc(filePath: string): Map<string, ParsedJSDoc> {
  const result = new Map<string, ParsedJSDoc>();
  const sourceText = Deno.readTextFileSync(filePath);
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true, // setParentNodes
  );

  // Find class declaration
  ts.forEachChild(sourceFile, (node) => {
    if (!ts.isClassDeclaration(node)) return;

    // Group methods by name (to handle overloads)
    const methodsByName = new Map<string, ts.MethodDeclaration[]>();

    for (const member of node.members) {
      if (!ts.isMethodDeclaration(member)) continue;
      if (!member.name || !ts.isIdentifier(member.name)) continue;

      const methodName = member.name.text;
      if (methodName === "constructor") continue;

      const methods = methodsByName.get(methodName) ?? [];
      methods.push(member);
      methodsByName.set(methodName, methods);
    }

    // For overloaded methods, get JSDoc from first overload signature (no body)
    // For non-overloaded methods, get JSDoc from the implementation
    for (const [methodName, methods] of methodsByName) {
      const overloads = methods.filter((m) => m.body === undefined);
      const targetMethod = overloads.length > 0 ? overloads[0] : methods[0];

      const rawJSDoc = getRawJSDocText(targetMethod, sourceFile);
      if (rawJSDoc) {
        result.set(methodName, parseJSDoc(rawJSDoc));
      }
    }
  });

  return result;
}

// =============================================================================
// EXAMPLE NORMALIZATION
// =============================================================================

/**
 * Normalize @example for comparison.
 * Removes imports, setup code, and extracts only the call parameters.
 */
function normalizeExample(example: string, isFunction: boolean, methodName: string): string {
  // Remove markdown code block markers
  let code = example
    .replace(/^```\w*\n?/, "")
    .replace(/\n?```$/, "")
    .trim();

  // Remove import statements and setup code
  const lines = code.split("\n").filter((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("import ")) return false;
    if (trimmed.includes("new HttpTransport()")) return false;
    if (trimmed.includes("new WebSocketTransport()")) return false;
    if (trimmed.includes("new hl.InfoClient")) return false;
    if (trimmed.includes("new hl.ExchangeClient")) return false;
    if (trimmed.includes("new hl.SubscriptionClient")) return false;
    if (trimmed.includes("privateKeyToAccount")) return false;
    return true;
  });

  code = lines.join("\n").trim();

  // Extract params from function/method call
  const pattern = isFunction
    // Function pattern: functionName({ config }, params) or functionName({ config })
    // The comma after config is optional (for methods without params)
    ? new RegExp(`${methodName}\\s*\\(\\s*\\{[^}]*\\}\\s*(?:,\\s*([\\s\\S]*?))?\\s*\\)\\s*;?`)
    // Method pattern: client.methodName(params) or client.methodName()
    : new RegExp(`\\.${methodName}\\s*\\(\\s*([\\s\\S]*?)\\s*\\)\\s*;?`);

  const match = code.match(pattern);
  if (match) {
    // match[1] may be undefined if no params after config
    return normalizeParams(match[1] ?? "");
  }

  // Fallback: return cleaned code
  return code;
}

/** Normalize whitespace in extracted params string */
function normalizeParams(params: string): string {
  return params
    .replace(/\s+/g, " ") // collapse whitespace
    .replace(/,\s*}/g, " }") // remove trailing commas before closing braces
    .replace(/,\s*]/g, " ]") // remove trailing commas before closing brackets
    .replace(/,\s*$/, "") // remove trailing comma at end
    .trim();
}

// =============================================================================
// COMPARISON
// =============================================================================

/** Format array for error output */
function formatArray(arr: string[]): string {
  if (arr.length === 0) return "(none)";
  return arr.map((item) => `"${item}"`).join(", ");
}

/** Compare two arrays of tag values */
function compareTagArrays(
  funcArray: string[],
  methodArray: string[],
  tagName: string,
  methodName: string,
  className: string,
  filePath: string,
): SyncError[] {
  const errors: SyncError[] = [];

  // Check count first
  if (funcArray.length !== methodArray.length) {
    errors.push({
      methodName,
      className,
      errorType: `@${tagName} count mismatch`,
      details: `Function: ${formatArray(funcArray)}\nMethod:   ${formatArray(methodArray)}`,
      filePath,
    });
    return errors;
  }

  // Compare each element by position
  for (let i = 0; i < funcArray.length; i++) {
    if (funcArray[i] !== methodArray[i]) {
      errors.push({
        methodName,
        className,
        errorType: `@${tagName} mismatch`,
        details: `Position ${i}:\nFunction: "${funcArray[i]}"\nMethod:   "${methodArray[i]}"`,
        filePath,
      });
    }
  }

  return errors;
}

/** Compare JSDoc between function and method, returning list of errors */
function compareJSDoc(
  funcJSDoc: ParsedJSDoc,
  methodJSDoc: ParsedJSDoc,
  methodName: string,
  className: string,
  funcFilePath: string,
  clientFilePath: string,
): SyncError[] {
  const errors: SyncError[] = [];

  // Skip comparison if method has incomplete JSDoc (likely placeholder)
  if (isIncompleteJSDoc(methodJSDoc)) {
    errors.push({
      methodName,
      className,
      errorType: "incomplete JSDoc",
      details: "Method JSDoc is missing essential documentation (description, @param, @returns, or @throws)",
      filePath: clientFilePath,
    });
    return errors;
  }

  // Compare description
  if (funcJSDoc.description !== methodJSDoc.description) {
    errors.push({
      methodName,
      className,
      errorType: "description mismatch",
      details: `Function: "${funcJSDoc.description}"\nMethod:   "${methodJSDoc.description}"`,
      filePath: funcFilePath,
    });
  }

  // Collect all tag names from both JSDoc
  const allTagNames = new Set([
    ...funcJSDoc.tags.keys(),
    ...methodJSDoc.tags.keys(),
  ]);

  // Compare each tag
  for (const tagName of allTagNames) {
    let funcValues = funcJSDoc.tags.get(tagName) ?? [];
    const methodValues = methodJSDoc.tags.get(tagName) ?? [];

    // Special case: @param - filter out "config" entries from function
    if (tagName === "param") {
      funcValues = funcValues.filter((v) => !v.startsWith("config "));
    }

    // Special case: @example - normalize before comparison
    if (tagName === "example") {
      const funcHasExample = funcValues.length > 0;
      const methodHasExample = methodValues.length > 0;

      if (funcHasExample !== methodHasExample) {
        errors.push({
          methodName,
          className,
          errorType: funcHasExample ? "@example missing" : "@example unexpected",
          details: funcHasExample ? "Function has @example, method does not" : "Method has @example, function does not",
          filePath: funcFilePath,
        });
      } else if (funcHasExample && methodHasExample) {
        const funcNormalized = normalizeExample(funcValues[0], true, methodName);
        const methodNormalized = normalizeExample(methodValues[0], false, methodName);

        if (funcNormalized !== methodNormalized) {
          errors.push({
            methodName,
            className,
            errorType: "@example mismatch",
            details: `Normalized params differ:\nFunction: "${funcNormalized}"\nMethod:   "${methodNormalized}"`,
            filePath: funcFilePath,
          });
        }
      }
      continue;
    }

    // Universal comparison for all other tags
    errors.push(
      ...compareTagArrays(funcValues, methodValues, tagName, methodName, className, funcFilePath),
    );
  }

  return errors;
}

// =============================================================================
// MAIN
// =============================================================================

function main(): void {
  const projectRoot = Deno.cwd();
  const allErrors: SyncError[] = [];

  // Process each API endpoint
  for (const endpoint of API_ENDPOINTS) {
    const clientPath = path.join(projectRoot, endpoint.clientPath);
    const methodsDir = path.join(projectRoot, endpoint.methodsDir);

    // Parse all method JSDoc from client class
    const methodsJSDoc = parseClassMethodsJSDoc(clientPath);

    // Compare each method with its corresponding function
    for (const [methodName, methodJSDoc] of methodsJSDoc) {
      const funcFilePath = path.join(methodsDir, `${methodName}.ts`);

      // Parse function JSDoc from _methods/*.ts
      const funcJSDocMap = parseFunctionJSDoc(funcFilePath);
      const funcJSDoc = funcJSDocMap.get(methodName);

      // Check if function exists and has JSDoc
      if (!funcJSDoc) {
        allErrors.push({
          methodName,
          className: endpoint.className,
          errorType: "function missing JSDoc",
          details: `Function ${methodName} not found or has no JSDoc`,
          filePath: funcFilePath,
        });
        continue;
      }

      allErrors.push(...compareJSDoc(funcJSDoc, methodJSDoc, methodName, endpoint.className, funcFilePath, clientPath));
    }
  }

  // Success - all JSDoc synchronized
  if (allErrors.length === 0) {
    console.log("All JSDoc comments are synchronized.");
    Deno.exit(0);
  }

  // Print all errors
  for (const error of allErrors) {
    console.log(`[ERROR] ${error.className}.${error.methodName}: ${error.errorType}`);
    console.log(`  ${error.details.split("\n").join("\n  ")}`);
    console.log(`  File: ${error.filePath}`);
    console.log("");
  }

  console.log(`Found ${allErrors.length} error(s)`);
  Deno.exit(1);
}

// Entry point
main();
