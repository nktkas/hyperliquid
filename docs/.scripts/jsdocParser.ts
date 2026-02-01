// deno-lint-ignore-file no-import-prefix
import ts from "npm:typescript@5";
import * as path from "jsr:@std/path@^1";

// =============================================================================
// TYPES
// =============================================================================

/** Structured JSDoc tags */
export interface JSDocTags {
  /** URLs from @see tags for external documentation */
  see?: string[];
}

/** JSDoc data for a single schema */
export interface SchemaJSDoc {
  schemaDescription?: string;
  fields: Record<string, string>;
  /** Structured JSDoc tags extracted from the schema comment */
  tags?: JSDocTags;
}

/** Result of parsing JSDoc from a file */
export type JSDocParseResult = Record<string, SchemaJSDoc>;

/** JSDoc data for a function (method) */
export interface FunctionJSDoc {
  /** Code blocks from @example tags */
  examples?: string[];
}

/** Result of parsing function JSDoc from a file */
export type FunctionJSDocResult = Record<string, FunctionJSDoc>;

// =============================================================================
// MAIN EXPORT
// =============================================================================

/**
 * Parse JSDoc comments from a TypeScript file for schema definitions.
 * @param filePath - Absolute path to the TypeScript file
 * @param processedFiles - Set of already processed files to prevent cycles
 */
export function parseJSDocFromFile(
  filePath: string,
  processedFiles: Set<string> = new Set(),
): JSDocParseResult {
  // Prevent cycles
  const normalizedPath = path.normalize(filePath);
  if (processedFiles.has(normalizedPath)) {
    return {};
  }
  processedFiles.add(normalizedPath);

  // Read and parse file
  const sourceText = Deno.readTextFileSync(filePath);
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true, // setParentNodes
  );

  // Parse imports
  const imports = parseImports(sourceFile, filePath);

  // Parse ALL schema declarations (including non-exported for local references)
  const allSchemas: JSDocParseResult = {};
  ts.forEachChild(sourceFile, (node) => {
    if (isSchemaDeclaration(node)) {
      const varDecl = getVariableDeclaration(node);
      if (varDecl) {
        const schemaName = varDecl.name.getText(sourceFile);
        const schemaJSDoc = parseSchemaJSDoc(node, varDecl, sourceFile, imports, allSchemas, filePath, processedFiles);
        if (schemaJSDoc) {
          allSchemas[schemaName] = schemaJSDoc;
        }
      }
    }
  });

  // Return only exported schemas
  const result: JSDocParseResult = {};
  ts.forEachChild(sourceFile, (node) => {
    if (isExportedSchemaDeclaration(node)) {
      const varDecl = getVariableDeclaration(node);
      if (varDecl) {
        const schemaName = varDecl.name.getText(sourceFile);
        if (allSchemas[schemaName]) {
          result[schemaName] = allSchemas[schemaName];
        }
      }
    }
  });

  return result;
}

// =============================================================================
// IMPORT PARSING
// =============================================================================

/** Parse import declarations from source file */
function parseImports(sourceFile: ts.SourceFile, currentFilePath: string): Map<string, string> {
  const imports = new Map<string, string>();
  const currentDir = path.dirname(currentFilePath);

  ts.forEachChild(sourceFile, (node) => {
    if (!ts.isImportDeclaration(node) || !node.moduleSpecifier) {
      return;
    }

    const moduleSpecifier = (node.moduleSpecifier as ts.StringLiteral).text;

    // Only handle relative imports
    if (!moduleSpecifier.startsWith(".")) {
      return;
    }

    const namedBindings = node.importClause?.namedBindings;
    if (!namedBindings || !ts.isNamedImports(namedBindings)) {
      return;
    }

    for (const element of namedBindings.elements) {
      const symbolName = element.name.getText(sourceFile);
      const resolvedPath = path.resolve(currentDir, moduleSpecifier);
      imports.set(symbolName, resolvedPath);
    }
  });

  return imports;
}

// =============================================================================
// SCHEMA DECLARATION DETECTION
// =============================================================================

/** Schema name suffixes that identify schema declarations */
const SCHEMA_SUFFIXES = ["Request", "Response", "Event", "Schema"] as const;

/** Check if node is a schema declaration (ends with Request, Response, Event, Schema) */
function isSchemaDeclaration(node: ts.Node): node is ts.VariableStatement {
  if (!ts.isVariableStatement(node)) return false;

  const declaration = node.declarationList.declarations[0];
  if (!declaration || !ts.isIdentifier(declaration.name)) return false;

  const name = declaration.name.text;
  return SCHEMA_SUFFIXES.some((suffix) => name.endsWith(suffix));
}

/** Check if node is an exported schema declaration */
function isExportedSchemaDeclaration(node: ts.Node): node is ts.VariableStatement {
  if (!isSchemaDeclaration(node)) return false;
  return node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
}

/** Get variable declaration from variable statement */
function getVariableDeclaration(node: ts.VariableStatement): ts.VariableDeclaration | undefined {
  return node.declarationList.declarations[0];
}

// =============================================================================
// JSDOC EXTRACTION
// =============================================================================

/** Parse JSDoc for a schema declaration */
function parseSchemaJSDoc(
  statement: ts.VariableStatement,
  varDecl: ts.VariableDeclaration,
  sourceFile: ts.SourceFile,
  imports: Map<string, string>,
  localSchemas: JSDocParseResult,
  currentFilePath: string,
  processedFiles: Set<string>,
): SchemaJSDoc | undefined {
  const schemaJSDoc: SchemaJSDoc = { fields: {} };

  // Get top-level JSDoc for schema (raw text for tag extraction)
  const rawJSDoc = getRawJSDocText(statement, sourceFile);
  if (rawJSDoc) {
    // Extract description (without @tags)
    const description = cleanJSDocText(rawJSDoc);
    if (description) {
      schemaJSDoc.schemaDescription = description;
    }

    // Extract structured tags (@see, @example)
    const tags = extractJSDocTags(rawJSDoc);
    if (tags) {
      schemaJSDoc.tags = tags;
    }
  }

  // Find v.object(), v.tuple(), etc. inside the initializer
  if (varDecl.initializer) {
    parseValibotSchema(
      varDecl.initializer,
      sourceFile,
      "",
      schemaJSDoc.fields,
      imports,
      localSchemas,
      currentFilePath,
      processedFiles,
    );
  }

  return schemaJSDoc;
}

/** Extract raw JSDoc comment text from a node (without cleaning) */
function getRawJSDocText(node: ts.Node, sourceFile: ts.SourceFile): string | undefined {
  const fullText = sourceFile.getFullText();
  const nodeStart = node.getFullStart();
  const nodeText = fullText.slice(nodeStart, node.getStart(sourceFile));

  // Find JSDoc comment (/** ... */)
  const match = nodeText.match(/\/\*\*\s*([\s\S]*?)\s*\*\//);
  return match ? match[1] : undefined;
}

/** Extract JSDoc comment text from a node (cleaned, without @tags) */
function getJSDocComment(node: ts.Node, sourceFile: ts.SourceFile): string | undefined {
  const raw = getRawJSDocText(node, sourceFile);
  if (!raw) return undefined;

  return cleanJSDocText(raw) || undefined;
}

/** Clean JSDoc text by removing * prefixes and normalizing whitespace */
function cleanJSDocText(text: string): string {
  return text
    .split("\n")
    .map((line) => line.replace(/^\s*\*\s*/, "").trim())
    .filter((line) => !line.startsWith("@")) // Remove @tags like @see
    .join("\n")
    .trim();
}

// =============================================================================
// TAG EXTRACTION
// =============================================================================

/** Check if string is a valid URL (http/https) */
function isValidUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

/** Extract structured tags (`@see`) from raw JSDoc text */
function extractJSDocTags(rawText: string): JSDocTags | undefined {
  // Clean lines: remove JSDoc asterisk prefix and all leading/trailing whitespace
  const lines = rawText.split("\n").map((line) => line.replace(/^\s*\*\s*/, ""));
  const tags: JSDocTags = {};

  // Extract @see URLs (only valid http/https URLs)
  const SEE_PREFIX = "@see ";
  const seeUrls = lines
    .map((line) => line.trim())
    .filter((line) => line.startsWith(SEE_PREFIX))
    .map((line) => line.substring(SEE_PREFIX.length).trim())
    .filter(isValidUrl);

  if (seeUrls.length > 0) {
    tags.see = seeUrls;
  }

  return Object.keys(tags).length > 0 ? tags : undefined;
}

/** Extract `@example` blocks from raw JSDoc text */
function extractExamples(rawText: string): string[] | undefined {
  // Clean lines: remove JSDoc asterisk prefix
  const lines = rawText.split("\n").map((line) => line.replace(/^\s*\*\s*/, ""));

  const examples: string[] = [];
  let inExample = false;
  let currentExample = "";

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("@example")) {
      // Save previous example if exists
      if (currentExample.trim()) {
        examples.push(currentExample.trim());
      }
      inExample = true;
      currentExample = "";
      continue;
    }

    // New tag ends current @example block
    if (trimmed.startsWith("@") && inExample) {
      if (currentExample.trim()) {
        examples.push(currentExample.trim());
      }
      inExample = false;
      currentExample = "";
      continue;
    }

    // Collect lines inside @example
    if (inExample) {
      currentExample += (currentExample ? "\n" : "") + line;
    }
  }

  // Save last example if exists
  if (currentExample.trim()) {
    examples.push(currentExample.trim());
  }

  return examples.length > 0 ? examples : undefined;
}

// =============================================================================
// VALIBOT SCHEMA PARSING
// =============================================================================

/** Parse Valibot schema expression and extract field JSDoc */
function parseValibotSchema(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  currentPath: string,
  fields: Record<string, string>,
  imports: Map<string, string>,
  localSchemas: JSDocParseResult,
  currentFilePath: string,
  processedFiles: Set<string>,
): void {
  // =========================================================================
  // HELPER FUNCTIONS
  // =========================================================================

  /** Recursively parse with the same context */
  function recurse(innerNode: ts.Node, innerPath: string = currentPath): void {
    parseValibotSchema(
      innerNode,
      sourceFile,
      innerPath,
      fields,
      imports,
      localSchemas,
      currentFilePath,
      processedFiles,
    );
  }

  /** Copy fields from a resolved schema with path prefix */
  function copySchemaFields(schema: SchemaJSDoc): void {
    for (const [fieldPath, description] of Object.entries(schema.fields)) {
      fields[joinPaths(currentPath, fieldPath)] = description;
    }
  }

  // =========================================================================
  // IIFE UNWRAPPING - (() => { return ...; })()
  // =========================================================================

  if (ts.isCallExpression(node) && ts.isParenthesizedExpression(node.expression)) {
    const inner = node.expression.expression;
    if (ts.isArrowFunction(inner) && inner.body) {
      // Expression body: () => schema
      if (!ts.isBlock(inner.body)) {
        recurse(inner.body);
        return;
      }
      // Block body: () => { return schema; }
      for (const stmt of inner.body.statements) {
        if (ts.isReturnStatement(stmt) && stmt.expression) {
          recurse(stmt.expression);
          return;
        }
      }
    }
  }

  // =========================================================================
  // WRAPPER FUNCTIONS - pass through to first argument
  // =========================================================================

  const WRAPPER_FUNCTIONS = [
    "pipe",
    "optional",
    "nullable",
    "nullish",
    "omit",
    "pick",
    "partial",
    "required",
    "undefinedable",
    "nonNullable",
    "nonNullish",
    "nonOptional",
    "exactOptional",
  ];
  const wrapperMatch = WRAPPER_FUNCTIONS.find((fn) => isValibotCall(node, fn));
  if (wrapperMatch) {
    const callExpr = node as ts.CallExpression;
    if (callExpr.arguments.length > 0) {
      recurse(callExpr.arguments[0]);
    }
    return;
  }

  // =========================================================================
  // OBJECT-LIKE FUNCTIONS - first argument is object literal with fields
  // =========================================================================

  const OBJECT_FUNCTIONS = ["object", "looseObject", "strictObject", "objectWithRest"];
  const objectMatch = OBJECT_FUNCTIONS.find((fn) => isValibotCall(node, fn));
  if (objectMatch) {
    const callExpr = node as ts.CallExpression;
    const firstArg = callExpr.arguments[0];
    if (firstArg && ts.isObjectLiteralExpression(firstArg)) {
      parseObjectProperties(
        firstArg,
        sourceFile,
        currentPath,
        fields,
        imports,
        localSchemas,
        currentFilePath,
        processedFiles,
      );
    }
    return;
  }

  // =========================================================================
  // ARRAY-LIKE FUNCTIONS - first argument is element schema
  // =========================================================================

  const ARRAY_FUNCTIONS = ["array", "set"];
  const arrayMatch = ARRAY_FUNCTIONS.find((fn) => isValibotCall(node, fn));
  if (arrayMatch) {
    const callExpr = node as ts.CallExpression;
    if (callExpr.arguments.length > 0) {
      const arrayPath = currentPath ? `${currentPath}[]` : "[]";
      recurse(callExpr.arguments[0], arrayPath);
    }
    return;
  }

  // =========================================================================
  // TUPLE-LIKE FUNCTIONS - first argument is array of schemas
  // =========================================================================

  const TUPLE_FUNCTIONS = ["tuple", "tupleWithRest"];
  const tupleMatch = TUPLE_FUNCTIONS.find((fn) => isValibotCall(node, fn));
  if (tupleMatch) {
    const callExpr = node as ts.CallExpression;
    const firstArg = callExpr.arguments[0];
    if (firstArg && ts.isArrayLiteralExpression(firstArg)) {
      for (const [index, element] of firstArg.elements.entries()) {
        const tuplePath = currentPath ? `${currentPath}[${index}]` : `[${index}]`;
        recurse(element, tuplePath);
      }
    }
    return;
  }

  // =========================================================================
  // MAP-LIKE FUNCTIONS - second argument is value schema
  // Note: These have dynamic keys, so we use [] notation for values
  // =========================================================================

  const MAP_FUNCTIONS = ["map", "record"];
  const mapMatch = MAP_FUNCTIONS.find((fn) => isValibotCall(node, fn));
  if (mapMatch) {
    const callExpr = node as ts.CallExpression;
    if (callExpr.arguments.length > 1) {
      const mapPath = currentPath ? `${currentPath}[]` : "[]";
      recurse(callExpr.arguments[1], mapPath);
    }
    return;
  }

  // =========================================================================
  // UNION-LIKE FUNCTIONS - first argument is array of variant schemas
  // =========================================================================

  const UNION_FUNCTIONS = ["union", "intersect"];
  const unionMatch = UNION_FUNCTIONS.find((fn) => isValibotCall(node, fn));
  if (unionMatch) {
    const callExpr = node as ts.CallExpression;
    const firstArg = callExpr.arguments[0];
    if (firstArg && ts.isArrayLiteralExpression(firstArg)) {
      for (const element of firstArg.elements) {
        recurse(element);
      }
    }
    return;
  }

  // =========================================================================
  // VARIANT FUNCTION - second argument is array of variant schemas
  // =========================================================================

  if (isValibotCall(node, "variant")) {
    const callExpr = node as ts.CallExpression;
    if (callExpr.arguments.length > 1) {
      const arrayArg = callExpr.arguments[1];
      if (ts.isArrayLiteralExpression(arrayArg)) {
        for (const element of arrayArg.elements) {
          recurse(element);
        }
      }
    }
    return;
  }

  // =========================================================================
  // LAZY FUNCTION - argument is a function returning schema
  // =========================================================================

  if (isValibotCall(node, "lazy")) {
    const callExpr = node as ts.CallExpression;
    const factoryFn = callExpr.arguments[0];
    if (factoryFn && ts.isArrowFunction(factoryFn)) {
      // Expression body: () => schema
      if (!ts.isBlock(factoryFn.body)) {
        recurse(factoryFn.body);
        return;
      }
      // Block body: () => { return schema; }
      for (const stmt of factoryFn.body.statements) {
        if (ts.isReturnStatement(stmt) && stmt.expression) {
          recurse(stmt.expression);
          return;
        }
      }
    }
    return;
  }

  // =========================================================================
  // SCHEMA REFERENCES - local or imported
  // =========================================================================

  if (ts.isIdentifier(node)) {
    const symbolName = node.getText(sourceFile);

    // Check local schemas first
    const localSchema = localSchemas[symbolName];
    if (localSchema) {
      copySchemaFields(localSchema);
      return;
    }

    // Check imported schemas
    const importPath = imports.get(symbolName);
    if (importPath) {
      const importedJSDoc = parseJSDocFromFile(importPath, processedFiles);
      const importedSchema = importedJSDoc[symbolName];
      if (importedSchema) {
        copySchemaFields(importedSchema);
      }
    }
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/** Join two paths, handling cases where fieldPath starts with [ */
function joinPaths(basePath: string, fieldPath: string): string {
  if (!basePath) return fieldPath;
  if (fieldPath.startsWith("[")) return basePath + fieldPath;
  return `${basePath}.${fieldPath}`;
}

/** Parse object literal properties for JSDoc */
function parseObjectProperties(
  objLiteral: ts.ObjectLiteralExpression,
  sourceFile: ts.SourceFile,
  currentPath: string,
  fields: Record<string, string>,
  imports: Map<string, string>,
  localSchemas: JSDocParseResult,
  currentFilePath: string,
  processedFiles: Set<string>,
): void {
  for (const prop of objLiteral.properties) {
    if (!ts.isPropertyAssignment(prop) || !prop.name) {
      continue;
    }

    const propName = prop.name.getText(sourceFile);
    const propPath = currentPath ? `${currentPath}.${propName}` : propName;

    // Get JSDoc for this property
    const jsdoc = getJSDocComment(prop, sourceFile);
    if (jsdoc) {
      fields[propPath] = jsdoc;
    }

    // Recursively parse the property value
    parseValibotSchema(
      prop.initializer,
      sourceFile,
      propPath,
      fields,
      imports,
      localSchemas,
      currentFilePath,
      processedFiles,
    );
  }
}

/** Check if node is a valibot function call (v.xxx) */
function isValibotCall(node: ts.Node, funcName: string): boolean {
  if (!ts.isCallExpression(node)) return false;

  const expr = node.expression;
  if (!ts.isPropertyAccessExpression(expr)) return false;

  const obj = expr.expression;
  const prop = expr.name;
  return ts.isIdentifier(obj) && obj.text === "v" && prop.text === funcName;
}

// =============================================================================
// FUNCTION JSDOC PARSING
// =============================================================================

/**
 * Parse JSDoc comments from exported functions in a TypeScript file.
 * Extracts @example tags from function declarations.
 * @param filePath - Absolute path to the TypeScript file
 */
export function parseFunctionJSDocFromFile(filePath: string): FunctionJSDocResult {
  // Read and parse file
  const sourceText = Deno.readTextFileSync(filePath);
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true, // setParentNodes
  );

  const result: FunctionJSDocResult = {};

  ts.forEachChild(sourceFile, (node) => {
    // Check for exported function declarations
    if (ts.isFunctionDeclaration(node) && node.name && isExported(node)) {
      const funcName = node.name.getText(sourceFile);
      const funcJSDoc = extractFunctionJSDoc(node, sourceFile);
      if (funcJSDoc) {
        result[funcName] = funcJSDoc;
      }
    }
  });

  return result;
}

/** Check if a node has export modifier */
function isExported(node: ts.Node): boolean {
  if (!ts.canHaveModifiers(node)) return false;
  const modifiers = ts.getModifiers(node);
  return modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
}

/** Extract JSDoc data from a function declaration */
function extractFunctionJSDoc(node: ts.FunctionDeclaration, sourceFile: ts.SourceFile): FunctionJSDoc | undefined {
  const rawJSDoc = getRawJSDocText(node, sourceFile);
  if (!rawJSDoc) return undefined;

  const examples = extractExamples(rawJSDoc);
  if (!examples) return undefined;

  return { examples };
}
