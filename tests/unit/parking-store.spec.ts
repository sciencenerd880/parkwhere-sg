import { describe, it, expect, vi, beforeEach } from "vitest"
import type { User } from "@supabase/supabase-js"

// Mock the supabase client before importing the store so `favorites.ts`
// picks up the fake client.
const upsertMock = vi.fn()
const deleteMock = vi.fn()

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      // propagate whatever upsertMock returns: undefined (default) -> success,
      // a rejected Promise (mockRejectedValueOnce) -> rejection bubbles to addFavorite.
      upsert: (row: unknown, opts: unknown) => {
        const r = upsertMock(row, opts)
        return r instanceof Promise ? r : Promise.resolve({ error: null })
      },
      delete: () => ({
        eq: () => ({
          eq: () => {
            deleteMock()
            return Promise.resolve({ error: null })
          },
        }),
      }),
    }),
  }),
}))

// Auth store we can poke directly.
import { useAuthStore } from "@/store/useAuthStore"
import { useParkingStore } from "@/store/useParkingStore"

const FAKE_USER = { id: "u1", email: "a@b.c" } as unknown as User

/** Flush all pending microtasks (promise chains with .catch/.finally). */
const flush = () => new Promise<void>((r) => setTimeout(r, 0))

beforeEach(() => {
  upsertMock.mockClear()
  deleteMock.mockClear()
  useAuthStore.setState({ user: FAKE_USER })
  useParkingStore.setState({ favorites: [], error: null })
})

describe("toggleFavorite — happy path", () => {
  it("adds favourite on single tap", async () => {
    useParkingStore.getState().toggleFavorite("CP1")
    expect(useParkingStore.getState().favorites).toContain("CP1")
    await flush()
    expect(upsertMock).toHaveBeenCalledTimes(1)
  })

  it("removes favourite on second tap after settle", async () => {
    useParkingStore.getState().toggleFavorite("CP1")
    await flush() // upsert + .finally clear in-flight flag
    useParkingStore.getState().toggleFavorite("CP1")
    await flush()
    expect(useParkingStore.getState().favorites).not.toContain("CP1")
    expect(deleteMock).toHaveBeenCalledTimes(1)
  })
})

describe("toggleFavorite — TOCTOU / double-tap race", () => {
  it("drops the second synchronous tap on the same carpark", async () => {
    useParkingStore.getState().toggleFavorite("CP2")
    useParkingStore.getState().toggleFavorite("CP2") // dropped by in-flight guard

    // Both fire synchronously same tick — only one DB call must occur.
    expect(useParkingStore.getState().favorites).toContain("CP2")

    // Let the in-flight mutation settle (upsert + .finally).
    await flush()

    expect(upsertMock).toHaveBeenCalledTimes(1)
  })

  it("state stays consistent with DB after double-tap (no rollback to [])", async () => {
    useParkingStore.getState().toggleFavorite("CP3")
    useParkingStore.getState().toggleFavorite("CP3")

    await flush()

    // Single tap would have favorited; double-tap must NOT rollback to empty.
    expect(useParkingStore.getState().favorites).toContain("CP3")
    expect(useParkingStore.getState().error).toBeNull()
    expect(upsertMock).toHaveBeenCalledTimes(1)
  })

  it("does NOT drop a tap on a different carpark while one is in flight", async () => {
    useParkingStore.getState().toggleFavorite("CP4")
    useParkingStore.getState().toggleFavorite("CP5") // different carpark — allowed

    await flush()

    const favs = useParkingStore.getState().favorites
    expect(favs).toContain("CP4")
    expect(favs).toContain("CP5")
    expect(upsertMock).toHaveBeenCalledTimes(2)
  })
})

describe("toggleFavorite — network error rollback", () => {
  it("reverts optimistic state and sets an error message on upsert failure", async () => {
    upsertMock.mockRejectedValueOnce(new Error("500"))
    useParkingStore.getState().toggleFavorite("CP6")

    await flush()

    expect(useParkingStore.getState().favorites).not.toContain("CP6")
    expect(useParkingStore.getState().error).toMatch(/favourites/i)
  })
})

describe("toggleFavorite — unauthenticated", () => {
  it("triggers sign-in and does not mutate favourites", () => {
    useAuthStore.setState({ user: null })
    const signInSpy = vi
      .spyOn(useAuthStore.getState(), "signInWithGoogle")
      .mockImplementation(async () => {})
    useParkingStore.getState().toggleFavorite("CP7")
    expect(signInSpy).toHaveBeenCalledTimes(1)
    expect(useParkingStore.getState().favorites).toEqual([])
  })
})