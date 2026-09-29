// Thông tin liên hệ hiện ở trang /gop-y. Để trống mục nào thì mục đó tự ẩn.
// Điền rồi deploy lại là hiện, không cần sửa chỗ khác.

export const CONTACT = {
  /** Số Zalo, vd "0912345678". */
  zalo: "",
  /** Link trang/nhóm Facebook, vd "https://facebook.com/ontaptieuhoc". */
  facebook: "",
  /** Email nhận góp ý. */
  email: "",
};

export const hasContact = Boolean(CONTACT.zalo || CONTACT.facebook || CONTACT.email);
