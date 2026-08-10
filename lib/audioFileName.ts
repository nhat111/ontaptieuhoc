// Đoán câu hỏi từ tên file audio người dùng tải lên.
//
// Ghép sai là lỗi IM LẶNG tệ nhất trong tính năng này: bé nghe câu 3 trong khi
// màn hình hiện câu 5, và không ai nhận ra. Nên chỗ này ưu tiên đoán đúng, và
// khi không chắc thì thà trả về null để giao diện hỏi lại còn hơn đoán bừa.

/**
 * Lấy số thứ tự câu từ tên file. Trả về chỉ số bắt đầu từ 0, hoặc null nếu
 * không tìm thấy số nào.
 *
 * Hai quyết định đáng chú ý:
 *
 * 1. **Bỏ phần đuôi file trước khi tìm số.** Đuôi `.m4a` và `.mp3` có sẵn chữ
 *    số bên trong; không bỏ thì "cau-01.m4a" có thể bị đọc thành câu 4.
 *
 * 2. **Lấy số CUỐI CÙNG, không phải số đầu.** Tên file thật hay có tiền tố
 *    không liên quan — "2024-06-01_cau3", "bai2_cau5", "v2_wav_7". Số cuối gần
 *    như luôn là số câu, còn số đầu thường là ngày tháng hay số bài.
 */
export function questionIndexFromFileName(name: string): number | null {
  const base = name.replace(/\.[a-z0-9]+$/i, "");
  const numbers = base.match(/\d+/g);
  if (!numbers?.length) return null;

  const n = Number(numbers[numbers.length - 1]);
  if (!Number.isInteger(n) || n < 1) return null;
  return n - 1;
}
