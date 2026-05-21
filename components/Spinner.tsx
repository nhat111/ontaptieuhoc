interface Props {
  label?: string;
  className?: string;
}

export default function Spinner({ label, className }: Props) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 text-gray-400 ${className ?? ""}`}>
      <svg className="animate-spin w-7 h-7" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
        <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      {label && <span className="text-xs font-medium">{label}</span>}
    </div>
  );
}
