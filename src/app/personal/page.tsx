"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function PersonalPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showCreator, setShowCreator] = useState(false);
  const [activeVault, setActiveVault] = useState<"shelf" | "music" | null>(null);
  const [creatorType, setCreatorType] = useState<"post" | "book" | "music">("post");
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{table: string, id: string} | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const [posts, setPosts] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [musicList, setMusicList] = useState<any[]>([]);
  const [currentMusic, setCurrentMusic] = useState({ artist: "Bach", album: "Cello Suites", song: "Prelude" });

  const [form, setForm] = useState({ title: "", author: "", status: "Reading", image_url: "", caption: "", artist: "", album: "", song: "" });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // 1. Check existing session immediately
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email === "phindilesandi07@gmail.com") {
        setIsAdmin(true);
        setUser(session.user);
      }
      fetchContent();
    };
    getInitialSession();

    // 2. Listen for the moment you click the email link and land back here
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth Event:", event); // Debug log
      if (session?.user?.email === "phindilesandi07@gmail.com") {
        setIsAdmin(true);
        setUser(session.user);
      } else {
        setIsAdmin(false);
        setUser(null);
      }
    });

    const saved = localStorage.getItem("wgw_music_current");
    if (saved) setCurrentMusic(JSON.parse(saved));

    return () => subscription.unsubscribe();
  }, []);

  const fetchContent = async () => {
    const { data: p } = await supabase.from("playground_posts").select("*").order("created_at", { ascending: false });
    const { data: b } = await supabase.from("library_shelf").select("*").order("created_at", { ascending: false });
    const { data: m } = await supabase.from("personal_music").select("*").order("created_at", { ascending: false });
    if (p) setPosts(p); 
    if (b) setBooks(b); 
    if (m) setMusicList(m);
  };

  const confirmDeletion = async () => {
    if (deleteTarget) {
      await supabase.from(deleteTarget.table).delete().eq("id", deleteTarget.id);
      setDeleteTarget(null);
      fetchContent();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('gallery').upload(fileName, file);
    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('gallery').getPublicUrl(fileName);
    setForm({ ...form, image_url: data.publicUrl });
    setUploading(false);
  };

  const handlePost = async () => {
    if (creatorType === "post") {
        if (editingId) await supabase.from("playground_posts").update({ image_url: form.image_url, caption: form.caption }).eq("id", editingId);
        else await supabase.from("playground_posts").insert([{ image_url: form.image_url, caption: form.caption }]);
    }
    if (creatorType === "book") {
        if (editingId) await supabase.from("library_shelf").update({ title: form.title, author: form.author, status: form.status }).eq("id", editingId);
        else await supabase.from("library_shelf").insert([{ title: form.title, author: form.author, status: form.status }]);
    }
    if (creatorType === "music") {
        if (editingId) await supabase.from("personal_music").update({ artist: form.artist, album: form.album, song: form.song }).eq("id", editingId);
        else await supabase.from("personal_music").insert([{ artist: form.artist, album: form.album, song: form.song }]);
        const latest = { artist: form.artist, album: form.album, song: form.song };
        setCurrentMusic(latest);
        localStorage.setItem("wgw_music_current", JSON.stringify(latest));
    }
    closeEditor();
    fetchContent();
  };

  const closeEditor = () => {
    setShowCreator(false);
    setEditingId(null);
    setForm({ title: "", author: "", status: "Reading", image_url: "", caption: "", artist: "", album: "", song: "" });
  };

  return (
    <div style={{ backgroundColor: '#fdfcf8', minHeight: '100vh' }}>
      <Navbar />
      
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '160px 20px 100px' }}>
        <button onClick={() => router.push("/")} style={homeBtnStyle}>← RETURN TO ORIGIN</button>

        <section style={{ textAlign: 'center', marginBottom: '80px' }}>
          <motion.div whileHover={{ scale: 1.1, rotate: 5 }} style={avatarStyle}>
            <img src="/me.jpg" alt="Phindile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </motion.div>
          <h1 style={{ fontFamily: 'serif', fontSize: '56px', color: '#111' }}>The <span style={{ color: '#b39359', fontStyle: 'italic' }}>Playground.</span></h1>
          <p style={{ fontSize: '18px', fontFamily: 'serif', color: '#555', marginTop: '20px', lineHeight: '1.7' }}>
             Welcome to my curated chaos! A collection of books currently devouring my time, melodies that haunt my late-night thinking, and snapshots of beauty stumbled upon while wandering.
          </p>
          {isAdmin && <button onClick={() => setShowCreator(true)} style={pulseBtnStyle}>+ DROP A NEW MEMORY</button>}
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '60px' }}>
           <motion.div onClick={() => setActiveVault("shelf")} whileHover={{ scale: 1.02 }} style={{ ...blockStyle, backgroundColor: '#b39359', color: '#fff' }}>
              <span style={labelStyle}>THE SHELF</span>
              <h3 style={{ fontFamily: 'serif', fontSize: '20px' }}>{books.length} Books Collected</h3>
           </motion.div>
           <motion.div onClick={() => setActiveVault("music")} whileHover={{ scale: 1.02 }} style={{ ...blockStyle, backgroundColor: '#111', color: '#fff' }}>
              <span style={{ ...labelStyle, color: '#b39359' }}>AURAL ARCHIVES</span>
              <h3 style={{ fontFamily: 'serif', fontSize: '20px' }}>{currentMusic.album}</h3>
           </motion.div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {posts.map((post) => (
                <motion.div key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={postCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden' }}>
                                <img src="/me.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Phindile" />
                            </div>
                            <p style={{ fontWeight: 'bold', fontSize: '13px' }}>Phindile Sandi</p>
                        </div>
                        {isAdmin && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => { setForm({ ...form, image_url: post.image_url, caption: post.caption }); setEditingId(post.id); setCreatorType("post"); setShowCreator(true); }} style={miniBtn}>EDIT</button>
                            <button onClick={() => setDeleteTarget({table: 'playground_posts', id: post.id})} style={{ ...miniBtn, color: '#ff4444' }}>DELETE</button>
                          </div>
                        )}
                    </div>
                    {post.image_url && (
                      <img 
                        src={post.image_url} 
                        onClick={() => setZoomImage(post.image_url)}
                        style={{ ...compactImageStyle, cursor: 'zoom-in' }} 
                        alt="Post content" 
                      />
                    )}
                    <p style={compactCaptionStyle}>{post.caption}</p>
                    <p style={{ fontSize: '9px', color: '#ccc', marginTop: '10px' }}>{new Date(post.created_at).toLocaleDateString()}</p>
                </motion.div>
            ))}
        </div>
      </main>

      {/* ZOOM MODAL */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setZoomImage(null)} style={zoomOverlayStyle}>
            <motion.img initial={{ scale: 0.8 }} animate={{ scale: 1 }} src={zoomImage} style={zoomedImageStyle} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* VAULT MODAL (Now showing book author/status and music artist/song) */}
      <AnimatePresence>
        {activeVault && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={masterOverlay}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} style={vaultCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <h2 style={{ fontFamily: 'serif', fontSize: '28px' }}>{activeVault === "shelf" ? "The Library Shelf" : "Aural Archives"}</h2>
                <button onClick={() => setActiveVault(null)} style={{ fontSize: '24px', cursor: 'pointer', background: 'none', border: 'none' }}>✕</button>
              </div>
              
              <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {activeVault === "shelf" ? (
                  books.map((b) => (
                    <div key={b.id} style={vaultItemStyle}>
                      <div>
                        <p style={{ fontWeight: 'bold', fontSize: '16px' }}>{b.title}</p>
                        <p style={{ fontSize: '13px', color: '#b39359' }}>{b.author}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                         <span style={{ fontSize: '9px', padding: '4px 10px', borderRadius: '20px', background: b.status === "Reading" ? '#fff9e6' : '#e6fff0', color: b.status === "Reading" ? '#b39359' : '#2ecc71' }}>{b.status}</span>
                         {isAdmin && <button onClick={() => { setForm({...b}); setEditingId(b.id); setCreatorType("book"); setShowCreator(true); setActiveVault(null); }} style={miniBtn}>EDIT</button>}
                         {isAdmin && <button onClick={() => setDeleteTarget({table: 'library_shelf', id: b.id})} style={{ ...miniBtn, color: '#ff4444' }}>DELETE</button>}
                      </div>
                    </div>
                  ))
                ) : (
                  musicList.map((m) => (
                    <div key={m.id} style={vaultItemStyle}>
                      <div>
                        <p style={{ fontWeight: 'bold', fontSize: '16px' }}>{m.song}</p>
                        <p style={{ fontSize: '13px', color: '#888' }}>{m.artist} — <span style={{ color: '#b39359' }}>{m.album}</span></p>
                      </div>
                      {isAdmin && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button onClick={() => { setForm({...m}); setEditingId(m.id); setCreatorType("music"); setShowCreator(true); setActiveVault(null); }} style={miniBtn}>EDIT</button>
                          <button onClick={() => setDeleteTarget({table: 'personal_music', id: m.id})} style={{ ...miniBtn, color: '#ff4444' }}>DELETE</button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATOR MODAL */}
      <AnimatePresence>
        {showCreator && isAdmin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={masterOverlay}>
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} style={creatorCard}>
              <h2 style={{ fontFamily: 'serif', marginBottom: '25px' }}>{editingId ? "Refine Entry" : "New Playground Entry"}</h2>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
                {["post", "book", "music"].map(t => (
                  <button key={t} onClick={() => setCreatorType(t as any)} style={{ ...typeBtn, backgroundColor: creatorType === t ? '#111' : '#eee', color: creatorType === t ? '#fff' : '#111' }}>{t.toUpperCase()}</button>
                ))}
              </div>
              {creatorType === "post" && (
                <>
                  <div onClick={() => fileInputRef.current?.click()} style={uploadAreaStyle}>
                    {form.image_url ? "✓ Attached" : (uploading ? "Uploading..." : "Click for Gallery")}
                  </div>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
                  <textarea value={form.caption} placeholder="Tell the story..." onChange={e => setForm({...form, caption: e.target.value})} style={inputStyle} />
                </>
              )}
              {creatorType === "book" && (
                <>
                  <input value={form.title} placeholder="Book Title" onChange={e => setForm({...form, title: e.target.value})} style={inputStyle} />
                  <input value={form.author} placeholder="Author" onChange={e => setForm({...form, author: e.target.value})} style={inputStyle} />
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={inputStyle}><option value="Reading">Reading</option><option value="Completed">Completed</option></select>
                </>
              )}
              {creatorType === "music" && (
                <>
                   <input value={form.artist} placeholder="Artist" onChange={e => setForm({...form, artist: e.target.value})} style={inputStyle} />
                   <input value={form.album} placeholder="Album" onChange={e => setForm({...form, album: e.target.value})} style={inputStyle} />
                   <input value={form.song} placeholder="Favourite Song/Track" onChange={e => setForm({...form, song: e.target.value})} style={inputStyle} />
                </>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button onClick={handlePost} disabled={uploading} style={saveBtn}>PUBLISH</button>
                <button onClick={closeEditor} style={{ ...saveBtn, background: '#eee', color: '#111' }}>DISCARD</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={masterOverlay}>
            <div style={alertCardStyle}>
              <h3 style={{ fontFamily: 'serif' }}>Confirm Deletion?</h3>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button onClick={confirmDeletion} style={{ ...actionBtn, background: '#ff4444' }}>DELETE</button>
                <button onClick={() => setDeleteTarget(null)} style={{ ...actionBtn, background: '#eee', color: '#111' }}>CANCEL</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// STYLES
const vaultItemStyle = { padding: '20px 0', borderBottom: '1px solid #f5f5f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const homeBtnStyle = { display: 'block', margin: '0 auto 50px', background: '#fff', border: '1px solid #eee', padding: '10px 25px', fontSize: '9px', fontWeight: 'bold' as const, letterSpacing: '3px', cursor: 'pointer', borderRadius: '50px', color: '#999' };
const avatarStyle = { width: '100px', height: '100px', borderRadius: '50%', border: '2px solid #b39359', margin: '0 auto 20px', overflow: 'hidden' };
const pulseBtnStyle = { padding: '12px 30px', background: '#111', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '10px', fontWeight: 'bold' as const, cursor: 'pointer' };
const blockStyle = { padding: '30px', borderRadius: '15px', cursor: 'pointer' };
const labelStyle = { fontSize: '8px', fontWeight: 'bold' as const, letterSpacing: '2px', marginBottom: '15px', display: 'block' };
const postCardStyle = { backgroundColor: '#fff', border: '1px solid #f0f0eb', borderRadius: '12px', padding: '20px' };
const compactImageStyle = { width: '100%', borderRadius: '8px', maxHeight: '450px', objectFit: 'cover' as const };
const compactCaptionStyle = { fontFamily: 'serif', fontSize: '16px', marginTop: '15px', color: '#333', lineHeight: '1.5' };
const miniBtn = { background: 'none', border: 'none', fontSize: '9px', fontWeight: 'bold', color: '#ccc', cursor: 'pointer' };
const zoomOverlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 2000000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' };
const zoomedImageStyle: React.CSSProperties = { maxWidth: '90%', maxHeight: '90vh', borderRadius: '4px' };
const masterOverlay = { position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(253, 252, 248, 0.95)', zIndex: 1000000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', backdropFilter: 'blur(10px)' };
const alertCardStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '20px', maxWidth: '300px', textAlign: 'center' as const };
const actionBtn = { flex: 1, padding: '12px', border: 'none', borderRadius: '30px', color: '#fff', fontWeight: 'bold' as const, cursor: 'pointer', fontSize: '10px' };
const creatorCard = { backgroundColor: '#fff', padding: '40px', borderRadius: '25px', width: '100%', maxWidth: '450px' };
const vaultCard = { backgroundColor: '#fff', padding: '60px', borderRadius: '40px', width: '100%', maxWidth: '600px', boxShadow: '0 40px 100px rgba(0,0,0,0.1)' };
const uploadAreaStyle = { width: '100%', padding: '20px', border: '1px dashed #ddd', borderRadius: '10px', textAlign: 'center' as const, cursor: 'pointer', fontSize: '12px', color: '#999', marginBottom: '15px' };
const inputStyle = { width: '100%', padding: '12px 0', background: 'none', border: 'none', borderBottom: '1px solid #eee', fontSize: '16px', fontFamily: 'serif', outline: 'none', marginBottom: '12px' };
const saveBtn = { flex: 1, padding: '15px', border: 'none', borderRadius: '40px', background: '#111', color: '#fff', fontWeight: 'bold' as const, cursor: 'pointer', fontSize: '10px' };
const typeBtn = { padding: '7px 12px', border: 'none', borderRadius: '20px', fontSize: '9px', fontWeight: 'bold' as const, cursor: 'pointer' };