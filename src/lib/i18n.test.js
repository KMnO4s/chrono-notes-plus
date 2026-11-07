import { describe, test, expect } from "bun:test";
import { normalizeLanguage } from "./i18n";

describe("note language setting", () => {
  test("allows French", () => expect(normalizeLanguage("fr")).toBe("fr"));
  test("allows English", () => expect(normalizeLanguage("en")).toBe("en"));
  test("defaults older notes and unsupported languages to French", () => {
    expect(normalizeLanguage(undefined)).toBe("fr");
    expect(normalizeLanguage("es")).toBe("fr");
  });
});