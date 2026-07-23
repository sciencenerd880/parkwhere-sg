import { describe, it, expect } from "vitest"
import { parseSkip, MAX_SKIP } from "@/lib/skip-validator"

describe("parseSkip", () => {
  describe("accepts valid numeric skip values", () => {
    const cases: Array<[string | null | undefined, number]> = [
      [null, 0],
      [undefined, 0],
      ["0", 0],
      ["500", 500],
      ["1000", 1000],
      [String(MAX_SKIP), MAX_SKIP],
    ]
    cases.forEach(([input, expected]) => {
      it(`parseSkip(${JSON.stringify(input)}) -> ${expected}`, () => {
        expect(parseSkip(input)).toBe(expected)
      })
    })
  })

  describe("clamps out-of-range values", () => {
    it("clamps above MAX_SKIP", () => {
      expect(parseSkip(String(MAX_SKIP + 1))).toBe(MAX_SKIP)
    })
    it("clamps a huge value", () => {
      expect(parseSkip("999999")).toBe(MAX_SKIP)
    })
    it("treats negative as 0", () => {
      expect(parseSkip("-100")).toBe(0)
    })
  })

  describe("rejects non-numeric / injection attempts", () => {
    const cases: Array<[string, string]> = [
      ["abc", "plain non-numeric"],
      ["", "empty string"],
      ["0abc", "trailing junk"],
      ["0&$filter=Agency eq 'HDB'", "OData param injection"],
      ["0#/../OtherEndpoint", "hash/path traversal"],
      ["0; drop table", "SQL-ish injection (irrelevant but blocked)"],
      ["1e5", "scientific notation"],
      ["0x10", "hex"],
      ["+5", "unary plus (parseInt allows, but stays 5)"],
    ]
cases.forEach(([input, reason]) => {
      it(`parseSkip(${JSON.stringify(input)}) (${reason}) -> safe int`, () => {
        const out = parseSkip(input)
        // Always a bounded non-negative integer — never the raw string interpolated upstream.
        expect(Number.isInteger(out)).toBe(true)
        expect(out).toBeGreaterThanOrEqual(0)
        expect(out).toBeLessThanOrEqual(MAX_SKIP)
        if (reason.includes("unary plus")) expect(out).toBe(5)
        // parseInt stops at 'e', so "1e5" -> 1 (harmless valid skip)
        if (reason.includes("scientific")) expect(out).toBe(1)
      })
    })
  })

  it("MAX_SKIP is exported and positive integer", () => {
    expect(Number.isInteger(MAX_SKIP)).toBe(true)
    expect(MAX_SKIP).toBeGreaterThan(0)
    expect(MAX_SKIP).toBeLessThanOrEqual(10_000)
  })
})