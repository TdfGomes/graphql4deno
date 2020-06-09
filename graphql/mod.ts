import type {
  ServerRequest,
} from "https://deno.land/std/http/server.ts";
import type { GraphQLOptions, GraphQLParams } from "./graphql.d.ts";
import { decode } from "https://deno.land/std/encoding/utf8.ts";
import {
  Source,
  parse,
  validate,
  validateSchema,
  execute,
  syntaxError,
} from "../deps.ts";

export async function getGraphQLParams(req: ServerRequest): Promise<GraphQLParams> {
  const typeInfo: any = req.headers.get("content-type");

  if (
    typeof req.body === "string" && typeInfo?.type === "application/graphql"
  ) {
    return { query: req.body };
  }

  const bufferContent: Uint8Array = await Deno.readAll(req.body);
  const decodedContent: string = decode(bufferContent);
  const params: GraphQLParams = JSON.parse(decodedContent);

  if (params.query === null) {
    req.respond({ status: 400, body: "Must provide a query string" });
  }

  console.log("\x1b[36m", "===========> PARAMS", params);
  return params;
}

export function schemaValidation(
  params: GraphQLParams,
  schema: any,
  req: ServerRequest,
): any {
  let documentAST;
  const source = new Source(params.query);

  try {
    documentAST = parse(source, {});
  } catch (error) {
    console.log("\x1b[41m", error);
    req.respond({ status: 400, body: "Graphql syntax error" });
  }

  const errorMessages = validate(schema, documentAST as any);
  console.log("\x1b[36m", "===========> VALID", errorMessages);

  if (errorMessages.length) {
    console.log("\x1b[41m", syntaxError(source, 1, errorMessages as any));
    req.respond({ status: 400, body: "Graphql validation error" });
  }

  const schemaValidationErrors = validateSchema(schema);
  if (schemaValidationErrors.length) {
    req.respond({ status: 500, body: "GraphQL schema validation error." });
  }

  return documentAST;
}

async function executeGraphql(
  req: ServerRequest,
  options: GraphQLOptions,
): Promise<any> {
  let result;
  const params = await getGraphQLParams(req);
  const document = schemaValidation(params, options.schema, req);

  if (!document) {
    return;
  }

  try {
    result = await execute({
      schema:options.schema,
      document,
      rootValue: "",
      contextValue: options.contextValue,
      variableValues: params.variables,
      operationName: options.operationName,
    });
  } catch (error) {
    req.respond({ status: 400, body: "GraphQL execution context error." });
  }
  return result;
}

export default executeGraphql