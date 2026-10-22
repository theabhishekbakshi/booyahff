"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

type Preset = {
  general: number;
  redDot: number;
  twoX: number;
  fourX: number;
  sniper: number;
  freeLook: number;
  dpi: string;
};

const SLIDERS: Array<{ key: keyof Preset; label: string; explanation: string }> = [
  { key: "general", label: "General", explanation: "Overall camera speed while moving." },
  { key: "redDot", label: "Red dot", explanation: "Speed of the red-dot sight." },
  { key: "twoX", label: "2× scope", explanation: "Speed of the 2× scope." },
  { key: "fourX", label: "4× scope", explanation: "Speed of the 4× scope." },
  { key: "sniper", label: "Sniper scope", explanation: "Speed of the sniper scope." },
  { key: "freeLook", label: "Free look", explanation: "Speed when peering without turning the view." },
];

const DEFAULT: Preset = {
  general: 90,
  redDot: 70,
  twoX: 60,
  fourX: 50,
  sniper: 40,
  freeLook: 60,
  dpi: "—",
};

const STORAGE_KEY = "booyahff-sensitivity";

export function SensitivityBuilderClient() {
  const [preset, setPreset] = useState<Preset>(DEFAULT);
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // localStorage persistence: read deferred until after mount (avoids hydration
  // mismatch), write on every change afterwards
  useEffect(() => {
    const load = setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) setPreset({ ...DEFAULT, ...(JSON.parse(stored) as Preset) });
      } catch {
        /* ignore */
      }
      setLoaded(true);
    }, 0);
    return () => clearTimeout(load);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preset));
    } catch {
      /* ignore */
    }
  }, [preset, loaded]);

  const presetText = useMemo(
    () =>
      [
        "Free Fire sensitivity preset (educational sheet from BooyahFF)",
        ...SLIDERS.map((s) => `${s.label}: ${preset[s.key]}`),
        `Device DPI: ${preset.dpi === "—" ? "unspecified" : preset.dpi}`,
      ].join("\n"),
    [preset],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-eyebrow">Adjust values</h2>
          <Button variant="ghost" size="sm" onClick={() => setPreset(DEFAULT)}>
            <RotateCcw className="size-3.5" aria-hidden /> Reset
          </Button>
        </div>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {SLIDERS.map((s) => (
            <div key={s.key}>
              <label htmlFor={`sens-${s.key}`} className="flex items-baseline justify-between text-sm font-medium">
                {s.label}
                <span className="font-mono text-sm tabular-nums text-brand">{preset[s.key]}</span>
              </label>
              <input
                id={`sens-${s.key}`}
                type="range"
                min={0}
                max={100}
                value={preset[s.key]}
                onChange={(e) => setPreset((p) => ({ ...p, [s.key]: Number(e.target.value) }))}
                className="mt-2 w-full accent-[var(--brand)]"
                aria-describedby={`sens-${s.key}-hint`}
              />
              <p id={`sens-${s.key}-hint`} className="mt-1 text-xs text-muted-foreground">
                {s.explanation}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-5 max-w-64">
          <label htmlFor="sens-dpi" className="text-sm font-medium">
            Device DPI record
          </label>
          <input
            id="sens-dpi"
            value={preset.dpi}
            onChange={(e) => setPreset((p) => ({ ...p, dpi: e.target.value }))}
            placeholder="optional note"
            className="mt-1.5 h-9 w-full rounded-lg border bg-secondary/40 px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-brand/50"
          />
        </div>
      </div>

      <aside className="rounded-xl border bg-card p-5">
        <h2 className="text-eyebrow">Shareable preset sheet</h2>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg border bg-secondary/40 p-3 font-mono text-xs leading-relaxed">
          {presetText}
        </pre>
        <Button
          variant="secondary"
          size="sm"
          className="mt-3 w-full"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(presetText);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            } catch {
              /* clipboard unavailable */
            }
          }}
        >
          {copied ? <Check className="size-3.5 text-success" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          {copied ? "Copied" : "Copy preset sheet"}
        </Button>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          This sheet is a note-taking aid, stored only in your browser (localStorage). It is not a
          formula and {siteConfig.name} does not claim any value is optimal — find what feels right
          for your grip and device.
        </p>
      </aside>
    </div>
  );
}
