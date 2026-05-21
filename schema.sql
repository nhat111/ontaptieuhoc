-- ============================================================
-- SCHEMA cho Ôn Tập Tiểu Học
-- Chạy trong Supabase SQL Editor
-- ============================================================

-- Môn học theo lớp
CREATE TABLE IF NOT EXISTS subjects (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  grade       INT  NOT NULL,            -- 1-5
  order_index INT  NOT NULL DEFAULT 0
);

-- Chương (nhóm bài học)
CREATE TABLE IF NOT EXISTS chapters (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  subject_id  INT  NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  order_index INT  NOT NULL DEFAULT 0
);

-- Bài học — id này được dùng làm lessonId trong URL /quiz?lessonId=X
CREATE TABLE IF NOT EXISTS lessons (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  index_label TEXT NOT NULL DEFAULT '01',   -- hiển thị "01", "02"...
  chapter_id  INT  NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'locked'
                   CHECK (status IN ('completed', 'active', 'locked')),
  order_index INT  NOT NULL DEFAULT 0
);

-- Câu hỏi
-- type: 'mcq' | 'multi' | 'short' | 'numeric'
-- options: JSON array of strings (2–6 cho mcq/multi, [] cho short/numeric)
-- correct_answer encoding theo type:
--   mcq     → text của option đúng (vd "8")
--   multi   → JSON.stringify mảng option đúng (vd '["A text","C text"]')
--   short   → các đáp án chấp nhận, ngăn bằng '|' (vd "Hà Nội|Ha Noi")
--   numeric → số (vd "42.5")
CREATE TABLE IF NOT EXISTS questions (
  id             SERIAL PRIMARY KEY,
  lesson_id      INT  NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  content        TEXT NOT NULL,
  type           TEXT NOT NULL DEFAULT 'mcq'
                   CHECK (type IN ('mcq', 'multi', 'short', 'numeric')),
  options        JSONB NOT NULL DEFAULT '[]',
  correct_answer TEXT NOT NULL,
  explanation    TEXT,
  order_index    INT  NOT NULL DEFAULT 0
);
-- Nếu DB cũ chưa có cột type, chạy:
--   ALTER TABLE questions ADD COLUMN type TEXT NOT NULL DEFAULT 'mcq';

-- Kết quả quiz (tuỳ chọn, dùng sau)
CREATE TABLE IF NOT EXISTS quiz_results (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id  INT  REFERENCES lessons(id) ON DELETE SET NULL,
  score      INT  NOT NULL,
  total      INT  NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subjects_grade     ON subjects(grade);
CREATE INDEX IF NOT EXISTS idx_chapters_subject   ON chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_lessons_chapter    ON lessons(chapter_id);
CREATE INDEX IF NOT EXISTS idx_questions_lesson   ON questions(lesson_id);

-- ============================================================
-- DỮ LIỆU MẪU — Lớp 1 đến Lớp 5
-- ============================================================

-- Môn học
INSERT INTO subjects (name, grade, order_index) VALUES
  ('Toán',          1, 1), ('Tiếng Việt',  1, 2), ('Tự nhiên & Xã hội', 1, 3),
  ('Toán',          2, 1), ('Tiếng Việt',  2, 2), ('Đạo đức',           2, 3),
  ('Toán',          3, 1), ('Tiếng Việt',  3, 2), ('Khoa học',          3, 3),
  ('Toán',          4, 1), ('Tiếng Việt',  4, 2), ('Khoa học',          4, 3),
  ('Toán',          5, 1), ('Tiếng Việt',  5, 2), ('Khoa học',          5, 3);

-- Chương của Toán lớp 1 (subject id = 1)
INSERT INTO chapters (title, subject_id, order_index) VALUES
  ('Chương 1: Số tự nhiên',                          61, 1),
  ('Chương 2: Hình học cơ bản',                      61, 2),
  ('Chương 3: Đo lường và bài toán có lời văn',      61, 3);

-- Bài học của Chương 1
INSERT INTO lessons (title, index_label, chapter_id, status, order_index) VALUES
  ('Phép cộng và phép trừ',   '01', 1, 'active',    1),
  ('Phép nhân và phép chia',  '02', 1, 'locked',    2),
  ('Hình học cơ bản',         '03', 1, 'locked',    3),
  ('Đo lường và thời gian',   '04', 1, 'locked',    4);

-- Bài học của Chương 2
INSERT INTO lessons (title, index_label, chapter_id, status, order_index) VALUES
  ('Nhận biết hình vuông, chữ nhật', '01', 2, 'locked', 1),
  ('Đo độ dài và chu vi',            '02', 2, 'locked', 2),
  ('Diện tích đơn giản',             '03', 2, 'locked', 3);

-- Bài học của Chương 3
INSERT INTO lessons (title, index_label, chapter_id, status, order_index) VALUES
  ('Đơn vị đo khối lượng', '01', 3, 'locked', 1),
  ('Đơn vị đo thời gian',  '02', 3, 'locked', 2),
  ('Bài toán có lời văn',  '03', 3, 'locked', 3);

-- Câu hỏi cho bài 1 (Phép cộng và phép trừ — lesson id = 1)
INSERT INTO questions (lesson_id, content, options, correct_answer, order_index) VALUES
  (1, '5 + 3 = ?',    '["6","7","8","9"]',          '8',  1),
  (1, '12 - 4 = ?',   '["6","7","8","9"]',          '8',  2),
  (1, '7 + 6 = ?',    '["12","13","14","15"]',      '13', 3),
  (1, '15 - 8 = ?',   '["5","6","7","8"]',          '7',  4),
  (1, '9 + 4 = ?',    '["11","12","13","14"]',      '13', 5),
  (1, '20 - 11 = ?',  '["8","9","10","11"]',        '9',  6),
  (1, '6 + 8 = ?',    '["13","14","15","16"]',      '14', 7),
  (1, '18 - 9 = ?',   '["7","8","9","10"]',         '9',  8);

-- Câu hỏi cho bài 2 (Phép nhân và phép chia — lesson id = 2)
INSERT INTO questions (lesson_id, content, options, correct_answer, order_index) VALUES
  (2, '3 × 4 = ?',   '["10","11","12","13"]',       '12', 1),
  (2, '20 ÷ 4 = ?',  '["4","5","6","7"]',           '5',  2),
  (2, '6 × 7 = ?',   '["40","41","42","43"]',       '42', 3),
  (2, '36 ÷ 6 = ?',  '["5","6","7","8"]',           '6',  4),
  (2, '8 × 5 = ?',   '["35","40","45","50"]',       '40', 5),
  (2, '45 ÷ 9 = ?',  '["4","5","6","7"]',           '5',  6);

-- Câu hỏi cho bài 3 (Hình học cơ bản — lesson id = 3)
INSERT INTO questions (lesson_id, content, options, correct_answer, order_index) VALUES
  (3, 'Hình nào có 4 cạnh bằng nhau?',                      '["Hình chữ nhật","Hình thoi","Hình vuông","Hình thang"]', 'Hình vuông', 1),
  (3, 'Chu vi hình vuông cạnh 5cm là?',                     '["10cm","15cm","20cm","25cm"]',                          '20cm',       2),
  (3, 'Hình tròn có bao nhiêu cạnh?',                       '["0","1","2","Vô số"]',                                  '0',          3),
  (3, 'Diện tích hình chữ nhật dài 6cm, rộng 4cm là?',     '["20cm²","22cm²","24cm²","26cm²"]',                     '24cm²',      4),
  (3, 'Tam giác có bao nhiêu góc?',                         '["2","3","4","5"]',                                      '3',          5);

-- Câu hỏi cho bài 4 (Đo lường và thời gian — lesson id = 4)
INSERT INTO questions (lesson_id, content, options, correct_answer, order_index) VALUES
  (4, '1kg = ? gram',                   '["10g","100g","1000g","10000g"]',              '1000g',    1),
  (4, '1 giờ = ? phút',                '["30","45","60","90"]',                         '60',       2),
  (4, 'Ngày sau thứ Hai là?',          '["Chủ nhật","Thứ Ba","Thứ Tư","Thứ Sáu"]',    'Thứ Ba',   3),
  (4, '500g + 300g = ?',               '["700g","800g","900g","1kg"]',                  '800g',     4),
  (4, '1 tuần có bao nhiêu ngày?',     '["5","6","7","8"]',                             '7',        5);
