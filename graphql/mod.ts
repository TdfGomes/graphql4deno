import type {
  ServerRequest,
} from "https://deno.land/std@0.98.0/http/server.ts";
import type { GraphQLParams, Options } from "./graphql.d.ts";

import { readAll } from 'https://deno.land/std@0.98.0/io/util.ts'
import { decode } from "https://deno.land/std@0.98.0/encoding/base64.ts";
import encodeBody from "../utils.ts";
import {
  execute,
  IExecutableSchemaDefinition,
  makeExecutableSchema,
  parse,
  validate,
  validateSchema,
} from "../deps.ts";

export async function getGraphQLParams(
  req: ServerRequest,
): Promise<GraphQLParams> {
  const typeInfo: any = req.headers.get("content-type");

  if (
    typeof req.body === "string" && typeInfo?.type === "application/graphql"
  ) {
    return { query: req.body };
  }

  const bufferContent: Uint8Array = await readAll(req.body);
  const decodedContent: string = decode(bufferContent);
  const params: GraphQLParams = JSON.parse(decodedContent);

  if (params.query === null) {
    throw req.respond({ status: 400, body: "Must provide a query string" });
  }

  return params;
}

export function schemaValidation(
  params: GraphQLParams,
  schema: any,
  req: ServerRequest,
) {
  let documentAST;
  const errors = [];

  try {
    documentAST = parse(params.query, {});
  } catch (e) {
    errors.push(e);
    const body = {
      data: {},
      errors,
    };
    throw req.respond({ status: 400, body: encodeBody(body) });
  }

  const errorMessages = validate(schema, documentAST);

  if (errorMessages.length) {
    errors.push(...errorMessages);
    const body = {
      data: {},
      errors,
    };
    throw req.respond({ status: 400, body: encodeBody(body) });
  }

  const schemaValidationErrors = validateSchema(schema);
  if (schemaValidationErrors.length) {
    errors.push(...schemaValidationErrors);
    const body = {
      data: {},
      errors,
    };
    throw req.respond({ status: 500, body: encodeBody(body) });
  }

  return documentAST;
}

async function executeGraphql(
  req: ServerRequest,
  options: Options,
): Promise<any> {
  let result;
  const params = await getGraphQLParams(req);
  const schema = options.schema.kind !== "Document"
    ? options.schema
    : makeExecutableSchema(
      {
        typeDefs: options.schema,
        resolvers: options.resolvers,
      } as IExecutableSchemaDefinition,
    );
  const document = schemaValidation(params, schema, req);

  if (!document) {
    return;
  }

  try {
    result = await execute(
      schema,
      document,
      options.rootValue,
      options.context ?? req,
      params.variables,
      params.operationName,
      null,
      null,
    );
  } catch (error) {
    const body = {
      data: {},
      errors: [{
        message: "GraphQL execution context error.",
      }],
    };
    throw req.respond({ status: 400, body: encodeBody(body) });
  }
  return result;
}

export default executeGraphql;
