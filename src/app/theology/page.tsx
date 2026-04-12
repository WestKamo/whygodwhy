"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

// --- SCRIPTURE TOOLTIP COMPONENT ---
const ScriptureTooltip = ({ reference }: { reference: string }) => {
  const [text, setText] = useState<string>("Loading verse...");
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show && text === "Loading verse...") {
      fetch(`https://bible-api.com/${reference}`)
        .then(res => res.json())
        .then(data => setText(data.text || "Verse not found."))
        .catch(() => setText("Error fetching verse."));
    }
  }, [show]);

  return (
    <span 
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      style={{ 
        color: '#b39359', 
        textDecoration: 'underline', 
        cursor: 'help', 
        position: 'relative', 
        fontWeight: 'bold',
        display: 'inline' 
      }}
    >
      {reference}
      <AnimatePresence>
        {show && (
          <motion.span 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            style={tooltipBoxStyle}
          >
            <strong style={{ display: 'block', marginBottom: '5px', fontSize: '10px', color: '#b39359', letterSpacing: '2px' }}>
              {reference.toUpperCase()}
            </strong>
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};

// --- SAFE MANUSCRIPT PARSER ---
const ProcessedContent = ({ text }: { text: string }) => {
  if (!text) return null;
  
  const verseRegex = /([1-3]?\s?[A-Z][a-z]+\s\d+:\d+(?:-\d+)?)/g;

  return (
    <section className="manuscript-body">
      {text.split('\n').map((para, i) => {
        if (!para.trim()) return <br key={i} />;
        
        const parts = para.split(verseRegex);

        return (
          <div key={i} style={{ marginBottom: '1.5em', display: 'block' }}>
            {parts.map((part, j) => {
              if (!part) return null;
              
              const isVerse = verseRegex.test(part);
              verseRegex.lastIndex = 0;

              if (isVerse) {
                return <ScriptureTooltip key={j} reference={part} />;
              }
              return <span key={j}>{part}</span>;
            })}
          </div>
        );
      })}
    </section>
  );
};

export default function TheologyPage() {
  const router = useRouter();
  
  // --- ADMIN PERSISTENCE STATES ---
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [articles, setArticles] = useState<any[]>([]);
  const [activeArticle, setActiveArticle] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({ 
    title: "", 
    content: "", 
    category: "Systematic Theology", 
    sources: "" 
  });

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
    fetchArticles();

    // Listen for Auth changes (like your secret login)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.email === "phindilesandi07@gmail.com") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchArticles = async () => {
    const { data } = await supabase.from("articles").select("*").order("created_at", { ascending: false });
    if (data) setArticles(data);
  };

  const handlePublish = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setShowValidationAlert(true);
      return;
    }
    const submission = { ...form, sources: form.sources || "" };
    if (editingId) {
      await supabase.from("articles").update(submission).eq("id", editingId);
    } else {
      await supabase.from("articles").insert([submission]);
    }
    closeEditor();
    fetchArticles();
  };

  const confirmDeletion = async () => {
    if (showDeleteConfirm) {
      await supabase.from("articles").delete().eq("id", showDeleteConfirm);
      setShowDeleteConfirm(null);
      fetchArticles();
    }
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingId(null);
    setForm({ title: "", content: "", category: "Systematic Theology", sources: "" });
  };

  return (
    <div style={{ backgroundColor: '#fdfcf8', minHeight: '100vh', position: 'relative' }}>
      <Navbar />
      
      <style dangerouslySetInnerHTML={{ __html: `
        .manuscript-body div:first-of-type::first-letter {
          font-size: 65px;
          float: left;
          line-height: 0.7;
          padding-top: 6px;
          padding-right: 12px;
          color: #b39359;
          font-family: serif;
          font-weight: bold;
        }
      `}} />
      
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '160px 20px 100px' }}>
        <button onClick={() => router.push("/")} style={homeBtnStyle}>← RETURN TO ORIGIN</button>

        <header style={{ textAlign: 'center', marginBottom: '80px' }}>
          <span style={{ fontSize: '10px', letterSpacing: '8px', color: '#ccc', fontWeight: 'bold' }}>THE LIBRARY OF INQUIRY</span>
          <h1 style={{ fontFamily: 'serif', fontSize: 'clamp(3rem, 7vw, 72px)', color: '#111', marginTop: '15px', lineHeight: '1.1' }}>
            Faith Seeking <br /> <span style={{ fontStyle: 'italic', color: '#b39359' }}>Understanding.</span>
          </h1>
          
          {/* GATED COMPOSE BUTTON */}
          {isAdmin && (
            <button onClick={() => setShowEditor(true)} style={composeBtnStyle}>+ COMPOSE NEW TREATISE</button>
          )}
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '50px' }}>
          {articles.map((art) => (
            <motion.div key={art.id} style={articleCardStyle} whileHover={{ y: -10 }}>
              
              {/* GATED EDIT/DELETE BUTTONS */}
              {isAdmin && (
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginBottom: '20px' }}>
                  <button onClick={() => { 
                    setForm({ title: art.title, content: art.content, category: art.category, sources: art.sources || "" }); 
                    setEditingId(art.id); 
                    setShowEditor(true); 
                  }} style={miniBtn}>EDIT</button>
                  <button onClick={() => setShowDeleteConfirm(art.id)} style={{ ...miniBtn, color: '#ff4444' }}>DELETE</button>
                </div>
              )}

              <h2 style={{ fontFamily: 'serif', fontSize: '36px', color: '#111' }}>{art.title}</h2>
              <div style={{ width: '40px', height: '1px', backgroundColor: '#eee', margin: '20px 0' }} />
              <p style={{ fontSize: '17px', color: '#666', lineHeight: '1.8' }}>{art.content.substring(0, 180)}...</p>
              <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#b39359', letterSpacing: '3px' }}>{art.category.toUpperCase()}</span>
                <button onClick={() => setActiveArticle(art)} style={readBtnStyle}>READ TREATISE →</button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* EDITOR (ONLY ACCESSIBLE VIA ADMIN GATED BUTTON) */}
      <AnimatePresence>
        {showEditor && isAdmin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={masterOverlayStyle}>
            <motion.div initial={{ scale: 0.95, y: 100 }} animate={{ scale: 1, y: 60 }} exit={{ scale: 0.95, y: 100 }} style={editorBubbleStyle}>
              <div style={{ padding: '50px 60px 20px', borderBottom: '1px solid #f5f5f0' }}>
                <h2 style={{ fontFamily: 'serif', fontSize: '32px', color: '#111' }}>{editingId ? "Refine Study" : "New Study"}</h2>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '30px 60px' }}>
                <label style={labelStyle}>TREATISE TITLE</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={{...inputStyle, fontSize: '24px', fontWeight: 'bold'}} placeholder="The nature of..." />
                <label style={labelStyle}>CATEGORY</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={inputStyle}>
                  <option>Systematic Theology</option>
                  <option>Existentialism</option>
                  <option>Church History</option>
                  <option>Ecclesiology</option>
                </select>
                <label style={labelStyle}>CONTENT</label>
                <textarea rows={10} value={form.content} onChange={e => setForm({...form, content: e.target.value})} style={inputStyle} placeholder="Begin the inquiry..." />
                <label style={labelStyle}>SOURCES</label>
                <textarea rows={3} value={form.sources} onChange={e => setForm({...form, sources: e.target.value})} style={{ ...inputStyle, borderBottom: 'none' }} placeholder="Citations..." />
              </div>
              <div style={footerStyle}>
                <button onClick={handlePublish} style={publishBtnStyle}>SAVE TREATISE</button>
                <button onClick={closeEditor} style={{ ...publishBtnStyle, background: '#eee', color: '#111' }}>DISCARD</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* READ BUBBLE */}
      <AnimatePresence>
        {activeArticle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={masterOverlayStyle}>
            <motion.div initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} style={readBubbleStyle}>
              <header style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 style={{ fontFamily: 'serif', fontSize: '52px', color: '#111', marginBottom: '10px' }}>{activeArticle.title}</h1>
                <p style={{ fontSize: '11px', letterSpacing: '4px', color: '#b39359', fontWeight: 'bold' }}>
                  A TREATISE BY P. SANDI — {activeArticle.category.toUpperCase()}
                </p>
              </header>
              <div style={{ fontSize: '21px', lineHeight: '2', fontFamily: 'serif', color: '#333' }}>
                <ProcessedContent text={activeArticle.content} />
              </div>
              <button onClick={() => setActiveArticle(null)} style={closeReadBtn}>RETURN TO LIBRARY →</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ALERTS */}
      <AnimatePresence>
        {showValidationAlert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={alertOverlayStyle}>
            <div style={alertCardStyle}>
              <div style={{ fontSize: '24px', marginBottom: '15px' }}>✍️</div>
              <h3 style={{ fontFamily: 'serif', marginBottom: '10px' }}>Incomplete Treatise</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>Phindile, title and content are required.</p>
              <button onClick={() => setShowValidationAlert(false)} style={closeAlertBtn}>UNDERSTOOD</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && isAdmin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={alertOverlayStyle}>
            <div style={alertCardStyle}>
              <div style={{ fontSize: '24px', color: '#ff4444', marginBottom: '15px' }}>⚠️</div>
              <h3 style={{ fontFamily: 'serif', marginBottom: '10px' }}>Confirm the Silence?</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>Remove from collection forever?</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                <button onClick={confirmDeletion} style={{ ...actionBtn, background: '#ff4444' }}>DELETE</button>
                <button onClick={() => setShowDeleteConfirm(null)} style={{ ...actionBtn, background: '#eee', color: '#111' }}>CANCEL</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// STYLES
const tooltipBoxStyle: React.CSSProperties = { position: 'absolute', bottom: '130%', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#fff', color: '#333', padding: '20px', borderRadius: '15px', width: '280px', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid #f0f0eb', fontSize: '14px', lineHeight: '1.6', zIndex: 10000000, fontWeight: 'normal', fontStyle: 'italic', pointerEvents: 'none', textAlign: 'left', display: 'block' };
const masterOverlayStyle = { position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(253, 252, 248, 0.98)', zIndex: 1000000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', backdropFilter: 'blur(15px)' };
const editorBubbleStyle = { backgroundColor: '#fff', width: '100%', maxWidth: '850px', borderRadius: '40px', boxShadow: '0 50px 100px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', maxHeight: '80vh', border: '1px solid rgba(179, 147, 89, 0.1)', overflow: 'hidden' };
const footerStyle = { padding: '30px 60px 50px', display: 'flex', gap: '20px', borderTop: '1px solid #f5f5f0', backgroundColor: '#fff' };
const alertOverlayStyle = { position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 2000000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' };
const alertCardStyle = { backgroundColor: '#fff', padding: '40px', borderRadius: '30px', maxWidth: '380px', textAlign: 'center' as const, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' };
const closeAlertBtn = { marginTop: '20px', padding: '12px 30px', background: '#111', color: '#fff', border: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '10px', cursor: 'pointer' };
const actionBtn = { flex: 1, padding: '15px', border: 'none', borderRadius: '40px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '10px' };
const labelStyle = { display: 'block', fontSize: '10px', fontWeight: 'bold', letterSpacing: '2px', color: '#b39359', marginBottom: '10px' };
const inputStyle = { width: '100%', padding: '15px 0', background: 'none', border: 'none', borderBottom: '1px solid #eee', fontSize: '18px', fontFamily: 'serif', outline: 'none' };
const publishBtnStyle = { flex: 1, padding: '18px', background: '#111', color: '#fff', border: 'none', borderRadius: '50px', fontWeight: 'bold', letterSpacing: '2px', fontSize: '10px', cursor: 'pointer' };
const readBubbleStyle = { maxWidth: '900px', width: '100%', maxHeight: '85vh', overflowY: 'auto' as const, padding: '100px 80px', backgroundColor: '#fdfcf8', borderRadius: '40px', boxShadow: '0 50px 100px rgba(0,0,0,0.1)' };
const closeReadBtn = { display: 'block', margin: '80px 0 0 auto', background: '#111', color: '#fff', padding: '15px 40px', border: 'none', borderRadius: '50px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' };
const homeBtnStyle = { display: 'block', margin: '0 auto 60px', background: '#fff', border: '1px solid #b39359', padding: '12px 30px', fontSize: '10px', fontWeight: 'bold', letterSpacing: '4px', cursor: 'pointer', borderRadius: '50px', color: '#b39359' };
const composeBtnStyle = { padding: '16px 40px', background: '#111', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '3px', cursor: 'pointer' };
const articleCardStyle = { padding: '60px', border: '1px solid #f0f0eb', backgroundColor: '#fff', cursor: 'pointer' };
const miniBtn = { background: 'none', border: 'none', color: '#ccc', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer' };
const readBtnStyle = { background: 'none', border: 'none', color: '#111', fontWeight: 'bold', fontSize: '11px', letterSpacing: '2px', cursor: 'pointer' };