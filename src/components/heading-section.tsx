import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

/** Consistent page intro block for all listing/detail pages. */
export function HeadingSection({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={cn("mb-8", className)}>
      {eyebrow ? <p className="text-eyebrow">{eyebrow}</p> : null}
      <h1 className="text-title mt-1 text-3xl leading-tight sm:text-4xl">{title}</h1>
      {description ? (
        <div className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </div>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </Reveal>
  );
}
