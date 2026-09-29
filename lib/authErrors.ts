import type { AuthError } from "@supabase/supabase-js";

/**
 * Đổi lỗi Supabase Auth sang câu tiếng Việt dễ hiểu.
 *
 * Dựa vào `error.code` (ổn định) chứ không dò `error.message` (tiếng Anh, đổi
 * theo phiên bản). Trước đây mọi lỗi đăng nhập đều thành "Email hoặc mật khẩu
 * không đúng" — kể cả khi chỉ là chưa bấm link xác nhận email, nên người dùng
 * gõ đúng mật khẩu vẫn tưởng mình gõ sai.
 */
export function authErrorMessage(error: AuthError | null | undefined): string {
  if (!error) return "";
  // auth-js gộp CẢ mất mạng (status 0) LẪN 502/503/504 của Supabase vào
  // AuthRetryableFetchError. Tách ra: 5xx gần như luôn là Supabase gửi email
  // xác nhận thất bại/quá giờ (SMTP mặc định), không phải mạng của người dùng.
  if (error.status === 0 || (!error.status && error.name === "AuthRetryableFetchError")) {
    return "Không kết nối được máy chủ. Bạn kiểm tra mạng rồi thử lại nhé.";
  }
  if (error.status && error.status >= 500) {
    return "Máy chủ đăng nhập đang gặp lỗi (thường là gửi email xác nhận không được). Bạn thử lại sau ít phút nhé.";
  }
  switch (error.code) {
    case "invalid_credentials":
      return "Email hoặc mật khẩu không đúng.";
    case "email_not_confirmed":
      return "Email này chưa được xác nhận. Mở hộp thư và bấm link xác nhận trước khi đăng nhập.";
    case "user_already_exists":
    case "email_exists":
      return "Email này đã có tài khoản. Bạn đăng nhập, hoặc bấm “Quên mật khẩu?” nếu không nhớ.";
    case "weak_password":
      return "Mật khẩu quá yếu. Dùng ít nhất 6 ký tự, nên có cả chữ và số.";
    case "email_address_invalid":
      return "Địa chỉ email không hợp lệ.";
    case "over_email_send_rate_limit":
      return "Hệ thống vừa gửi quá nhiều email. Bạn đợi khoảng một tiếng rồi thử lại nhé.";
    case "over_request_rate_limit":
      return "Bạn thao tác hơi nhanh. Đợi một lát rồi thử lại nhé.";
    case "signup_disabled":
    case "email_provider_disabled":
      return "Hiện chưa mở đăng ký tài khoản mới.";
    case "same_password":
      return "Mật khẩu mới phải khác mật khẩu cũ.";
    case "otp_expired":
    case "flow_state_expired":
    case "flow_state_not_found":
      return "Link đã hết hạn hoặc đã được dùng. Bạn yêu cầu link mới nhé.";
    default:
      return "Có lỗi xảy ra, bạn thử lại sau nhé.";
  }
}

/**
 * Mã lỗi kỹ thuật hiện nhỏ dưới câu báo, để người quản trị đối chiếu với
 * Supabase → Logs → Auth. Câu tiếng Việt ở trên cố ý nói chung chung.
 */
export function authErrorDetail(error: AuthError | null | undefined): string {
  if (!error) return "";
  // message có khi là "{}" (phản hồi 5xx không phải JSON) — bỏ đi cho gọn.
  const msg = !error.code && error.message && error.message !== "{}" ? error.message : "";
  return [error.status ? `HTTP ${error.status}` : "", error.code ?? "", msg]
    .filter(Boolean)
    .join(" · ");
}
