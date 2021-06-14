import type {
  HTTPOptions,
  ServerRequest,
} from "https://deno.land/std@0.98.0/http/server.ts";
import type { Options } from "./graphql/graphql.d.ts";

import { listenAndServe } from "https://deno.land/std@0.98.0/http/server.ts";

import encodeBody from "./utils.ts";
import executeGraphql from "./graphql/mod.ts";

export default function graphqlHttp(
  addr: string | HTTPOptions,
  path: string,
  options: Options,
): void {
  async function handler(req: ServerRequest): Promise<void> {
    if (req.method !== "POST" && req.method !== "GET") {
      return req.respond({
        status: 405,
        body: 'Method not allowed!\nGraphql only supports "GET" or "POST"',
      });
    }
    if (req.url !== path) {
      return req.respond({ status: 404, body: "Route not Found!" });
    }
    try {
      const result = await executeGraphql(req, options);

      const body = encodeBody(result);
      return req.respond({
        status: 200,
        headers: new Headers({
          "content-type": "application/json",
          "content-length": String(body.length),
        }),
        body,
      });
    } catch {}
  }

  listenAndServe(addr, handler);
}
