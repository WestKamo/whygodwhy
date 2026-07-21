import Navbar from "@/components/Navbar";
import "./globals.css";



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Replaced inline styles with Tailwind classes for the body */}
      <body className="bg-[var(--background)] m-0 p-0">
        <Navbar />
        {/* 
          Replaced inline styles with responsive Tailwind classes:
          - pt-24 (96px) for mobile devices
          - md:pt-[280px] for desktop devices
        */}
        <main className="relative z-10 w-full flex flex-col items-center pt-24 md:pt-[280px]">
          {children}
        </main>
      </body>
    </html>
  );
}
