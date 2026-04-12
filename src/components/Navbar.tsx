"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ChurchTimeline from "./ChurchTimeline";
import { createBrowserClient } from "@supabase/ssr";

export default function Navbar() {
  const router = useRouter();
  const [showPsalm, setShowPsalm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const verse = "One thing I ask from the Lord, this only do I seek: that I may dwell in the house of the Lord all the days of my life, to gaze on the beauty of the Lord and to seek him in his temple.";
  const reference = "Psalm 27:4";

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const sync = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email?.toLowerCase() === "phindilesandi07@gmail.com") setIsAdmin(true);
    };
    sync();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(session?.user?.email?.toLowerCase() === "phindilesandi07@gmail.com");
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav style={{ 
      position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 9999, 
      backgroundColor: '#fdfcf8', borderBottom: '1px solid rgba(0,0,0,0.03)'
    }}>
      <div style={{ 
        maxWidth: '1200px', margin: '0 auto', 
        display: 'flex', justifyContent: 'space-between', 
        alignItems: 'center', padding: '15px 40px' 
      }}>
        
        {/* LEFT LINKS */}
        <div style={{ display: 'flex', gap: '30px', flex: 1 }}>
          <button onClick={() => router.push("/theology")} style={navLinkStyle}>Theology</button>
          <button onClick={() => router.push("/personal")} style={navLinkStyle}>Personal</button>
        </div>

        {/* CENTER: RESTORED LOGO & VERSE */}
        <div 
          style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} 
          onClick={() => setShowPsalm(!showPsalm)}
        >
          {/* Restored 'W' Circle */}
          <motion.div whileHover={{ rotate: 90 }} style={logoCircleStyle}>
            <span style={{ fontSize: '14px', fontFamily: 'serif', color: '#b39359', fontWeight: 'bold' }}>W</span>
          </motion.div>

          <AnimatePresence mode="wait">
            {!showPsalm ? (
              <motion.div key="name" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
                <span style={logoTextStyle}>WHYGODWHY</span>
                {/* Restored Jesus is my God */}
                <span style={subLogoStyle}>Jesus is my God</span>
              </motion.div>
            ) : (
              <motion.div key="psalm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', maxWidth: '500px' }}>
                <p style={psalmTextStyle}>"{verse}"</p>
                <span style={referenceStyle}>{reference}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT LINKS */}
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
          <button onClick={() => router.push("/thoughts")} style={navLinkStyle}>Thoughts</button>
          {isAdmin && <button onClick={() => supabase.auth.signOut()} style={exitBtn}>EXIT ADMIN</button>}
        </div>
      </div>

      <ChurchTimeline />
    </nav>
  );
}

// RESTORED STYLES
const logoCircleStyle = { 
  width: '32px', height: '32px', border: '1px solid #b39359', 
  borderRadius: '50%', display: 'flex', alignItems: 'center', 
  justifyContent: 'center', marginBottom: '8px' 
};
const logoTextStyle = { fontSize: '20px', fontFamily: 'serif', letterSpacing: '5px', fontWeight: 'bold', color: '#111' };
const subLogoStyle = { fontSize: '8px', letterSpacing: '4px', color: '#b39359', display: 'block', marginTop: '4px', textTransform: 'uppercase' as const };
const navLinkStyle = { fontSize: '10px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' as const, color: '#aaa', background: 'none', border: 'none', cursor: 'pointer' };
const psalmTextStyle = { margin: 0, fontSize: '11px', fontStyle: 'italic', color: '#b39359', lineHeight: '1.4' };
const referenceStyle = { fontSize: '8px', fontWeight: 'bold', color: '#ccc', marginTop: '4px', display: 'block' };
const exitBtn = { background: 'none', border: '1px solid #ff4444', color: '#ff4444', padding: '5px 10px', fontSize: '7px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' };