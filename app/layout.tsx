import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SITE_URL } from "@/lib/siteUrl";

const SITE_NAME = "Ôn Tập Tiểu Học";
const SITE_DESCRIPTION =
  "Nền tảng ôn tập miễn phí cho học sinh Tiểu học Việt Nam — bài tập và đề kiểm tra lớp 1 đến lớp 5, bám sát sách giáo khoa, làm bài và chấm điểm ngay trên web.";

export const metadata: Metadata = {
  // Makes the relative Open Graph / canonical URLs below resolve to absolute ones.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Bài tập & đề kiểm tra lớp 1-5`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "ôn tập tiểu học",
    "bài tập lớp 1",
    "bài tập lớp 2",
    "bài tập lớp 3",
    "bài tập lớp 4",
    "bài tập lớp 5",
    "đề kiểm tra tiểu học",
    "trắc nghiệm online",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "vi_VN",
    url: "/",
    title: `${SITE_NAME} — Bài tập & đề kiểm tra lớp 1-5`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Bài tập & đề kiểm tra lớp 1-5`,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
