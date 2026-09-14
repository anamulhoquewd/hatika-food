import type { SettingsDTO } from "@/lib/types"

export function OfferSection({ settings }: { settings: SettingsDTO }) {
  const discount =
    settings.offerOldPrice > 0
      ? Math.round(((settings.offerOldPrice - settings.offerNewPrice) / settings.offerOldPrice) * 100)
      : 0
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14">
      <div className="flex flex-col items-center gap-6 rounded-3xl border border-border/60 bg-accent/30 px-6 py-12 text-center shadow-sm">
        <span className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">
          {discount > 0 ? `${discount}% ছাড়` : "বিশেষ অফার"}
        </span>
        <h2 className="text-balance text-3xl font-bold text-foreground">{settings.offerHeadline}</h2>
        <div className="flex items-end justify-center gap-4">
          <span className="text-2xl font-medium text-muted-foreground line-through">
            ৳{settings.offerOldPrice}
          </span>
          <span className="text-5xl font-bold text-primary">৳{settings.offerNewPrice}</span>
        </div>
        <p className="max-w-md text-pretty text-lg text-muted-foreground">{settings.offerDescription}</p>
      </div>
    </section>
  )
}
