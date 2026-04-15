import type { Metadata, Viewport } from 'next'

import ClientLayout from '@/lib/client-layout'
import StyledComponentsRegistry from '@/lib/registry'

export const metadata: Metadata = {
  title: 'DermaTrack',
  description: 'Track and manage your dermatological health daily.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang='en'>
    <head>
      <link
        href='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0&display=swap'
        rel='stylesheet'
      />
    </head>
    <body>
      <StyledComponentsRegistry>
        <ClientLayout>{children}</ClientLayout>
      </StyledComponentsRegistry>
    </body>
  </html>
)

export default RootLayout
