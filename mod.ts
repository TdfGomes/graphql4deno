import type { ServerRequest, HTTPOptions } from "https://deno.land/std/http/server.ts";
import type { GraphQLOptions } from './graphql/graphql.d.ts'

import { listenAndServe } from "https://deno.land/std/http/server.ts";
import { encode } from "https://deno.land/std/encoding/utf8.ts"

import  executeGraphql from "./graphql/mod.ts";

function encodeBody(body: object) {
  return encode(JSON.stringify(body));
}

export default function graphqlHttp(addr: string | HTTPOptions, path: string, options: GraphQLOptions):any{

  async function handler(req: ServerRequest):Promise<void>{
    if (req.method !== 'POST' && req.method !== 'GET') {
      return req.respond({status:405, body:'Method not allowed!\nGraphql only supports "GET" or "POST"'}) 
    }
    if (req.url !== path) {
      return req.respond({status:404, body:'Route not Found!'}) 
    }
  
    const result = await executeGraphql(req,options);
    console.log("\x1b[32m", "===========> RESULT", result);
    const body = encodeBody(result);
    
    return req.respond({
      status:200,
      headers: new Headers({
        'content-type': 'application/json',
        'content-length': String(body.length)
      }),
      body
    })
  
  }
  
  listenAndServe(addr,handler)
}



