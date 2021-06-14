import { encode } from "https://deno.land/std@0.98.0/encoding/base64.ts";

export default function encodeBody(body: Record<string, unknown>) {
  return encode(JSON.stringify(body, null, 2));
}
