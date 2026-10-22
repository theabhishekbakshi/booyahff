import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Info, PawPrint } from "lucide-react";
import { GameImage } from "@/components/game-image";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProvenanceInfo } from "@/components/provenance-info";
import { Reveal } from "@/components/reveal";
import { PetCard } from "@/components/game-cards";
import { getPets, getPetById } from "@/lib/data";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { titleCase } from "@/lib/format";

type Params = { params: Promise<{ slug: string }> };

// blocking route: params resolve before the shell flushes, so unlisted slugs emit a real HTTP 404
export const instant = false;


export async function generateStaticParams() {
  const pets = await getPets();
  return pets.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const pet = await getPetById(slug);
  if (!pet)
    return pageMetadata({ title: "Pet not found", description: "This pet does not exist in the dataset.", path: `/pets/${slug}`, noIndex: true });
  return pageMetadata({
    title: `${pet.name} — ability & data`,
    description: pet.description ? `${pet.name}: ${pet.description.slice(0, 150)}` : `${pet.name} ability and dataset provenance.`,
    path: `/pets/${pet.id}`,
  });
}

export default async function PetDetailPage({ params }: Params) {
  const { slug } = await params;
  const pet = await getPetById(slug);
  if (!pet) notFound();

  const all = await getPets();
  const related = all.filter((p) => p.id !== pet.id).slice(0, 6);

  return (
    <div className="container-page py-8 sm:py-10">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", href: "/" },
              { name: "Pets", href: "/pets" },
              { name: pet.name, href: `/pets/${pet.id}` },
            ]),
          ),
        }}
      />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Pets", href: "/pets" },
          { name: pet.name, href: `/pets/${pet.id}` },
        ]}
      />

      <Reveal className="mt-6">
        <div className="relative overflow-hidden rounded-2xl border bg-card">
          <div className="surface-tactical absolute inset-0 opacity-70" aria-hidden />
          <div className="relative grid gap-6 p-6 sm:p-8 md:grid-cols-[minmax(0,240px)_1fr]">
            <div className="relative mx-auto w-full max-w-52">
              <div className="relative aspect-square overflow-hidden rounded-xl border bg-gradient-to-b from-secondary/50 to-transparent">
                <GameImage name={pet.name} assetPath={pet.imageLocal} size={300} contain={false} className="size-full" priority />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {pet.role ? (
                  <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider">
                    <PawPrint className="mr-1 size-3" aria-hidden />
                    {titleCase(pet.role)}
                  </Badge>
                ) : null}
              </div>
              <h1 className="text-title mt-3 text-4xl leading-tight">{pet.name}</h1>

              <section aria-label="Pet skill" className="mt-5">
                <p className="text-eyebrow">Skill</p>
                <h2 className="mt-1 text-xl font-semibold">
                  {pet.skill ?? "Not available in dataset"}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {pet.description ?? "Skill description not provided by the dataset."}
                </p>
              </section>

              <p className="mt-5 flex items-start gap-2 rounded-lg border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
                <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                The imported pet dataset does not include verification dates or upgrade tables.
                Skill effects may change across game versions — verify in-game before relying on
                exact numbers.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <section aria-label="More pets">
          <h2 className="text-title mb-3 text-lg">Other pets</h2>
          <Reveal className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {related.map((p) => (
              <PetCard key={p.id} pet={p} />
            ))}
          </Reveal>
        </section>
        <aside>
          <ProvenanceInfo
            confidenceLabel={null}
            lastVerified={null}
            patchVersion={null}
            sources={pet.sources}
            notes={[
              "Records imported as-is; the source file lists no verification metadata for pets.",
            ]}
          />
        </aside>
      </div>
    </div>
  );
}
