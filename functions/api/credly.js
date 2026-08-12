const CREDLY_USER_AGENT = "Mozilla/5.0 (compatible; AWS-Medaglier/1.0)"
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
    },
  })
}

export async function onRequest(context) {
  const { request } = context
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  const url = new URL(request.url)
  const username = url.searchParams.get("username")?.trim()
  const page = url.searchParams.get("page") ?? "1"

  if (!username) {
    return jsonResponse({ error: "username is required" }, 400)
  }

  try {
    const response = await fetch(
      `https://www.credly.com/users/${encodeURIComponent(username)}/badges?page=${page}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": CREDLY_USER_AGENT,
        },
      },
    )

    if (!response.ok) {
      if (response.status === 404) {
        return jsonResponse(
          { error: `No Credly profile was found for username ${username}.` },
          404,
        )
      }

      const text = await response.text()
      return jsonResponse(
        { error: `Credly request failed with ${response.status}.`, detail: text },
        response.status,
      )
    }

    const body = await response.text()
    return new Response(body, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Credly proxy failed" },
      502,
    )
  }
}
