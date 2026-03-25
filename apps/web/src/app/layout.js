import Providers from "./providers";
import { ClerkProvider } from '@clerk/nextjs'

export const metadata = {
  title: "Flowboard",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
