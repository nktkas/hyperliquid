// deno-lint-ignore-file no-explicit-any no-import-prefix no-console

/**
 * Generates OpenAPI specs from SDK schemas/types and syncs them to GitBook.
 *
 * - Request schemas: converted from valibot via `@valibot/to-json-schema`
 * - Response types: converted from TypeScript via `typeToJsonSchema`
 *
 * Required environment variables:
 * - GITBOOK_TOKEN: GitBook API token
 * - GITBOOK_ORG_ID: GitBook organization ID
 *
 * @example
 * ```sh
 * deno run -A docs/.scripts/updateOpenAPI.ts
 * ```
 */

// =============================================================================
// IMPORTS
// =============================================================================

import "jsr:@std/dotenv@^0.225.5/load";

import * as hl from "@nktkas/hyperliquid";
import * as hlExchange from "@nktkas/hyperliquid/api/exchange";
import * as hlInfo from "@nktkas/hyperliquid/api/info";
import * as hlSubscription from "@nktkas/hyperliquid/api/subscription";
import type { AbstractWallet } from "@nktkas/hyperliquid/signing";
import { convert } from "npm:@openapi-contrib/json-schema-to-openapi-schema@4";
import { type ConversionConfig, type JsonSchema, toJsonSchema } from "jsr:@valibot/to-json-schema@1";
import * as path from "jsr:@std/path@1";

import { typeToJsonSchema } from "../../tests/api/_utils/typeToJsonSchema.ts";

import { enrichJsonSchema } from "./schemaEnricher.ts";
import { parseFunctionJSDocFromFile, parseJSDocFromFile } from "./jsdocParser.ts";

// =============================================================================
// TYPES
// =============================================================================

/** API endpoint type */
type Endpoint = "info" | "exchange" | "subscription";

/** Collection of all schemas grouped by endpoint and method */
type AllSchemas = Record<
  Endpoint,
  Record<string, { request: JsonSchema; response: JsonSchema; codeSamples?: string[] }>
>;

/** Collection of OpenAPI specs grouped by endpoint and method */
type OpenAPISpecs = Record<Endpoint, Record<string, unknown>>;

// =============================================================================
// CONSTANTS
// =============================================================================

/** Mapping of endpoints to their API modules */
const API_MODULES: Record<Endpoint, typeof hlInfo | typeof hlExchange | typeof hlSubscription> = {
  info: hlInfo,
  exchange: hlExchange,
  subscription: hlSubscription,
};

/** Ordered list of all endpoints */
const ENDPOINTS: Endpoint[] = ["info", "exchange", "subscription"];

/** REST API server configurations */
const REST_SERVERS = [
  { url: "https://api.hyperliquid.xyz", description: "Mainnet" },
  { url: "https://api.hyperliquid-testnet.xyz", description: "Testnet" },
];

/** WebSocket server configurations */
const WEBSOCKET_SERVERS = [
  { url: "wss://api.hyperliquid.xyz/ws", description: "Mainnet WebSocket" },
  { url: "wss://api.hyperliquid-testnet.xyz/ws", description: "Testnet WebSocket" },
];

/** Display titles for endpoint sections in SUMMARY.md */
const SECTION_TITLES: Record<Endpoint, string> = {
  info: "Info Methods",
  exchange: "Exchange Methods",
  subscription: "Subscription Methods",
};

/** GitBook API base URL */
const GITBOOK_API_BASE = "https://api.gitbook.com/v1";

// =============================================================================
// SCHEMA EXTRACTION
// =============================================================================

/**
 * Extract all schemas/types from SDK and convert to JSON Schemas.
 *
 * Request schemas are extracted from valibot and enriched with JSDoc.
 * Response types are converted from TypeScript with automatic JSDoc extraction.
 *
 * @returns Collection of JSON Schemas for all endpoints and methods
 */
export function getAllSchemas(): AllSchemas {
  console.log("[Schemas] Starting to extract schemas...");

  // Configuration for valibot-to-json-schema conversion (used for Request schemas only)
  const toJsonConfig: ConversionConfig = {
    // Skip validation errors (some schemas may have unsupported constructs)
    errorMode: "ignore",
    // Use output types (after validation transforms)
    typeMode: "output",
    // Remove default values from generated schemas (not needed for API docs)
    overrideSchema: ({ jsonSchema }) => {
      if ("default" in jsonSchema) delete jsonSchema.default;
      return undefined;
    },
  };

  // Path to SDK source files
  const srcBasePath = path.resolve(path.dirname(path.fromFileUrl(import.meta.url)), "../../src/api");
  const results: AllSchemas = { info: {}, exchange: {}, subscription: {} };

  for (const endpoint of ENDPOINTS) {
    // Get the API module containing valibot request schemas (e.g., hlInfo, hlExchange)
    const api = API_MODULES[endpoint];
    // Get method names by introspecting the SDK client class
    const methods = getAllMethodsFromClient(endpoint);

    for (const method of methods) {
      // Convert method name to PascalCase (e.g., "userFills" -> "UserFills")
      const pascalMethod = capitalizeFirst(method);
      // Path to method source file (e.g., src/api/info/_methods/userFills.ts)
      const sourceFilePath = path.join(srcBasePath, endpoint, "_methods", `${method}.ts`);
      // Parse JSDoc comments from source file for field descriptions
      const jsdocData = parseJSDocFromFile(sourceFilePath);

      // Convert request valibot schema to JSON Schema and enrich with JSDoc
      const requestVSchema = api[pascalMethod + "Request" as keyof typeof api] as any;
      let requestJSchema = toJsonSchema(requestVSchema, toJsonConfig);
      const requestJSDoc = jsdocData[`${pascalMethod}Request`];
      if (requestJSDoc) {
        requestJSchema = enrichJsonSchema(requestJSchema, requestJSDoc);
      }

      // Convert response TypeScript type to JSON Schema
      // typeToJsonSchema extracts JSDoc tags (@description, @pattern, etc.) automatically
      // Note: Subscriptions use *Event suffix instead of *Response
      const responseKey = endpoint === "subscription" ? "Event" : "Response";
      const responseJSchema = typeToJsonSchema(sourceFilePath, pascalMethod + responseKey);

      // Extract @example from function JSDoc
      const functionJSDoc = parseFunctionJSDocFromFile(sourceFilePath);
      const codeSamples = functionJSDoc[method]?.examples;

      results[endpoint][method] = {
        request: requestJSchema,
        response: responseJSchema as JsonSchema,
        codeSamples,
      };
    }
  }

  console.log("[Schemas] Completed extraction of schemas.");
  return results;
}

/**
 * Get all method names from an SDK client.
 * @param endpoint - The endpoint type to get methods for
 * @returns Array of method names
 */
function getAllMethodsFromClient(endpoint: Endpoint): string[] {
  // Factory functions to create dummy client instances for method introspection
  // We pass empty objects as transport/wallet since we only need the prototype
  const clientFactories: Record<Endpoint, () => hl.InfoClient | hl.ExchangeClient | hl.SubscriptionClient> = {
    info: () => new hl.InfoClient({ transport: {} as hl.HttpTransport }),
    exchange: () => new hl.ExchangeClient({ transport: {} as hl.HttpTransport, wallet: {} as AbstractWallet }),
    subscription: () => new hl.SubscriptionClient({ transport: {} as hl.WebSocketTransport }),
  };

  const client = clientFactories[endpoint]();

  // Extract public method names from client prototype, excluding constructor
  return Object.getOwnPropertyNames(Object.getPrototypeOf(client))
    .filter((name) => name !== "constructor" && typeof client[name as keyof typeof client] === "function");
}

/** Capitalize the first character of a string */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// =============================================================================
// OPENAPI CONVERSION
// =============================================================================

/** Build OpenAPI responses object for an endpoint */
function buildResponses(
  endpoint: Endpoint,
  responseDescription: string,
  openapiResponse: unknown,
): Record<string, object> {
  const responses: Record<string, object> = {
    "200": {
      description: responseDescription,
      content: { "application/json": { schema: openapiResponse } },
    },
  };

  // REST endpoints have additional error responses
  if (endpoint !== "subscription") {
    responses["422"] = {
      description: "Failed to deserialize the JSON body into the target type",
      content: { "text/plain": { schema: { type: "string" } } },
    };
    // Only info endpoint can return internal server errors
    if (endpoint === "info") {
      responses["500"] = {
        description: "Internal Server Error",
        content: { "application/json": { schema: { type: "null" } } },
      };
    }
  }

  return responses;
}

/**
 * Convert JSON Schemas to OpenAPI specs.
 * @param schemas - Collection of JSON Schemas to convert
 * @returns Collection of OpenAPI specs
 */
export async function jsonSchemasToOpenAPIs(schemas: AllSchemas): Promise<OpenAPISpecs> {
  console.log("[OpenAPI] Converting JSON schemas to OpenAPI specs...");
  const result: OpenAPISpecs = { info: {}, exchange: {}, subscription: {} };

  for (const endpoint of ENDPOINTS) {
    for (const method of Object.keys(schemas[endpoint])) {
      const { request, response, codeSamples } = schemas[endpoint][method];

      // Convert JSON Schema to OpenAPI Schema (handles differences like nullable, etc.)
      const openapiRequest = await convert(request);
      const openapiResponse = await convert(response);

      const isSubscription = endpoint === "subscription";
      // WebSocket subscriptions use "/" path, REST endpoints use "/info" or "/exchange"
      const pathKey = isSubscription ? "/" : `/${endpoint}`;
      const responses = buildResponses(endpoint, response?.description || "", openapiResponse);

      // Build x-codeSamples from function @example tags
      const xCodeSamples = codeSamples?.map((source) => ({ lang: "TypeScript", source }));

      // Build complete OpenAPI spec for this method
      const spec = {
        openapi: "3.1.1",
        info: {
          title: isSubscription ? `Hyperliquid Subscription - ${method}` : `Hyperliquid API - ${endpoint}/${method}`,
          version: "1.0.0",
        },
        servers: isSubscription ? WEBSOCKET_SERVERS : REST_SERVERS,
        // x-page-title and x-page-slug are GitBook-specific extensions for page generation
        tags: [{ name: method, "x-page-title": method, "x-page-slug": method }],
        paths: {
          [pathKey]: {
            post: {
              tags: [method],
              ...(isSubscription ? { summary: `Subscribe to ${method}` } : {}),
              description: request.description || "",
              ...(xCodeSamples?.length ? { "x-codeSamples": xCodeSamples } : {}),
              requestBody: {
                content: { "application/json": { schema: openapiRequest } },
                required: true,
              },
              responses,
            },
          },
        },
      };

      result[endpoint][method] = spec;
    }
  }

  const totalSpecs = Object.values(result).reduce((sum, methods) => sum + Object.keys(methods).length, 0);
  console.log(`[OpenAPI] Completed: ${totalSpecs} specs converted`);
  return result;
}

// =============================================================================
// SUMMARY.MD UPDATE
// =============================================================================

/**
 * Update SUMMARY.md with OpenAPI method references.
 * @param openapiSpecs - Collection of OpenAPI specs to reference
 */
export async function updateSummary(openapiSpecs: OpenAPISpecs): Promise<void> {
  console.log("[Summary] Updating SUMMARY.md...");
  const summaryPath = new URL("../SUMMARY.md", import.meta.url);
  const summary = await Deno.readTextFile(summaryPath);

  // Find "## API Reference" section start position
  const apiHeader = "## API Reference";
  const start = summary.indexOf(apiHeader);
  if (start === -1) throw new Error("Section '## API Reference' not found in SUMMARY.md");

  // Find the next section (## ...) to determine where API Reference section ends
  const nextHeaderIndex = summary.indexOf("\n## ", start + apiHeader.length);
  // Content before API Reference section (to preserve)
  const prefix = summary.slice(0, start);
  // Content after API Reference section (to preserve), empty if no next section
  const suffix = nextHeaderIndex === -1 ? "" : summary.slice(nextHeaderIndex);

  // Build new API Reference section content
  const lines = ["## API Reference", ""];

  for (const endpoint of ENDPOINTS) {
    const methods = Object.keys(openapiSpecs[endpoint]).sort();
    if (!methods.length) continue;

    // Group header without link creates a collapsible group in GitBook
    lines.push(`- ${SECTION_TITLES[endpoint]}`);
    // Each method gets a YAML block that references the uploaded OpenAPI spec
    for (const method of methods) {
      lines.push(...buildMethodYamlBlock(endpoint, method));
    }
    lines.push("");
  }

  // Reconstruct SUMMARY.md: prefix + new API Reference + suffix
  await Deno.writeTextFile(summaryPath, `${prefix}${lines.join("\n")}${suffix}`.trimEnd() + "\n");
  const totalMethods = Object.values(openapiSpecs).reduce((sum, methods) => sum + Object.keys(methods).length, 0);
  console.log(`[Summary] Updated with ${totalMethods} methods`);
}

/** Build GitBook YAML block that embeds an OpenAPI spec as documentation page */
function buildMethodYamlBlock(endpoint: Endpoint, method: string): string[] {
  return [
    `  - \`\`\`yaml`,
    "    type: builtin:openapi",
    "    props:",
    "      models: false",
    "      downloadLink: false",
    "    dependencies:",
    "      spec:",
    "        ref:",
    "          kind: openapi",
    `          spec: hl-${endpoint}-${method}`,
    "    ```",
  ];
}

// =============================================================================
// GITBOOK SYNC
// =============================================================================

/**
 * Sync OpenAPI specs to GitBook organization.
 * @param openapiSpecs - Collection of OpenAPI specs to upload
 * @param gitbookToken - GitBook API token
 * @param orgId - GitBook organization ID
 */
export async function updateGitBookOpenAPIs(
  openapiSpecs: OpenAPISpecs,
  gitbookToken: string,
  orgId: string,
): Promise<void> {
  console.log("[GitBook] Starting GitBook OpenAPI sync...");
  const headers = {
    Authorization: `Bearer ${gitbookToken}`,
    "Content-Type": "application/json",
  };

  // Convert nested openapiSpecs to flat array with slug identifiers
  // Slug format: "hl-{endpoint}-{method}" (e.g., "hl-info-userFills")
  const localSpecs = Object.entries(openapiSpecs)
    .flatMap(([section, methods]) =>
      Object.entries(methods).map(([name, spec]) => ({
        slug: `hl-${section}-${name}`,
        text: JSON.stringify(spec),
      }))
    )
    .sort((a, b) => a.slug.localeCompare(b.slug));

  console.log(`[GitBook] Prepared ${localSpecs.length} local specs`);
  if (localSpecs.length === 0) {
    console.log("[GitBook] No specs to upload.");
    return;
  }

  // Set of local slugs for quick membership check
  const localSlugs = new Set(localSpecs.map((s) => s.slug));

  // Fetch all existing specs from GitBook to determine what to create/update/delete
  console.log("[GitBook] Fetching existing specs from GitBook...");
  const { slugs: remoteSlugs, pageCount } = await fetchAllRemoteSpecs(orgId, headers);
  console.log(`[GitBook] Fetched ${remoteSlugs.length} existing specs from GitBook over ${pageCount} page(s)`);

  // Delete specs that exist remotely but not locally (removed methods)
  const toDelete = remoteSlugs.filter((slug) => !localSlugs.has(slug));
  if (toDelete.length > 0) {
    console.log(`[GitBook] Deleting ${toDelete.length} obsolete spec(s)...`);
    for (const slug of toDelete) {
      await deleteGitBookSpec(orgId, slug, headers);
      console.log(`[GitBook] Deleted ${slug}`);
    }
  }

  // Categorize specs for logging (both use PUT, but different log messages)
  const remoteSlugSet = new Set(remoteSlugs);
  const toCreate = localSpecs.filter((s) => !remoteSlugSet.has(s.slug));
  const toUpdate = localSpecs.filter((s) => remoteSlugSet.has(s.slug));
  console.log(`[GitBook] Uploading ${toCreate.length} new, updating ${toUpdate.length} existing spec(s)...`);

  // Upload all local specs (GitBook PUT creates or updates based on slug existence)
  for (const { slug, text } of localSpecs) {
    const isUpdate = remoteSlugSet.has(slug);
    await uploadGitBookSpec(orgId, slug, text, headers);
    console.log(`[GitBook] ${isUpdate ? "Updated" : "Uploaded"} ${slug}`);
  }

  console.log(`[GitBook] Sync completed`);
}

// =============================================================================
// GITBOOK HELPER FUNCTIONS
// =============================================================================

/**
 * Fetch all remote OpenAPI specs from GitBook with pagination.
 * @param orgId - GitBook organization ID
 * @param headers - API headers
 * @returns Array of slugs and page count
 */
async function fetchAllRemoteSpecs(
  orgId: string,
  headers: Record<string, string>,
): Promise<{ slugs: string[]; pageCount: number }> {
  const allRemoteSpecs: Array<{ slug: string }> = [];
  let nextPage: string | undefined;
  let pageCount = 0;

  // Paginate through all specs (GitBook returns max 1000 per page)
  do {
    pageCount++;
    const url = new URL(`${GITBOOK_API_BASE}/orgs/${orgId}/openapi`);
    url.searchParams.set("limit", "1000");
    if (nextPage) url.searchParams.set("page", nextPage);

    const response = await fetch(url.toString(), { headers });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Failed to list GitBook specs (${response.status}): ${body}`);
    }

    const data = await response.json();
    allRemoteSpecs.push(...data.items);
    // data.next.page contains cursor for next page, undefined if no more pages
    nextPage = data.next?.page;
  } while (nextPage);

  // Filter only our specs (prefixed with "hl-") to avoid touching other specs
  const slugs = allRemoteSpecs
    .map((item) => item.slug)
    .filter((slug) => slug.startsWith("hl-"));

  return { slugs, pageCount };
}

/**
 * Delete an OpenAPI spec from GitBook.
 * @param orgId - GitBook organization ID
 * @param slug - Spec slug to delete
 * @param headers - API headers
 */
async function deleteGitBookSpec(
  orgId: string,
  slug: string,
  headers: Record<string, string>,
): Promise<void> {
  const response = await fetch(`${GITBOOK_API_BASE}/orgs/${orgId}/openapi/${slug}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Delete failed for ${slug} (${response.status}): ${body}`);
  }
}

/**
 * Upload or update an OpenAPI spec to GitBook.
 * @param orgId - GitBook organization ID
 * @param slug - Spec slug
 * @param text - Spec content as JSON string
 * @param headers - API headers
 */
async function uploadGitBookSpec(
  orgId: string,
  slug: string,
  text: string,
  headers: Record<string, string>,
): Promise<void> {
  // PUT creates if not exists, updates if exists
  const response = await fetch(`${GITBOOK_API_BASE}/orgs/${orgId}/openapi/${slug}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ source: { text } }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Upload failed for ${slug} (${response.status}): ${body}`);
  }
}

// =============================================================================
// MAIN
// =============================================================================

if (import.meta.main) {
  console.log("==".repeat(40));
  console.log("Starting Hyperliquid OpenAPI Update Process");
  console.log("==".repeat(40));

  const GITBOOK_TOKEN = Deno.env.get("GITBOOK_TOKEN");
  const GITBOOK_ORG_ID = Deno.env.get("GITBOOK_ORG_ID");

  if (!GITBOOK_TOKEN || !GITBOOK_ORG_ID) {
    throw new Error("GITBOOK_TOKEN and GITBOOK_ORG_ID must be set in environment variables");
  }

  // Step 1: Extract JSON Schemas from SDK schemas/types with JSDoc enrichment
  const schemas = getAllSchemas();
  // Step 2: Convert JSON Schemas to OpenAPI specs
  const openapiSpecs = await jsonSchemasToOpenAPIs(schemas);
  // Step 3: Update local SUMMARY.md with method references
  await updateSummary(openapiSpecs);
  // Step 4: Sync OpenAPI specs to GitBook (create, update, delete)
  await updateGitBookOpenAPIs(openapiSpecs, GITBOOK_TOKEN, GITBOOK_ORG_ID);

  console.log("==".repeat(40));
  console.log(`Process completed successfully`);
  console.log("==".repeat(40));
}
