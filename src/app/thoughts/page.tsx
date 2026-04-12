"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function ThoughtsPage() {
  const router = useRouter();

  // --- ADMIN PERSISTENCE STATES ---
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

  // --- AUTH CHECK & PERSISTENCE ---
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email === "phindilesandi07@gmail.com") {
        setIsAdmin(true);
      }
    };

    checkUser();
    fetchThoughts();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.email === "phindilesandi07@gmail.com") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
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
          <h1 style={{ fontFamily: 'serif', fontSize: '56px', color: '#111' }}>Thoughts Too Heavy.</h1>
          
          {/* GATED WRITE BUTTON */}
          {isAdmin && (
            <button onClick={() => setShowEditor(true)} style={writeBtnStyle}>+ WRITE FOR TODAY</button>
          )}
        </header>

        {/* FEED */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
          {thoughts.map((t) => (
            <article key={t.id} style={{ borderBottom: '1px solid #f0f0eb', paddingBottom: '50px', position: 'relative' }}>
              
              {/* GATED ADMIN ACTIONS */}
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

      {/* DELETE CONFIRMATION POP-OUT (GATED) */}
      <AnimatePresence>
        {showDeleteConfirm && isAdmin && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={modalBg}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              style={{ backgroundColor: '#fff', padding: '50px', borderRadius: '30px', textAlign: 'center', maxWidth: '400px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
            >
              <div style={{ color: '#ff4444', fontSize: '30px', marginBottom: '20px' }}>⚠</div>
              <h2 style={{ fontFamily: 'serif', fontSize: '24px', marginBottom: '10px' }}>Confirm the Silence?</h2>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', marginBottom: '30px' }}>
                Phindile, are you sure you want to delete this echo?
              </p>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button onClick={confirmDeletion} style={{ ...btnStyle, backgroundColor: '#ff4444' }}>PROCEED</button>
                <button onClick={() => setShowDeleteConfirm(null)} style={{ ...btnStyle, backgroundColor: '#eee', color: '#111' }}>CANCEL</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL POST BUBBLE */}
      <AnimatePresence>
        {activeThought && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={bubbleBg}>
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={bubbleCard}>
               <h1 style={{ fontFamily: 'serif', fontSize: '42px', marginBottom: '20px' }}>{activeThought.title}</h1>
               <p style={{ fontSize: '19px', lineHeight: '1.9', fontFamily: 'serif' }}>{activeThought.content}</p>
               
               <div style={{ position: 'sticky', bottom: '0', display: 'flex', justifyContent: 'flex-end', marginTop: '40px' }}>
                 <button onClick={() => setActiveThought(null)} style={returnBtn}>RETURN TO THOUGHTS →</button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDITOR MODAL (GATED) */}
      <AnimatePresence>
        {showEditor && isAdmin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={modalBg}>
            <div style={{ maxWidth: '600px', width: '90%', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#fff', padding: '40px', borderRadius: '30px' }}>
              <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={inputStyle} />
              <textarea placeholder="Content..." rows={8} value={form.content} onChange={e => setForm({...form, content: e.target.value})} style={inputStyle} />
              <input placeholder="Image URL" value={form.img} onChange={e => setForm({...form, img: e.target.value})} style={inputStyle} />
              <div style={{ display: 'flex', gap: '20px' }}>
                <button onClick={handlePublish} style={btnStyle}>{editingId ? "UPDATE" : "PUBLISH"}</button>
                <button onClick={() => { setShowEditor(false); setEditingId(null); }} style={{ ...btnStyle, background: '#eee', color: '#111' }}>CANCEL</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// STYLES (Remaining identical for UI consistency)
const writeBtnStyle = { marginTop: '20px', padding: '12px 30px', border: '1px solid #b39359', color: '#b39359', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '10px', letterSpacing: '2px' };
const miniBtn = { background: 'none', border: 'none', color: '#ccc', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' };
const inputStyle = { padding: '15px', border: '1px solid #eee', background: '#f9f9f9', outline: 'none', fontFamily: 'serif', fontSize: '16px', borderRadius: '10px' };
const btnStyle = { flex: 1, padding: '15px', background: '#111', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '40px', fontSize: '10px', letterSpacing: '2px' };
const modalBg = { position: 'fixed', inset: 0, backgroundColor: 'rgba(17,17,17,0.3)', backdropFilter: 'blur(10px)', zIndex: 60000, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const bubbleBg = { position: 'fixed', inset: 0, backgroundColor: 'rgba(253, 252, 248, 0.95)', backdropFilter: 'blur(20px)', zIndex: 50000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' };
const bubbleCard = { backgroundColor: '#fdfcf8', width: '100%', maxWidth: '850px', maxHeight: '90vh', borderRadius: '40px', padding: '60px', overflowY: 'auto', boxShadow: '0 50px 100px rgba(179, 147, 89, 0.25)', position: 'relative', border: '1px solid rgba(179, 147, 89, 0.1)' };
const returnBtn = { background: '#111', color: '#fff', border: 'none', padding: '12px 28px', fontSize: '9px', fontWeight: 'bold', letterSpacing: '3px', cursor: 'pointer', borderRadius: '50px', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' };