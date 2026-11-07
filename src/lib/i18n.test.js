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
import { createTranslator } from "./i18n";
describe("French punctuation", () => {
  const t = createTranslator("fr");
  test("non-breaking space before colon", () =>
    expect(t("Running in standalone mode - changes won't sync to Standard Notes")).toContain("autonome\u00A0:"));
  test("times keep plain colons", () =>
    expect(t("This will reset the chronometer to 00:00:00. This action cannot be undone.")).toContain("00:00:00"));
});
