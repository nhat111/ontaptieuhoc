-- Bài luyện tập Toán tự sinh — lớp 1, 2, 3, 4, 5 (seed "v1")
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
  ('Nam có 57 cái kẹo. Tú có ít hơn Nam 7 cái kẹo. Hỏi Tú có bao nhiêu cái kẹo? Trả lời: ___ cái kẹo.', 'numeric', '[]', '50', '{"solution":"Bài giải\nSố cái kẹo của Tú là:\n57 - 7 = 50 (cái kẹo)\nĐáp số: 50 cái kẹo."}', 9),
  ('Hoa có 39 quyển vở. Tú có ít hơn Hoa 20 quyển vở. Hỏi Tú có bao nhiêu quyển vở? Trả lời: ___ quyển vở.', 'numeric', '[]', '19', '{"solution":"Bài giải\nSố quyển vở của Tú là:\n39 - 20 = 19 (quyển vở)\nĐáp số: 19 quyển vở."}', 10)
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
  ('An có 31 quyển vở. Tú có ít hơn An 8 quyển vở. Hỏi Tú có bao nhiêu quyển vở? Trả lời: ___ quyển vở.', 'numeric', '[]', '23', '{"solution":"Bài giải\nSố quyển vở của Tú là:\n31 - 8 = 23 (quyển vở)\nĐáp số: 23 quyển vở."}', 7),
  ('Hoa có 56 quả cam. Linh có ít hơn Hoa 25 quả cam. Hỏi Linh có bao nhiêu quả cam? Trả lời: ___ quả cam.', 'numeric', '[]', '31', '{"solution":"Bài giải\nSố quả cam của Linh là:\n56 - 25 = 31 (quả cam)\nĐáp số: 31 quả cam."}', 8),
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
  ('Mỗi bạn có 2 bông hoa. Hỏi 10 bạn có tất cả bao nhiêu bông hoa? Trả lời: ___ bông hoa.', 'numeric', '[]', '20', '{"solution":"Bài giải\nSố bông hoa của 10 bạn là:\n2 × 10 = 20 (bông hoa)\nĐáp số: 20 bông hoa."}', 7),
  ('Có 6 quả cam chia đều cho 2 bạn. Hỏi mỗi bạn được mấy quả cam? Trả lời: ___ quả cam.', 'numeric', '[]', '3', '{"solution":"Bài giải\nMỗi bạn được số quả cam là:\n6 : 2 = 3 (quả cam)\nĐáp số: 3 quả cam."}', 8),
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
  ('Can thứ nhất đựng 58 l nước, can thứ hai đựng 35 l nước. Cả hai can đựng ___ l nước.', 'numeric', '[]', '93', '{"solution":"Bài giải\nCả hai can đựng được số lít nước là:\n58 + 35 = 93 (l)\nĐáp số: 93 l nước."}', 2),
  ('8 m = ___ cm', 'numeric', '[]', '800', '{"solution":"1 m = 100 cm nên 8 m = 800 cm."}', 3),
  ('Bao gạo nặng 25 kg, bao ngô nặng 6 kg. Cả hai bao nặng ___ kg.', 'numeric', '[]', '31', '{"solution":"Bài giải\nCả hai bao nặng là:\n25 + 6 = 31 (kg)\nĐáp số: 31 kg."}', 4),
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

-- ═══════════════ LỚP 3 ═══════════════
INSERT INTO subjects (grade, name, order_index)
SELECT 3, 'Toán', 99
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE grade = 3 AND name = 'Toán');

INSERT INTO chapters (title, subject_id, order_index, source_id)
SELECT 'Luyện tập theo chủ đề', (SELECT id FROM subjects WHERE grade = 3 AND name = 'Toán' ORDER BY id LIMIT 1), 1000, 'gen_toan_lop_3'
WHERE NOT EXISTS (SELECT 1 FROM chapters WHERE source_id = 'gen_toan_lop_3');

-- Bảng nhân, bảng chia 6 và 7
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Bảng nhân, bảng chia 6 và 7', '01', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_3'), 'active', 1, 15, 'gen_toan-3-nhan-chia-6-7', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-3-nhan-chia-6-7');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('6 : 6 = ___', 'numeric', '[]', '1', '{"solution":"Vì 6 × 1 = 6 nên 6 : 6 = 1."}', 1),
  ('6 × 10 = ___', 'numeric', '[]', '60', '{"solution":"Theo bảng nhân 6: 6 × 10 = 60."}', 2),
  ('7 × 6 = ___', 'numeric', '[]', '42', '{"solution":"Theo bảng nhân 7: 7 × 6 = 42."}', 3),
  ('Số nào nhân với 6 thì được 60?', 'mcq', '["11","9","10","12"]', '10', '{"solution":"Lấy 60 : 6 = 10. Thử lại: 10 × 6 = 60."}', 4),
  ('6 × 5 - 14 = ___', 'numeric', '[]', '16', '{"solution":"Nhân trước, trừ sau: 6 × 5 = 30; 30 - 14 = 16."}', 5),
  ('Chọn dấu thích hợp: 6 × 8 ___ 8 × 7', 'mcq', '[">","<","="]', '<', '{"solution":"6 × 8 = 48, 8 × 7 = 56. Vì 48 < 56 nên 6 × 8 < 8 × 7."}', 6),
  ('7 × 9 = 70. Đúng hay sai?', 'mcq', '["Đúng","Sai"]', 'Sai', '{"solution":"Sai, 7 × 9 = 63."}', 7),
  ('Mỗi đĩa có 7 bông hoa. Hỏi 6 đĩa như thế có tất cả bao nhiêu bông hoa? Trả lời: ___ bông hoa.', 'numeric', '[]', '42', '{"solution":"Bài giải\nSố bông hoa có trong 6 đĩa là:\n7 × 6 = 42 (bông hoa)\nĐáp số: 42 bông hoa."}', 8),
  ('Có 42 quả táo, xếp vào các đĩa, mỗi đĩa 7 quả táo. Hỏi xếp được mấy đĩa? Trả lời: ___ đĩa.', 'numeric', '[]', '6', '{"solution":"Bài giải\nXếp được số đĩa là:\n42 : 7 = 6 (đĩa)\nĐáp số: 6 đĩa."}', 9),
  ('Linh có 7 hộp, mỗi hộp 6 con tem. Linh cho bạn 36 con tem. Hỏi Linh còn lại bao nhiêu con tem? Trả lời: ___ con tem.', 'numeric', '[]', '6', '{"solution":"Bài giải\nSố con tem có trong 7 hộp là:\n6 × 7 = 42 (con tem)\nLinh còn lại số con tem là:\n42 - 36 = 6 (con tem)\nĐáp số: 6 con tem."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-3-nhan-chia-6-7'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- Bảng nhân, bảng chia 3 và 4
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Bảng nhân, bảng chia 3 và 4', '02', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_3'), 'active', 2, 15, 'gen_toan-3-bang-nhan-chia-3-4', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-3-bang-nhan-chia-3-4');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('4 × ___ = 16', 'numeric', '[]', '4', '{"solution":"Muốn tìm thừa số chưa biết, lấy tích chia cho thừa số kia: 16 : 4 = 4."}', 1),
  ('4 × 4 = ___', 'numeric', '[]', '16', '{"solution":"Đổi chỗ các thừa số thì tích không đổi: 4 × 4 = 4 × 4 = 16."}', 2),
  ('24 : 3 = ___', 'numeric', '[]', '8', '{"solution":"Vì 3 × 8 = 24 nên 24 : 3 = 8."}', 3),
  ('30 : 3 = ___', 'numeric', '[]', '10', '{"solution":"Vì 3 × 10 = 30 nên 30 : 3 = 10."}', 4),
  ('Số nào nhân với 4 thì được 20?', 'mcq', '["5","4","3","6"]', '5', '{"solution":"Lấy 20 : 4 = 5. Thử lại: 5 × 4 = 20."}', 5),
  ('Số nào nhân với 3 thì được 15?', 'mcq', '["6","3","5","4"]', '5', '{"solution":"Lấy 15 : 3 = 5. Thử lại: 5 × 3 = 15."}', 6),
  ('4 × 5 = 25. Đúng hay sai?', 'mcq', '["Đúng","Sai"]', 'Sai', '{"solution":"Sai, 4 × 5 = 20."}', 7),
  ('Mỗi túi có 4 con tem. Hỏi 2 túi như thế có tất cả bao nhiêu con tem? Trả lời: ___ con tem.', 'numeric', '[]', '8', '{"solution":"Bài giải\nSố con tem có trong 2 túi là:\n4 × 2 = 8 (con tem)\nĐáp số: 8 con tem."}', 8),
  ('Có 8 viên bi chia đều cho 4 bạn. Hỏi mỗi bạn được mấy viên bi? Trả lời: ___ viên bi.', 'numeric', '[]', '2', '{"solution":"Bài giải\nMỗi bạn được số viên bi là:\n8 : 4 = 2 (viên bi)\nĐáp số: 2 viên bi."}', 9),
  ('Mỗi hộp có 4 quả cam. Hỏi 9 hộp như thế có tất cả bao nhiêu quả cam? Trả lời: ___ quả cam.', 'numeric', '[]', '36', '{"solution":"Bài giải\nSố quả cam có trong 9 hộp là:\n4 × 9 = 36 (quả cam)\nĐáp số: 36 quả cam."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-3-bang-nhan-chia-3-4'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- Bảng nhân, bảng chia 8 và 9
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Bảng nhân, bảng chia 8 và 9', '03', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_3'), 'active', 3, 15, 'gen_toan-3-bang-nhan-chia-8-9', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-3-bang-nhan-chia-8-9');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('8 × ___ = 72', 'numeric', '[]', '9', '{"solution":"Muốn tìm thừa số chưa biết, lấy tích chia cho thừa số kia: 72 : 8 = 9."}', 1),
  ('9 × ___ = 81', 'numeric', '[]', '9', '{"solution":"Muốn tìm thừa số chưa biết, lấy tích chia cho thừa số kia: 81 : 9 = 9."}', 2),
  ('7 × 9 = ___', 'numeric', '[]', '63', '{"solution":"Đổi chỗ các thừa số thì tích không đổi: 7 × 9 = 9 × 7 = 63."}', 3),
  ('8 × 1 = ___', 'numeric', '[]', '8', '{"solution":"Theo bảng nhân 8: 8 × 1 = 8."}', 4),
  ('Số nào nhân với 9 thì được 18?', 'mcq', '["2","1","4","3"]', '2', '{"solution":"Lấy 18 : 9 = 2. Thử lại: 2 × 9 = 18."}', 5),
  ('Số nào nhân với 9 thì được 63?', 'mcq', '["8","9","7","5"]', '7', '{"solution":"Lấy 63 : 9 = 7. Thử lại: 7 × 9 = 63."}', 6),
  ('8 × 3 = 21. Đúng hay sai?', 'mcq', '["Đúng","Sai"]', 'Sai', '{"solution":"Sai, 8 × 3 = 24."}', 7),
  ('Có 27 bông hoa chia đều cho 9 bạn. Hỏi mỗi bạn được mấy bông hoa? Trả lời: ___ bông hoa.', 'numeric', '[]', '3', '{"solution":"Bài giải\nMỗi bạn được số bông hoa là:\n27 : 9 = 3 (bông hoa)\nĐáp số: 3 bông hoa."}', 8),
  ('Mỗi túi có 9 chiếc bút chì. Hỏi 10 túi như thế có tất cả bao nhiêu chiếc bút chì? Trả lời: ___ chiếc bút chì.', 'numeric', '[]', '90', '{"solution":"Bài giải\nSố chiếc bút chì có trong 10 túi là:\n9 × 10 = 90 (chiếc bút chì)\nĐáp số: 90 chiếc bút chì."}', 9),
  ('Mỗi rổ có 9 viên bi. Hỏi 10 rổ như thế có tất cả bao nhiêu viên bi? Trả lời: ___ viên bi.', 'numeric', '[]', '90', '{"solution":"Bài giải\nSố viên bi có trong 10 rổ là:\n9 × 10 = 90 (viên bi)\nĐáp số: 90 viên bi."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-3-bang-nhan-chia-8-9'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- Gấp, giảm một số lần; tìm thành phần phép nhân, phép chia
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Gấp, giảm một số lần; tìm thành phần phép nhân, phép chia', '04', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_3'), 'active', 4, 15, 'gen_toan-3-gap-giam', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-3-gap-giam');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('Giảm 77 đi 7 lần được ___', 'numeric', '[]', '11', '{"solution":"Muốn giảm một số đi nhiều lần, ta chia số đó cho số lần: 77 : 7 = 11."}', 1),
  ('Gấp 5 lên 4 lần được số nào?', 'mcq', '["16","19","25","20"]', '20', '{"solution":"Gấp lên 4 lần là nhân với 4: 5 × 4 = 20. (Thêm 4 đơn vị mới là cộng: 5 + 4 = 9.)"}', 2),
  ('Gấp 8 lên 9 lần được ___', 'numeric', '[]', '72', '{"solution":"Muốn gấp một số lên nhiều lần, ta nhân số đó với số lần: 8 × 9 = 72."}', 3),
  ('Gấp 10 lên 3 lần được số nào?', 'mcq', '["27","29","30","13"]', '30', '{"solution":"Gấp lên 3 lần là nhân với 3: 10 × 3 = 30. (Thêm 3 đơn vị mới là cộng: 10 + 3 = 13.)"}', 4),
  ('Hoa có 4 con tem. Số con tem của Minh gấp 6 lần số con tem của Hoa. Hỏi Minh có bao nhiêu con tem? Trả lời: ___ con tem.', 'numeric', '[]', '24', '{"solution":"Bài giải\nSố con tem của Minh là:\n4 × 6 = 24 (con tem)\nĐáp số: 24 con tem."}', 5),
  ('Linh có 6 quyển vở. Số quyển vở của An gấp 6 lần số quyển vở của Linh. Hỏi An có bao nhiêu quyển vở? Trả lời: ___ quyển vở.', 'numeric', '[]', '36', '{"solution":"Bài giải\nSố quyển vở của An là:\n6 × 6 = 36 (quyển vở)\nĐáp số: 36 quyển vở."}', 6),
  ('Hoa có 14 viên bi. Số viên bi của Nam gấp 5 lần số viên bi của Hoa. Hỏi Nam có bao nhiêu viên bi? Trả lời: ___ viên bi.', 'numeric', '[]', '70', '{"solution":"Bài giải\nSố viên bi của Nam là:\n14 × 5 = 70 (viên bi)\nĐáp số: 70 viên bi."}', 7),
  ('___ × 3 = 6', 'numeric', '[]', '2', '{"solution":"Muốn tìm thừa số chưa biết, lấy tích chia cho thừa số kia: 6 : 3 = 2."}', 8),
  ('___ × 8 = 32', 'numeric', '[]', '4', '{"solution":"Muốn tìm thừa số chưa biết, lấy tích chia cho thừa số kia: 32 : 8 = 4."}', 9),
  ('16 : ___ = 8', 'numeric', '[]', '2', '{"solution":"Muốn tìm số chia, lấy số bị chia chia cho thương: 16 : 8 = 2."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-3-gap-giam'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- Nhân, chia với số có một chữ số; biểu thức; một phần mấy
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Nhân, chia với số có một chữ số; biểu thức; một phần mấy', '05', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_3'), 'active', 5, 15, 'gen_toan-3-nhan-chia-mot-chu-so', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-3-nhan-chia-mot-chu-so');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('677 : 5 = 135 (dư ___)', 'numeric', '[]', '2', '{"solution":"135 × 5 = 675; 677 - 675 = 2. Số dư 2 bé hơn số chia 5."}', 1),
  ('307 : 6 = 51 (dư ___)', 'numeric', '[]', '1', '{"solution":"51 × 6 = 306; 307 - 306 = 1. Số dư 1 bé hơn số chia 6."}', 2),
  ('950 : 4 = 237 (dư ___)', 'numeric', '[]', '2', '{"solution":"237 × 4 = 948; 950 - 948 = 2. Số dư 2 bé hơn số chia 4."}', 3),
  ('916 : 4 = ___', 'numeric', '[]', '229', '{"solution":"Chia lần lượt từ trái sang phải. Thử lại: 229 × 4 = 916."}', 4),
  ('396 × 2 = ___', 'numeric', '[]', '792', '{"solution":"Đặt tính rồi nhân từ hàng đơn vị, nhớ sang hàng bên trái: 396 × 2 = 792."}', 5),
  ('Tính giá trị biểu thức: 40 + 2 × 5 = ___', 'numeric', '[]', '50', '{"solution":"Nhân, chia trước; cộng, trừ sau: 2 × 5 = 10; 40 + 10 = 50."}', 6),
  ('Tính giá trị biểu thức: 4 × (11 - 2) = ___', 'numeric', '[]', '36', '{"solution":"Tính trong ngoặc trước: 11 - 2 = 9; rồi 4 × 9 = 36."}', 7),
  ('Tính giá trị biểu thức: 8 × (25 - 20) = ___', 'numeric', '[]', '40', '{"solution":"Tính trong ngoặc trước: 25 - 20 = 5; rồi 8 × 5 = 40."}', 8),
  ('1/7 của 63 l là ___ l.', 'numeric', '[]', '9', '{"solution":"Muốn tìm 1/7 của một số, ta chia số đó cho 7: 63 : 7 = 9 l."}', 9),
  ('1/8 của 56 quả cam là ___ quả cam.', 'numeric', '[]', '7', '{"solution":"Muốn tìm 1/8 của một số, ta chia số đó cho 8: 56 : 8 = 7 quả cam."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-3-nhan-chia-mot-chu-so'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- Các số trong phạm vi 100.000; làm tròn số; chữ số La Mã
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Các số trong phạm vi 100.000; làm tròn số; chữ số La Mã', '06', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_3'), 'active', 6, 15, 'gen_toan-3-so-den-100000', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-3-so-den-100000');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('Số liền sau của số 76.424 là ___', 'short', '[]', '76.425|76425|76 425', '{"solution":"Số liền sau hơn số đã cho 1 đơn vị: 76.424 + 1 = 76.425."}', 1),
  ('Viết số gồm 2 chục nghìn, 8 nghìn, 3 trăm, 6 chục và 7 đơn vị: ___', 'short', '[]', '28.367|28367|28 367', '{"solution":"Viết lần lượt các chữ số từ hàng chục nghìn đến hàng đơn vị: 28367 → 28.367."}', 2),
  ('Giá trị của chữ số 7 trong số 74.238 là ___', 'short', '[]', '70.000|70000|70 000', '{"solution":"Chữ số 7 ở hàng chục nghìn nên có giá trị là 70.000."}', 3),
  ('Chọn dấu thích hợp: 11.226 ___ 11.426', 'mcq', '[">","<","="]', '<', '{"solution":"Hai số cùng có 5 chữ số. So sánh từ hàng chục nghìn sang phải, gặp hàng đầu tiên khác nhau: 11.226 < 11.426."}', 4),
  ('Chọn dấu thích hợp: 34.711 ___ 36.711', 'mcq', '[">","<","="]', '<', '{"solution":"Hai số cùng có 5 chữ số. So sánh từ hàng chục nghìn sang phải, gặp hàng đầu tiên khác nhau: 34.711 < 36.711."}', 5),
  ('Dãy số nào được sắp xếp theo thứ tự từ lớn đến bé?', 'mcq', '["40.953; 40.774; 40.147; 40.366","40.953; 40.774; 40.366; 40.147","40.147; 40.366; 40.774; 40.953","40.774; 40.953; 40.366; 40.147"]', '40.953; 40.774; 40.366; 40.147', '{"solution":"Thứ tự đúng: 40.953 > 40.774 > 40.366 > 40.147."}', 6),
  ('Làm tròn số 785 đến hàng chục thì được số nào?', 'mcq', '["800","770","810","790"]', '790', '{"solution":"Chữ số ngay bên phải hàng chục là 5. Vì 5 ≥ 5 nên làm tròn lên: 785 ≈ 790."}', 7),
  ('Làm tròn số 29.543 đến hàng chục nghìn thì được số nào?', 'mcq', '["10.000","50.000","30.000","40.000"]', '30.000', '{"solution":"Chữ số ngay bên phải hàng chục nghìn là 9. Vì 9 ≥ 5 nên làm tròn lên: 29.543 ≈ 30.000."}', 8),
  ('Số 13 viết bằng chữ số La Mã là:', 'mcq', '["XIII","VIII","XV","XII"]', 'XIII', '{"solution":"I = 1, V = 5, X = 10. Số 13 viết là XIII."}', 9),
  ('Số La Mã IX đọc là số nào?', 'mcq', '["8","11","6","9"]', '9', '{"solution":"I = 1, V = 5, X = 10. Chữ số ghi bên phải chữ số lớn hơn thì cộng thêm, ghi bên trái thì trừ đi: IX = 9."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-3-so-den-100000'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- Cộng, trừ, nhân, chia trong phạm vi 100.000
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Cộng, trừ, nhân, chia trong phạm vi 100.000', '07', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_3'), 'active', 7, 15, 'gen_toan-3-phep-tinh-100000', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-3-phep-tinh-100000');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('12.505 × 4 = ___', 'short', '[]', '50.020|50020|50 020', '{"solution":"Nhân lần lượt từ phải sang trái, nhớ sang hàng bên trái: 12.505 × 4 = 50.020."}', 1),
  ('40.850 + 10.529 = ___', 'short', '[]', '51.379|51379|51 379', '{"solution":"Đặt tính thẳng cột rồi cộng từ phải sang trái, nhớ sang hàng bên trái: 40.850 + 10.529 = 51.379."}', 2),
  ('8.363 × 3 = ___', 'short', '[]', '25.089|25089|25 089', '{"solution":"Nhân lần lượt từ phải sang trái, nhớ sang hàng bên trái: 8.363 × 3 = 25.089."}', 3),
  ('51.223 + 2.345 = ___', 'short', '[]', '53.568|53568|53 568', '{"solution":"Đặt tính thẳng cột rồi cộng từ phải sang trái, nhớ sang hàng bên trái: 51.223 + 2.345 = 53.568."}', 4),
  ('73.437 : 7 = ___', 'short', '[]', '10.491|10491|10 491', '{"solution":"Chia lần lượt từ trái sang phải. Thử lại: 10.491 × 7 = 73.437."}', 5),
  ('47.729 × 2 = ___', 'short', '[]', '95.458|95458|95 458', '{"solution":"Nhân lần lượt từ phải sang trái, nhớ sang hàng bên trái: 47.729 × 2 = 95.458."}', 6),
  ('48.007 : 3 = 16.002 (dư ___)', 'numeric', '[]', '1', '{"solution":"16.002 × 3 = 48.006; 48.007 - 48.006 = 1."}', 7),
  ('76.896 : 7 = 10.985 (dư ___)', 'numeric', '[]', '1', '{"solution":"10.985 × 7 = 76.895; 76.896 - 76.895 = 1."}', 8),
  ('Mai có 50.000 đồng, mua một chiếc mũ giá 35.500 đồng. Hỏi Mai còn lại bao nhiêu tiền? Trả lời: ___ đồng.', 'short', '[]', '14.500|14500|14 500', '{"solution":"Bài giải\nMai còn lại số tiền là:\n50.000 - 35.500 = 14.500 (đồng)\nĐáp số: 14.500 đồng."}', 9),
  ('Lan có 50.000 đồng, mua một chiếc mũ giá 42.500 đồng. Hỏi Lan còn lại bao nhiêu tiền? Trả lời: ___ đồng.', 'short', '[]', '7.500|7500|7 500', '{"solution":"Bài giải\nLan còn lại số tiền là:\n50.000 - 42.500 = 7.500 (đồng)\nĐáp số: 7.500 đồng."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-3-phep-tinh-100000'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- Chu vi, diện tích; mi-li-mét, gam, mi-li-lít; tháng – năm
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Chu vi, diện tích; mi-li-mét, gam, mi-li-lít; tháng – năm', '08', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_3'), 'active', 8, 15, 'gen_toan-3-hinh-do-luong', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-3-hinh-do-luong');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('Hình vuông có cạnh 11 cm. Diện tích hình vuông là ___ cm².', 'numeric', '[]', '121', '{"solution":"Diện tích hình vuông = cạnh × cạnh = 11 × 11 = 121 (cm²)."}', 1),
  ('Hình chữ nhật có chiều dài 13 cm, chiều rộng 9 cm. Diện tích hình chữ nhật là ___ cm².', 'numeric', '[]', '117', '{"solution":"Diện tích hình chữ nhật = chiều dài × chiều rộng = 13 × 9 = 117 (cm²)."}', 2),
  ('Hình vuông có cạnh 4 cm. Chu vi hình vuông là ___ cm.', 'numeric', '[]', '16', '{"solution":"Chu vi hình vuông = cạnh × 4 = 4 × 4 = 16 (cm)."}', 3),
  ('Hình chữ nhật có chiều dài 25 cm, chiều rộng 8 cm. Chu vi hình chữ nhật là ___ cm.', 'numeric', '[]', '66', '{"solution":"Chu vi hình chữ nhật = (chiều dài + chiều rộng) × 2 = (25 + 8) × 2 = 66 (cm)."}', 4),
  ('6 km = ___ m', 'short', '[]', '6.000|6000|6 000', '{"solution":"1 km = 1.000 m, nên 6 km = 6 × 1.000 = 6.000 m."}', 5),
  ('8 m 54 cm = ___ cm', 'numeric', '[]', '854', '{"solution":"1 m = 100 cm, nên 8 m = 800 cm; 800 + 54 = 854 (cm)."}', 6),
  ('7 km 978 m = ___ m', 'short', '[]', '7.978|7978|7 978', '{"solution":"1 km = 1.000 m, nên 7 km = 7.000 m; 7.000 + 978 = 7.978 (m)."}', 7),
  ('8 l = ___ ml', 'short', '[]', '8.000|8000|8 000', '{"solution":"1 l = 1.000 ml, nên 8 l = 8 × 1.000 = 8.000 ml."}', 8),
  ('Tháng 11 có bao nhiêu ngày?', 'mcq', '["28 ngày","30 ngày","31 ngày"]', '30 ngày', '{"solution":"Các tháng có 31 ngày: 1, 3, 5, 7, 8, 10, 12. Các tháng có 30 ngày: 4, 6, 9, 11. Tháng 2 có 28 hoặc 29 ngày. Vậy tháng 11 có 30 ngày."}', 9),
  ('Tháng 8 có bao nhiêu ngày?', 'mcq', '["28 ngày","30 ngày","31 ngày"]', '31 ngày', '{"solution":"Các tháng có 31 ngày: 1, 3, 5, 7, 8, 10, 12. Các tháng có 30 ngày: 4, 6, 9, 11. Tháng 2 có 28 hoặc 29 ngày. Vậy tháng 8 có 31 ngày."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-3-hinh-do-luong'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- ═══════════════ LỚP 4 ═══════════════
INSERT INTO subjects (grade, name, order_index)
SELECT 4, 'Toán', 99
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE grade = 4 AND name = 'Toán');

INSERT INTO chapters (title, subject_id, order_index, source_id)
SELECT 'Luyện tập theo chủ đề', (SELECT id FROM subjects WHERE grade = 4 AND name = 'Toán' ORDER BY id LIMIT 1), 1000, 'gen_toan_lop_4'
WHERE NOT EXISTS (SELECT 1 FROM chapters WHERE source_id = 'gen_toan_lop_4');

-- Số có nhiều chữ số: hàng và lớp, so sánh, làm tròn
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Số có nhiều chữ số: hàng và lớp, so sánh, làm tròn', '01', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_4'), 'active', 1, 15, 'gen_toan-4-so-nhieu-chu-so', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-4-so-nhieu-chu-so');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('Trong số 1.740.986, chữ số 8 thuộc hàng nào?', 'mcq', '["hàng trăm","hàng nghìn","hàng chục","hàng đơn vị"]', 'hàng chục', '{"solution":"Đếm từ phải sang trái: đơn vị, chục, trăm, nghìn, chục nghìn, trăm nghìn, triệu, chục triệu, trăm triệu. Chữ số 8 ở hàng chục."}', 1),
  ('Trong số 4.329.805, chữ số 8 thuộc hàng nào?', 'mcq', '["hàng nghìn","hàng chục nghìn","hàng trăm nghìn","hàng trăm"]', 'hàng trăm', '{"solution":"Đếm từ phải sang trái: đơn vị, chục, trăm, nghìn, chục nghìn, trăm nghìn, triệu, chục triệu, trăm triệu. Chữ số 8 ở hàng trăm."}', 2),
  ('Trong số 876.142.503, chữ số 7 thuộc hàng nào?', 'mcq', '["hàng trăm nghìn","hàng triệu","hàng trăm triệu","hàng chục triệu"]', 'hàng chục triệu', '{"solution":"Đếm từ phải sang trái: đơn vị, chục, trăm, nghìn, chục nghìn, trăm nghìn, triệu, chục triệu, trăm triệu. Chữ số 7 ở hàng chục triệu."}', 3),
  ('Giá trị của chữ số 7 trong số 7.184.932 là ___', 'short', '[]', '7.000.000|7000000|7 000 000', '{"solution":"Chữ số 7 ở hàng triệu nên có giá trị là 7.000.000."}', 4),
  ('Giá trị của chữ số 8 trong số 8.064.517 là ___', 'short', '[]', '8.000.000|8000000|8 000 000', '{"solution":"Chữ số 8 ở hàng triệu nên có giá trị là 8.000.000."}', 5),
  ('Chọn dấu thích hợp: 36.905.530 ___ 33.905.530', 'mcq', '[">","<","="]', '>', '{"solution":"Hai số có cùng 8 chữ số. So sánh từng hàng từ trái sang phải, gặp hàng đầu tiên khác nhau thì số nào có chữ số lớn hơn là số lớn hơn: 36.905.530 > 33.905.530."}', 6),
  ('Chọn dấu thích hợp: 1.757.734 ___ 1.750.734', 'mcq', '[">","<","="]', '>', '{"solution":"Hai số có cùng 7 chữ số. So sánh từng hàng từ trái sang phải, gặp hàng đầu tiên khác nhau thì số nào có chữ số lớn hơn là số lớn hơn: 1.757.734 > 1.750.734."}', 7),
  ('Dãy số nào được sắp xếp theo thứ tự từ bé đến lớn?', 'mcq', '["367.459; 367.754; 367.823; 367.825","367.825; 367.823; 367.754; 367.459","367.459; 367.754; 367.825; 367.823","367.754; 367.459; 367.823; 367.825"]', '367.459; 367.754; 367.823; 367.825', '{"solution":"Các số có chung các chữ số ở hàng cao, nên so sánh từ hàng trăm trở xuống. Thứ tự đúng: 367.459 < 367.754 < 367.823 < 367.825."}', 8),
  ('Làm tròn số 3.973.735 đến hàng chục nghìn thì được số nào?', 'mcq', '["3.974.000","3.970.000","3.960.000","3.980.000"]', '3.970.000', '{"solution":"Xét chữ số ngay bên phải hàng chục nghìn là 3. Vì 3 < 5 nên làm tròn xuống: 3.973.735 ≈ 3.970.000."}', 9),
  ('Làm tròn số 95.789 đến hàng nghìn thì được số nào?', 'mcq', '["94.000","96.000","95.800","97.000"]', '96.000', '{"solution":"Xét chữ số ngay bên phải hàng nghìn là 7. Vì 7 ≥ 5 nên làm tròn lên: 95.789 ≈ 96.000."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-4-so-nhieu-chu-so'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- Cộng, trừ các số có nhiều chữ số
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Cộng, trừ các số có nhiều chữ số', '02', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_4'), 'active', 2, 15, 'gen_toan-4-cong-tru', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-4-cong-tru');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('652.310 - 477.167 = ___', 'short', '[]', '175.143|175143|175 143', '{"solution":"Đặt tính thẳng hàng rồi trừ từ phải sang trái (nhớ sang hàng bên trái nếu có): 652.310 - 477.167 = 175.143."}', 1),
  ('77.622 - 4.892 = ___', 'short', '[]', '72.730|72730|72 730', '{"solution":"Đặt tính thẳng hàng rồi trừ từ phải sang trái (nhớ sang hàng bên trái nếu có): 77.622 - 4.892 = 72.730."}', 2),
  ('359.663 + 4.628 = ___', 'short', '[]', '364.291|364291|364 291', '{"solution":"Đặt tính thẳng hàng rồi cộng từ phải sang trái (nhớ sang hàng bên trái nếu có): 359.663 + 4.628 = 364.291."}', 3),
  ('556.527 + 76.699 = ___', 'short', '[]', '633.226|633226|633 226', '{"solution":"Đặt tính thẳng hàng rồi cộng từ phải sang trái (nhớ sang hàng bên trái nếu có): 556.527 + 76.699 = 633.226."}', 4),
  ('2.554 + ___ = 41.139', 'short', '[]', '38.585|38585|38 585', '{"solution":"Muốn tìm số hạng chưa biết, lấy tổng trừ số hạng đã biết: 41.139 - 2.554 = 38.585."}', 5),
  ('50.150 + ___ = 135.659', 'short', '[]', '85.509|85509|85 509', '{"solution":"Muốn tìm số hạng chưa biết, lấy tổng trừ số hạng đã biết: 135.659 - 50.150 = 85.509."}', 6),
  ('Tính bằng cách thuận tiện: 2.370 + 5.563 + 130 = ___', 'short', '[]', '8.063|8063|8 063', '{"solution":"Đổi chỗ và nhóm hai số có tổng tròn: (2.370 + 130) + 5.563 = 2.500 + 5.563 = 8.063."}', 7),
  ('14.571 + 45.946 = 59.517. Đúng hay sai?', 'mcq', '["Đúng","Sai"]', 'Sai', '{"solution":"Sai, 14.571 + 45.946 = 60.517. Kết quả đã cho lệch 1.000, thường do quên nhớ hoặc nhớ thừa khi cộng."}', 8),
  ('Một cửa hàng tháng thứ nhất bán được 7.120 kg gạo, tháng thứ hai bán được nhiều hơn tháng thứ nhất 490 kg gạo. Hỏi cả hai tháng bán được bao nhiêu kg gạo? Trả lời: ___ kg gạo.', 'short', '[]', '14.730|14730|14 730', '{"solution":"Bài giải\nTháng thứ hai bán được số kg gạo là:\n7.120 + 490 = 7.610 (kg gạo)\nCả hai tháng bán được số kg gạo là:\n7.120 + 7.610 = 14.730 (kg gạo)\nĐáp số: 14.730 kg gạo."}', 9),
  ('Một xưởng may tháng thứ nhất làm được 6.970 sản phẩm, tháng thứ hai làm được nhiều hơn tháng thứ nhất 860 sản phẩm. Hỏi cả hai tháng làm được bao nhiêu sản phẩm? Trả lời: ___ sản phẩm.', 'short', '[]', '14.800|14800|14 800', '{"solution":"Bài giải\nTháng thứ hai làm được số sản phẩm là:\n6.970 + 860 = 7.830 (sản phẩm)\nCả hai tháng làm được số sản phẩm là:\n6.970 + 7.830 = 14.800 (sản phẩm)\nĐáp số: 14.800 sản phẩm."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-4-cong-tru'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- Nhân, chia với số có một, hai chữ số
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Nhân, chia với số có một, hai chữ số', '03', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_4'), 'active', 3, 15, 'gen_toan-4-nhan-chia', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-4-nhan-chia');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('1.563 × 2 = ___', 'short', '[]', '3.126|3126|3 126', '{"solution":"Nhân lần lượt từ phải sang trái, nhớ sang hàng bên trái: 1.563 × 2 = 3.126."}', 1),
  ('84.213 × 6 = ___', 'short', '[]', '505.278|505278|505 278', '{"solution":"Nhân lần lượt từ phải sang trái, nhớ sang hàng bên trái: 84.213 × 6 = 505.278."}', 2),
  ('394 × 41 = ___', 'short', '[]', '16.154|16154|16 154', '{"solution":"394 × 1 = 394 (tích riêng thứ nhất); 394 × 4 = 1.576 (tích riêng thứ hai, viết lùi sang trái một cột). Cộng lại: 394 + 15.760 = 16.154."}', 3),
  ('363.380 : 4 = ___', 'short', '[]', '90.845|90845|90 845', '{"solution":"Chia lần lượt từ trái sang phải. Thử lại: 90.845 × 4 = 363.380, nên 363.380 : 4 = 90.845."}', 4),
  ('76.050 : 2 = ___', 'short', '[]', '38.025|38025|38 025', '{"solution":"Chia lần lượt từ trái sang phải. Thử lại: 38.025 × 2 = 76.050, nên 76.050 : 2 = 38.025."}', 5),
  ('53.358 : 8 = 6.669 (dư ___)', 'numeric', '[]', '6', '{"solution":"6.669 × 8 = 53.352; 53.358 - 53.352 = 6. Số dư 6 bé hơn số chia 8."}', 6),
  ('649 × 1.000 = ___', 'short', '[]', '649.000|649000|649 000', '{"solution":"Nhân với 1.000 chỉ cần viết thêm 3 chữ số 0 vào bên phải: 649 × 1.000 = 649.000."}', 7),
  ('800 × 10 = ___', 'short', '[]', '8.000|8000|8 000', '{"solution":"Nhân với 10 chỉ cần viết thêm 1 chữ số 0 vào bên phải: 800 × 10 = 8.000."}', 8),
  ('Người ta xếp 4.176 quyển vở vào các chồng, mỗi chồng 48 quyển vở. Hỏi xếp được bao nhiêu chồng? Trả lời: ___ chồng.', 'numeric', '[]', '87', '{"solution":"Bài giải\nXếp được số chồng là:\n4.176 : 48 = 87 (chồng)\nĐáp số: 87 chồng."}', 9),
  ('Mỗi két có 46 chai nước. Hỏi 233 két như thế có tất cả bao nhiêu chai nước? Trả lời: ___ chai nước.', 'short', '[]', '10.718|10718|10 718', '{"solution":"Bài giải\nSố chai nước có trong 233 két là:\n46 × 233 = 10.718 (chai nước)\nĐáp số: 10.718 chai nước."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-4-nhan-chia'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- Trung bình cộng; tìm hai số khi biết tổng và hiệu
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Trung bình cộng; tìm hai số khi biết tổng và hiệu', '04', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_4'), 'active', 4, 15, 'gen_toan-4-tbc-tong-hieu', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-4-tbc-tong-hieu');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('Số trung bình cộng của 396; 294; 302 và 28 là ___', 'numeric', '[]', '255', '{"solution":"Tổng các số: 396 + 294 + 302 + 28 = 1.020. Có 4 số nên trung bình cộng là 1.020 : 4 = 255."}', 1),
  ('Số trung bình cộng của 83; 50 và 26 là ___', 'numeric', '[]', '53', '{"solution":"Tổng các số: 83 + 50 + 26 = 159. Có 3 số nên trung bình cộng là 159 : 3 = 53."}', 2),
  ('Số trung bình cộng của 182; 74 và 104 là ___', 'numeric', '[]', '120', '{"solution":"Tổng các số: 182 + 74 + 104 = 360. Có 3 số nên trung bình cộng là 360 : 3 = 120."}', 3),
  ('Số trung bình cộng của 94 và 310 là ___', 'numeric', '[]', '202', '{"solution":"Tổng các số: 94 + 310 = 404. Có 2 số nên trung bình cộng là 404 : 2 = 202."}', 4),
  ('Số trung bình cộng của 36; 246; 211 và 499 là ___', 'numeric', '[]', '248', '{"solution":"Tổng các số: 36 + 246 + 211 + 499 = 992. Có 4 số nên trung bình cộng là 992 : 4 = 248."}', 5),
  ('Tổng số tuổi của mẹ và con là 51 tuổi. Mẹ hơn con 27 tuổi. Hỏi con bao nhiêu tuổi? Trả lời: ___ tuổi.', 'numeric', '[]', '12', '{"solution":"Bài giải\nTuổi con là:\n(51 - 27) : 2 = 12 (tuổi)\nĐáp số: 12 tuổi."}', 6),
  ('Tổng của hai số là 752, hiệu của hai số là 10. Số bé là ___', 'numeric', '[]', '371', '{"solution":"Số bé = (tổng - hiệu) : 2 = (752 - 10) : 2 = 371."}', 7),
  ('Tổng của hai số là 1.574, hiệu của hai số là 96. Số lớn là ___', 'numeric', '[]', '835', '{"solution":"Số lớn = (tổng + hiệu) : 2 = (1.574 + 96) : 2 = 835."}', 8),
  ('Hai lớp 4A và 4B trồng được 267 cây. Lớp 4A trồng được nhiều hơn lớp 4B 159 cây. Hỏi lớp 4B trồng được bao nhiêu cây? Trả lời: ___ cây.', 'numeric', '[]', '54', '{"solution":"Bài giải\nSố cây lớp 4B trồng được là:\n(267 - 159) : 2 = 54 (cây)\nĐáp số: 54 cây."}', 9),
  ('Hai lớp 4A và 4C trồng được 921 cây. Lớp 4A trồng được nhiều hơn lớp 4C 281 cây. Hỏi lớp 4A trồng được bao nhiêu cây? Trả lời: ___ cây.', 'numeric', '[]', '601', '{"solution":"Bài giải\nSố cây lớp 4A trồng được là:\n(921 + 281) : 2 = 601 (cây)\nĐáp số: 601 cây."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-4-tbc-tong-hieu'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- Phân số: rút gọn, so sánh, cộng, trừ, nhân, chia
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Phân số: rút gọn, so sánh, cộng, trừ, nhân, chia', '05', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_4'), 'active', 5, 15, 'gen_toan-4-phan-so', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-4-phan-so');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('Rút gọn phân số 4/6 thành phân số tối giản: 4/6 = ___', 'short', '[]', '2/3|2 / 3', '{"solution":"Chia cả tử số và mẫu số cho 2: 4 : 2 = 2; 6 : 2 = 3. Phân số 2/3 không rút gọn được nữa."}', 1),
  ('Rút gọn phân số 5/10 thành phân số tối giản: 5/10 = ___', 'short', '[]', '1/2|1 / 2', '{"solution":"Chia cả tử số và mẫu số cho 5: 5 : 5 = 1; 10 : 5 = 2. Phân số 1/2 không rút gọn được nữa."}', 2),
  ('Phân số nào bằng phân số 2/3?', 'mcq', '["8/9","12/18","14/18","12/21"]', '12/18', '{"solution":"Nhân cả tử số và mẫu số của 2/3 với 6: 2 × 6 = 12; 3 × 6 = 18. Vậy 2/3 = 12/18."}', 3),
  ('Chọn dấu thích hợp: 8/15 ___ 8/11', 'mcq', '[">","<","="]', '<', '{"solution":"Hai phân số cùng tử số: phân số nào có mẫu số bé hơn thì lớn hơn. Vậy 8/15 < 8/11."}', 4),
  ('Chọn dấu thích hợp: 1/4 ___ 1/2', 'mcq', '[">","<","="]', '<', '{"solution":"Hai phân số cùng tử số: phân số nào có mẫu số bé hơn thì lớn hơn. Vậy 1/4 < 1/2."}', 5),
  ('5/7 + 2/7 = ? (viết kết quả ở dạng tối giản)', 'mcq', '["8/7","3/7","1/2","1"]', '1', '{"solution":"Cộng hai tử số, giữ nguyên mẫu số: 7/7, rút gọn được 1."}', 6),
  ('1/9 + 8/9 = ? (viết kết quả ở dạng tối giản)', 'mcq', '["3/2","1","1/2","10/9"]', '1', '{"solution":"Cộng hai tử số, giữ nguyên mẫu số: 9/9, rút gọn được 1."}', 7),
  ('5/9 - 1/9 = ? (viết kết quả ở dạng tối giản)', 'mcq', '["1/3","1/2","2/5","4/9"]', '4/9', '{"solution":"Trừ hai tử số, giữ nguyên mẫu số: 4/9."}', 8),
  ('1/2 : 1/3 = ? (viết kết quả ở dạng tối giản)', 'mcq', '["1","1/6","3/2","2"]', '3/2', '{"solution":"Chia cho một phân số là nhân với phân số đảo ngược: 1/2 × 3/1 = 3/2."}', 9),
  ('5/6 × 1/4 = ? (viết kết quả ở dạng tối giản)', 'mcq', '["5/6","1/4","5/24","24/5"]', '5/24', '{"solution":"Nhân tử số với tử số, mẫu số với mẫu số: 5 × 1 = 5; 6 × 4 = 24. Được 5/24."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-4-phan-so'
  AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.lesson_id = l.id);

-- Yến, tạ, tấn; mét vuông; giây, thế kỉ
INSERT INTO lessons (title, index_label, chapter_id, status, order_index, duration_minutes, source_id, type)
SELECT 'Yến, tạ, tấn; mét vuông; giây, thế kỉ', '06', (SELECT id FROM chapters WHERE source_id = 'gen_toan_lop_4'), 'active', 6, 15, 'gen_toan-4-don-vi-do', 'lesson'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE source_id = 'gen_toan-4-don-vi-do');

INSERT INTO questions (lesson_id, content, type, options, correct_answer, explanation, order_index)
SELECT l.id, v.content, v.type, v.options::jsonb, v.correct_answer, v.explanation, v.ord
FROM lessons l, (VALUES
  ('29 yến = ___ kg', 'numeric', '[]', '290', '{"solution":"1 yến = 10 kg, nên 29 yến = 29 × 10 = 290 kg."}', 1),
  ('7 tạ 18 kg = ___ kg', 'numeric', '[]', '718', '{"solution":"7 tạ = 700 kg; 700 + 18 = 718 (kg)."}', 2),
  ('4 tạ 57 kg = ___ kg', 'numeric', '[]', '457', '{"solution":"4 tạ = 400 kg; 400 + 57 = 457 (kg)."}', 3),
  ('1 tạ 49 kg = ___ kg', 'numeric', '[]', '149', '{"solution":"1 tạ = 100 kg; 100 + 49 = 149 (kg)."}', 4),
  ('8 cm² 48 mm² = ___ mm²', 'numeric', '[]', '848', '{"solution":"8 cm² = 800 mm²; 800 + 48 = 848 (mm²)."}', 5),
  ('3.200 dm² = ___ m²', 'numeric', '[]', '32', '{"solution":"1 m² = 100 dm², nên 3.200 dm² = 3.200 : 100 = 32 m²."}', 6),
  ('8.600 dm² = ___ m²', 'numeric', '[]', '86', '{"solution":"1 m² = 100 dm², nên 8.600 dm² = 8.600 : 100 = 86 m²."}', 7),
  ('3 thế kỉ = ___ năm', 'numeric', '[]', '300', '{"solution":"1 thế kỉ = 100 năm, nên 3 thế kỉ = 3 × 100 = 300 năm."}', 8),
  ('Năm 1945 (năm nước Việt Nam Dân chủ Cộng hoà ra đời) thuộc thế kỉ nào?', 'mcq', '["XIX","XX","XVIII","XXII"]', 'XX', '{"solution":"Từ năm 1901 đến năm 2000 là thế kỉ XX (thế kỉ thứ 20). Năm 1945 nằm trong khoảng đó."}', 9),
  ('3 phút 39 giây = ___ giây', 'numeric', '[]', '219', '{"solution":"3 phút = 180 giây; 180 + 39 = 219 (giây)."}', 10)
) AS v(content, type, options, correct_answer, explanation, ord)
WHERE l.source_id = 'gen_toan-4-don-vi-do'
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
  ('Lớp 5A có 50 học sinh, trong đó có 33 học sinh nữ. Số học sinh nữ chiếm ___% số học sinh cả lớp.', 'numeric', '[]', '66', '{"solution":"Bài giải\nTỉ số phần trăm của số học sinh nữ và số học sinh cả lớp là:\n33 : 50 = 0,66 = 66%\nĐáp số: 66%."}', 1),
  ('Lớp 5A có 50 học sinh, trong đó có 38 học sinh nữ. Số học sinh nữ chiếm ___% số học sinh cả lớp.', 'numeric', '[]', '76', '{"solution":"Bài giải\nTỉ số phần trăm của số học sinh nữ và số học sinh cả lớp là:\n38 : 50 = 0,76 = 76%\nĐáp số: 76%."}', 2),
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
  ('Nam mua 2 quyển truyện, mỗi quyển giá 22.000 đồng. Nam đưa người bán 50.000 đồng. Người bán trả lại ___ đồng.', 'short', '[]', '6.000|6000|6 000', '{"solution":"Bài giải\nSố tiền mua 2 quyển truyện là:\n22.000 × 2 = 44.000 (đồng)\nNgười bán trả lại số tiền là:\n50.000 - 44.000 = 6.000 (đồng)\nĐáp số: 6.000 đồng."}', 2),
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
