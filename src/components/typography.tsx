/** Small typography helpers shared by editorial pages. */
export function Heading({
  id,
  level = 2,
  children,
}: {
  id?: string;
  level?: 2 | 3;
  children: React.ReactNode;
}) {
  const className =
    level === 2
      ? "text-title mt-1 text-xl font-semibold text-foreground"
      : "text-base font-semibold text-foreground";
  if (level === 2) {
    return (
      <h2 id={id} className={`scroll-mt-20 ${className}`}>
        {children}
      </h2>
    );
  }
  return (
    <h3 id={id} className={`scroll-mt-20 ${className}`}>
      {children}
    </h3>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-muted-foreground [&_a]:text-brand [&_a:underline-offset-2] [&_code]:rounded [&_code]:bg-secondary/50 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px] [&_code]:text-foreground [&_li]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5">
      {children}
    </div>
  );
}
