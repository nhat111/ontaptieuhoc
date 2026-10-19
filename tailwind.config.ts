import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    // lib/gradeTheme.ts giữ class màu theo lớp — thiếu dòng này Tailwind bỏ mất các màu đó.
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Biến CSS do next/font đặt ở app/layout.tsx (Nunito: nét bo tròn, đủ dấu tiếng Việt).
        sans: ["var(--font-nunito)", "system-ui", "sans-serif"],
      },
      // Design system (xem .claude/ai-context/ui-rules.md): tên theo vai trò, không theo màu.
      colors: {
        /** Xanh chàm thân thiện: nút chính, liên kết, ô đang chọn. */
        primary: colors.indigo,
        /** Vàng rực: sao, điểm thưởng, huy chương. */
        star: colors.amber,
        /** Xanh ngọc: câu đúng, hoàn thành. */
        success: colors.emerald,
        /** Coral dịu mắt — thay cho đỏ gắt (lớp 1, môn Toán lớp 1). */
        coral: {
          50: "#fff5f2",
          100: "#ffe7e0",
          200: "#ffcfc1",
          300: "#ffad97",
          400: "#fb8a6e",
          500: "#f26d50",
          600: "#d9533a",
          700: "#b4412d",
          800: "#913628",
          900: "#772f25",
        },
      },
      boxShadow: {
        /** Bóng mềm cho thẻ nổi (thẻ lớp, thẻ trò chơi, khung làm thử). */
        soft: "0 1px 2px rgba(30, 41, 59, 0.04), 0 8px 24px -12px rgba(30, 41, 59, 0.18)",
        pop: "0 2px 4px rgba(30, 41, 59, 0.06), 0 16px 32px -14px rgba(79, 70, 229, 0.35)",
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
        // Trò lớp 3: bóng bay lên từ đáy khung (top 100%) tới quá mép trên.
        rise: {
          "0%": { top: "100%" },
          "100%": { top: "-30%" },
        },
        // Xe xoay một vòng khi trả lời sai.
        spinout: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        // Số đếm ngược 3-2-1 phóng to rồi thu về.
        zoomin: {
          "0%": { transform: "scale(2.4)", opacity: "0" },
          "40%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.9)", opacity: "0.9" },
        },
        // Bật nhẹ khi chọn đúng (khung "Làm thử một câu").
        boing: {
          "0%": { transform: "scale(1)" },
          "35%": { transform: "scale(1.12)" },
          "65%": { transform: "scale(0.96)" },
          "100%": { transform: "scale(1)" },
        },
        sway: {
          "0%, 100%": { transform: "translateX(-6px) rotate(-3deg)" },
          "50%": { transform: "translateX(6px) rotate(3deg)" },
        },
      },
      animation: {
        shake: "shake 0.4s ease-in-out",
        pop: "pop 0.35s ease-out both",
        float: "float 3s ease-in-out infinite",
        jump: "jump 0.6s ease-out",
        burst: "burst 0.8s ease-out forwards",
        // Thời lượng thật đặt inline (animationDuration) theo từng quả bóng.
        rise: "rise 6s linear forwards",
        spinout: "spinout 0.6s ease-in-out",
        zoomin: "zoomin 0.9s ease-out both",
        sway: "sway 2.4s ease-in-out infinite",
        boing: "boing 0.45s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
