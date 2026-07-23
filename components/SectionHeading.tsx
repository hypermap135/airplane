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
        <div className="text-xs font-semibold uppercase tracking-widest text-brand mb-2">
          {eyebrow}
        </div>
      )}
      <h2 className="h-display" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)" }}>
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-ink-500 leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
