# Toán theo từng bài sách Kết nối tri thức

Hướng đã thống nhất (10/2026): thay vì đuổi theo số lượng đề của các trang giải bài, mỗi
bài trong sách Toán **Kết nối tri thức với cuộc sống** (bộ sách dùng thống nhất toàn quốc
từ năm học 2026–2027, QĐ 3588/QĐ-BGDĐT) có một trang luyện tập **do máy tự sinh câu**:
làm trên máy chấm ngay, mỗi lần một bộ câu mới, in được phiếu. Không chép đề, lời giải
của trang khác. Làm lớp 3 trước làm mẫu, rồi lớp 1, 2, 4, 5.

THCS (6–9) không nằm trong kế hoạch này: Tạo đề nhanh THCS lấy câu từ đề thầy cô nhập
(xem `quick-exam.md`); Toán THCS tự sinh để sau khi xong tiểu học.

## Toán 3 — đối chiếu 81 bài với generator hiện có

Mục lục: Toán 3 Kết nối tri thức, 16 chủ đề, 81 bài (đối chiếu qua trang lý thuyết Toán 3
của VietJack, 10/2026). Generator: `lib/mathGen/lop3.ts` (`LOP3`), dùng lại được cả
`LOP2` và các dạng có hình trong `lib/exam5/toan1to4.ts` (xem giờ, tiền, góc, hình tròn,
đếm hình, nhận dạng hình).

Ký hiệu: **có** = generator đã có, chỉ cần gắn vào bài (có thể kèm lọc theo phạm vi số);
**một phần** = có generator gần đúng, cần sửa phạm vi hoặc thêm dạng câu; **thiếu** = phải
viết mới; **in** = bài thực hành (vẽ, đo thật) — chỉ làm phiếu in, không chấm trên máy;
**trộn** = luyện tập chung / ôn tập: trộn câu của các bài trong chủ đề.

### Tập một

| Bài | Tên bài | Trạng thái | Ghi chú |
|---|---|---|---|
| 1 | Ôn tập các số đến 1000 | có | `LOP2` số đến 1000 |
| 2 | Ôn tập phép cộng, phép trừ trong phạm vi 1000 | có | `LOP2.congTru1000` |
| 3 | Tìm thành phần trong phép cộng, phép trừ | có | `LOP2.thanhPhanPhepTinh` |
| 4 | Ôn tập bảng nhân 2; 5, bảng chia 2; 5 | có | `LOP2.bangNhanChia` |
| 5 | Bảng nhân 3, bảng chia 3 | có | `bangNhanChia34` lọc bảng 3 |
| 6 | Bảng nhân 4, bảng chia 4 | có | `bangNhanChia34` lọc bảng 4 |
| 7 | Ôn tập hình học và đo lường | một phần | đường gấp khúc, xem giờ, đơn vị lớp 2 có; thiếu điểm – đoạn thẳng |
| 8 | Luyện tập chung | trộn | |
| 9 | Bảng nhân 6, bảng chia 6 | có | `bangNhanChia67` lọc bảng 6 |
| 10 | Bảng nhân 7, bảng chia 7 | có | lọc bảng 7 |
| 11 | Bảng nhân 8, bảng chia 8 | có | `bangNhanChia89` lọc bảng 8 |
| 12 | Bảng nhân 9, bảng chia 9 | có | lọc bảng 9 |
| 13 | Tìm thành phần trong phép nhân, phép chia | có | `timThanhPhanNhanChia` |
| 14 | Một phần mấy | có | `motPhanMay` |
| 15 | Luyện tập chung | trộn | |
| 16 | Điểm ở giữa, trung điểm của đoạn thẳng | thiếu | cần hình vẽ đoạn thẳng có chia vạch |
| 17 | Hình tròn. Tâm, bán kính, đường kính | một phần | `hinhTron3` (đề in) — thêm câu bán kính ↔ đường kính |
| 18 | Góc, góc vuông, góc không vuông | một phần | `gocHinh` đang theo lớp 4 (nhọn/tù) — cần bản vuông / không vuông |
| 19 | Hình tam giác, hình tứ giác. Hình chữ nhật, hình vuông | một phần | đếm, nhận dạng hình có; thiếu đếm cạnh, đỉnh, góc |
| 20 | Thực hành vẽ góc vuông, đường tròn, hình vuông, hình chữ nhật | in | |
| 21 | Khối lập phương, khối hộp hình chữ nhật | thiếu | hình hộp SVG lớp 5 dùng lại được; câu đếm mặt, đỉnh, cạnh |
| 22 | Luyện tập chung | trộn | |
| 23 | Nhân số có hai chữ số với số có một chữ số | có | `nhanChiaMotChuSo` lọc thừa số < 100 |
| 24 | Gấp một số lên một số lần | có | `gapGiam` lọc "gấp" |
| 25 | Phép chia hết, phép chia có dư | một phần | có câu tìm số dư; thêm câu "chia hết hay có dư", số dư lớn nhất |
| 26 | Chia số có hai chữ số cho số có một chữ số | có | lọc số bị chia < 100 |
| 27 | Giảm một số đi một số lần | có | `gapGiam` lọc "giảm" |
| 28 | Bài toán giải bằng hai bước tính | một phần | `loiVanHaiBuoc67` chỉ dùng bảng 6, 7 — mở rộng phép tính |
| 29 | Luyện tập chung | trộn | |
| 30 | Mi-li-mét | có | `doiDonVi3` lọc mm |
| 31 | Gam | có | lọc g |
| 32 | Mi-li-lít | có | lọc ml |
| 33 | Nhiệt độ. Đơn vị đo nhiệt độ | thiếu | đọc nhiệt kế (hình), so sánh nhiệt độ |
| 34 | Thực hành và trải nghiệm với mm, g, ml, độ C | in | |
| 35 | Luyện tập chung | trộn | |
| 36 | Nhân số có ba chữ số với số có một chữ số | có | `nhanChiaMotChuSo` lọc thừa số ≥ 100 |
| 37 | Chia số có ba chữ số cho số có một chữ số | có | lọc số bị chia ≥ 100 |
| 38 | Biểu thức số. Tính giá trị của biểu thức số | có | `bieuThuc3` |
| 39 | So sánh số lớn gấp mấy lần số bé | thiếu | dạng tính + bài toán lời văn, dễ viết |
| 40 | Luyện tập chung | trộn | |
| 41–44 | Ôn tập học kì 1 (4 bài) | trộn | |

### Tập hai

| Bài | Tên bài | Trạng thái | Ghi chú |
|---|---|---|---|
| 45 | Các số có bốn chữ số. Số 10 000 | một phần | `cauTaoSo` đang cho số 5 chữ số — thêm phạm vi 10 000 |
| 46 | So sánh các số trong phạm vi 10 000 | một phần | `soSanh100000` — thêm phạm vi 10 000 |
| 47 | Làm quen với chữ số La Mã | có | `soLaMa` |
| 48 | Làm tròn số đến hàng chục, hàng trăm | có | `lamTron3` lọc hàng chục, trăm |
| 49 | Luyện tập chung | trộn | |
| 50 | Chu vi hình tam giác, hình tứ giác, hình chữ nhật, hình vuông | một phần | HCN, HV có; thêm tam giác, tứ giác |
| 51 | Diện tích của một hình. Xăng-ti-mét vuông | một phần | thêm câu đếm ô vuông 1 cm² (hình chia ô có sẵn) |
| 52 | Diện tích hình chữ nhật, diện tích hình vuông | có | `chuViDienTich` lọc diện tích |
| 53 | Luyện tập chung | trộn | |
| 54 | Phép cộng trong phạm vi 10 000 | một phần | `phepTinh100000` — thêm phạm vi 10 000 |
| 55 | Phép trừ trong phạm vi 10 000 | một phần | như trên |
| 56 | Nhân số có bốn chữ số với số có một chữ số | một phần | như trên |
| 57 | Chia số có bốn chữ số cho số có một chữ số | một phần | như trên |
| 58 | Luyện tập chung | trộn | |
| 59 | Các số có năm chữ số. Số 100 000 | có | `cauTaoSo`, `giaTriChuSo3` |
| 60 | So sánh các số trong phạm vi 100 000 | có | `soSanh100000`, `sapXep100000` |
| 61 | Làm tròn số đến hàng nghìn, hàng chục nghìn | có | `lamTron3` lọc nghìn, chục nghìn |
| 62 | Luyện tập chung | trộn | |
| 63 | Phép cộng trong phạm vi 100 000 | có | `phepTinh100000` lọc cộng |
| 64 | Phép trừ trong phạm vi 100 000 | có | lọc trừ |
| 65 | Luyện tập chung | trộn | |
| 66 | Xem đồng hồ. Tháng – năm | có | `xemGio` (đề in, có hình), `thangNam` |
| 67 | Thực hành xem đồng hồ, xem lịch | một phần | thiếu câu xem tờ lịch tháng |
| 68 | Tiền Việt Nam | có | `tienVN3`, `tienHinh` |
| 69 | Luyện tập chung | trộn | |
| 70 | Nhân số có năm chữ số với số có một chữ số | có | lọc nhân |
| 71 | Chia số có năm chữ số cho số có một chữ số | có | lọc chia, chia có dư |
| 72 | Luyện tập chung | trộn | |
| 73 | Thu thập, phân loại, ghi chép số liệu. Bảng số liệu | thiếu | đọc bảng số liệu (bảng HTML, không cần hình) |
| 74 | Khả năng xảy ra của một sự kiện | thiếu | chắc chắn / có thể / không thể — câu viết tay |
| 75 | Thực hành thu thập, phân loại số liệu, đọc bảng số liệu | in | |
| 76–81 | Ôn tập cuối năm (6 bài) | trộn | bài 80 cần bài 73, 74 |

### Tổng kết lớp 3

58 bài học mới (không tính 23 bài luyện tập chung, ôn tập):

- **34 bài có ngay** — chỉ cần gắn generator vào bài, nhiều bài cần lọc theo phạm vi số.
- **15 bài một phần** — sửa phạm vi số (chủ đề 8, 10 sang phạm vi 10 000) hoặc thêm vài dạng câu.
- **7 bài thiếu** — trung điểm (16), khối hộp (21), nhiệt độ (33), so sánh số lớn gấp mấy lần (39), bảng số liệu (73), khả năng xảy ra (74), và phần còn lại của bài 75.
- **2 bài thực hành** chỉ làm phiếu in (20, 34).

23 bài luyện tập chung, ôn tập trộn câu của các bài trước, không cần viết gì thêm.

## Cấu trúc dữ liệu (chuẩn hoá 10/2026)

- Một cuốn sách = một `SgkBook` trong `lib/sgk/books/<môn><lớp>.ts`, khai báo trong `SGK_BOOKS`. Tên chủ đề, tên bài chép đúng sách; `source` ghi nơi đã đối chiếu mục lục.
- Dạng câu dùng lại từ `lib/mathGen/lop<N>.ts` (lọc bằng `only` + `has` / `tagged`) hoặc từ dạng có hình của đề in (`lib/exam5/toan1to4.ts`). Dạng viết riêng theo sách nằm ở `lib/mathGen/kntt/lop<N>.ts` (`KNTT<N>`), không thêm vào `LOP<N>` cũ.
- Hình vẽ mới ở `lib/exam5/figures.ts`, mang `data-…` để kiểm tra đọc ngược.
- `scripts/sgk-toan-check.ts`: kiểm tra mọi sách, mỗi `KNTT<N>` có một hàm `recheck<N>` tính lại đáp án.

## Toán 1 (10/2026)

Mục lục 10 chủ đề, 41 bài, đối chiếu với kế hoạch dạy học Toán 1 Kết nối tri thức (HoaTieu.vn). **39/41 bài làm được trên máy**; bài 8 (thực hành lắp ghép, xếp hình) và bài 27 (thực hành ước lượng, đo độ dài) là bài thực hành. Dạng mới `KNTT1`: nhiều hơn – ít hơn – bằng nhau (bài 3), đồ vật có dạng hình gì (7), vị trí trong không gian (15), dài hơn – ngắn hơn có hình băng giấy (25), cộng trừ không nhớ tách theo từng bài 29–32. Còn lại dùng `LOP1`, dạng có hình của đề in và `KNTT3` (khối hộp, tờ lịch).

## Toán 2 (10/2026)

Mục lục 14 chủ đề, 75 bài (tập một: chủ đề 1–7, bài 1–36; tập hai: chủ đề 8–14), đối chiếu với kế hoạch dạy học Toán 2 Kết nối tri thức (HoaTieu.vn). **71/75 bài làm được trên máy**; bài 17 (trải nghiệm ki-lô-gam, lít), 27 (gấp, cắt, ghép hình, vẽ đoạn thẳng), 57 (đo độ dài) và 67 (thu thập số liệu) là bài thực hành. Dạng mới `KNTT2` (`lib/mathGen/kntt/lop2.ts`), mỗi dạng một bài trở lên:

- tia số có hình (bài 2), tên gọi thành phần phép cộng, trừ (3), hơn kém nhau bao nhiêu (4);
- thêm, bớt và nhiều hơn, ít hơn qua 10 (9, 13); ki-lô-gam (15), lít (16);
- cộng, trừ có nhớ tách theo từng bài 19, 20, 22, 23;
- điểm, đoạn thẳng, ba điểm thẳng hàng có hình (25);
- ngày – giờ, giờ – phút (29); ngày – tháng (30);
- phép nhân là tổng các số hạng bằng nhau (37), thừa số – tích (38), phép chia (41), số bị chia – số chia – thương (42), bảng chia 2, 5 (43, 44);
- khối trụ, khối cầu (46);
- đơn vị, chục, trăm, nghìn (48), số tròn trăm, tròn chục (49, 50), đọc – viết số có ba chữ số (51), viết số thành tổng (52);
- chọn đơn vị đo độ dài, so sánh số đo khác đơn vị (55);
- cộng, trừ trong phạm vi 1000 không nhớ / có nhớ đúng một lần (59–62);
- kiểm đếm (64), biểu đồ tranh (65).

Còn lại dùng `LOP1`, `LOP2`, `KNTT1` (cộng trừ không nhớ, bài 5), `KNTT3` (tờ lịch, khối hộp, khả năng xảy ra) và các dạng có hình của đề in: đồng hồ, đường gấp khúc, đếm tứ giác, tiền, nhóm đồ vật.

## Toán 4 (10/2026)

Mục lục 13 chủ đề, 73 bài (tập một: chủ đề 1–7, bài 1–37; tập hai: chủ đề 8–13), đối chiếu với kế hoạch dạy học Toán 4 Kết nối tri thức (HoaTieu.vn). **69/73 bài làm được trên máy**; bài 20 (sử dụng đơn vị đo đại lượng), 28 (vẽ hai đường thẳng vuông góc), 30 (vẽ hai đường thẳng song song) và 45 (ước lượng trong tính toán) là bài thực hành. Phần lớn bài dùng `LOP4`, `LOP3` và các dạng có hình của đề in (góc, nhận dạng hình bình hành – hình thoi, biểu đồ cột, phân số tô màu). Dạng mới `KNTT4` (`lib/mathGen/kntt/lop4.ts`):

- số chẵn, số lẻ (bài 3), biểu thức chứa chữ (4), bài toán ba bước tính (5);
- đo góc trên hình thước đo góc có hai vòng số, nhiễu là số đọc nhầm vòng (7), loại góc theo số đo (8);
- đọc, viết số sáu chữ số và số đến lớp triệu (10, 12; không ra số có nhóm nghìn bằng 0 ở giữa vì cách đọc chưa thống nhất), dãy số tự nhiên (15);
- tính chất giao hoán, kết hợp của phép cộng, phép nhân, tính chất phân phối (24, 40, 42);
- hai đường thẳng vuông góc, song song trên hình chữ nhật, hình vuông có tên đỉnh (27, 29), hình bình hành, hình thoi (31);
- rút về đơn vị (47), dãy số liệu (49), số lần xuất hiện của một sự kiện (51);
- đọc, viết phân số, tử số – mẫu số (53), phân số và phép chia (54), tính chất cơ bản (55), quy đồng mẫu số (57), tìm phân số của một số (65).

Câu "góc gì" và "hình nào là hình bình hành" của đề in có chữ giống nhau ở mọi câu (chỉ hình khác) nên mỗi bài chỉ lấy một câu, tránh trùng khi khử câu lặp.

## Toán 5 (10/2026)

Mục lục 12 chủ đề, 75 bài (tập một: chủ đề 1–6, bài 1–35; tập hai: chủ đề 7–12), đối chiếu với kế hoạch dạy học Toán 5 Kết nối tri thức (HoaTieu.vn; bài 49 "Hình khai triển…" thuộc chủ đề 9). **68/75 bài làm được trên máy**; 7 bài thực hành: 17 (đơn vị đo đại lượng), 28 (đo, vẽ, lắp ghép), 42–43 (máy tính cầm tay), 54 (ước lượng thể tích), 61 (ước lượng chuyển động), 66 (thu thập số liệu). Phần lớn bài dùng `LOP5`, `LOP4` (ôn số tự nhiên, phân số) và các dạng có hình của đề in lớp 5 (`lib/exam5/toan5.ts`: tam giác, hình thang, hình tròn, hình hộp, biểu đồ quạt, tổng – tỉ, hiệu – tỉ, phần trăm), lọc theo bài bằng `only` + `has`/`tagged` (cộng trừ phân số khác mẫu, đổi đơn vị ra số thập phân, nhân chia với 10; 0,1…, Sxq / Stp / V của hình hộp, hình lập phương, vận tốc / quãng đường – thời gian). Dạng mới `KNTT5` (`lib/mathGen/kntt/lop5.ts`): nhận biết phân số thập phân (4), viết số thập phân từ các hàng (10), làm tròn số thập phân (13), km² – ha (15), tỉ số (36), tỉ lệ bản đồ (37), giá trị phần trăm trong bài toán (41), thể tích đếm bằng hình lập phương 1 cm³ (45), đơn vị thể tích và lít (46, 47), hình khai triển (49), chia số đo thời gian (58), sắp xếp số liệu (63), tỉ số số lần lặp lại (65).

## Tiến độ

- **10/2026 — đã làm (lớp 3):** trang `/lop/3/toan` và `/lop/3/toan/bai-<n>`, dữ liệu `lib/sgk/toan3.ts`. **63/81 bài làm được trên máy**: 34 bài "có", thêm 8 bài nhờ dạng mới (25 chia hết – có dư, 39 số lớn gấp mấy lần số bé, 45–46 các số đến 10 000, 54–57 phép tính trong phạm vi 10 000; 23, 26 có dạng riêng thay vì lọc), và các bài luyện tập / ôn tập trộn được.
- **Đợt 2 (lớp 3):** thêm 13 dạng câu trong `lib/mathGen/lop3kntt.ts` (`LOP3K`) và hình vẽ mới trong `lib/exam5/figures.ts` (điểm trên đường thẳng, hình tròn có bán kính – đường kính – dây, nhiệt kế, tờ lịch, hình có số đo cạnh, hình ghép ô vuông, bảng số liệu) cho các bài 7, 16, 17, 18, 19, 21, 28, 33, 50, 51, 67, 73, 74; bài 22, 80 trộn được. **Toán 3: 78/81 bài làm được trên máy**; 3 bài còn lại (20, 34, 75) là bài thực hành vẽ, đo, làm trên giấy. Hình mang thuộc tính `data-…` để `scripts/sgk-toan-check.ts` đọc ngược mà tính lại đáp án.
- URL đã chốt: `/lop/3/toan/bai-15`; có lưu tiến độ trên máy.

## Kế hoạch làm

1. **Dữ liệu sách:** `lib/sgk/toan3.ts` — danh sách 81 bài (chủ đề, số bài, tên bài, tập), mỗi bài trỏ tới các dạng câu (`mix`) hoặc tới các bài cần trộn.
2. **Trang:** `/lop/3/toan/bai-<n>` — tên bài, bài luyện 10 câu sinh theo seed (dùng lại `QuizClient` như Tạo đề nhanh, không cần DB), nút "Làm bộ khác", "In phiếu"; trang mục lục `/lop/3/toan` theo chủ đề. Tab Toán của `/lop/3` có lối vào.
3. **Generator:** gắn 34 bài có ngay trước, rồi 15 bài một phần, rồi 7 bài thiếu. Mỗi dạng mới được kiểm tra trong `scripts/gen-math-check.ts` như các dạng cũ.
4. **Kiểm tra:** `scripts/sgk-toan-check.ts` — đủ 81 bài, số bài liên tục, bài nào cũng sinh được 10 câu chấm đúng, bài trộn chỉ trỏ tới bài đứng trước.
5. Làm xong lớp 3 thì lặp lại cho lớp 1, 2, 4, 5. **Đã xong lớp 1–5. THCS làm sau.**

Câu hỏi cần chủ site chốt: URL `/lop/3/toan/bai-15` hay `/toan-3/bai-15`; trang bài có lưu
tiến độ vào `localStorage` như bài trong DB không.
