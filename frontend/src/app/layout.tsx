import GlobalStyle from '@/app/global-style'

import ClientLayout from '@/lib/client-layout'
import StyledComponentsRegistry from '@/lib/registry'

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang='en'>
    <head>
      <link
        href='https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded'
        rel='stylesheet'
      />
    </head>
    <body>
      <StyledComponentsRegistry>
        <ClientLayout>
          <GlobalStyle />
          {children}
        </ClientLayout>
      </StyledComponentsRegistry>
    </body>
  </html>
)

export default RootLayout
