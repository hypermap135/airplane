export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`max-w-3xl ${align === "center" ? "text-center mx-auto" : ""}`}>
      {eyebrow && (
        <div className="flex items-center gap-3 mb-5" style={align === "center" ? { justifyContent: "center" } : {}}>
          <div style={{ width: 20, height: 1, background: "rgba(58,142,255,0.6)" }} />
          <span className="font-mono text-[0.6rem] tracking-[0.28em] uppercase" style={{ color: "rgba(58,142,255,0.6)" }}>
            {eyebrow}
          </span>
        </div>
      )}

      <h2 className="font-black uppercase leading-[0.9] tracking-tight"
        style={{
          fontSize: "clamp(2rem,4.5vw,3.8rem)",
          letterSpacing: "-0.02em",
          background: "linear-gradient(125deg, #e0e4ea 0%, #ffffff 45%, #b0b8c8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
        {title}
      </h2>

      {subtitle && (
        <p className="mt-4 text-[0.95rem] leading-relaxed" style={{ color: "#565870" }}>
          {subtitle}
        </p>
      )}

      <div className="mt-6" style={{
        height: 1,
        background: align === "center"
          ? "linear-gradient(to right, transparent, rgba(58,142,255,0.5) 50%, transparent)"
          : "linear-gradient(to right, rgba(58,142,255,0.5), rgba(58,142,255,0.12) 60%, transparent)",
      }} />
    </div>
  );
}
