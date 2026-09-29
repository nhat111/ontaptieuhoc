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
  // Mất mạng / không tới được Supabase: auth-js báo status 0.
  if (error.status === 0 || error.name === "AuthRetryableFetchError") {
    return "Không kết nối được máy chủ. Bạn kiểm tra mạng rồi thử lại nhé.";
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
