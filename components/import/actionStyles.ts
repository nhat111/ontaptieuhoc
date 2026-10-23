// Kiểu nút dùng chung cho các trang quản lý nội dung (/import/chapter/[id], …):
// cùng chiều cao, bo góc, cỡ chữ — chỉ khác màu theo vai trò. Trước đây mỗi nút
// tự đặt viền/màu riêng nên đứng cạnh nhau trông lệch nhau.

const BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border-2 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

/** Cỡ cho thanh công cụ đầu danh sách. */
export const ACTION_MD = `${BASE} h-9 px-3.5 text-sm`;
/** Cỡ cho nút trên từng dòng bài. */
export const ACTION_SM = `${BASE} h-8 px-3 text-xs`;

/** Việc chính: tạo, sửa. */
export const ACTION_PRIMARY = "border-primary-600 bg-primary-600 text-white hover:bg-primary-700 hover:border-primary-700";
/** Việc phụ: xem, tạo đề. */
export const ACTION_SECONDARY = "border-slate-200 bg-white text-slate-700 hover:border-primary-200 hover:text-primary-700";
/** Xoá — không khôi phục được. */
export const ACTION_DANGER = "border-coral-200 bg-white text-coral-700 hover:bg-coral-50 hover:border-coral-300";
