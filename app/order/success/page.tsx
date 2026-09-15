import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { getSettings } from "@/lib/data"

export const dynamic = "force-dynamic"

export default async function OrderSuccessPage() {
  const settings = await getSettings()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center bg-secondary/10 px-4 py-16">
        <section className="w-full max-w-xl rounded-3xl border border-border/60 bg-card p-8 text-center shadow-lg sm:p-12">
          <CheckCircle2
            className="mx-auto h-16 w-16 text-primary"
            aria-hidden="true"
          />
          <h1 className="mt-6 text-3xl font-bold sm:text-4xl">
            {settings.successTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-md whitespace-pre-line text-lg leading-8 text-muted-foreground">
            {settings.successMessage}
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.03]"
          >
            হোমপেজে ফিরে যান
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}