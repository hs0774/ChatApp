import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./(styles)/globals.css";
import { AuthProvider } from "./(stores)/authContext.tsx";

//components
import Navbar from "./(components)/Navbar";
import Footer from "./(components)/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
