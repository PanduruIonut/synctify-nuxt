export default defineEventHandler((event) => {
  const query = getQuery(event)
  const queryString = new URLSearchParams(query as Record<string, string>).toString()
  return sendRedirect(event, '/callback' + (queryString ? '?' + queryString : ''), 302)
})
