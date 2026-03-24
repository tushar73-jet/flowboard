import "./globals.css";

export const metadata = {
  title: "Flowboard",

};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
