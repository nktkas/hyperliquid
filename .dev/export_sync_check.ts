// deno-lint-ignore-file no-console

/**
 * Export Sync Checker
 *
 * Verifies that all method files in _methods/ directories are properly
 * exported in mod.ts and client.ts for each API module.
 *
 * Usage: deno run -A .dev/export_sync_check.ts
 */

import * as path from "jsr:@std/path@1";

// =============================================================================
// TYPES
// =============================================================================

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
  clientPath: string;
  modPath: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Endpoints to check */
const API_ENDPOINTS: ApiEndpoint[] = [
  {
    name: "info",
    methodsDir: "src/api/info/_methods",
    clientPath: "src/api/info/client.ts",
    modPath: "src/api/info/mod.ts",
  },
  {
    name: "exchange",
    methodsDir: "src/api/exchange/_methods",
    clientPath: "src/api/exchange/client.ts",
    modPath: "src/api/exchange/mod.ts",
  },
  {
    name: "subscription",
    methodsDir: "src/api/subscription/_methods",
    clientPath: "src/api/subscription/client.ts",
    modPath: "src/api/subscription/mod.ts",
  },
];

// =============================================================================
// PARSING
// =============================================================================

/** Get all method names from _methods directory */
async function getMethodsFromDir(methodsDir: string): Promise<Set<string>> {
  const methods = new Set<string>();
  const projectRoot = Deno.cwd();
  const fullPath = path.join(projectRoot, methodsDir);

  for await (const entry of Deno.readDir(fullPath)) {
    if (!entry.isFile || !entry.name.endsWith(".ts")) continue;
    if (entry.name.startsWith("_")) continue;

    const methodName = entry.name.replace(".ts", "");
    methods.add(methodName);
  }

  return methods;
}

/** Parse exported methods from mod.ts */
async function parseModExports(modPath: string): Promise<Set<string>> {
  const methods = new Set<string>();
  const projectRoot = Deno.cwd();
  const fullPath = path.join(projectRoot, modPath);

  const content = await Deno.readTextFile(fullPath);

  // Match: export * from "./_methods/methodName.ts";
  const exportPattern = /export\s+\*\s+from\s+["']\.\/_methods\/(\w+)\.ts["']/g;
  let match;

  while ((match = exportPattern.exec(content)) !== null) {
    const methodName = match[1];
    if (methodName.startsWith("_")) continue;
    methods.add(methodName);
  }

  return methods;
}

/** Parse exported methods from client.ts */
async function parseClientExports(clientPath: string): Promise<Set<string>> {
  const methods = new Set<string>();
  const projectRoot = Deno.cwd();
  const fullPath = path.join(projectRoot, clientPath);

  const content = await Deno.readTextFile(fullPath);

  // Match: export type { ... } from "./_methods/methodName.ts";
  const exportPattern = /export\s+type\s+\{[^}]+\}\s+from\s+["']\.\/_methods\/(\w+)\.ts["']/g;
  let match;

  while ((match = exportPattern.exec(content)) !== null) {
    const methodName = match[1];
    if (methodName.startsWith("_")) continue;
    methods.add(methodName);
  }

  return methods;
}

// =============================================================================
// COMPARISON
// =============================================================================

/** Compare methods from _methods directory with mod.ts exports */
function compareModExports(
  methodsFromDir: Set<string>,
  modExports: Set<string>,
  endpoint: ApiEndpoint,
): SyncError[] {
  const errors: SyncError[] = [];
  const projectRoot = Deno.cwd();

  // Check for methods in _methods but not in mod.ts
  for (const methodName of methodsFromDir) {
    if (!modExports.has(methodName)) {
      errors.push({
        methodName,
        endpoint: endpoint.name,
        errorType: "missing in mod.ts",
        details: `Method "${methodName}" exists in _methods/ but is not exported in mod.ts`,
        filePath: path.join(projectRoot, endpoint.modPath),
      });
    }
  }

  // Check for exports in mod.ts that don't exist in _methods
  for (const methodName of modExports) {
    if (!methodsFromDir.has(methodName)) {
      errors.push({
        methodName,
        endpoint: endpoint.name,
        errorType: "extra in mod.ts",
        details: `Method "${methodName}" is exported in mod.ts but does not exist in _methods/`,
        filePath: path.join(projectRoot, endpoint.modPath),
      });
    }
  }

  return errors;
}

/** Compare methods from _methods directory with client.ts exports */
function compareClientExports(
  methodsFromDir: Set<string>,
  clientExports: Set<string>,
  endpoint: ApiEndpoint,
): SyncError[] {
  const errors: SyncError[] = [];
  const projectRoot = Deno.cwd();

  // Check for methods in _methods but not in client.ts
  for (const methodName of methodsFromDir) {
    if (!clientExports.has(methodName)) {
      errors.push({
        methodName,
        endpoint: endpoint.name,
        errorType: "missing in client.ts",
        details: `Method "${methodName}" exists in _methods/ but is not exported in client.ts`,
        filePath: path.join(projectRoot, endpoint.clientPath),
      });
    }
  }

  // Check for exports in client.ts that don't exist in _methods
  for (const methodName of clientExports) {
    if (!methodsFromDir.has(methodName)) {
      errors.push({
        methodName,
        endpoint: endpoint.name,
        errorType: "extra in client.ts",
        details: `Method "${methodName}" is exported in client.ts but does not exist in _methods/`,
        filePath: path.join(projectRoot, endpoint.clientPath),
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

  for (const endpoint of API_ENDPOINTS) {
    // Get methods from _methods directory
    const methodsFromDir = await getMethodsFromDir(endpoint.methodsDir);

    // Parse mod.ts exports
    const modExports = await parseModExports(endpoint.modPath);

    // Parse client.ts exports
    const clientExports = await parseClientExports(endpoint.clientPath);

    // Compare and collect errors
    allErrors.push(...compareModExports(methodsFromDir, modExports, endpoint));
    allErrors.push(...compareClientExports(methodsFromDir, clientExports, endpoint));
  }

  // Success
  if (allErrors.length === 0) {
    console.log("All exports are synchronized.");
    Deno.exit(0);
  }

  // Print errors
  for (const error of allErrors) {
    console.log(`[ERROR] ${error.endpoint}.${error.methodName}: ${error.errorType}`);
    console.log(`  ${error.details}`);
    console.log(`  File: ${error.filePath}`);
    console.log("");
  }

  console.log(`Found ${allErrors.length} error(s)`);
  Deno.exit(1);
}

// Entry point
main();
