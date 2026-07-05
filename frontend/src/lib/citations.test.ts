import { describe, expect, it } from "vitest";

import { citationNumberFromHref, linkifyCitations } from "./citations";

describe("linkifyCitations", () => {
  it("turns [n] markers into markdown citation links", () => {
    expect(linkifyCitations("He built X [1] and Y [2].")).toBe(
      "He built X [1](#cite-1) and Y [2](#cite-2)."
    );
  });

  it("leaves text without markers untouched", () => {
    expect(linkifyCitations("No citations here.")).toBe("No citations here.");
  });
});

describe("citationNumberFromHref", () => {
  it("extracts the citation number from chip hrefs", () => {
    expect(citationNumberFromHref("#cite-3")).toBe(3);
  });

  it("rejects non-citation hrefs and invalid numbers", () => {
    expect(citationNumberFromHref("https://example.com")).toBeNull();
    expect(citationNumberFromHref("#cite-0")).toBeNull();
    expect(citationNumberFromHref("#cite-abc")).toBeNull();
  });
});
