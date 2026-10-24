import type { MetadataRoute } from "next";

// Cho phép "Thêm vào màn hình chính" trên điện thoại: mở như một ứng dụng riêng,
// có biểu tượng sách xanh. Không có service worker — site vẫn cần mạng.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ôn Tập Cùng Con",
    short_name: "Ôn Tập",
    description: "Bài tập, đề kiểm tra, phiếu in và trò chơi học tập lớp 1–9. Miễn phí.",
    lang: "vi",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#2563eb",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
