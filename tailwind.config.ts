import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Biến CSS do next/font đặt ở app/layout.tsx.
        sans: ["var(--font-be-vietnam)", "system-ui", "sans-serif"],
      },
      // Lắc nhẹ khi bé chọn sai (components/games/GameShell.tsx).
      // Hiệu ứng "2.5D" của trò chơi lớp 1 — chỉ CSS, không thư viện.
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-8px)" },
          "40%, 80%": { transform: "translateX(8px)" },
        },
        pop: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "70%": { transform: "scale(1.06)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        jump: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "30%": { transform: "translateY(-26px) scale(1.1, 0.95)" },
          "60%": { transform: "translateY(0) scale(0.95, 1.05)" },
        },
        // Hạt pháo giấy bay ra theo hướng --dx/--dy đặt inline.
        burst: {
          "0%": { transform: "translate(0, 0) scale(1)", opacity: "1" },
          "100%": { transform: "translate(var(--dx), var(--dy)) scale(0.4)", opacity: "0" },
        },
      },
      animation: {
        shake: "shake 0.4s ease-in-out",
        pop: "pop 0.35s ease-out both",
        float: "float 3s ease-in-out infinite",
        jump: "jump 0.6s ease-out",
        burst: "burst 0.8s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
