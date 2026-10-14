-- AI Lành Nghề – lược đồ D1. KHÔNG có cột nội dung (không lưu file, prompt, kết quả).
CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT, created_at INTEGER NOT NULL);
CREATE TABLE otp_codes (email TEXT NOT NULL, code_hash TEXT NOT NULL, expires_at INTEGER NOT NULL, attempts INTEGER DEFAULT 0);
CREATE INDEX otp_email ON otp_codes(email, expires_at);
CREATE TABLE sessions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at INTEGER NOT NULL, device TEXT);
CREATE TABLE organizations (id TEXT PRIMARY KEY, name TEXT NOT NULL, plan TEXT NOT NULL CHECK(plan IN ('personal','business','business_plus')), seats INTEGER DEFAULT 1, expires_at INTEGER);
CREATE TABLE members (org_id TEXT NOT NULL, user_id TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('admin','member')), status TEXT NOT NULL DEFAULT 'active', PRIMARY KEY (org_id, user_id));
CREATE INDEX members_user ON members(user_id);
CREATE TABLE ai_connections (org_id TEXT PRIMARY KEY, source TEXT NOT NULL CHECK(source IN ('openrouter_oauth','gemini_key','company_key')), provider TEXT NOT NULL, key_ciphertext TEXT NOT NULL, key_iv TEXT NOT NULL, key_last4 TEXT NOT NULL, verified_at INTEGER);
CREATE TABLE oauth_states (state TEXT PRIMARY KEY, user_id TEXT NOT NULL, code_verifier TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE TABLE trial_usage (user_id TEXT PRIMARY KEY, used INTEGER NOT NULL DEFAULT 0);
CREATE TABLE baselines (user_id TEXT NOT NULL, scenario_id TEXT NOT NULL, manual_minutes INTEGER NOT NULL, PRIMARY KEY (user_id, scenario_id));
-- KHÔNG có cột nội dung. Dashboard tính từ bảng này.
CREATE TABLE runs (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, org_id TEXT NOT NULL, scenario_id TEXT NOT NULL,
  opened_at INTEGER, submitted_at INTEGER, result_at INTEGER, exported_at INTEGER,
  edits INTEGER DEFAULT 0, checklist_done INTEGER DEFAULT 0, checklist_total INTEGER DEFAULT 0,
  masked_items INTEGER DEFAULT 0, tokens_in INTEGER, tokens_out INTEGER, via_trial INTEGER DEFAULT 0, status TEXT);
CREATE INDEX runs_org ON runs(org_id, opened_at);
CREATE INDEX runs_user ON runs(user_id, opened_at);
