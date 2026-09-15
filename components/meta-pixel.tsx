"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

export function trackMetaEvent(
  eventName: string,
  parameters?: Record<string, unknown>,
) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, parameters);
  }
}

export function MetaPixel({ pixelId }: { pixelId?: string }) {
  const pathname = usePathname();
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    if (window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [pathname]);

  if (!pixelId) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${pixelId}');`}
      </Script>
      <Script
        id="meta-pixel-page-view"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: "fbq('track', 'PageView');" }}
      />
    </>
  );
}
