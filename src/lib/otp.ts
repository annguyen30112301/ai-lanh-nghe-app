import { env } from "cloudflare:workers";
import { sha256 } from "./crypto";
export const otpHash = (email: string, code: string) => sha256(`${email}:${code}:${env.SESSION_SECRET}`);
