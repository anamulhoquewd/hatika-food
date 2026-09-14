import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          aria-label="Hatika Foods home"
          className="flex items-center gap-2 text-primary"
        >
          <Image
            src="/hatika-food-logo.png"
            alt="HATIKA FOOD"
            width={500}
            height={500}
            className="h-13 w-auto"
            priority
          />
          <span className="sr-only">Hatika Foods</span>
        </Link>
        <Link
          href="/"
          className="text-center text-xl font-bold tracking-[0.15em] text-primary sm:text-2xl"
        >
          HATIKA FOOD
        </Link>
        <nav className="flex w-24 justify-end">
          <Link
            href="/about"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            আমাদের সম্পর্কে
          </Link>
        </nav>
      </div>
    </header>
  );
}
