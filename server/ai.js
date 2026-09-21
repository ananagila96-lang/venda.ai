export async function getAIReply({ url, token, tenantId, contactWaId, text, history, fetchImpl = fetch }) {
  if (!url) return null;
  const response = await fetchImpl(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ tenantId, contactWaId, message: text, history }),
  });
  if (!response.ok) throw new Error(`AI webhook failed: ${response.status}`);
  const data = await response.json();
  const reply = typeof data?.reply === "string" ? data.reply.trim() : "";
  return reply || null;
}
