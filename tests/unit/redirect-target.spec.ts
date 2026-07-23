import { describe, it, expect } from "vitest"
import { safeNext } from "@/lib/redirect-target"

describe("safeNext", () => {
  describe("accepts valid relative paths", () => {
    const cases: Array<[string, string]> = [
      ["/", "/"],
      ["/dashboard", "/dashboard"],
      ["/auth/settings?tab=profile", "/auth/settings?tab=profile"],
      ["/parking/123/details", "/parking/123/details"],
      ["/a", "/a"],
    ]
    cases.forEach(([input, expected]) => {
      it(`accepts ${JSON.stringify(input)} -> ${JSON.stringify(expected)}`, () => {
        expect(safeNext(input)).toBe(expected)
      })
    })
  })

  describe("rejects protocol-relative and absolute bypasses", () => {
    const cases: Array<[string, string]> = [
      ["//evil.com", "protocol-relative"],
      ["//evil.com/steal-token", "protocol-relative with path"],
      ["/\\evil.com", "backslash-prefixed"],
      ["https://evil.com", "absolute https"],
      ["http://evil.com", "absolute http"],
      ["javascript:alert(1)", "javascript scheme"],
    ]
    cases.forEach(([input, reason]) => {
      it(`rejects ${JSON.stringify(input)} (${reason}) -> "/"`, () => {
        expect(safeNext(input)).toBe("/")
      })
    })
  })

  describe("rejects encoded and injection attempts", () => {
    const cases: Array<[string, string]> = [
      ["/%2F%2Fevil.com", "encoded double-slash"],
      ["/%5Cevil.com", "encoded backslash"],
      ["/path\nwith-LF", "LF injection (CRLF)"],
      ["/path\rwith-CR", "CR injection"],
      ["/path\twith-tab", "tab injection"],
      ["/<script>alert(1)</script>", "xss chars"],
    ]
    cases.forEach(([input, reason]) => {
      it(`rejects ${JSON.stringify(input)} (${reason}) -> "/"`, () => {
        expect(safeNext(input)).toBe("/")
      })
    })
  })

  describe("handles null / undefined / empty", () => {
    it("null -> /", () => expect(safeNext(null)).toBe("/"))
    it("undefined -> /", () => expect(safeNext(undefined)).toBe("/"))
    it("empty string -> /", () => expect(safeNext("")).toBe("/"))
  })
})