export const api = async (p, o) => {
  try {
    const res = await fetch(`/api/${p}`, o)
    const json = await res.json().catch(() => ({}))
    if (!res.ok) return { error: true, status: res.status, code: json?.error }
    return json
  } catch (err) {
    console.warn(`API call failed for /api/${p}:`, err)
    return { error: true }
  }
}

export const jsonPost = (p, body, method = 'POST') =>
  api(p, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
