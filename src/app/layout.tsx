import type { Viewport } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

// This tells mobile browsers to scale properly so Tailwind 'md:' breakpoints work
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[var(--background)] m-0 p-0 min-h-screen">
        {/* Navbar only exists here now! */}
        <Navbar />
        
        {/* Main wrapper only exists here now! */}
        <main className="relative z-10 w-full flex flex-col items-center pt-24 md:pt-[280px]">
          {children}
        </main>
      </body>
    </html>
  );
}
