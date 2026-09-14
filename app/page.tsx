import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { HeroSection } from "@/components/hero-section"
import { CountdownSection } from "@/components/countdown-section"
import { ProductsOrder } from "@/components/products-order"
import { getProducts, getSettings } from "@/lib/data"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [products, settings] = await Promise.all([getProducts(), getSettings()])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection settings={settings} />
        {settings.countdownEnabled && (
          <CountdownSection endsAt={settings.countdownEndsAt} headline={settings.countdownHeadline} />
        )}
        <ProductsOrder products={products} settings={settings} />
      </main>
      <SiteFooter />
    </div>
  )
}
