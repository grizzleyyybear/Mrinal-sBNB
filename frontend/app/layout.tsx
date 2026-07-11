import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Airbnb Clone",
  description: "A fullstack Airbnb clone assignment built with Next.js and FastAPI."
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
