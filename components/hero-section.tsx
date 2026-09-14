import type { SettingsDTO } from "@/lib/types";
import { Phone } from "lucide-react";
import Image from "next/image";

export function HeroSection({ settings }: { settings: SettingsDTO }) {
  const heroImage = settings.heroImageUrl || "/hero-organic-food.png";
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
        <div className="flex flex-col gap-6 text-center md:text-left">
          <span className="mx-auto w-fit rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground md:mx-0">
            শতভাগ খাঁটি ও প্রাকৃতিক
          </span>
          <h1 className="text-balance text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            {settings.heroHeadline}
          </h1>
          <p className="text-pretty text-lg text-muted-foreground">
            {settings.heroDescription}
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row md:justify-start">
            <a
              href="#order"
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.03]"
            >
              এখনই অর্ডার করুন
            </a>
            <a
              href={`tel:${settings.contactPhone}`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-primary/30 bg-card px-6 text-base font-semibold text-primary transition-colors hover:bg-secondary"
            >
              <Phone className="h-4 w-4" />
              {settings.contactPhone}
            </a>
          </div>
        </div>
        <div className="relative">
          <div
            className="absolute -inset-4 rounded-[2.5rem] bg-accent/40 blur-2xl"
            aria-hidden
          />
          <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-xl">
            <Image
              src={heroImage || "/placeholder.svg"}
              alt="হাটিকা ফুডসের খাঁটি পণ্যসমূহ"
              width={720}
              height={560}
              priority
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
