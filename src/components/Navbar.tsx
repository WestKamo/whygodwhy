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
  
  // --- SECRET MODAL STATES ---
  const [clickCount, setClickCount] = useState(0);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [secretEmail, setSecretEmail] = useState("");
  const [loading, setLoading] = useState(false);

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

  // --- SECRET CLICK HANDLER ---
  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    setShowPsalm(!showPsalm); // Keep the Psalm toggle working

    if (newCount === 5) {
      setShowSecretModal(true);
      setClickCount(0);
    }

    // Reset counter if user stops clicking for 3 seconds
    const timer = setTimeout(() => setClickCount(0), 3000);
    return () => clearTimeout(timer);
  };

  // --- LOGIN LOGIC ---
  const handleIdentify = async () => {
    if (secretEmail.trim().toLowerCase() === "phindilesandi07@gmail.com") {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({ 
        email: secretEmail.trim(),
        options: { 
          // Crucial for Vercel: redirects to your callback route
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      setLoading(false);
      if (!error) {
        alert("Verification sent. Open the link in your email to unveil.");
        setShowSecretModal(false);
      } else {
        alert("Error: " + error.message);
      }
    } else {
      alert("Unauthorized seeker.");
      setSecretEmail("");
    }
  };

  return (
    <>
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

          {/* CENTER: LOGO (NOW WITH CLICK HANDLER) */}
          <div 
            style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} 
            onClick={handleLogoClick}
          >
            <motion.div whileHover={{ rotate: 90 }} style={logoCircleStyle}>
              <span style={{ fontSize: '14px', fontFamily: 'serif', color: '#b39359', fontWeight: 'bold' }}>W</span>
            </motion.div>

            <AnimatePresence mode="wait">
              {!showPsalm ? (
                <motion.div key="name" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
                  <span style={logoTextStyle}>WHYGODWHY</span>
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

      {/* --- THE SECRET MODAL --- */}
      <AnimatePresence>
        {showSecretModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={modalOverlayStyle}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              style={modalContentStyle}
            >
              <h3 style={{ fontFamily: 'serif', letterSpacing: '2px', marginBottom: '15px' }}>IDENTIFY SEEKER</h3>
              <input 
                type="email" 
                placeholder="Enter Secret Email" 
                value={secretEmail}
                onChange={(e) => setSecretEmail(e.target.value)}
                style={modalInputStyle}
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button onClick={() => setShowSecretModal(false)} style={cancelBtnStyle}>Cancel</button>
                <button onClick={handleIdentify} style={unveilBtnStyle}>
                  {loading ? "Sending..." : "Unveil"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// RESTORED STYLES (NO CHANGES)
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

// --- MODAL STYLES ---
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, backgroundColor: 'rgba(253, 252, 248, 0.95)',
  zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)'
};
const modalContentStyle: React.CSSProperties = {
  backgroundColor: '#fff', padding: '40px', borderRadius: '20px', border: '1px solid #b39359',
  textAlign: 'center', width: '90%', maxWidth: '400px', boxShadow: '0 20px 50px rgba(179, 147, 89, 0.1)'
};
const modalInputStyle: React.CSSProperties = {
  width: '100%', padding: '12px', border: '1px solid #eee', borderRadius: '8px', outline: 'none', textAlign: 'center', fontSize: '14px'
};
const cancelBtnStyle = { background: 'none', border: 'none', color: '#aaa', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '1px' };
const unveilBtnStyle = { background: '#b39359', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '2px' };