import GlobalStyle from '@/app/global-style'

import ClientLayout from '@/lib/client-layout'
import StyledComponentsRegistry from '@/lib/registry'

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang='en'>
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
