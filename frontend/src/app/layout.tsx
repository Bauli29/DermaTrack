import GlobalStyle from '@/app/global-style'

import ClientLayout from '@/lib/client-layout'
import StyledComponentsRegistry from '@/lib/registry'

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang='en'>
    <head>
      <link
        href='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0&display=optional'
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
