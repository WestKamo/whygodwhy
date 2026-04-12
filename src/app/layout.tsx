import Navbar from "@/components/Navbar";
import "./globals.css";

// ... (keep your imports)

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#fdfcf8', margin: 0, padding: 0 }}>
        <Navbar />
        <main style={{ 
          position: 'relative', 
          zIndex: 1, 
          paddingTop: '280px', // Pushed down further for the larger Navbar
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {children}
        </main>
      </body>
    </html>
  );
}

