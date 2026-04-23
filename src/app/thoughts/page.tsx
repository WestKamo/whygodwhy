"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function ThoughtsPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [thoughts, setThoughts] = useState<any[]>([]);
  const [activeThought, setActiveThought] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "", img: "" });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email === "phindilesandi07@gmail.com") setIsAdmin(true);
    };
    checkUser();
    fetchThoughts();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(session?.user?.email === "phindilesandi07@gmail.com");
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchThoughts = async () => {
    const { data } = await supabase.from("thoughts").select("*").order("created_at", { ascending: false });
    if (data) setThoughts(data);
  };

  const handlePublish = async () => {
    if (editingId) {
      await supabase.from("thoughts").update(form).eq("id", editingId);
    } else {
      await supabase.from("thoughts").insert([form]);
    }
    setShowEditor(false); setEditingId(null); setForm({ title: "", content: "", img: "" });
    fetchThoughts();
  };

  const confirmDeletion = async () => {
    if (showDeleteConfirm) {
      await supabase.from("thoughts").delete().eq("id", showDeleteConfirm);
      setShowDeleteConfirm(null);
      fetchThoughts();
    }
  };

  return (
    <div style={{ backgroundColor: '#fdfcf8', minHeight: '100vh', position: 'relative' }}>
      <Navbar />
      
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '160px 20px 100px' }}>
        <button 
          onClick={() => router.push("/")}
          style={{ display: 'block', margin: '0 auto 60px', background: 'none', border: '1px solid #eee', padding: '10px 25px', fontSize: '9px', fontWeight: 'bold', letterSpacing: '3px', cursor: 'pointer', borderRadius: '20px', color: '#aaa' }}
        >
          ← BACK TO HOME
        </button>

        <header style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #b39359', margin: '0 auto 25px' }}>
            <img src="/me.jpg" alt="Phindile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h1 style={{ fontFamily: 'serif', fontSize: 'clamp(32px, 8vw, 56px)', color: '#111' }}>Thoughts Too Heavy.</h1>
          {isAdmin && <button onClick={() => setShowEditor(true)} style={writeBtnStyle}>+ WRITE FOR TODAY</button>}
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
          {thoughts.map((t) => (
            <article key={t.id} style={{ borderBottom: '1px solid #f0f0eb', paddingBottom: '50px', position: 'relative' }}>
              {isAdmin && (
                <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: '15px' }}>
                   <button onClick={() => { setForm({title: t.title, content: t.content, img: t.img}); setEditingId(t.id); setShowEditor(true); }} style={miniBtn}>EDIT</button>
                   <button onClick={() => setShowDeleteConfirm(t.id)} style={{ ...miniBtn, color: '#ff4444' }}>DELETE</button>
                </div>
              )}
              <span style={{ fontSize: '9px', color: '#b39359', fontWeight: 'bold', letterSpacing: '3px' }}>
                {new Date(t.created_at).toLocaleDateString().toUpperCase()} / {t.views || 0} EYEWITNESSES
              </span>
              <h2 style={{ fontFamily: 'serif', fontSize: '32px', margin: '15px 0' }}>{t.title}</h2>
              <p style={{ fontSize: '18px', color: '#444', lineHeight: '1.8', fontFamily: 'serif' }}>
                {t.content.substring(0, 150)}...
                <button onClick={() => setActiveThought(t)} style={{ background: 'none', border: 'none', color: '#b39359', fontWeight: 'bold', cursor: 'pointer', marginLeft: '10px', textDecoration: 'underline' }}>
                  [ KEEP READING ]
                </button>
              </p>
            </article>
          ))}
        </div>
      </main>

      {/* --- SCROLLABLE EDITOR MODAL --- */}
      <AnimatePresence>
        {showEditor && isAdmin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalBg}>
            <motion.div 
              initial={{ y: 50, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              style={editorCardStyle}
            >
              <h2 style={{ fontFamily: 'serif', fontSize: '28px', marginBottom: '30px', color: '#111' }}>
                {editingId ? "Refine the Echo" : "Capture a Thought"}
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={inputContainer}>
                  <label style={labelStyle}>TITLE</label>
                  <input 
                    placeholder="What is this weight called?" 
                    value={form.title} 
                    onChange={e => setForm({...form, title: e.target.value})} 
                    style={inputStyle} 
                  />
                </div>

                <div style={inputContainer}>
                  <label style={labelStyle}>CONTENT</label>
                  <textarea 
                    placeholder="Spill the truth here..." 
                    rows={12} 
                    value={form.content} 
                    onChange={e => setForm({...form, content: e.target.value})} 
                    style={{ ...inputStyle, resize: 'none' }} 
                  />
                </div>

                <div style={inputContainer}>
                  <label style={labelStyle}>VISUAL URL (OPTIONAL)</label>
                  <input 
                    placeholder="https://..." 
                    value={form.img} 
                    onChange={e => setForm({...form, img: e.target.value})} 
                    style={inputStyle} 
                  />
                </div>
              </div>

              <div style={editorFooter}>
                <button onClick={() => { setShowEditor(false); setEditingId(null); setForm({title: "", content: "", img: ""}); }} style={cancelBtn}>DISCARD</button>
                <button onClick={handlePublish} style={publishBtn}>{editingId ? "UPDATE ECHO" : "RELEASE THOUGHT"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- UPDATED FULL-FLOW READING BUBBLE --- */}
      <AnimatePresence>
        {activeThought && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={bubbleBg}>
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={bubbleCard}>
               <h1 style={{ fontFamily: 'serif', fontSize: 'clamp(32px, 8vw, 42px)', marginBottom: '30px', color: '#111' }}>{activeThought.title}</h1>
               
               {/* Content Split for better mobile rendering */}
               <div style={{ color: '#333' }}>
                {activeThought.content.split('\n').map((para: string, i: number) => (
                  <p key={i} style={{ fontSize: '19px', lineHeight: '1.9', fontFamily: 'serif', marginBottom: '25px' }}>
                    {para}
                  </p>
                ))}
               </div>
               
               <div style={{ display: 'flex', justifyContent: 'center', marginTop: '60px', paddingBottom: '40px' }}>
                 <button onClick={() => setActiveThought(null)} style={returnBtn}>RETURN TO ORIGIN</button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- DELETE CONFIRMATION --- */}
      <AnimatePresence>
        {showDeleteConfirm && isAdmin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalBg}>
            <div style={{ backgroundColor: '#fff', padding: '50px', borderRadius: '30px', textAlign: 'center', maxWidth: '400px' }}>
              <h2 style={{ fontFamily: 'serif', fontSize: '24px' }}>Confirm the Silence?</h2>
              <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                <button onClick={confirmDeletion} style={{ ...btnStyle, backgroundColor: '#ff4444' }}>DELETE</button>
                <button onClick={() => setShowDeleteConfirm(null)} style={{ ...btnStyle, backgroundColor: '#eee', color: '#111' }}>CANCEL</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- RESPONSIVE STYLES ---
const editorCardStyle: React.CSSProperties = {
  backgroundColor: '#fdfcf8',
  width: '100%',
  maxWidth: '800px',
  maxHeight: '85vh',
  overflowY: 'auto', 
  borderRadius: '40px',
  padding: 'clamp(20px, 5vw, 60px)',
  boxShadow: '0 50px 100px rgba(0,0,0,0.2)',
  position: 'relative',
  border: '1px solid rgba(179, 147, 89, 0.2)'
};

const editorFooter: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '20px',
  marginTop: '40px',
  paddingTop: '20px',
  borderTop: '1px solid #f0f0eb',
  position: 'sticky',
  bottom: 0,
  backgroundColor: '#fdfcf8',
  zIndex: 10
};

const inputContainer: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle: React.CSSProperties = { fontSize: '9px', fontWeight: 'bold', letterSpacing: '2px', color: '#b39359' };
const inputStyle: React.CSSProperties = { padding: '20px', border: '1px solid #f0f0eb', background: '#fff', outline: 'none', fontFamily: 'serif', fontSize: '18px', borderRadius: '15px', width: '100%' };

const publishBtn: React.CSSProperties = { padding: '15px 35px', background: '#111', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '50px', fontSize: '10px', letterSpacing: '2px' };
const cancelBtn: React.CSSProperties = { background: 'none', border: 'none', color: '#aaa', fontWeight: 'bold', cursor: 'pointer', fontSize: '10px', letterSpacing: '2px' };

const writeBtnStyle = { marginTop: '20px', padding: '12px 30px', border: '1px solid #b39359', color: '#b39359', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '10px', letterSpacing: '2px', borderRadius: '50px' };
const miniBtn = { background: 'none', border: 'none', color: '#ccc', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' };
const btnStyle = { flex: 1, padding: '15px', background: '#111', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '40px', fontSize: '10px', letterSpacing: '2px' };

const modalBg: React.CSSProperties = { 
  position: 'fixed', 
  inset: 0, 
  backgroundColor: 'rgba(17,17,17,0.4)', 
  backdropFilter: 'blur(15px)', 
  zIndex: 60000, 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  padding: '20px' 
};

const bubbleBg: React.CSSProperties = { 
  position: 'fixed', 
  inset: 0, 
  backgroundColor: 'rgba(253, 252, 248, 0.98)', 
  backdropFilter: 'blur(20px)', 
  zIndex: 50000, 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'flex-start', // Allows scrolling from top
  overflowY: 'auto', 
  padding: '0' 
};

const bubbleCard: React.CSSProperties = { 
  backgroundColor: '#fdfcf8', 
  width: '100%', 
  maxWidth: '900px', 
  minHeight: '100vh', 
  borderRadius: '0px', // Mobile feels better without curves on full-screen reading
  padding: '120px clamp(20px, 5vw, 80px) 100px', 
  boxShadow: 'none',
  position: 'relative'
};

const returnBtn: React.CSSProperties = { 
  background: '#111', 
  color: '#fff', 
  border: 'none', 
  padding: '15px 40px', 
  fontSize: '10px', 
  fontWeight: 'bold', 
  letterSpacing: '3px', 
  cursor: 'pointer', 
  borderRadius: '50px' 
};