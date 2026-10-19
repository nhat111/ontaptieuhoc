/** Logo của site: quyển sách mở, nét trắng trên nền xanh — dùng chung cho Header, Footer và app/icon.svg. */
export default function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`flex-shrink-0 ${className}`} aria-hidden>
      <rect width="32" height="32" rx="8" fill="#2563EB" />
      <path
        d="M16 10.5c-2.2-1.4-4.8-1.9-7.5-1.5v12.5c2.7-.4 5.3.1 7.5 1.5m0-12.5c2.2-1.4 4.8-1.9 7.5-1.5v12.5c-2.7-.4-5.3.1-7.5 1.5m0-12.5v12.5"
        stroke="white"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
