import type {
  ServerRequest,
} from "https://deno.land/std/http/server.ts";
import type { GraphQLParams, Otpions } from "./graphql.d.ts";

import { decode } from "https://deno.land/std/encoding/utf8.ts";
import encodeBody from '../utils.ts'
import {
  makeExecutableSchema,
  Source,
  parse,
  validate,
  validateSchema,
  execute,
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
  console.log("\x1b[36m","====>documentAST_2",documentAST)
  
  const errorMessages = validate(schema, documentAST as any);
  console.log("\x1b[36m","====>ERRRORR",errorMessages)
  if (errorMessages.length) {
    console.log("\x1b[31m","Syntax Error");
    errors.push(errorMessages)
    const body = {
      data:{},
      errors
    }
    throw req.respond({status:400,body:encodeBody(body)})
  }
  
  const schemaValidationErrors = validateSchema(schema);
  if (schemaValidationErrors.length) {
    console.log("\x1b[31m", "GraphQL schema validation error.");
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
  options: Otpions,
  ): Promise<any> {
    let result;
    const params = await getGraphQLParams(req);
    const schema = options.schema.kind !== 'Document' ? options.schema : makeExecutableSchema({typeDefs:options.schema,resolvers:options.resolvers, })
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
    console.log("\x1b[31m", "GraphQL execution context error.");
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