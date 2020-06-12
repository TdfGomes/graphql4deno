import { encode } from "https://deno.land/std/encoding/utf8.ts"

export default function encodeBody(body: object) {
  return encode(JSON.stringify(body));
}