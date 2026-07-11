import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Mrinal-sBNB",
  description: "A full-stack stay discovery and booking application built with Next.js and FastAPI."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
