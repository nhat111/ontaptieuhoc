import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Dạng bài đổi tên theo sách Kết nối tri thức ("cảm xúc về một câu chuyện").
      { source: "/lam-van/lop-5/cam-xuc-nhan-vat", destination: "/lam-van/lop-5/cam-xuc-cau-chuyen", permanent: true },
    ];
  },
};

export default nextConfig;
