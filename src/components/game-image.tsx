"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

const PALETTE = [
  "linear-gradient(135deg, #2a1607 0%, #4d2606 55%, #7a4310 100%)",
  "linear-gradient(135deg, #062a2a 0%, #0b4044 55%, #11565a 100%)",
  "linear-gradient(135deg, #1d1230 0%, #321c4d 55%, #472a66 100%)",
  "linear-gradient(135deg, #241016 0%, #451722 55%, #5c2230 100%)",
];

function hashIndex(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return h % PALETTE.length;
}

/**
 * next/image wrapper with a deterministic gradient fallback when the asset is
 * unavailable (never fabricates a fake in-game render).
 */
export function GameImage({
  name,
  assetPath,
  size,
  className,
  contain = true,
  priority,
}: {
  name: string;
  assetPath: string | null;
  size: number;
  className?: string;
  /** object-contain (sprites) vs object-cover (editorial) */
  contain?: boolean;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const gradient = PALETTE[hashIndex(name)];

  if (!assetPath || failed) {
    return (
      <span
        role="img"
        aria-label={name}
        className={cn(
          "flex size-full items-center justify-center",
          className,
        )}
        style={{ background: gradient }}
      >
        <span
          aria-hidden
          className="font-mono font-bold text-white/60"
          style={{ fontSize: Math.max(12, size * 0.22) }}
        >
          {initials(name)}
        </span>
      </span>
    );
  }

  const imageProps: Omit<ImageProps, "alt"> = {
    src: assetPath,
    width: size,
    height: size,
    className: cn(
      contain ? "object-contain" : "object-cover",
      "bg-transparent",
      className,
    ),
    onError: () => setFailed(true),
    priority,
  };

  return <Image alt={name} {...imageProps} />;
}
