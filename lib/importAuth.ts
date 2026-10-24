// Khoá khu vực soạn nội dung bằng một mật khẩu chung.
//
// Vì sao cần: `/import/edit/[id]` mở cho khách, mà `POST /api/update-lesson`
// XOÁ SẠCH câu hỏi rồi chèn lại. Ai đoán được mã đề là xoá trắng được nội dung,
// và không có bản sao lưu nào. Chưa ai biết site thì không sao; có người vào là
// thành rủi ro thật.
//
// Cố ý KHÔNG làm hệ thống tài khoản: đây là site một người quản trị, một mật
// khẩu chung đủ chặn gần hết rủi ro mà không đẻ thêm bảng, thêm màn hình.
//
// **Chưa đặt `IMPORT_PASSWORD` thì mọi thứ mở như cũ** — để môi trường dev và
// bản đang chạy không gãy khi cập nhật.

const COOKIE = "ontap_import";
/** Trộn vào mật khẩu trước khi băm, để giá trị cookie không phải là hash trần. */
const SALT = "ontap-import-v1";

export const IMPORT_COOKIE = COOKIE;

export function isImportProtected(): boolean {
  return !!process.env.IMPORT_PASSWORD;
}

/**
 * Giá trị hợp lệ của cookie, suy ra từ mật khẩu.
 *
 * Băm thay vì lưu thẳng mật khẩu: cookie bị lộ thì cũng không đọc ra được mật
 * khẩu để dùng nơi khác. Suy ra được (không lưu ở đâu) nên không cần bảng
 * session — đúng tinh thần "một người quản trị".
 *
 * Dùng Web Crypto chứ không phải `node:crypto` vì hàm này chạy cả trong
 * `proxy.ts`, nơi không chắc có API của Node.
 */
export async function expectedToken(): Promise<string | null> {
  const pass = process.env.IMPORT_PASSWORD;
  if (!pass) return null;
  const data = new TextEncoder().encode(`${SALT}:${pass}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** So sánh không phụ thuộc thời gian, để không rò rỉ độ dài khớp qua thời gian đáp. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Cookie này có quyền vào khu soạn nội dung không. */
export async function hasImportAccess(cookieValue: string | undefined): Promise<boolean> {
  if (!isImportProtected()) return true; // chưa đặt mật khẩu → mở
  if (!cookieValue) return false;
  const expected = await expectedToken();
  return !!expected && safeEqual(cookieValue, expected);
}

export async function checkPassword(input: unknown): Promise<boolean> {
  const pass = process.env.IMPORT_PASSWORD;
  if (!pass) return false;
  return typeof input === "string" && safeEqual(input, pass);
}

// Chặn từng route ghi: xem lib/editorAuth.ts (require…), nơi gộp mật khẩu chung
// này với tài khoản người soạn được mời.
