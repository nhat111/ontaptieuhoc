-- ============================================================
-- EDUCATION PLATFORM SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================

-- GRADES
CREATE TABLE IF NOT EXISTS grades (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SUBJECTS
CREATE TABLE IF NOT EXISTS subjects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  icon        VARCHAR(20),
  color       VARCHAR(30),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- LESSONS
CREATE TABLE IF NOT EXISTS lessons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  grade_id    UUID NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
  subject_id  UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  thumbnail   VARCHAR(500),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- QUESTIONS
CREATE TABLE IF NOT EXISTS questions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id   UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  type        VARCHAR(20) NOT NULL DEFAULT 'single' CHECK (type IN ('single', 'multiple')),
  difficulty  VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  content     TEXT NOT NULL,
  explanation TEXT,
  image_url   VARCHAR(500),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- OPTIONS
CREATE TABLE IF NOT EXISTS options (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  label       VARCHAR(5) NOT NULL,
  content     TEXT NOT NULL,
  is_correct  BOOLEAN NOT NULL DEFAULT FALSE
);

-- QUIZ RESULTS
CREATE TABLE IF NOT EXISTS quiz_results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID,
  lesson_id       UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  score           INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  answers         JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_lessons_grade       ON lessons(grade_id);
CREATE INDEX IF NOT EXISTS idx_lessons_subject     ON lessons(subject_id);
CREATE INDEX IF NOT EXISTS idx_lessons_grade_sub   ON lessons(grade_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_lessons_slug        ON lessons(slug);
CREATE INDEX IF NOT EXISTS idx_questions_lesson    ON questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_options_question    ON options(question_id);
CREATE INDEX IF NOT EXISTS idx_results_lesson      ON quiz_results(lesson_id);
CREATE INDEX IF NOT EXISTS idx_results_user        ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_grades_slug         ON grades(slug);
CREATE INDEX IF NOT EXISTS idx_subjects_slug       ON subjects(slug);

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO grades (name, slug, order_index) VALUES
  ('Lớp 6',  'lop-6',  6),
  ('Lớp 7',  'lop-7',  7),
  ('Lớp 8',  'lop-8',  8),
  ('Lớp 9',  'lop-9',  9),
  ('Lớp 10', 'lop-10', 10),
  ('Lớp 11', 'lop-11', 11),
  ('Lớp 12', 'lop-12', 12)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subjects (name, slug, icon, color, order_index) VALUES
  ('Toán',       'toan',      '📐', 'blue',    1),
  ('Vật Lý',     'vat-ly',    '⚡', 'yellow',  2),
  ('Hóa Học',    'hoa-hoc',   '🧪', 'green',   3),
  ('Sinh Học',   'sinh-hoc',  '🌱', 'emerald', 4),
  ('Ngữ Văn',    'ngu-van',   '📚', 'red',     5),
  ('Lịch Sử',    'lich-su',   '🏛️', 'orange',  6),
  ('Địa Lý',     'dia-ly',    '🌍', 'teal',    7),
  ('Tiếng Anh',  'tieng-anh', '🌐', 'purple',  8),
  ('Tin Học',    'tin-hoc',   '💻', 'indigo',  9),
  ('GDCD',       'gdcd',      '⚖️', 'pink',   10)
ON CONFLICT (slug) DO NOTHING;
