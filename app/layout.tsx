import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ôn Tập Tiểu Học",
  description: "Nền tảng ôn tập miễn phí cho học sinh Tiểu học Việt Nam",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
