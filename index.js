addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const target = url.searchParams.get("url") // Example: ?url=https://api.example.com/data
  const device = url.searchParams.get("device") || "mobile" // optional: mobile/tablet/desktop

  // Mobile / Tablet / Desktop headers
  const userAgents = {
    mobile: 'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36',
    tablet: 'Mozilla/5.0 (Linux; Android 13; Tablet) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    desktop: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
  }

  const headers = {
    'User-Agent': userAgents[device],
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://example.com', // optional, API dependent
    'Origin': 'https://example.com'
  }

  try {
    const response = await fetch(target, {
      method: request.method,
      headers: headers,
      body: request.body ? request.body : undefined
    })

    // Pass through original response headers & status
    const respHeaders = new Headers(response.headers)
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: respHeaders
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
