-- ============================================================
-- NHIỀU NGƯỜI SOẠN ĐỀ (lib/editorAuth.ts, trang /import/nguoi-soan)
--
-- Dán cả file vào Supabase → SQL Editor → Run. Chạy lại nhiều lần không sao.
--
-- • editors: danh sách email được mời soạn. Người soạn đăng nhập bằng đúng email
--   đó (đã xác nhận) thì vào được khu soạn đề, chỉ sửa / xoá bài của mình.
--   Người giữ mật khẩu chung IMPORT_PASSWORD vẫn là quản trị, sửa được mọi bài.
-- • lessons.owner_id: ai soạn bài này. Bài cũ để NULL = của quản trị.
-- Chỉ service role đọc/ghi (RLS bật, không có policy) — giống feedback, usage_events.
-- ============================================================
CREATE TABLE IF NOT EXISTS editors (
  email      TEXT PRIMARY KEY CHECK (email = lower(email)),
  user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- điền tự động lần đầu người đó vào khu soạn
  note       TEXT,                                               -- vd "Cô Lan – lớp 3A"
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE editors ENABLE ROW LEVEL SECURITY;

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_lessons_owner ON lessons(owner_id) WHERE owner_id IS NOT NULL;
