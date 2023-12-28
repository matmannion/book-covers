import type { Metadata } from 'next'
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry'

export const metadata: Metadata = {
  title: `Laura's book cover stickers generator`,
  description: `Generate book covers for printing and cutting as stickers on a Cricut`,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  )
}
