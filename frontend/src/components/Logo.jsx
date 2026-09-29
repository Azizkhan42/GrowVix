export default function Logo({ size = 48, textClassName = "", className = "", showText = true }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/favicon.png"
        alt="GrowVix logo"
        width={size}
        height={size}
        className="rounded-xl object-cover shrink-0 shadow-[0_0_20px_rgba(170,59,255,0.35)]"
        style={{ width: size, height: size }}
      />
      {showText && (
        <span
          className={`font-heading font-extrabold text-white truncate ${textClassName}`}
          style={{ fontSize: size * 0.62, lineHeight: 1 }}
        >
          Grow<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Vix</span>
        </span>
      )}
    </div>
  );
}
