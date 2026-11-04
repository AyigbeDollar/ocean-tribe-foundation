// GET /api/auth : starts GitHub sign-in for the CMS at /admin (Decap CMS OAuth flow).
// Needs GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET from a GitHub OAuth App whose
// callback URL is https://<site>/api/callback. No dependencies.
import { randomBytes } from "node:crypto";

export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(501).send("CMS sign-in is not configured yet: set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in Vercel.");
    return;
  }
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  const state = randomBytes(16).toString("hex");
  const scope = process.env.GITHUB_OAUTH_SCOPE || "repo,user";
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", `${proto}://${host}/api/callback`);
  url.searchParams.set("scope", scope);
  url.searchParams.set("state", state);
  res.setHeader("Set-Cookie", `ld_cms_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  res.setHeader("Cache-Control", "no-store");
  res.redirect(302, url.toString());
}
