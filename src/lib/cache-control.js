export function setPublicCache(
  res,
  { maxAge = 0, sMaxage = 60, staleWhileRevalidate = 300 } = {}
) {
  res.setHeader(
    "Cache-Control",
    `public, max-age=${maxAge}, s-maxage=${sMaxage}, stale-while-revalidate=${staleWhileRevalidate}`
  );
}
