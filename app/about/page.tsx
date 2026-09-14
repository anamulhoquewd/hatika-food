import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata = {
  title: "আমাদের সম্পর্কে — হাটিকা ফুডস",
}

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto w-full max-w-4xl px-4 py-16">
          <div className="mb-10 text-center">
            <span className="mx-auto w-fit rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
              আমাদের গল্প
            </span>
            <h1 className="mt-4 text-balance text-4xl font-bold text-foreground">
              হাটিকা ফুডস সম্পর্কে
            </h1>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
            <div className="relative aspect-16/7">
              <Image
                src="/hero-organic-food.png"
                alt="হাটিকা ফুডসের প্রাকৃতিক পণ্য"
                fill
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-5 p-6 text-pretty leading-relaxed text-muted-foreground sm:p-10">
              <p>
                হাটিকা ফুডস একটি বিশ্বাসযোগ্য নাম, যারা আপনার পরিবারের জন্য নিয়ে এসেছে ১০০% খাঁটি,
                ভেজালমুক্ত ও প্রাকৃতিক খাবার। আমরা বিশ্বাস করি, সুস্বাস্থ্যের মূল চাবিকাঠি হলো
                বিশুদ্ধ ও নিরাপদ খাবার।
              </p>
              <p>
                আমাদের প্রতিটি পণ্য যত্নসহকারে বাছাই করা হয় এবং সরাসরি নির্ভরযোগ্য উৎস থেকে সংগ্রহ
                করা হয়। ঘানি ভাঙা সরিষার তেল থেকে শুরু করে খাঁটি মধু ও দেশি ঘি — প্রতিটি পণ্যেই আমরা
                মান ও বিশুদ্ধতাকে সর্বোচ্চ গুরুত্ব দিই।
              </p>
              <p>
                আমাদের লক্ষ্য একটাই — দেশের প্রতিটি ঘরে নিরাপদ ও স্বাস্থ্যকর খাবার পৌঁছে দেওয়া। আপনার
                আস্থা ও ভালোবাসাই আমাদের এগিয়ে চলার প্রেরণা।
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
