export async function register() {
  // Node 18+ resolves AAAA (IPv6) records before A (IPv4). When there is no
  // working IPv6 route to the upstream weather APIs (open-meteo, wikipedia,
  // bigdatacloud), every server-side fetch waits for the IPv6 attempt to time
  // out before falling back to IPv4 — adding seconds per request. Forcing IPv4
  // first avoids that stall. Node runtime only (the `dns` module is unavailable
  // in the Edge runtime).
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { setDefaultResultOrder } = await import("node:dns");
    setDefaultResultOrder("ipv4first");
  }
}
