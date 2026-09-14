import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Hind_Siliguri } from 'next/font/google'
import './globals.css'

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bengali',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'HATIKA FOOD — খাঁটি ও প্রাকৃতিক খাবার',
  description:
    'হাটিকা ফুডস — স্বাস্থ্যকর, ভেজালমুক্ত ও প্রাকৃতিক খাবার এখন আপনার দরজায়। এখনই অর্ডার করুন।',
  generator: 'github.com/anamulhoquewd',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#0379C6',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="bn" className={`light ${hindSiliguri.variable}`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
