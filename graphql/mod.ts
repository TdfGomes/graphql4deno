import type {
  ServerRequest,
} from "https://deno.land/std/http/server.ts";
import type { GraphQLOptions, GraphQLParams } from "./graphql.d.ts";

import { decode } from "https://deno.land/std/encoding/utf8.ts";
import encodeBody from '../utils.ts'
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
    throw req.respond({ status: 400, body: "Must provide a query string" });
  }

  console.log("\x1b[31m", "===========> PARAMS", params);
  return params;
}

export function schemaValidation(
  params: GraphQLParams,
  schema: any,
  req: ServerRequest,
): any {
  let documentAST;
  const source = new Source(params.query);
  const errors=[]
  try {
    documentAST = parse(source, {});
  } catch (errors) {
    console.log("\x1b[31m", "Graphql syntax error");
    errors.pus(errors)
    const body = {
      data:{},
      errors
    }
    throw req.respond({ status: 400, body:  encodeBody(body)});
  }

  const errorMessages = validate(schema, documentAST as any);
  
  if (errorMessages.length) {
    console.log("\x1b[41m","Syntax Error");
    errors.push(errorMessages)
    const body = {
      data:{},
      errors
    }
    throw req.respond({status:400,body:encodeBody(body)})
  }
  
  const schemaValidationErrors = validateSchema(schema);
  if (schemaValidationErrors.length) {
    console.log("\x1b[41m", "GraphQL schema validation error.");
    errors.push(schemaValidationErrors);
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
      contextValue: options.contextValue ?? req,
      variableValues: params.variables,
      operationName: params.operationName,
    });
  } catch (error) {
    const body = {
      data: {},
      errors:[{
        message:"GraphQL execution context error."
      }]
    }
    throw req.respond({ status: 400, body:  encodeBody(body)});
  }
  return result;
}

export default executeGraphql