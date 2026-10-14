import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { pkcePair, randomId } from "../../../lib/crypto";
import { db, now } from "../../../lib/db";
import { HttpError } from "../../../lib/http";
import { authUrl } from "../../../lib/openrouter";
import { canManageAI, requireAuth } from "../../../lib/session";

export const prerender = false;

export const GET: APIRoute = async ({ cookies, url, redirect }) => {
  try {
    const a = await requireAuth(cookies);
    if (!canManageAI(a)) return redirect("/app/ket-noi-ai/?loi=quyen", 302);
    const state = randomId(18);
    const { verifier, challenge } = await pkcePair();
    await db().batch([
      db().prepare("DELETE FROM oauth_states WHERE created_at < ?").bind(now() - 15 * 6e4),
      db().prepare("INSERT INTO oauth_states (state, user_id, code_verifier, created_at) VALUES (?, ?, ?, ?)").bind(state, a.user.id, verifier, now())
    ]);
    cookies.set("alnh_oauth", state, { httpOnly: true, secure: url.protocol === "https:", sameSite: "lax", path: "/api/ai/", maxAge: 900 });
    const origin = env.APP_ORIGIN || url.origin;
    return redirect(authUrl(`${origin}/api/ai/callback?state=${state}`, challenge), 302);
  } catch (e) {
    return redirect(e instanceof HttpError && e.status === 401 ? "/app/dang-nhap/" : "/app/ket-noi-ai/?loi=ket-noi", 302);
  }
};
