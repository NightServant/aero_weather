import { describe, it, expect, vi, afterEach } from "vitest";
import { getJSON } from "./client";

type FetchInit = RequestInit & { next?: { revalidate: number } };
type FetchLike = (url: string, init?: FetchInit) => Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
  text: () => Promise<string>;
}>;

function mockFetch(body: unknown, ok = true, status = 200, text = "") {
  const fn = vi.fn<FetchLike>(async () => ({
    ok,
    status,
    json: async () => body,
    text: async () => text,
  }));
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe("getJSON", () => {
  it("builds a query string, skipping undefined and joining arrays with commas", async () => {
    const fetchFn = mockFetch({ ok: 1 });
    await getJSON("https://api.test/data", {
      name: "Berlin",
      count: 8,
      flag: true,
      fields: ["a", "b"],
      omit: undefined,
    });
    const url = new URL(fetchFn.mock.calls[0]![0]);
    expect(url.origin + url.pathname).toBe("https://api.test/data");
    expect(url.searchParams.get("name")).toBe("Berlin");
    expect(url.searchParams.get("count")).toBe("8");
    expect(url.searchParams.get("flag")).toBe("true");
    expect(url.searchParams.get("fields")).toBe("a,b");
    expect(url.searchParams.has("omit")).toBe(false);
  });

  it("returns the parsed JSON body", async () => {
    mockFetch({ hello: "world" });
    await expect(getJSON("https://api.test/x", {})).resolves.toEqual({ hello: "world" });
  });

  it("forwards the revalidate option to the fetch call", async () => {
    const fetchFn = mockFetch({});
    await getJSON("https://api.test/x", {}, { revalidate: 3600 });
    const init = fetchFn.mock.calls[0]![1];
    expect(init?.next?.revalidate).toBe(3600);
  });

  it("defaults revalidate to 600 when not provided", async () => {
    const fetchFn = mockFetch({});
    await getJSON("https://api.test/x", {});
    const init = fetchFn.mock.calls[0]![1];
    expect(init?.next?.revalidate).toBe(600);
  });

  it("throws with the status code and body text on a non-ok response", async () => {
    mockFetch(null, false, 503, "upstream down");
    await expect(getJSON("https://api.test/x", {})).rejects.toThrow(/503.*upstream down/);
  });
});
