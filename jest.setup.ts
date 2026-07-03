import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "node:util";
import { ReadableStream } from "node:stream/web";

if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = TextDecoder as typeof global.TextDecoder;
}
if (typeof global.ReadableStream === "undefined") {
  global.ReadableStream = ReadableStream as typeof global.ReadableStream;
}
