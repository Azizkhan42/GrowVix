export default function Logo({
  size = 40,
  showText = true,
  className = "",
  textClassName = "",
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/favicon.png"
        alt="GrowVix logo"
        width={size}
        height={size}
        className="shrink-0 rounded-xl object-cover ring-1 ring-slate-900/5"
        style={{ width: size, height: size }}
      />
      {showText && (
        <span
          className={`font-heading font-extrabold tracking-tight text-slate-900 truncate ${textClassName}`}
          style={{ fontSize: Math.max(14, size * 0.55), lineHeight: 1.1 }}
        >
          Grow<span className="gradient-brand-text">Vix</span>
        </span>
      )}
    </div>
  );
}
