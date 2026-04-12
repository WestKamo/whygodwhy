"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function SubscribeBar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "exists">("idle");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubscribe = async () => {
  if (!email || !email.includes('@')) {
    setStatus("error");
    return;
  }
  
  setStatus("loading");

  const { error } = await supabase
    .from("subscribers")
    .insert([{ email }]);

  if (error) {
    if (error.code === '23505') {
      setStatus("exists");
      // Even if they already exist, we should mark them as subscribed locally
      localStorage.setItem("wgw_subscriber", "true"); 
    } else {
      setStatus("error");
    }
  } else {
    setStatus("success");
    // SAVE TO LOCAL STORAGE
    localStorage.setItem("wgw_subscriber", "true");
    
    setTimeout(() => {
      onClose();
      setEmail("");
      setStatus("idle");
      // Refresh the page or trigger a state update to update the Navbar
      window.dispatchEvent(new Event("storage")); 
    }, 3500);
  }
};

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: -200 }}
          animate={{ y: 0 }}
          exit={{ y: -200 }}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', minHeight: '100px',
            backgroundColor: '#111', color: '#fdfcf8', zIndex: 20000,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)', padding: '20px'
          }}
        >
          <div style={{ maxWidth: '800px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px' }}>
            
            {/* Playful Messaging Logic */}
            <div style={{ textAlign: 'left', minWidth: '300px' }}>
              <span style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '3px', color: '#b39359', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>
                {status === "success" ? "Connection Established" : "The Inner Circle"}
              </span>
              <p style={{ margin: 0, fontSize: '14px', fontFamily: 'serif', fontStyle: 'italic', color: '#ccc' }}>
                {status === "loading" && "Syncing your soul to the database..."}
                {status === "success" && "Your support keeps my existential gears turning. It means the world."}
                {status === "exists" && "You're already here! I love the enthusiasm."}
                {status === "error" && "Something glitched in the matrix. Try again?"}
                {status === "idle" && "Join the dialogue. I'll ping you when the thoughts get deep."}
              </p>
            </div>

            {/* Input & Action Section */}
            {(status === "idle" || status === "loading" || status === "error" || status === "exists") && (
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <input 
                  type="email" 
                  placeholder="your.email@here.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if(status !== 'idle') setStatus('idle'); }}
                  style={{
                    background: 'transparent', border: 'none', borderBottom: `1px solid ${status === 'error' ? '#ff4444' : '#b39359'}`,
                    color: '#fff', padding: '8px', outline: 'none', width: '220px', fontSize: '14px'
                  }}
                />
                <button 
                  onClick={handleSubscribe}
                  disabled={status === "loading"}
                  style={{ 
                    backgroundColor: '#b39359', color: '#111', border: 'none', 
                    padding: '10px 25px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer',
                    borderRadius: '2px', transition: 'all 0.3s'
                  }}
                >
                  {status === "loading" ? "SYNCING..." : "I'M IN"}
                </button>
              </div>
            )}

            {status === "success" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                style={{ fontSize: '12px', fontWeight: 'bold', color: '#b39359', letterSpacing: '2px' }}
              >
                SUBSCRIBED.
              </motion.div>
            )}

            <button 
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: '10px', marginLeft: '20px' }}
            >
              [CLOSE]
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}