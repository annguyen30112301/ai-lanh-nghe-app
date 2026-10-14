import type { APIRoute } from "astro";
import { saveConnection } from "../../../lib/ai-store";
import { db, now } from "../../../lib/db";
import { exchangeCode } from "../../../lib/openrouter";
import { canManageAI, requireAuth } from "../../../lib/session";

export const prerender = false;

export const GET: APIRoute = async ({ cookies, url, redirect }) => {
  try {
    const a = await requireAuth(cookies);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state") || cookies.get("alnh_oauth")?.value;
    if (!code || !state || !canManageAI(a)) return redirect("/app/ket-noi-ai/?loi=ket-noi", 302);
    const st = await db().prepare("SELECT code_verifier FROM oauth_states WHERE state = ? AND user_id = ? AND created_at > ?")
      .bind(state, a.user.id, now() - 15 * 6e4).first<{ code_verifier: string }>();
    await db().prepare("DELETE FROM oauth_states WHERE state = ?").bind(state).run();
    cookies.delete("alnh_oauth", { path: "/api/ai/" });
    if (!st) return redirect("/app/ket-noi-ai/?loi=het-han", 302);
    const key = await exchangeCode(code, st.code_verifier);
    await saveConnection(a.org.org_id, "openrouter_oauth", "openrouter", key);
    return redirect("/app/ket-noi-ai/?buoc=mo-hinh", 302);
  } catch {
    return redirect("/app/ket-noi-ai/?loi=ket-noi", 302);
  }
};
