import Link from "next/link";
import { ArrowRight, BadgeX, BadgeCheck } from "lucide-react";
import { GameImage } from "@/components/game-image";
import { Badge } from "@/components/ui/badge";
import type { Character, Pet, Weapon, Loadout } from "@/types/game";
import { titleCase } from "@/lib/format";
import { cn } from "@/lib/utils";

function MetaChip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        "rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
        ok
          ? "border-success/40 bg-success/10 text-success"
          : "border-border bg-secondary/40 text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}

export function CharacterCard({ character }: { character: Character }) {
  return (
    <Link
      href={`/characters/${character.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_8px_28px_-12px_rgba(249,121,22,0.25)] focus-visible:outline-2"
    >
      <div className="surface-tactical relative flex aspect-[4/3] items-center justify-center border-b bg-gradient-to-b from-secondary/40 to-transparent">
        <GameImage
          name={character.name}
          assetPath={character.imageLocal}
          size={160}
          className="size-full"
        />
        {character.role ? (
          <Badge
            variant="secondary"
            className="absolute left-2.5 top-2.5 font-mono text-[10px] uppercase tracking-wider"
          >
            {titleCase(character.role)}
          </Badge>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-semibold">{character.name}</h3>
          {character.skillType ? (
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {character.skillType}
            </span>
          ) : null}
        </div>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {character.skill ?? "Ability details unavailable"}
        </p>
        <div className="mt-auto flex items-center gap-1.5 pt-2">
          {character.metaBr !== null && (
            <MetaChip ok={character.metaBr} label="BR" />
          )}
          {character.metaCs !== null && (
            <MetaChip ok={character.metaCs} label="CS" />
          )}
        </div>
      </div>
    </Link>
  );
}

export function WeaponCard({ weapon }: { weapon: Weapon }) {
  return (
    <Link
      href={`/weapons/${weapon.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_8px_28px_-12px_rgba(249,121,22,0.25)] focus-visible:outline-2"
    >
      <div className="surface-tactical relative flex aspect-[16/9] items-center justify-center border-b bg-gradient-to-b from-secondary/40 to-transparent">
        <GameImage
          name={weapon.name}
          assetPath={weapon.imageLocal}
          size={200}
          className="size-full transition-transform duration-300 group-hover:scale-105"
        />
        <Badge
          variant="secondary"
          className="absolute left-2.5 top-2.5 font-mono text-[10px] uppercase tracking-wider"
        >
          {weapon.primaryType ?? titleCase(weapon.type) ?? "Weapon"}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <h3 className="truncate font-semibold">{weapon.name}</h3>
        {/* stat chips: only verified numbers present in the dataset */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
          {weapon.damage !== null && <span>DMG {weapon.damage}</span>}
          {weapon.rateOfFire !== null && <span>RoF {weapon.rateOfFire}</span>}
          {weapon.range !== null && <span>RNG {weapon.range}</span>}
          {weapon.magazineSize !== null && <span>MAG {weapon.magazineSize}</span>}
        </div>
        <div className="mt-auto flex items-center justify-between pt-1.5">
          <div className="flex items-center gap-2">
            {weapon.price !== null ? (
              <span className="text-[11px] text-muted-foreground">
                {weapon.price} {weapon.armory?.includes("CS") ? "CS Cash" : "FF Coins"}
              </span>
            ) : null}
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100">
            Details <ArrowRight className="size-3.5" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function PetCard({ pet }: { pet: Pet }) {
  return (
    <Link
      href={`/pets/${pet.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_8px_28px_-12px_rgba(249,121,22,0.25)] focus-visible:outline-2"
    >
      <div className="surface-tactical relative flex aspect-square items-center justify-center border-b bg-gradient-to-b from-secondary/40 to-transparent">
        <GameImage
          name={pet.name}
          assetPath={pet.imageLocal}
          size={140}
          className="size-full"
        />
        {pet.role ? (
          <Badge
            variant="secondary"
            className="absolute left-2.5 top-2.5 font-mono text-[10px] uppercase tracking-wider"
          >
            {titleCase(pet.role)}
          </Badge>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-semibold">{pet.name}</h3>
        </div>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {pet.skill ?? "Ability details unavailable"}
        </p>
      </div>
    </Link>
  );
}

export function LoadoutCard({ loadout }: { loadout: Loadout }) {
  return (
    <Link
      href={`/loadouts/${loadout.id}`}
      className="group relative flex items-center gap-4 overflow-hidden rounded-xl border bg-card p-4 transition-all duration-200 hover:border-brand/40 hover:shadow-[0_8px_28px_-12px_rgba(249,121,22,0.25)] focus-visible:outline-2"
    >
      <div className="surface-tactical relative flex size-20 shrink-0 items-center justify-center rounded-lg border bg-gradient-to-b from-secondary/40 to-transparent">
        <GameImage
          name={loadout.name ?? loadout.id}
          assetPath={loadout.imageLocal}
          size={64}
          className="size-full"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-semibold">{loadout.name ?? loadout.id}</h3>
          <span className="hidden font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:inline">
            {loadout.category ?? "Loadout"}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {loadout.shortDescription ?? loadout.descriptionBr?.slice(0, 140) ?? "Description unavailable"}
        </p>
      </div>
      <ArrowRight
        className="size-4 shrink-0 text-brand opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden
      />
    </Link>
  );
}

export function VerificationBadge({
  status,
  className,
}: {
  status: { verified: boolean; text: string };
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground",
        className,
      )}
    >
      {status.verified ? (
        <BadgeCheck className="size-3 text-success" aria-hidden />
      ) : (
        <BadgeX className="size-3 opacity-60" aria-hidden />
      )}
      {status.text}
    </span>
  );
}
