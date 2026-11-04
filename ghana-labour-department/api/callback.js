// GET /api/callback : completes GitHub sign-in and hands the token to the CMS window
// using Decap CMS's postMessage handshake. No dependencies.
export default async function handler(req, res) {
  const { code, state } = req.query || {};
  const cookieState = /(?:^|;\s*)ld_cms_state=([a-f0-9]+)/.exec(req.headers.cookie || "")?.[1];
  const reply = (status, content) => {
    const msg = `authorization:github:${status}:${JSON.stringify(content)}`;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Set-Cookie", "ld_cms_state=; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
    res.status(200).send(`<!doctype html><html><body><p>Signing you in to the Ghana Labour Department content manager...</p><script>
(function () {
  var origin = ${JSON.stringify(`${req.headers["x-forwarded-proto"] || "https"}://${req.headers["x-forwarded-host"] || req.headers.host}`)};
  function receive(e) {
    if (e.origin !== origin) return;
    window.opener.postMessage(${JSON.stringify(msg)}, e.origin);
    window.removeEventListener("message", receive, false);
  }
  window.addEventListener("message", receive, false);
  window.opener && window.opener.postMessage("authorizing:github", origin);
})();
</script></body></html>`);
  };

  if (!code || !state || !cookieState || state !== cookieState) return reply("error", { message: "Sign-in expired or was tampered with. Please try again." });
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) return reply("error", { message: "CMS sign-in is not configured." });

  try {
    const r = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code }),
    });
    const data = await r.json();
    if (!r.ok || data.error || !data.access_token) return reply("error", { message: data.error_description || "GitHub did not return a token." });
    return reply("success", { token: data.access_token, provider: "github" });
  } catch (e) {
    return reply("error", { message: "Could not reach GitHub. Please try again." });
  }
}
