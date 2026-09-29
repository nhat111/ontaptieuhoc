/** Biểu tượng quyển sách của site — dùng chung cho Header và Footer. */
export default function LogoMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`flex-shrink-0 ${className}`}>
      <rect width="36" height="36" rx="9" fill="#2563EB"/>
      <path d="M8 25V12C8 11.4 8.4 11 9 11H17V26H9C8.4 26 8 25.6 8 25Z" fill="white" fillOpacity="0.85"/>
      <path d="M28 25V12C28 11.4 27.6 11 27 11H19V26H27C27.6 26 28 25.6 28 25Z" fill="white"/>
      <rect x="17" y="11" width="2" height="15" rx="0.5" fill="#BFDBFE"/>
      <line x1="10" y1="15" x2="15.5" y2="15" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="10" y1="18" x2="15.5" y2="18" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="10" y1="21" x2="13.5" y2="21" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M21 19L23.5 22L27 16" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
