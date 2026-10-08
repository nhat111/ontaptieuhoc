-- Bài luyện tập Toán tự sinh — lớp 1, 2, 5 (seed "v1")
-- Sinh bởi scripts/gen-math-sql.ts từ lib/mathGen. ĐỪNG sửa tay: sửa generator rồi sinh lại.
--
-- Cách dùng: Supabase → SQL Editor → dán toàn bộ file → Run.
-- Chạy lại an toàn: chương/bài nhận diện qua source_id 'gen_…', bài đã có câu hỏi thì bỏ qua.
--
-- Muốn gỡ toàn bộ (xoá luôn bài + câu hỏi bên trong, không đụng bài nhập tay / NXBGD):
--   DELETE FROM chapters WHERE source_id LIKE 'gen_toan_lop_%';
-- Muốn thay bộ đề mới: chạy câu DELETE trên, rồi dán file SQL mới.

BEGIN;

-- ═══════════════ LỚP 1 ═══════════════
INSERT INTO subjects (grade, name, order_index)
SELECT 1, 'Toán', 99
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE grade = 1 AND name = 'Toán');

INSERT INTO chapters (title, subject_id, order_index, source_id)
SELECT 'Luyện tập theo chủ đề', (SELECT id FROM subjects WHERE grade = 1 AND name = 'Toán' ORDER BY id LIMIT 1), 1000, 'gen_toan_lop_1'
WHERE NOT EXISTS (SELECT 1 FROM chapters WHERE source_id = 'gen_toan_lop_1');

-- Các số từ 0 đến 10
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Các số từ 0 đến 10', '01', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_1'), 'active', 1, 15, 'gen_toan-1-cac-so-0-10', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-1-cac-so-0-10');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('Có mấy ngôi sao?  ⭐⭐⭐⭐⭐⭐', 'mcq', '["7","5","6","4"]', '6', '{"solution":"Đếm lần lượt: 1, 2, 3, 4, 5, 6. Có tất cả 6 ngôi sao."}', 1),
  ('Có mấy chiếc ô tô?  🚗🚗🚗🚗🚗🚗', 'mcq', '["6","8","7","5"]', '6', '{"solution":"Đếm lần lượt: 1, 2, 3, 4, 5, 6. Có tất cả 6 chiếc ô tô."}', 2),
  ('Có mấy quả bóng bay?  🎈🎈🎈🎈🎈🎈🎈🎈', 'mcq', '["6","8","10","7"]', '8', '{"solution":"Đếm lần lượt: 1, 2, 3, 4, 5, 6, 7, 8. Có tất cả 8 quả bóng bay."}', 3),
  ('Có mấy quả bóng bay?  🎈🎈🎈🎈🎈🎈🎈🎈🎈🎈', 'mcq', '["9","8","1","10"]', '10', '{"solution":"Đếm lần lượt: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10. Có tất cả 10 quả bóng bay."}', 4),
  ('Số 3 gồm 1 và ___.', 'numeric', '[]', '2', '{"solution":"1 + 2 = 3, nên 3 gồm 1 và 2."}', 5),
  ('Số 5 gồm 3 và ___.', 'numeric', '[]', '2', '{"solution":"3 + 2 = 5, nên 5 gồm 3 và 2."}', 6),
  ('Chọn dấu thích hợp: 10 ___ 7', 'mcq', '[">","<","="]', '>', '{"solution":"So sánh từ hàng cao nhất (trăm, rồi chục, rồi đơn vị). 10 lớn hơn 7 nên 10 > 7."}', 7),
  ('Chọn dấu thích hợp: 4 ___ 6', 'mcq', '[">","<","="]', '<', '{"solution":"So sánh từ hàng cao nhất (trăm, rồi chục, rồi đơn vị). 6 lớn hơn 4 nên 4 < 6."}', 8),
  ('Dãy số nào được sắp xếp theo thứ tự từ lớn đến bé?', 'mcq', '["8; 7; 6; 0","8; 7; 0; 6","6; 0; 8; 7","0; 6; 7; 8"]', '8; 7; 6; 0', '{"solution":"Thứ tự đúng: 8 > 7 > 6 > 0."}', 9),
  ('Dãy số nào được sắp xếp theo thứ tự từ bé đến lớn?', 'mcq', '["0; 3; 5; 6","5; 6; 0; 3","6; 5; 3; 0","3; 0; 5; 6"]', '0; 3; 5; 6', '{"solution":"Thứ tự đúng: 0 < 3 < 5 < 6."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-1-cac-so-0-10'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- Phép cộng, phép trừ trong phạm vi 10
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Phép cộng, phép trừ trong phạm vi 10', '02', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_1'), 'active', 2, 15, 'gen_toan-1-cong-tru-pv10', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-1-cong-tru-pv10');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('6 - ___ = 5', 'numeric', '[]', '1', '{"solution":"Ta lấy 6 - 5 = 1. Thử lại: 6 - 1 = 5."}', 1),
  ('___ + 7 = 9', 'numeric', '[]', '2', '{"solution":"Ta lấy 9 - 7 = 2. Thử lại: 2 + 7 = 9."}', 2),
  ('7 - 2 = ___', 'numeric', '[]', '5', '{"solution":"7 bớt 2 còn 5."}', 3),
  ('5 - ___ = 1', 'numeric', '[]', '4', '{"solution":"Ta lấy 5 - 1 = 4. Thử lại: 5 - 4 = 1."}', 4),
  ('4 - 4 = ___', 'numeric', '[]', '0', '{"solution":"4 bớt 4 còn 0."}', 5),
  ('6 - 6 = ___', 'numeric', '[]', '0', '{"solution":"6 bớt 6 còn 0."}', 6),
  ('7 - 5 = 1. Đúng hay sai?', 'mcq', '["Đúng","Sai"]', 'Sai', '{"solution":"Sai, vì 7 - 5 = 2, không phải 1."}', 7),
  ('6 - 4 = 1. Đúng hay sai?', 'mcq', '["Đúng","Sai"]', 'Sai', '{"solution":"Sai, vì 6 - 4 = 2, không phải 1."}', 8),
  ('Số 2 gồm 1 và ___.', 'numeric', '[]', '1', '{"solution":"1 + 1 = 2, nên 2 gồm 1 và 1."}', 9),
  ('Số 5 gồm 2 và ___.', 'numeric', '[]', '3', '{"solution":"2 + 3 = 5, nên 5 gồm 2 và 3."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-1-cong-tru-pv10'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- Các số đến 100
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Các số đến 100', '03', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_1'), 'active', 3, 15, 'gen_toan-1-so-den-100', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-1-so-den-100');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('Số gồm 8 chục và 7 đơn vị viết là ___.', 'numeric', '[]', '87', '{"solution":"8 chục là 80, thêm 7 đơn vị được 87."}', 1),
  ('Số gồm 9 chục và 1 đơn vị viết là ___.', 'numeric', '[]', '91', '{"solution":"9 chục là 90, thêm 1 đơn vị được 91."}', 2),
  ('Số gồm 6 chục và 0 đơn vị viết là ___.', 'numeric', '[]', '60', '{"solution":"6 chục là 60, thêm 0 đơn vị được 60."}', 3),
  ('Số liền sau của 35 là số nào?', 'mcq', '["37","34","46","36"]', '36', '{"solution":"Số liền sau thì hơn 1: 35 + 1 = 36."}', 4),
  ('Số liền trước của 84 là số nào?', 'mcq', '["84","83","82","85"]', '83', '{"solution":"Số liền trước thì kém 1: 84 - 1 = 83."}', 5),
  ('Số liền trước của 68 là số nào?', 'mcq', '["67","77","66","68"]', '67', '{"solution":"Số liền trước thì kém 1: 68 - 1 = 67."}', 6),
  ('Chọn dấu thích hợp: 87 ___ 46', 'mcq', '[">","<","="]', '>', '{"solution":"So sánh từ hàng cao nhất (trăm, rồi chục, rồi đơn vị). 87 lớn hơn 46 nên 87 > 46."}', 7),
  ('Chọn dấu thích hợp: 42 ___ 80', 'mcq', '[">","<","="]', '<', '{"solution":"So sánh từ hàng cao nhất (trăm, rồi chục, rồi đơn vị). 80 lớn hơn 42 nên 42 < 80."}', 8),
  ('Dãy số nào được sắp xếp theo thứ tự từ lớn đến bé?', 'mcq', '["93; 92; 78; 80","93; 92; 80; 78","78; 80; 92; 93","92; 93; 80; 78"]', '93; 92; 80; 78', '{"solution":"Thứ tự đúng: 93 > 92 > 80 > 78."}', 9),
  ('Dãy số nào được sắp xếp theo thứ tự từ lớn đến bé?', 'mcq', '["89; 66; 18; 34","89; 66; 34; 18","89; 34; 18; 66","18; 34; 66; 89"]', '89; 66; 34; 18', '{"solution":"Thứ tự đúng: 89 > 66 > 34 > 18."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-1-so-den-100'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- Cộng, trừ (không nhớ) trong phạm vi 100
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Cộng, trừ (không nhớ) trong phạm vi 100', '04', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_1'), 'active', 4, 15, 'gen_toan-1-cong-tru-pv100', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-1-cong-tru-pv100');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('81 + 8 = ___', 'numeric', '[]', '89', '{"solution":"Cộng đơn vị: 1 + 8 = 9. Cộng chục: 8 + 0 = 8. Kết quả: 89."}', 1),
  ('80 + 9 = ___', 'numeric', '[]', '89', '{"solution":"Cộng đơn vị: 0 + 9 = 9. Cộng chục: 8 + 0 = 8. Kết quả: 89."}', 2),
  ('15 + 3 = ___', 'numeric', '[]', '18', '{"solution":"Cộng đơn vị: 5 + 3 = 8. Cộng chục: 1 + 0 = 1. Kết quả: 18."}', 3),
  ('83 - 1 = ___', 'numeric', '[]', '82', '{"solution":"Trừ đơn vị: 3 - 1 = 2. Trừ chục: 8 - 0 = 8. Kết quả: 82."}', 4),
  ('22 - 11 = ___', 'numeric', '[]', '11', '{"solution":"Trừ đơn vị: 2 - 1 = 1. Trừ chục: 2 - 1 = 1. Kết quả: 11."}', 5),
  ('An có 7 quả cam, An cho bạn 3 quả cam. Hỏi An còn lại bao nhiêu quả cam? Trả lời: ___ quả cam.', 'numeric', '[]', '4', '{"solution":"\"Cho bạn\" và \"còn lại\" là phép trừ: 7 - 3 = 4 (quả cam)."}', 6),
  ('Hoa có 5 viên bi, Hoa cho bạn 2 viên bi. Hỏi Hoa còn lại bao nhiêu viên bi? Trả lời: ___ viên bi.', 'numeric', '[]', '3', '{"solution":"\"Cho bạn\" và \"còn lại\" là phép trừ: 5 - 2 = 3 (viên bi)."}', 7),
  ('Bình có 30 chiếc bút chì, Bình cho bạn 10 chiếc bút chì. Hỏi Bình còn lại bao nhiêu chiếc bút chì? Trả lời: ___ chiếc bút chì.', 'numeric', '[]', '20', '{"solution":"\"Cho bạn\" và \"còn lại\" là phép trừ: 30 - 10 = 20 (chiếc bút chì)."}', 8),
  ('Thước kẻ dài 78 cm, bút chì dài 55 cm. Thước kẻ dài hơn bút chì ___ cm.', 'numeric', '[]', '23', '{"solution":"Dài hơn bao nhiêu thì lấy số lớn trừ số bé: 78 - 55 = 23 (cm)."}', 9),
  ('20 cm - 10 cm = ___ cm', 'numeric', '[]', '10', '{"solution":"Tính như số bình thường rồi ghi đơn vị cm: 20 - 10 = 10."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-1-cong-tru-pv100'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- Xem giờ đúng, các ngày trong tuần
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Xem giờ đúng, các ngày trong tuần', '05', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_1'), 'active', 5, 15, 'gen_toan-1-thoi-gian', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-1-thoi-gian');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('Đồng hồ chỉ mấy giờ?', 'mcq', '["4 giờ","10 giờ","12 giờ","11 giờ"]', '10 giờ', '{"solution":"Kim ngắn (màu đen) chỉ giờ, kim dài (màu đỏ) chỉ phút. Kim ngắn chỉ đúng số 10, kim dài chỉ số 12 nên là giờ đúng. Đồng hồ chỉ 10 giờ.","images":[{"url":"data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20120%20120%22%20width%3D%22160%22%20height%3D%22160%22%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2260%22%20r%3D%2256%22%20fill%3D%22%23fffbeb%22%20stroke%3D%22%23f59e0b%22%20stroke-width%3D%224%22%2F%3E%3Ctext%20x%3D%2281.0%22%20y%3D%2223.6%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E1%3C%2Ftext%3E%3Ctext%20x%3D%2296.4%22%20y%3D%2239.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E2%3C%2Ftext%3E%3Ctext%20x%3D%22102.0%22%20y%3D%2260.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E3%3C%2Ftext%3E%3Ctext%20x%3D%2296.4%22%20y%3D%2281.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E4%3C%2Ftext%3E%3Ctext%20x%3D%2281.0%22%20y%3D%2296.4%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E5%3C%2Ftext%3E%3Ctext%20x%3D%2260.0%22%20y%3D%22102.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E6%3C%2Ftext%3E%3Ctext%20x%3D%2239.0%22%20y%3D%2296.4%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E7%3C%2Ftext%3E%3Ctext%20x%3D%2223.6%22%20y%3D%2281.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E8%3C%2Ftext%3E%3Ctext%20x%3D%2218.0%22%20y%3D%2260.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E9%3C%2Ftext%3E%3Ctext%20x%3D%2223.6%22%20y%3D%2239.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E10%3C%2Ftext%3E%3Ctext%20x%3D%2239.0%22%20y%3D%2223.6%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E11%3C%2Ftext%3E%3Ctext%20x%3D%2260.0%22%20y%3D%2218.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E12%3C%2Ftext%3E%3Cline%20x1%3D%2260%22%20y1%3D%2260%22%20x2%3D%2237.5%22%20y2%3D%2247.0%22%20stroke%3D%22%231c1917%22%20stroke-width%3D%225%22%20stroke-linecap%3D%22round%22%2F%3E%3Cline%20x1%3D%2260%22%20y1%3D%2260%22%20x2%3D%2260.0%22%20y2%3D%2222.0%22%20stroke%3D%22%23e11d48%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%2F%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2260%22%20r%3D%224%22%20fill%3D%22%231c1917%22%2F%3E%3C%2Fsvg%3E","position":"after"}]}', 1),
  ('Đồng hồ chỉ mấy giờ?', 'mcq', '["7 giờ","6 giờ 30 phút","12 giờ","6 giờ"]', '6 giờ', '{"solution":"Kim ngắn (màu đen) chỉ giờ, kim dài (màu đỏ) chỉ phút. Kim ngắn chỉ đúng số 6, kim dài chỉ số 12 nên là giờ đúng. Đồng hồ chỉ 6 giờ.","images":[{"url":"data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20120%20120%22%20width%3D%22160%22%20height%3D%22160%22%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2260%22%20r%3D%2256%22%20fill%3D%22%23fffbeb%22%20stroke%3D%22%23f59e0b%22%20stroke-width%3D%224%22%2F%3E%3Ctext%20x%3D%2281.0%22%20y%3D%2223.6%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E1%3C%2Ftext%3E%3Ctext%20x%3D%2296.4%22%20y%3D%2239.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E2%3C%2Ftext%3E%3Ctext%20x%3D%22102.0%22%20y%3D%2260.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E3%3C%2Ftext%3E%3Ctext%20x%3D%2296.4%22%20y%3D%2281.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E4%3C%2Ftext%3E%3Ctext%20x%3D%2281.0%22%20y%3D%2296.4%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E5%3C%2Ftext%3E%3Ctext%20x%3D%2260.0%22%20y%3D%22102.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E6%3C%2Ftext%3E%3Ctext%20x%3D%2239.0%22%20y%3D%2296.4%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E7%3C%2Ftext%3E%3Ctext%20x%3D%2223.6%22%20y%3D%2281.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E8%3C%2Ftext%3E%3Ctext%20x%3D%2218.0%22%20y%3D%2260.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E9%3C%2Ftext%3E%3Ctext%20x%3D%2223.6%22%20y%3D%2239.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E10%3C%2Ftext%3E%3Ctext%20x%3D%2239.0%22%20y%3D%2223.6%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E11%3C%2Ftext%3E%3Ctext%20x%3D%2260.0%22%20y%3D%2218.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E12%3C%2Ftext%3E%3Cline%20x1%3D%2260%22%20y1%3D%2260%22%20x2%3D%2260.0%22%20y2%3D%2286.0%22%20stroke%3D%22%231c1917%22%20stroke-width%3D%225%22%20stroke-linecap%3D%22round%22%2F%3E%3Cline%20x1%3D%2260%22%20y1%3D%2260%22%20x2%3D%2260.0%22%20y2%3D%2222.0%22%20stroke%3D%22%23e11d48%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%2F%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2260%22%20r%3D%224%22%20fill%3D%22%231c1917%22%2F%3E%3C%2Fsvg%3E","position":"after"}]}', 2),
  ('Đồng hồ chỉ mấy giờ?', 'mcq', '["11 giờ","6 giờ","12 giờ 30 phút","12 giờ"]', '12 giờ', '{"solution":"Kim ngắn (màu đen) chỉ giờ, kim dài (màu đỏ) chỉ phút. Kim ngắn chỉ đúng số 12, kim dài chỉ số 12 nên là giờ đúng. Đồng hồ chỉ 12 giờ.","images":[{"url":"data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20120%20120%22%20width%3D%22160%22%20height%3D%22160%22%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2260%22%20r%3D%2256%22%20fill%3D%22%23fffbeb%22%20stroke%3D%22%23f59e0b%22%20stroke-width%3D%224%22%2F%3E%3Ctext%20x%3D%2281.0%22%20y%3D%2223.6%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E1%3C%2Ftext%3E%3Ctext%20x%3D%2296.4%22%20y%3D%2239.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E2%3C%2Ftext%3E%3Ctext%20x%3D%22102.0%22%20y%3D%2260.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E3%3C%2Ftext%3E%3Ctext%20x%3D%2296.4%22%20y%3D%2281.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E4%3C%2Ftext%3E%3Ctext%20x%3D%2281.0%22%20y%3D%2296.4%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E5%3C%2Ftext%3E%3Ctext%20x%3D%2260.0%22%20y%3D%22102.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E6%3C%2Ftext%3E%3Ctext%20x%3D%2239.0%22%20y%3D%2296.4%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E7%3C%2Ftext%3E%3Ctext%20x%3D%2223.6%22%20y%3D%2281.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E8%3C%2Ftext%3E%3Ctext%20x%3D%2218.0%22%20y%3D%2260.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E9%3C%2Ftext%3E%3Ctext%20x%3D%2223.6%22%20y%3D%2239.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E10%3C%2Ftext%3E%3Ctext%20x%3D%2239.0%22%20y%3D%2223.6%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E11%3C%2Ftext%3E%3Ctext%20x%3D%2260.0%22%20y%3D%2218.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E12%3C%2Ftext%3E%3Cline%20x1%3D%2260%22%20y1%3D%2260%22%20x2%3D%2260.0%22%20y2%3D%2234.0%22%20stroke%3D%22%231c1917%22%20stroke-width%3D%225%22%20stroke-linecap%3D%22round%22%2F%3E%3Cline%20x1%3D%2260%22%20y1%3D%2260%22%20x2%3D%2260.0%22%20y2%3D%2222.0%22%20stroke%3D%22%23e11d48%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%2F%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2260%22%20r%3D%224%22%20fill%3D%22%231c1917%22%2F%3E%3C%2Fsvg%3E","position":"after"}]}', 3),
  ('Đồng hồ chỉ mấy giờ?', 'mcq', '["10 giờ","12 giờ","11 giờ 30 phút","11 giờ"]', '11 giờ', '{"solution":"Kim ngắn (màu đen) chỉ giờ, kim dài (màu đỏ) chỉ phút. Kim ngắn chỉ đúng số 11, kim dài chỉ số 12 nên là giờ đúng. Đồng hồ chỉ 11 giờ.","images":[{"url":"data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20120%20120%22%20width%3D%22160%22%20height%3D%22160%22%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2260%22%20r%3D%2256%22%20fill%3D%22%23fffbeb%22%20stroke%3D%22%23f59e0b%22%20stroke-width%3D%224%22%2F%3E%3Ctext%20x%3D%2281.0%22%20y%3D%2223.6%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E1%3C%2Ftext%3E%3Ctext%20x%3D%2296.4%22%20y%3D%2239.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E2%3C%2Ftext%3E%3Ctext%20x%3D%22102.0%22%20y%3D%2260.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E3%3C%2Ftext%3E%3Ctext%20x%3D%2296.4%22%20y%3D%2281.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E4%3C%2Ftext%3E%3Ctext%20x%3D%2281.0%22%20y%3D%2296.4%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E5%3C%2Ftext%3E%3Ctext%20x%3D%2260.0%22%20y%3D%22102.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E6%3C%2Ftext%3E%3Ctext%20x%3D%2239.0%22%20y%3D%2296.4%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E7%3C%2Ftext%3E%3Ctext%20x%3D%2223.6%22%20y%3D%2281.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E8%3C%2Ftext%3E%3Ctext%20x%3D%2218.0%22%20y%3D%2260.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E9%3C%2Ftext%3E%3Ctext%20x%3D%2223.6%22%20y%3D%2239.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E10%3C%2Ftext%3E%3Ctext%20x%3D%2239.0%22%20y%3D%2223.6%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E11%3C%2Ftext%3E%3Ctext%20x%3D%2260.0%22%20y%3D%2218.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E12%3C%2Ftext%3E%3Cline%20x1%3D%2260%22%20y1%3D%2260%22%20x2%3D%2247.0%22%20y2%3D%2237.5%22%20stroke%3D%22%231c1917%22%20stroke-width%3D%225%22%20stroke-linecap%3D%22round%22%2F%3E%3Cline%20x1%3D%2260%22%20y1%3D%2260%22%20x2%3D%2260.0%22%20y2%3D%2222.0%22%20stroke%3D%22%23e11d48%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%2F%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2260%22%20r%3D%224%22%20fill%3D%22%231c1917%22%2F%3E%3C%2Fsvg%3E","position":"after"}]}', 4),
  ('Đồng hồ chỉ mấy giờ?', 'mcq', '["2 giờ 30 phút","2 giờ","8 giờ","3 giờ"]', '2 giờ', '{"solution":"Kim ngắn (màu đen) chỉ giờ, kim dài (màu đỏ) chỉ phút. Kim ngắn chỉ đúng số 2, kim dài chỉ số 12 nên là giờ đúng. Đồng hồ chỉ 2 giờ.","images":[{"url":"data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20120%20120%22%20width%3D%22160%22%20height%3D%22160%22%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2260%22%20r%3D%2256%22%20fill%3D%22%23fffbeb%22%20stroke%3D%22%23f59e0b%22%20stroke-width%3D%224%22%2F%3E%3Ctext%20x%3D%2281.0%22%20y%3D%2223.6%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E1%3C%2Ftext%3E%3Ctext%20x%3D%2296.4%22%20y%3D%2239.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E2%3C%2Ftext%3E%3Ctext%20x%3D%22102.0%22%20y%3D%2260.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E3%3C%2Ftext%3E%3Ctext%20x%3D%2296.4%22%20y%3D%2281.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E4%3C%2Ftext%3E%3Ctext%20x%3D%2281.0%22%20y%3D%2296.4%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E5%3C%2Ftext%3E%3Ctext%20x%3D%2260.0%22%20y%3D%22102.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E6%3C%2Ftext%3E%3Ctext%20x%3D%2239.0%22%20y%3D%2296.4%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E7%3C%2Ftext%3E%3Ctext%20x%3D%2223.6%22%20y%3D%2281.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E8%3C%2Ftext%3E%3Ctext%20x%3D%2218.0%22%20y%3D%2260.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E9%3C%2Ftext%3E%3Ctext%20x%3D%2223.6%22%20y%3D%2239.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E10%3C%2Ftext%3E%3Ctext%20x%3D%2239.0%22%20y%3D%2223.6%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E11%3C%2Ftext%3E%3Ctext%20x%3D%2260.0%22%20y%3D%2218.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E12%3C%2Ftext%3E%3Cline%20x1%3D%2260%22%20y1%3D%2260%22%20x2%3D%2282.5%22%20y2%3D%2247.0%22%20stroke%3D%22%231c1917%22%20stroke-width%3D%225%22%20stroke-linecap%3D%22round%22%2F%3E%3Cline%20x1%3D%2260%22%20y1%3D%2260%22%20x2%3D%2260.0%22%20y2%3D%2222.0%22%20stroke%3D%22%23e11d48%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%2F%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2260%22%20r%3D%224%22%20fill%3D%22%231c1917%22%2F%3E%3C%2Fsvg%3E","position":"after"}]}', 5),
  ('Hôm nay là thứ Ba. Hỏi ngày kia là thứ mấy?', 'mcq', '["Thứ Tư","Thứ Năm","Thứ Hai","Thứ Bảy"]', 'Thứ Năm', '{"solution":"Thứ tự các ngày: thứ Hai, thứ Ba, thứ Tư, thứ Năm, thứ Sáu, thứ Bảy, Chủ nhật. Ngày kia là thứ Năm."}', 6),
  ('Hôm nay là thứ Hai. Hỏi hôm qua là thứ mấy?', 'mcq', '["Thứ Hai","Thứ Tư","Chủ nhật","Thứ Bảy"]', 'Chủ nhật', '{"solution":"Thứ tự các ngày: thứ Hai, thứ Ba, thứ Tư, thứ Năm, thứ Sáu, thứ Bảy, Chủ nhật. Hôm qua là Chủ nhật."}', 7),
  ('Hôm nay là thứ Năm. Hỏi hôm qua là thứ mấy?', 'mcq', '["Chủ nhật","Thứ Tư","Thứ Ba","Thứ Bảy"]', 'Thứ Tư', '{"solution":"Thứ tự các ngày: thứ Hai, thứ Ba, thứ Tư, thứ Năm, thứ Sáu, thứ Bảy, Chủ nhật. Hôm qua là thứ Tư."}', 8),
  ('Hôm nay là thứ Hai. Hỏi ngày kia là thứ mấy?', 'mcq', '["Thứ Sáu","Thứ Tư","Thứ Hai","Thứ Ba"]', 'Thứ Tư', '{"solution":"Thứ tự các ngày: thứ Hai, thứ Ba, thứ Tư, thứ Năm, thứ Sáu, thứ Bảy, Chủ nhật. Ngày kia là thứ Tư."}', 9),
  ('Hôm nay là thứ Hai. Hỏi hôm qua là thứ mấy?', 'mcq', '["Chủ nhật","Thứ Ba","Thứ Năm","Thứ Hai"]', 'Chủ nhật', '{"solution":"Thứ tự các ngày: thứ Hai, thứ Ba, thứ Tư, thứ Năm, thứ Sáu, thứ Bảy, Chủ nhật. Hôm qua là Chủ nhật."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-1-thoi-gian'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- ═══════════════ LỚP 2 ═══════════════
INSERT INTO subjects (grade, name, order_index)
SELECT 2, 'Toán', 99
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE grade = 2 AND name = 'Toán');

INSERT INTO chapters (title, subject_id, order_index, source_id)
SELECT 'Luyện tập theo chủ đề', (SELECT id FROM subjects WHERE grade = 2 AND name = 'Toán' ORDER BY id LIMIT 1), 1000, 'gen_toan_lop_2'
WHERE NOT EXISTS (SELECT 1 FROM chapters WHERE source_id = 'gen_toan_lop_2');

-- Cộng, trừ qua 10 trong phạm vi 20
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Cộng, trừ qua 10 trong phạm vi 20', '01', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_2'), 'active', 1, 15, 'gen_toan-2-cong-tru-pv20', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-2-cong-tru-pv20');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('8 + 9 = ___', 'numeric', '[]', '17', '{"solution":"Tách để làm tròn 10: 8 + 2 = 10, còn 7; 10 + 7 = 17."}', 1),
  ('13 - 8 = ___', 'numeric', '[]', '5', '{"solution":"Tách: 13 - 3 = 10, còn phải trừ 5; 10 - 5 = 5."}', 2),
  ('18 - 9 = ___', 'numeric', '[]', '9', '{"solution":"Tách: 18 - 8 = 10, còn phải trừ 1; 10 - 1 = 9."}', 3),
  ('5 + 8 = ___', 'numeric', '[]', '13', '{"solution":"Tách để làm tròn 10: 5 + 5 = 10, còn 3; 10 + 3 = 13."}', 4),
  ('17 - 8 = ___', 'numeric', '[]', '9', '{"solution":"Tách: 17 - 7 = 10, còn phải trừ 1; 10 - 1 = 9."}', 5),
  ('3 + 8 = ___', 'numeric', '[]', '11', '{"solution":"Tách để làm tròn 10: 3 + 7 = 10, còn 1; 10 + 1 = 11."}', 6),
  ('Số hạng thứ nhất là 26, số hạng thứ hai là 37. Tổng là ___.', 'numeric', '[]', '63', '{"solution":"Tổng = số hạng + số hạng = 26 + 37 = 63."}', 7),
  ('69 + ___ = 95', 'numeric', '[]', '26', '{"solution":"Muốn tìm số hạng chưa biết, lấy tổng trừ số hạng đã biết: 95 - 69 = 26."}', 8),
  ('Nam có 57 cái kẹo. Tú có ít hơn Nam 7 cái kẹo. Hỏi Tú có bao nhiêu cái kẹo? Trả lời: ___ cái kẹo.', 'numeric', '[]', '50', '{"solution":"\"Ít hơn\" thì làm phép trừ: 57 - 7 = 50 (cái kẹo)."}', 9),
  ('Hoa có 39 quyển vở. Tú có ít hơn Hoa 20 quyển vở. Hỏi Tú có bao nhiêu quyển vở? Trả lời: ___ quyển vở.', 'numeric', '[]', '19', '{"solution":"\"Ít hơn\" thì làm phép trừ: 39 - 20 = 19 (quyển vở)."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-2-cong-tru-pv20'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- Cộng, trừ có nhớ trong phạm vi 100
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Cộng, trừ có nhớ trong phạm vi 100', '02', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_2'), 'active', 2, 15, 'gen_toan-2-cong-tru-pv100', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-2-cong-tru-pv100');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('14 + 37 = ___', 'numeric', '[]', '51', '{"solution":"Cộng đơn vị: 4 + 7 = 11, viết 1 nhớ 1 sang hàng chục. Kết quả: 51."}', 1),
  ('54 - 18 = ___', 'numeric', '[]', '36', '{"solution":"Trừ đơn vị: 4 không trừ được 8, lấy 14 - 8 = 6, nhớ 1 sang hàng chục của số trừ. Kết quả: 36."}', 2),
  ('49 + 51 = ___', 'numeric', '[]', '100', '{"solution":"Cộng đơn vị: 9 + 1 = 10, viết 0 nhớ 1 sang hàng chục. Kết quả: 100."}', 3),
  ('47 + 47 = ___', 'numeric', '[]', '94', '{"solution":"Cộng đơn vị: 7 + 7 = 14, viết 4 nhớ 1 sang hàng chục. Kết quả: 94."}', 4),
  ('94 - 58 = ___', 'numeric', '[]', '36', '{"solution":"Trừ đơn vị: 4 không trừ được 8, lấy 14 - 8 = 6, nhớ 1 sang hàng chục của số trừ. Kết quả: 36."}', 5),
  ('80 - 45 = ___', 'numeric', '[]', '35', '{"solution":"Trừ đơn vị: 0 không trừ được 5, lấy 10 - 5 = 5, nhớ 1 sang hàng chục của số trừ. Kết quả: 35."}', 6),
  ('An có 31 quyển vở. Tú có ít hơn An 8 quyển vở. Hỏi Tú có bao nhiêu quyển vở? Trả lời: ___ quyển vở.', 'numeric', '[]', '23', '{"solution":"\"Ít hơn\" thì làm phép trừ: 31 - 8 = 23 (quyển vở)."}', 7),
  ('Hoa có 56 quả cam. Linh có ít hơn Hoa 25 quả cam. Hỏi Linh có bao nhiêu quả cam? Trả lời: ___ quả cam.', 'numeric', '[]', '31', '{"solution":"\"Ít hơn\" thì làm phép trừ: 56 - 25 = 31 (quả cam)."}', 8),
  ('Một đường gấp khúc gồm 2 đoạn thẳng dài 13 cm, 16 cm. Độ dài đường gấp khúc là ___ cm.', 'numeric', '[]', '29', '{"solution":"Độ dài đường gấp khúc = tổng độ dài các đoạn: 13 + 16 = 29 (cm)."}', 9),
  ('Một đường gấp khúc gồm 3 đoạn thẳng dài 8 cm, 9 cm, 18 cm. Độ dài đường gấp khúc là ___ cm.', 'numeric', '[]', '35', '{"solution":"Độ dài đường gấp khúc = tổng độ dài các đoạn: 8 + 9 + 18 = 35 (cm)."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-2-cong-tru-pv100'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- Bảng nhân, bảng chia 2 và 5
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Bảng nhân, bảng chia 2 và 5', '03', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_2'), 'active', 3, 15, 'gen_toan-2-nhan-chia', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-2-nhan-chia');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('5 × ___ = 10', 'numeric', '[]', '2', '{"solution":"Lấy 10 : 5 = 2."}', 1),
  ('2 × ___ = 4', 'numeric', '[]', '2', '{"solution":"Lấy 4 : 2 = 2."}', 2),
  ('5 × ___ = 25', 'numeric', '[]', '5', '{"solution":"Lấy 25 : 5 = 5."}', 3),
  ('35 : 5 = ___', 'numeric', '[]', '7', '{"solution":"Vì 5 × 7 = 35 nên 35 : 5 = 7."}', 4),
  ('5 × 8 = ___', 'numeric', '[]', '40', '{"solution":"5 × 8 là 5 được lấy 8 lần. Theo bảng nhân 5: 5 × 8 = 40."}', 5),
  ('5 × 3 = ___', 'numeric', '[]', '15', '{"solution":"5 × 3 là 5 được lấy 3 lần. Theo bảng nhân 5: 5 × 3 = 15."}', 6),
  ('Mỗi bạn có 2 bông hoa. Hỏi 10 bạn có tất cả bao nhiêu bông hoa? Trả lời: ___ bông hoa.', 'numeric', '[]', '20', '{"solution":"10 bạn, mỗi bạn 2 bông hoa: 2 × 10 = 20 (bông hoa)."}', 7),
  ('Có 6 quả cam chia đều cho 2 bạn. Hỏi mỗi bạn được mấy quả cam? Trả lời: ___ quả cam.', 'numeric', '[]', '3', '{"solution":"Chia đều → phép chia: 6 : 2 = 3 (quả cam)."}', 8),
  ('2 × 6 = 12. Đúng hay sai?', 'mcq', '["Đúng","Sai"]', 'Đúng', '{"solution":"Đúng, 2 × 6 = 12."}', 9),
  ('5 × 7 = 30. Đúng hay sai?', 'mcq', '["Đúng","Sai"]', 'Sai', '{"solution":"Sai, 5 × 7 = 35."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-2-nhan-chia'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- Các số trong phạm vi 1000
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Các số trong phạm vi 1000', '04', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_2'), 'active', 4, 15, 'gen_toan-2-so-den-1000', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-2-so-den-1000');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('Số 343 gồm 3 trăm, 4 chục và ___ đơn vị.', 'numeric', '[]', '3', '{"solution":"343: chữ số 3 ở hàng trăm, 4 ở hàng chục, 3 ở hàng đơn vị."}', 1),
  ('400 + 80 + 3 = ___', 'numeric', '[]', '483', '{"solution":"4 trăm, 8 chục, 3 đơn vị là số 483."}', 2),
  ('Số 460 gồm 4 trăm, ___ chục và 0 đơn vị.', 'numeric', '[]', '6', '{"solution":"460: chữ số 4 ở hàng trăm, 6 ở hàng chục, 0 ở hàng đơn vị."}', 3),
  ('200 + 70 + 4 = ___', 'numeric', '[]', '274', '{"solution":"2 trăm, 7 chục, 4 đơn vị là số 274."}', 4),
  ('Chọn dấu thích hợp: 756 ___ 756', 'mcq', '[">","<","="]', '=', '{"solution":"So sánh từ hàng cao nhất (trăm, rồi chục, rồi đơn vị). Hai số bằng nhau nên 756 = 756."}', 5),
  ('Chọn dấu thích hợp: 804 ___ 511', 'mcq', '[">","<","="]', '>', '{"solution":"So sánh từ hàng cao nhất (trăm, rồi chục, rồi đơn vị). 804 lớn hơn 511 nên 804 > 511."}', 6),
  ('Dãy số nào được sắp xếp theo thứ tự từ lớn đến bé?', 'mcq', '["436; 322; 269; 240","322; 436; 269; 240","240; 269; 322; 436","436; 322; 240; 269"]', '436; 322; 269; 240', '{"solution":"Thứ tự đúng: 436 > 322 > 269 > 240."}', 7),
  ('Dãy số nào được sắp xếp theo thứ tự từ lớn đến bé?', 'mcq', '["214; 273; 533; 708","708; 533; 214; 273","708; 533; 273; 214","708; 273; 214; 533"]', '708; 533; 273; 214', '{"solution":"Thứ tự đúng: 708 > 533 > 273 > 214."}', 8),
  ('365 + 278 = ___', 'numeric', '[]', '643', '{"solution":"Cộng đơn vị: 5 + 8 = 13, viết 3 nhớ 1 sang hàng chục. Kết quả: 643."}', 9),
  ('935 - 709 = ___', 'numeric', '[]', '226', '{"solution":"Trừ đơn vị: 5 không trừ được 9, lấy 15 - 9 = 6, nhớ 1 sang hàng chục của số trừ. Kết quả: 226."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-2-so-den-1000'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- Độ dài, ki-lô-gam, lít, tiền Việt Nam
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Độ dài, ki-lô-gam, lít, tiền Việt Nam', '05', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_2'), 'active', 5, 15, 'gen_toan-2-do-luong', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-2-do-luong');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('5 km = ___ m', 'short', '[]', '5.000|5000|5 000', '{"solution":"1 km = 1.000 m nên 5 km = 5.000 m."}', 1),
  ('Can thứ nhất đựng 58 l nước, can thứ hai đựng 35 l nước. Cả hai can đựng ___ l nước.', 'numeric', '[]', '93', '{"solution":"\"Cả hai\" → phép cộng: 58 + 35 = 93 (lít)."}', 2),
  ('8 m = ___ cm', 'numeric', '[]', '800', '{"solution":"1 m = 100 cm nên 8 m = 800 cm."}', 3),
  ('Bao gạo nặng 25 kg, bao ngô nặng 6 kg. Cả hai bao nặng ___ kg.', 'numeric', '[]', '31', '{"solution":"\"Cả hai\" → phép cộng: 25 + 6 = 31 (ki-lô-gam)."}', 4),
  ('Mẹ có 2 tờ 200 đồng. Mẹ có tất cả ___ đồng.', 'numeric', '[]', '400', '{"solution":"2 × 200 = 400. Tổng: 400 đồng."}', 5),
  ('Mẹ có 1 tờ 1.000 đồng và 1 tờ 200 đồng. Mẹ có tất cả ___ đồng.', 'short', '[]', '1.200|1200|1 200', '{"solution":"1 × 1.000 = 1.000; 1 × 200 = 200. Tổng: 1.200 đồng."}', 6),
  ('Mẹ có 2 tờ 200 đồng và 1 tờ 100 đồng. Mẹ có tất cả ___ đồng.', 'numeric', '[]', '500', '{"solution":"2 × 200 = 400; 1 × 100 = 100. Tổng: 500 đồng."}', 7),
  ('Một đường gấp khúc gồm 4 đoạn thẳng dài 22 cm, 22 cm, 17 cm, 5 cm. Độ dài đường gấp khúc là ___ cm.', 'numeric', '[]', '66', '{"solution":"Độ dài đường gấp khúc = tổng độ dài các đoạn: 22 + 22 + 17 + 5 = 66 (cm)."}', 8),
  ('Một đường gấp khúc gồm 3 đoạn thẳng dài 17 cm, 10 cm, 12 cm. Độ dài đường gấp khúc là ___ cm.', 'numeric', '[]', '39', '{"solution":"Độ dài đường gấp khúc = tổng độ dài các đoạn: 17 + 10 + 12 = 39 (cm)."}', 9),
  ('Một đường gấp khúc gồm 2 đoạn thẳng dài 23 cm, 13 cm. Độ dài đường gấp khúc là ___ cm.', 'numeric', '[]', '36', '{"solution":"Độ dài đường gấp khúc = tổng độ dài các đoạn: 23 + 13 = 36 (cm)."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-2-do-luong'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- Xem đồng hồ, ngày – tháng
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Xem đồng hồ, ngày – tháng', '06', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_2'), 'active', 6, 15, 'gen_toan-2-thoi-gian', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-2-thoi-gian');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('Đồng hồ chỉ mấy giờ?', 'mcq', '["8 giờ 30 phút","10 giờ 30 phút","9 giờ 30 phút","3 giờ 30 phút"]', '9 giờ 30 phút', '{"solution":"Kim ngắn (màu đen) chỉ giờ, kim dài (màu đỏ) chỉ phút. Kim ngắn chỉ qua số 9, kim dài chỉ số 6 nghĩa là 30 phút. Đồng hồ chỉ 9 giờ 30 phút.","images":[{"url":"data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20120%20120%22%20width%3D%22160%22%20height%3D%22160%22%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2260%22%20r%3D%2256%22%20fill%3D%22%23fffbeb%22%20stroke%3D%22%23f59e0b%22%20stroke-width%3D%224%22%2F%3E%3Ctext%20x%3D%2281.0%22%20y%3D%2223.6%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E1%3C%2Ftext%3E%3Ctext%20x%3D%2296.4%22%20y%3D%2239.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E2%3C%2Ftext%3E%3Ctext%20x%3D%22102.0%22%20y%3D%2260.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E3%3C%2Ftext%3E%3Ctext%20x%3D%2296.4%22%20y%3D%2281.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E4%3C%2Ftext%3E%3Ctext%20x%3D%2281.0%22%20y%3D%2296.4%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E5%3C%2Ftext%3E%3Ctext%20x%3D%2260.0%22%20y%3D%22102.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E6%3C%2Ftext%3E%3Ctext%20x%3D%2239.0%22%20y%3D%2296.4%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E7%3C%2Ftext%3E%3Ctext%20x%3D%2223.6%22%20y%3D%2281.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E8%3C%2Ftext%3E%3Ctext%20x%3D%2218.0%22%20y%3D%2260.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E9%3C%2Ftext%3E%3Ctext%20x%3D%2223.6%22%20y%3D%2239.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E10%3C%2Ftext%3E%3Ctext%20x%3D%2239.0%22%20y%3D%2223.6%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E11%3C%2Ftext%3E%3Ctext%20x%3D%2260.0%22%20y%3D%2218.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E12%3C%2Ftext%3E%3Cline%20x1%3D%2260%22%20y1%3D%2260%22%20x2%3D%2234.9%22%20y2%3D%2253.3%22%20stroke%3D%22%231c1917%22%20stroke-width%3D%225%22%20stroke-linecap%3D%22round%22%2F%3E%3Cline%20x1%3D%2260%22%20y1%3D%2260%22%20x2%3D%2260.0%22%20y2%3D%2298.0%22%20stroke%3D%22%23e11d48%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%2F%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2260%22%20r%3D%224%22%20fill%3D%22%231c1917%22%2F%3E%3C%2Fsvg%3E","position":"after"}]}', 1),
  ('Đồng hồ chỉ mấy giờ?', 'mcq', '["7 giờ 15 phút","7 giờ 30 phút","6 giờ 15 phút","3 giờ"]', '7 giờ 15 phút', '{"solution":"Kim ngắn (màu đen) chỉ giờ, kim dài (màu đỏ) chỉ phút. Kim ngắn chỉ qua số 7, kim dài chỉ số 3 nghĩa là 15 phút. Đồng hồ chỉ 7 giờ 15 phút.","images":[{"url":"data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20120%20120%22%20width%3D%22160%22%20height%3D%22160%22%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2260%22%20r%3D%2256%22%20fill%3D%22%23fffbeb%22%20stroke%3D%22%23f59e0b%22%20stroke-width%3D%224%22%2F%3E%3Ctext%20x%3D%2281.0%22%20y%3D%2223.6%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E1%3C%2Ftext%3E%3Ctext%20x%3D%2296.4%22%20y%3D%2239.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E2%3C%2Ftext%3E%3Ctext%20x%3D%22102.0%22%20y%3D%2260.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E3%3C%2Ftext%3E%3Ctext%20x%3D%2296.4%22%20y%3D%2281.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E4%3C%2Ftext%3E%3Ctext%20x%3D%2281.0%22%20y%3D%2296.4%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E5%3C%2Ftext%3E%3Ctext%20x%3D%2260.0%22%20y%3D%22102.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E6%3C%2Ftext%3E%3Ctext%20x%3D%2239.0%22%20y%3D%2296.4%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E7%3C%2Ftext%3E%3Ctext%20x%3D%2223.6%22%20y%3D%2281.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E8%3C%2Ftext%3E%3Ctext%20x%3D%2218.0%22%20y%3D%2260.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E9%3C%2Ftext%3E%3Ctext%20x%3D%2223.6%22%20y%3D%2239.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E10%3C%2Ftext%3E%3Ctext%20x%3D%2239.0%22%20y%3D%2223.6%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E11%3C%2Ftext%3E%3Ctext%20x%3D%2260.0%22%20y%3D%2218.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E12%3C%2Ftext%3E%3Cline%20x1%3D%2260%22%20y1%3D%2260%22%20x2%3D%2244.2%22%20y2%3D%2280.6%22%20stroke%3D%22%231c1917%22%20stroke-width%3D%225%22%20stroke-linecap%3D%22round%22%2F%3E%3Cline%20x1%3D%2260%22%20y1%3D%2260%22%20x2%3D%2298.0%22%20y2%3D%2260.0%22%20stroke%3D%22%23e11d48%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%2F%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2260%22%20r%3D%224%22%20fill%3D%22%231c1917%22%2F%3E%3C%2Fsvg%3E","position":"after"}]}', 2),
  ('Đồng hồ chỉ mấy giờ?', 'mcq', '["8 giờ","2 giờ","2 giờ 30 phút","12 giờ"]', '2 giờ', '{"solution":"Kim ngắn (màu đen) chỉ giờ, kim dài (màu đỏ) chỉ phút. Kim ngắn chỉ đúng số 2, kim dài chỉ số 12 nên là giờ đúng. Đồng hồ chỉ 2 giờ.","images":[{"url":"data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20120%20120%22%20width%3D%22160%22%20height%3D%22160%22%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2260%22%20r%3D%2256%22%20fill%3D%22%23fffbeb%22%20stroke%3D%22%23f59e0b%22%20stroke-width%3D%224%22%2F%3E%3Ctext%20x%3D%2281.0%22%20y%3D%2223.6%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E1%3C%2Ftext%3E%3Ctext%20x%3D%2296.4%22%20y%3D%2239.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E2%3C%2Ftext%3E%3Ctext%20x%3D%22102.0%22%20y%3D%2260.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E3%3C%2Ftext%3E%3Ctext%20x%3D%2296.4%22%20y%3D%2281.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E4%3C%2Ftext%3E%3Ctext%20x%3D%2281.0%22%20y%3D%2296.4%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E5%3C%2Ftext%3E%3Ctext%20x%3D%2260.0%22%20y%3D%22102.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E6%3C%2Ftext%3E%3Ctext%20x%3D%2239.0%22%20y%3D%2296.4%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E7%3C%2Ftext%3E%3Ctext%20x%3D%2223.6%22%20y%3D%2281.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E8%3C%2Ftext%3E%3Ctext%20x%3D%2218.0%22%20y%3D%2260.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E9%3C%2Ftext%3E%3Ctext%20x%3D%2223.6%22%20y%3D%2239.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E10%3C%2Ftext%3E%3Ctext%20x%3D%2239.0%22%20y%3D%2223.6%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E11%3C%2Ftext%3E%3Ctext%20x%3D%2260.0%22%20y%3D%2218.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E12%3C%2Ftext%3E%3Cline%20x1%3D%2260%22%20y1%3D%2260%22%20x2%3D%2282.5%22%20y2%3D%2247.0%22%20stroke%3D%22%231c1917%22%20stroke-width%3D%225%22%20stroke-linecap%3D%22round%22%2F%3E%3Cline%20x1%3D%2260%22%20y1%3D%2260%22%20x2%3D%2260.0%22%20y2%3D%2222.0%22%20stroke%3D%22%23e11d48%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%2F%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2260%22%20r%3D%224%22%20fill%3D%22%231c1917%22%2F%3E%3C%2Fsvg%3E","position":"after"}]}', 3),
  ('Đồng hồ chỉ mấy giờ?', 'mcq', '["4 giờ","5 giờ","3 giờ","12 giờ"]', '4 giờ', '{"solution":"Kim ngắn (màu đen) chỉ giờ, kim dài (màu đỏ) chỉ phút. Kim ngắn chỉ đúng số 4, kim dài chỉ số 12 nên là giờ đúng. Đồng hồ chỉ 4 giờ.","images":[{"url":"data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20120%20120%22%20width%3D%22160%22%20height%3D%22160%22%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2260%22%20r%3D%2256%22%20fill%3D%22%23fffbeb%22%20stroke%3D%22%23f59e0b%22%20stroke-width%3D%224%22%2F%3E%3Ctext%20x%3D%2281.0%22%20y%3D%2223.6%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E1%3C%2Ftext%3E%3Ctext%20x%3D%2296.4%22%20y%3D%2239.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E2%3C%2Ftext%3E%3Ctext%20x%3D%22102.0%22%20y%3D%2260.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E3%3C%2Ftext%3E%3Ctext%20x%3D%2296.4%22%20y%3D%2281.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E4%3C%2Ftext%3E%3Ctext%20x%3D%2281.0%22%20y%3D%2296.4%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E5%3C%2Ftext%3E%3Ctext%20x%3D%2260.0%22%20y%3D%22102.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E6%3C%2Ftext%3E%3Ctext%20x%3D%2239.0%22%20y%3D%2296.4%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E7%3C%2Ftext%3E%3Ctext%20x%3D%2223.6%22%20y%3D%2281.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E8%3C%2Ftext%3E%3Ctext%20x%3D%2218.0%22%20y%3D%2260.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E9%3C%2Ftext%3E%3Ctext%20x%3D%2223.6%22%20y%3D%2239.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E10%3C%2Ftext%3E%3Ctext%20x%3D%2239.0%22%20y%3D%2223.6%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E11%3C%2Ftext%3E%3Ctext%20x%3D%2260.0%22%20y%3D%2218.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E12%3C%2Ftext%3E%3Cline%20x1%3D%2260%22%20y1%3D%2260%22%20x2%3D%2282.5%22%20y2%3D%2273.0%22%20stroke%3D%22%231c1917%22%20stroke-width%3D%225%22%20stroke-linecap%3D%22round%22%2F%3E%3Cline%20x1%3D%2260%22%20y1%3D%2260%22%20x2%3D%2260.0%22%20y2%3D%2222.0%22%20stroke%3D%22%23e11d48%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%2F%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2260%22%20r%3D%224%22%20fill%3D%22%231c1917%22%2F%3E%3C%2Fsvg%3E","position":"after"}]}', 4),
  ('Đồng hồ chỉ mấy giờ?', 'mcq', '["9 giờ","4 giờ","3 giờ","12 giờ"]', '3 giờ', '{"solution":"Kim ngắn (màu đen) chỉ giờ, kim dài (màu đỏ) chỉ phút. Kim ngắn chỉ đúng số 3, kim dài chỉ số 12 nên là giờ đúng. Đồng hồ chỉ 3 giờ.","images":[{"url":"data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20120%20120%22%20width%3D%22160%22%20height%3D%22160%22%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2260%22%20r%3D%2256%22%20fill%3D%22%23fffbeb%22%20stroke%3D%22%23f59e0b%22%20stroke-width%3D%224%22%2F%3E%3Ctext%20x%3D%2281.0%22%20y%3D%2223.6%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E1%3C%2Ftext%3E%3Ctext%20x%3D%2296.4%22%20y%3D%2239.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E2%3C%2Ftext%3E%3Ctext%20x%3D%22102.0%22%20y%3D%2260.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E3%3C%2Ftext%3E%3Ctext%20x%3D%2296.4%22%20y%3D%2281.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E4%3C%2Ftext%3E%3Ctext%20x%3D%2281.0%22%20y%3D%2296.4%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E5%3C%2Ftext%3E%3Ctext%20x%3D%2260.0%22%20y%3D%22102.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E6%3C%2Ftext%3E%3Ctext%20x%3D%2239.0%22%20y%3D%2296.4%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E7%3C%2Ftext%3E%3Ctext%20x%3D%2223.6%22%20y%3D%2281.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E8%3C%2Ftext%3E%3Ctext%20x%3D%2218.0%22%20y%3D%2260.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E9%3C%2Ftext%3E%3Ctext%20x%3D%2223.6%22%20y%3D%2239.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E10%3C%2Ftext%3E%3Ctext%20x%3D%2239.0%22%20y%3D%2223.6%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E11%3C%2Ftext%3E%3Ctext%20x%3D%2260.0%22%20y%3D%2218.0%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%2344403c%22%3E12%3C%2Ftext%3E%3Cline%20x1%3D%2260%22%20y1%3D%2260%22%20x2%3D%2286.0%22%20y2%3D%2260.0%22%20stroke%3D%22%231c1917%22%20stroke-width%3D%225%22%20stroke-linecap%3D%22round%22%2F%3E%3Cline%20x1%3D%2260%22%20y1%3D%2260%22%20x2%3D%2260.0%22%20y2%3D%2222.0%22%20stroke%3D%22%23e11d48%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%2F%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2260%22%20r%3D%224%22%20fill%3D%22%231c1917%22%2F%3E%3C%2Fsvg%3E","position":"after"}]}', 5),
  ('Hôm nay là thứ Ba. Hỏi ngày mai là thứ mấy?', 'mcq', '["Thứ Ba","Thứ Hai","Thứ Sáu","Thứ Tư"]', 'Thứ Tư', '{"solution":"Thứ tự các ngày: thứ Hai, thứ Ba, thứ Tư, thứ Năm, thứ Sáu, thứ Bảy, Chủ nhật. Ngày mai là thứ Tư."}', 6),
  ('Hôm nay là thứ Sáu. Hỏi ngày mai là thứ mấy?', 'mcq', '["Thứ Tư","Thứ Bảy","Thứ Ba","Thứ Sáu"]', 'Thứ Bảy', '{"solution":"Thứ tự các ngày: thứ Hai, thứ Ba, thứ Tư, thứ Năm, thứ Sáu, thứ Bảy, Chủ nhật. Ngày mai là thứ Bảy."}', 7),
  ('Ngày 2 tháng này là thứ Hai. Hỏi ngày 9 tháng này là thứ mấy?', 'mcq', '["Chủ nhật","Thứ Tư","Thứ Sáu","Thứ Hai"]', 'Thứ Hai', '{"solution":"Từ ngày 2 đến ngày 9 là 7 ngày, đúng 1 tuần, nên vẫn là thứ Hai."}', 8),
  ('Ngày 10 tháng này là thứ Bảy. Hỏi ngày 17 tháng này là thứ mấy?', 'mcq', '["Thứ Ba","Thứ Năm","Thứ Bảy","Chủ nhật"]', 'Thứ Bảy', '{"solution":"Từ ngày 10 đến ngày 17 là 7 ngày, đúng 1 tuần, nên vẫn là thứ Bảy."}', 9),
  ('Ngày 9 tháng này là thứ Tư. Hỏi ngày 16 tháng này là thứ mấy?', 'mcq', '["Thứ Hai","Thứ Năm","Thứ Tư","Chủ nhật"]', 'Thứ Tư', '{"solution":"Từ ngày 9 đến ngày 16 là 7 ngày, đúng 1 tuần, nên vẫn là thứ Tư."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-2-thoi-gian'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- ═══════════════ LỚP 5 ═══════════════
INSERT INTO subjects (grade, name, order_index)
SELECT 5, 'Toán', 99
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE grade = 5 AND name = 'Toán');

INSERT INTO chapters (title, subject_id, order_index, source_id)
SELECT 'Luyện tập theo chủ đề', (SELECT id FROM subjects WHERE grade = 5 AND name = 'Toán' ORDER BY id LIMIT 1), 1000, 'gen_toan_lop_5'
WHERE NOT EXISTS (SELECT 1 FROM chapters WHERE source_id = 'gen_toan_lop_5');

-- Phân số thập phân và hỗn số
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Phân số thập phân và hỗn số', '01', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_5'), 'active', 1, 15, 'gen_toan-5-phan-so-hon-so', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-5-phan-so-hon-so');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('Viết thành phân số thập phân: 2/5 = ___/10', 'numeric', '[]', '4', '{"solution":"Nhân cả tử số và mẫu số với 2: 2 × 2 = 4; 5 × 2 = 10."}', 1),
  ('Viết thành phân số thập phân: 59/200 = ___/1.000', 'numeric', '[]', '295', '{"solution":"Nhân cả tử số và mẫu số với 5: 59 × 5 = 295; 200 × 5 = 1.000."}', 2),
  ('Viết thành phân số thập phân: 21/50 = ___/100', 'numeric', '[]', '42', '{"solution":"Nhân cả tử số và mẫu số với 2: 21 × 2 = 42; 50 × 2 = 100."}', 3),
  ('Viết thành phân số thập phân: 93/250 = ___/1.000', 'numeric', '[]', '372', '{"solution":"Nhân cả tử số và mẫu số với 4: 93 × 4 = 372; 250 × 4 = 1.000."}', 4),
  ('Viết phân số 17/6 thành hỗn số: 17/6 = 2 và ___/6', 'numeric', '[]', '5', '{"solution":"17 : 6 = 2 dư 5. Vậy 17/6 = 2 5/6."}', 5),
  ('Viết phân số 11/2 thành hỗn số: 11/2 = 5 và ___/2', 'numeric', '[]', '1', '{"solution":"11 : 2 = 5 dư 1. Vậy 11/2 = 5 1/2."}', 6),
  ('Viết phân số 39/7 thành hỗn số: 39/7 = 5 và ___/7', 'numeric', '[]', '4', '{"solution":"39 : 7 = 5 dư 4. Vậy 39/7 = 5 4/7."}', 7),
  ('Viết phân số 25/8 thành hỗn số: 25/8 = 3 và ___/8', 'numeric', '[]', '1', '{"solution":"25 : 8 = 3 dư 1. Vậy 25/8 = 3 1/8."}', 8),
  ('Phân số 9198/1.000 viết dưới dạng số thập phân là:', 'mcq', '["9,198","91,98","9.198","0,09198"]', '9,198', '{"solution":"Mẫu số 1.000 có 3 chữ số 0, nên phần thập phân có 3 chữ số: 9,198."}', 9),
  ('Phân số 896/100 viết dưới dạng số thập phân là:', 'mcq', '["0,896","896","8,96","89,6"]', '8,96', '{"solution":"Mẫu số 100 có 2 chữ số 0, nên phần thập phân có 2 chữ số: 8,96."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-5-phan-so-hon-so'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- Số thập phân: các hàng, so sánh, sắp xếp
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Số thập phân: các hàng, so sánh, sắp xếp', '02', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_5'), 'active', 2, 15, 'gen_toan-5-so-thap-phan', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-5-so-thap-phan');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('Trong số 31,628, chữ số 3 thuộc hàng nào?', 'mcq', '["hàng chục","hàng phần trăm","hàng đơn vị","hàng phần nghìn"]', 'hàng chục', '{"solution":"31,628: 3 – hàng chục; 1 – hàng đơn vị; 6 – hàng phần mười; 2 – hàng phần trăm; 8 – hàng phần nghìn."}', 1),
  ('Trong số 15,837, chữ số 7 thuộc hàng nào?', 'mcq', '["hàng chục","hàng phần nghìn","hàng đơn vị","hàng phần trăm"]', 'hàng phần nghìn', '{"solution":"15,837: 1 – hàng chục; 5 – hàng đơn vị; 8 – hàng phần mười; 3 – hàng phần trăm; 7 – hàng phần nghìn."}', 2),
  ('Trong số 93,017, chữ số 9 thuộc hàng nào?', 'mcq', '["hàng phần mười","hàng đơn vị","hàng phần nghìn","hàng chục"]', 'hàng chục', '{"solution":"93,017: 9 – hàng chục; 3 – hàng đơn vị; 0 – hàng phần mười; 1 – hàng phần trăm; 7 – hàng phần nghìn."}', 3),
  ('Phân số 271/1.000 viết dưới dạng số thập phân là:', 'mcq', '["0,00271","0,271","0,0271","271"]', '0,271', '{"solution":"Mẫu số 1.000 có 3 chữ số 0, nên phần thập phân có 3 chữ số: 0,271."}', 4),
  ('Phân số 6/10 viết dưới dạng số thập phân là:', 'mcq', '["0,006","0,6","6","0,06"]', '0,6', '{"solution":"Mẫu số 10 có 1 chữ số 0, nên phần thập phân có 1 chữ số: 0,6."}', 5),
  ('Chọn dấu thích hợp: 17,31 ___ 17,6', 'mcq', '[">","<","="]', '<', '{"solution":"So sánh phần nguyên trước; nếu bằng nhau thì so sánh lần lượt hàng phần mười, phần trăm, phần nghìn. Vậy 17,31 < 17,6."}', 6),
  ('Chọn dấu thích hợp: 14,371 ___ 14,1', 'mcq', '[">","<","="]', '>', '{"solution":"So sánh phần nguyên trước; nếu bằng nhau thì so sánh lần lượt hàng phần mười, phần trăm, phần nghìn. Vậy 14,371 > 14,1."}', 7),
  ('Chọn dấu thích hợp: 17,1 ___ 19,4', 'mcq', '[">","<","="]', '<', '{"solution":"So sánh phần nguyên trước; nếu bằng nhau thì so sánh lần lượt hàng phần mười, phần trăm, phần nghìn. Vậy 17,1 < 19,4."}', 8),
  ('Dãy số nào được sắp xếp theo thứ tự từ bé đến lớn?', 'mcq', '["6,3; 6,326; 7,5; 6,5","7,5; 6,5; 6,326; 6,3","6,326; 6,3; 6,5; 7,5","6,3; 6,326; 6,5; 7,5"]', '6,3; 6,326; 6,5; 7,5', '{"solution":"Thứ tự đúng: 6,3 < 6,326 < 6,5 < 7,5."}', 9),
  ('Dãy số nào được sắp xếp theo thứ tự từ bé đến lớn?', 'mcq', '["6,99; 6,299; 5,9; 5,867","6,99; 5,867; 5,9; 6,299","5,867; 5,9; 6,299; 6,99","5,867; 5,9; 6,99; 6,299"]', '5,867; 5,9; 6,299; 6,99', '{"solution":"Thứ tự đúng: 5,867 < 5,9 < 6,299 < 6,99."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-5-so-thap-phan'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- Cộng, trừ, nhân, chia số thập phân
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Cộng, trừ, nhân, chia số thập phân', '03', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_5'), 'active', 3, 15, 'gen_toan-5-phep-tinh-stp', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-5-phep-tinh-stp');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('96,39 - 16,54 = ___', 'numeric', '[]', '79,85', '{"solution":"Đặt tính sao cho các dấu phẩy thẳng cột (96,39 - 16,54), tính như số tự nhiên rồi đặt dấu phẩy: 79,85."}', 1),
  ('6,49 + 2,4 = ___', 'numeric', '[]', '8,89', '{"solution":"Đặt tính sao cho các dấu phẩy thẳng cột (6,49 + 2,40), tính như số tự nhiên rồi đặt dấu phẩy: 8,89."}', 2),
  ('8,3 + 12,13 = ___', 'numeric', '[]', '20,43', '{"solution":"Đặt tính sao cho các dấu phẩy thẳng cột (8,30 + 12,13), tính như số tự nhiên rồi đặt dấu phẩy: 20,43."}', 3),
  ('17,6 × 7,8 = ___', 'numeric', '[]', '137,28', '{"solution":"Nhân như số tự nhiên; tích có số chữ số thập phân bằng tổng số chữ số thập phân của hai thừa số (rồi bỏ chữ số 0 thừa ở cuối). Kết quả: 137,28."}', 4),
  ('85,9 × 100 = ___', 'short', '[]', '8.590|8590|8 590', '{"solution":"Nhân với 100: chuyển dấu phẩy sang phải 2 chữ số. Kết quả: 8.590."}', 5),
  ('13,4 × 8,1 = ___', 'numeric', '[]', '108,54', '{"solution":"Nhân như số tự nhiên; tích có số chữ số thập phân bằng tổng số chữ số thập phân của hai thừa số (rồi bỏ chữ số 0 thừa ở cuối). Kết quả: 108,54."}', 6),
  ('9.200 : 1.000 = ___', 'numeric', '[]', '9,2', '{"solution":"Chia cho 1.000: chuyển dấu phẩy sang trái 3 chữ số. Kết quả: 9,2. Thử lại: 9,2 × 1.000 = 9.200."}', 7),
  ('25,25 : 2,5 = ___', 'numeric', '[]', '10,1', '{"solution":"Chuyển dấu phẩy của số chia sang phải cho thành số tự nhiên, số bị chia cũng chuyển sang phải bấy nhiêu chữ số, rồi chia như thường. Kết quả: 10,1. Thử lại: 10,1 × 2,5 = 25,25."}', 8),
  ('5,7 : 1,5 = ___', 'numeric', '[]', '3,8', '{"solution":"Chuyển dấu phẩy của số chia sang phải cho thành số tự nhiên, số bị chia cũng chuyển sang phải bấy nhiêu chữ số, rồi chia như thường. Kết quả: 3,8. Thử lại: 3,8 × 1,5 = 5,7."}', 9),
  ('2,7 > 2,33. Đúng hay sai?', 'mcq', '["Đúng","Sai"]', 'Đúng', '{"solution":"Viết 2,7 = 2,70 rồi so sánh với 2,33: 2,7 > 2,33. Khẳng định đúng."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-5-phep-tinh-stp'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- Đổi đơn vị đo độ dài, khối lượng, diện tích, thể tích
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Đổi đơn vị đo độ dài, khối lượng, diện tích, thể tích', '04', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_5'), 'active', 4, 15, 'gen_toan-5-doi-don-vi', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-5-doi-don-vi');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('18 kg 205 g = ___ kg', 'numeric', '[]', '18,205', '{"solution":"1 kg = 1.000 g nên 205 g = 205/1.000 kg = 0,205 kg. Vậy 18 kg 205 g = 18,205 kg."}', 1),
  ('2,81 m³ = ___ dm³', 'short', '[]', '2.810|2810|2 810', '{"solution":"1 m³ = 1.000 dm³ nên 2,81 m³ = 2,81 × 1.000 = 2.810 dm³."}', 2),
  ('261 dm³ = ___ m³', 'numeric', '[]', '0,261', '{"solution":"1 dm³ = 1/1.000 m³ nên 261 dm³ = 261 : 1.000 = 0,261 m³."}', 3),
  ('5 yến 383 dag = ___ yến', 'numeric', '[]', '5,383', '{"solution":"1 yến = 1.000 dag nên 383 dag = 383/1.000 yến = 0,383 yến. Vậy 5 yến 383 dag = 5,383 yến."}', 4),
  ('762 m³ = ___ dm³', 'short', '[]', '762.000|762000|762 000', '{"solution":"1 m³ = 1.000 dm³ nên 762 m³ = 762 × 1.000 = 762.000 dm³."}', 5),
  ('838 hg = ___ tạ', 'numeric', '[]', '0,838', '{"solution":"1 hg = 1/1.000 tạ nên 838 hg = 838 : 1.000 = 0,838 tạ."}', 6),
  ('419 m³ = ___ dm³', 'short', '[]', '419.000|419000|419 000', '{"solution":"1 m³ = 1.000 dm³ nên 419 m³ = 419 × 1.000 = 419.000 dm³."}', 7),
  ('682 cm² = ___ m²', 'numeric', '[]', '0,0682', '{"solution":"1 cm² = 1/10.000 m² nên 682 cm² = 682 : 10.000 = 0,0682 m²."}', 8),
  ('497 m² = ___ dam²', 'numeric', '[]', '4,97', '{"solution":"1 m² = 1/100 dam² nên 497 m² = 497 : 100 = 4,97 dam²."}', 9),
  ('884 dm = ___ m', 'numeric', '[]', '88,4', '{"solution":"1 dm = 1/10 m nên 884 dm = 884 : 10 = 88,4 m."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-5-doi-don-vi'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- Tỉ số phần trăm
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Tỉ số phần trăm', '05', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_5'), 'active', 5, 15, 'gen_toan-5-ti-so-phan-tram', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-5-ti-so-phan-tram');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('Lớp 5A có 50 học sinh, trong đó có 33 học sinh nữ. Số học sinh nữ chiếm ___% số học sinh cả lớp.', 'numeric', '[]', '66', '{"solution":"Lấy 33 : 50 = 0,66, rồi nhân với 100 và viết thêm kí hiệu %: 66%."}', 1),
  ('Lớp 5A có 50 học sinh, trong đó có 38 học sinh nữ. Số học sinh nữ chiếm ___% số học sinh cả lớp.', 'numeric', '[]', '76', '{"solution":"Lấy 38 : 50 = 0,76, rồi nhân với 100 và viết thêm kí hiệu %: 76%."}', 2),
  ('Tỉ số phần trăm của 2 và 8 là ___%', 'numeric', '[]', '25', '{"solution":"Lấy 2 : 8 = 0,25, rồi nhân với 100 và viết thêm kí hiệu %: 25%."}', 3),
  ('Tỉ số phần trăm của 6 và 16 là ___%', 'numeric', '[]', '37,5', '{"solution":"Lấy 6 : 16 = 0,375, rồi nhân với 100 và viết thêm kí hiệu %: 37,5%."}', 4),
  ('80% của 450 là ___', 'numeric', '[]', '360', '{"solution":"Lấy 450 × 80 : 100 = 360."}', 5),
  ('Tìm một số, biết 10% của số đó là 13. Số đó là ___', 'numeric', '[]', '130', '{"solution":"Lấy 13 : 10 × 100 = 130."}', 6),
  ('Tìm một số, biết 50% của số đó là 180. Số đó là ___', 'numeric', '[]', '360', '{"solution":"Lấy 180 : 50 × 100 = 360."}', 7),
  ('15% của 470 là ___', 'numeric', '[]', '70,5', '{"solution":"Lấy 470 × 15 : 100 = 70,5."}', 8),
  ('0,75 = 75%. Đúng hay sai?', 'mcq', '["Đúng","Sai"]', 'Đúng', '{"solution":"0,75 = 0,75 × 100% = 75%. Vậy khẳng định đúng."}', 9),
  ('0,05 = 5%. Đúng hay sai?', 'mcq', '["Đúng","Sai"]', 'Đúng', '{"solution":"0,05 = 0,05 × 100% = 5%. Vậy khẳng định đúng."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-5-ti-so-phan-tram'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- Diện tích, chu vi, thể tích các hình
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Diện tích, chu vi, thể tích các hình', '06', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_5'), 'active', 6, 15, 'gen_toan-5-hinh-hoc', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-5-hinh-hoc');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('Hình thang có hai đáy dài 12,3 cm và 7,3 cm, chiều cao 25 cm. Diện tích hình thang là ___ cm²', 'numeric', '[]', '245', '{"solution":"S = (đáy lớn + đáy bé) × chiều cao : 2 = (12,3 + 7,3) × 25 : 2 = 245 (cm²)."}', 1),
  ('Hình tròn có bán kính 3,7 m. Diện tích hình tròn là ___ m² (lấy π = 3,14)', 'numeric', '[]', '42,9866', '{"solution":"S = r × r × 3,14 = 3,7 × 3,7 × 3,14 = 42,9866 (m²)."}', 2),
  ('Hình thang có hai đáy dài 21 m và 14 m, chiều cao 6,2 m. Diện tích hình thang là ___ m²', 'numeric', '[]', '108,5', '{"solution":"S = (đáy lớn + đáy bé) × chiều cao : 2 = (21 + 14) × 6,2 : 2 = 108,5 (m²)."}', 3),
  ('Hình tròn có đường kính 7,9 cm. Chu vi hình tròn là ___ cm (lấy π = 3,14)', 'numeric', '[]', '24,806', '{"solution":"C = d × 3,14 = 7,9 × 3,14 = 24,806 (cm)."}', 4),
  ('Hình tròn có bán kính 1,2 cm. Diện tích hình tròn là ___ cm² (lấy π = 3,14)', 'numeric', '[]', '4,5216', '{"solution":"S = r × r × 3,14 = 1,2 × 1,2 × 3,14 = 4,5216 (cm²)."}', 5),
  ('Hình hộp chữ nhật có chiều dài 9 m, chiều rộng 2 m, chiều cao 7 m. Diện tích xung quanh là ___ m²', 'numeric', '[]', '154', '{"solution":"Diện tích xung quanh = (9 + 2) × 2 × 7 = 154 (m²)."}', 6),
  ('Hình hộp chữ nhật có chiều dài 9 m, chiều rộng 2 m, chiều cao 5 m. Thể tích là ___ m³', 'numeric', '[]', '90', '{"solution":"Thể tích = 9 × 2 × 5 = 90 (m³)."}', 7),
  ('Hình hộp chữ nhật có chiều dài 5 m, chiều rộng 7 m, chiều cao 7 m. Thể tích là ___ m³', 'numeric', '[]', '245', '{"solution":"Thể tích = 5 × 7 × 7 = 245 (m³)."}', 8),
  ('Hình hộp chữ nhật có chiều dài 6 cm, chiều rộng 3 cm, chiều cao 5 cm. Thể tích là ___ cm³', 'numeric', '[]', '90', '{"solution":"Thể tích = 6 × 3 × 5 = 90 (cm³)."}', 9),
  ('Hình hộp chữ nhật có chiều dài 5 m, chiều rộng 3 m, chiều cao 4 m. Diện tích toàn phần là ___ m²', 'numeric', '[]', '94', '{"solution":"Diện tích toàn phần = 64 + 5 × 3 × 2 = 94 (m²)."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-5-hinh-hoc'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- Số đo thời gian, chuyển động đều
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Số đo thời gian, chuyển động đều', '07', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_5'), 'active', 7, 15, 'gen_toan-5-thoi-gian-chuyen-dong', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-5-thoi-gian-chuyen-dong');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('0,75 giờ = ___ phút', 'numeric', '[]', '45', '{"solution":"1 giờ = 60 phút nên 0,75 giờ = 0,75 × 60 = 45 phút."}', 1),
  ('90 phút = ___ giờ', 'numeric', '[]', '1,5', '{"solution":"90 phút = 90 : 60 = 1,5 giờ."}', 2),
  ('135 phút = ___ giờ', 'numeric', '[]', '2,25', '{"solution":"135 phút = 135 : 60 = 2,25 giờ."}', 3),
  ('1 giờ 5 phút × 5 = ?', 'mcq', '["5 giờ 20 phút","5 giờ 15 phút","5 giờ 25 phút","5 giờ 30 phút"]', '5 giờ 25 phút', '{"solution":"5 giờ 25 phút."}', 4),
  ('2,5 giờ = ___ phút', 'numeric', '[]', '150', '{"solution":"1 giờ = 60 phút nên 2,5 giờ = 2,5 × 60 = 150 phút."}', 5),
  ('Một xe máy đi quãng đường 92,5 km với vận tốc 37 km/giờ. Thời gian đi là ___ giờ.', 'numeric', '[]', '2,5', '{"solution":"Thời gian = quãng đường : vận tốc = 92,5 : 37 = 2,5 (giờ), tức là 2 giờ 30 phút."}', 6),
  ('Một người đi xe đạp đi với vận tốc 11 km/giờ trong 45 phút. Quãng đường đi được là ___ km.', 'numeric', '[]', '8,25', '{"solution":"Đổi 45 phút = 0,75 giờ. Quãng đường = vận tốc × thời gian = 11 × 0,75 = 8,25 (km)."}', 7),
  ('Một ca nô đi quãng đường 10 km với vận tốc 20 km/giờ. Thời gian đi là ___ giờ.', 'numeric', '[]', '0,5', '{"solution":"Thời gian = quãng đường : vận tốc = 10 : 20 = 0,5 (giờ), tức là 30 phút."}', 8),
  ('Một xe máy đi với vận tốc 35 km/giờ trong 45 phút. Quãng đường đi được là ___ km.', 'numeric', '[]', '26,25', '{"solution":"Đổi 45 phút = 0,75 giờ. Quãng đường = vận tốc × thời gian = 35 × 0,75 = 26,25 (km)."}', 9),
  ('Một người đi xe đạp đi quãng đường 21 km hết 1 giờ 30 phút. Vận tốc là ___ km/giờ.', 'numeric', '[]', '14', '{"solution":"Đổi 1 giờ 30 phút = 1,5 giờ. Vận tốc = quãng đường : thời gian = 21 : 1,5 = 14 (km/giờ)."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-5-thoi-gian-chuyen-dong'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- Ôn tập toán có lời văn
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Ôn tập toán có lời văn', '08', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_5'), 'active', 8, 15, 'gen_toan-5-on-tap-loi-van', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-5-on-tap-loi-van');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('Tìm trung bình cộng của các số: 14,8; 26,5; 5,6; 57,5. Trung bình cộng là ___', 'numeric', '[]', '26,1', '{"solution":"Tổng: 14,8 + 26,5 + 5,6 + 57,5 = 104,4. Trung bình cộng = 104,4 : 4 = 26,1."}', 1),
  ('Nam mua 2 quyển truyện, mỗi quyển giá 22.000 đồng. Nam đưa người bán 50.000 đồng. Người bán trả lại ___ đồng.', 'short', '[]', '6.000|6000|6 000', '{"solution":"Tiền mua: 22.000 × 2 = 44.000 đồng. Tiền trả lại: 50.000 - 44.000 = 6.000 đồng."}', 2),
  ('Tìm trung bình cộng của các số: 15,2; 33,6; 29,8. Trung bình cộng là ___', 'numeric', '[]', '26,2', '{"solution":"Tổng: 15,2 + 33,6 + 29,8 = 78,6. Trung bình cộng = 78,6 : 3 = 26,2."}', 3),
  ('75% của 320 là ___', 'numeric', '[]', '240', '{"solution":"Lấy 320 × 75 : 100 = 240."}', 4),
  ('Tỉ số phần trăm của 74 và 250 là ___%', 'numeric', '[]', '29,6', '{"solution":"Lấy 74 : 250 = 0,296, rồi nhân với 100 và viết thêm kí hiệu %: 29,6%."}', 5),
  ('Một ô tô đi quãng đường 145 km với vận tốc 58 km/giờ. Thời gian đi là ___ giờ.', 'numeric', '[]', '2,5', '{"solution":"Thời gian = quãng đường : vận tốc = 145 : 58 = 2,5 (giờ), tức là 2 giờ 30 phút."}', 6),
  ('Một xe máy đi quãng đường 30 km hết 1 giờ. Vận tốc là ___ km/giờ.', 'numeric', '[]', '30', '{"solution":"Đổi 1 giờ = 1 giờ. Vận tốc = quãng đường : thời gian = 30 : 1 = 30 (km/giờ)."}', 7),
  ('Một người đi xe đạp đi quãng đường 24 km hết 2 giờ. Vận tốc là ___ km/giờ.', 'numeric', '[]', '12', '{"solution":"Đổi 2 giờ = 2 giờ. Vận tốc = quãng đường : thời gian = 24 : 2 = 12 (km/giờ)."}', 8),
  ('Hình hộp chữ nhật có chiều dài 14 dm, chiều rộng 7 dm, chiều cao 5 dm. Thể tích là ___ dm³', 'numeric', '[]', '490', '{"solution":"Thể tích = 14 × 7 × 5 = 490 (dm³)."}', 9),
  ('Hình hộp chữ nhật có chiều dài 3 dm, chiều rộng 11 dm, chiều cao 3 dm. Diện tích toàn phần là ___ dm²', 'numeric', '[]', '150', '{"solution":"Diện tích toàn phần = 84 + 3 × 11 × 2 = 150 (dm²)."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-5-on-tap-loi-van'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

COMMIT;
