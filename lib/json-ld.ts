const JSON_LD_SCRIPT_ESCAPES: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

/** Serialize trusted structured data without allowing values to close its script tag. */
export function serializeJsonLd(value: unknown): string {
  const json = JSON.stringify(value);
  if (json === undefined) {
    throw new TypeError("JSON-LD value must be JSON serializable");
  }
  return json.replace(/[<>&\u2028\u2029]/g, (character) =>
    JSON_LD_SCRIPT_ESCAPES[character] ?? character,
  );
}
