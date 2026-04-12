"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X } from "lucide-react";

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)', zIndex: 2000 }}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{ 
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '90%', maxWidth: '400px', backgroundColor: '#fdfcf8', padding: '40px',
              borderRadius: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.12)', zIndex: 2001,
              textAlign: 'center'
            }}
          >
            <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', cursor: 'pointer', color: '#ccc' }}>
              <X size={20} />
            </button>

            <h2 style={{ fontFamily: 'serif', fontSize: '32px', marginBottom: '10px' }}>Join the Dialogue</h2>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '30px', lineHeight: '1.5' }}>
              By signing up, you’re agreeing to get a ping whenever I have an existential crisis (and new posts).
            </p>

            <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input 
                type="email" 
                placeholder="yourname@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: '15px', borderRadius: '12px', border: '1px solid #eee', backgroundColor: '#f9f9f7', outline: 'none' }}
              />
              <input 
                type="password" 
                placeholder="A very secret password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ padding: '15px', borderRadius: '12px', border: '1px solid #eee', backgroundColor: '#f9f9f7', outline: 'none' }}
              />
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ 
                  backgroundColor: '#111', color: '#fff', padding: '15px', 
                  borderRadius: '12px', border: 'none', fontWeight: 'bold', 
                  marginTop: '10px', cursor: 'pointer', letterSpacing: '1px' 
                }}
              >
                LET'S DO THIS →
              </motion.button>
            </form>

            <p style={{ fontSize: '10px', color: '#bbb', marginTop: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              No spam. Just soul-searching.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}