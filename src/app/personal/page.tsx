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
  const [currentMusic, setCurrentMusic] = useState({ artist: "...", album: "...", song: "..." });

  const [form, setForm] = useState({ title: "", author: "", status: "Reading", image_url: "", caption: "", artist: "", album: "", song: "" });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email === "phindilesandi07@gmail.com") setIsAdmin(true);
      fetchContent();
    };
    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(session?.user?.email === "phindilesandi07@gmail.com");
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
    if (m) {
        setMusicList(m);
        if (m.length > 0 && !localStorage.getItem("wgw_music_current")) setCurrentMusic(m[0]);
    }
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
    } else if (creatorType === "book") {
        if (editingId) await supabase.from("library_shelf").update({ title: form.title, author: form.author, status: form.status }).eq("id", editingId);
        else await supabase.from("library_shelf").insert([{ title: form.title, author: form.author, status: form.status }]);
    } else if (creatorType === "music") {
        if (editingId) await supabase.from("personal_music").update({ artist: form.artist, album: form.album, song: form.song }).eq("id", editingId);
        else await supabase.from("personal_music").insert([{ artist: form.artist, album: form.album, song: form.song }]);
        setCurrentMusic({ artist: form.artist, album: form.album, song: form.song });
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

        <section style={{ textAlign: 'center', marginBottom: '60px' }}>
          <motion.div whileHover={{ scale: 1.1 }} style={avatarStyle}>
            <img src="/me.jpg" alt="Phindile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </motion.div>
          <h1 style={{ fontFamily: 'serif', fontSize: 'clamp(32px, 8vw, 56px)', color: '#111' }}>The <span style={{ color: '#b39359', fontStyle: 'italic' }}>Playground.</span></h1>
          {isAdmin && <button onClick={() => setShowCreator(true)} style={pulseBtnStyle}>+ DROP A NEW MEMORY</button>}
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '60px' }}>
           <motion.div onClick={() => setActiveVault("shelf")} whileHover={{ y: -5 }} style={{ ...blockStyle, backgroundColor: '#b39359', color: '#fff' }}>
              <span style={labelStyle}>THE SHELF</span>
              <h3 style={{ fontFamily: 'serif', fontSize: '18px' }}>{books.length} Books Collected</h3>
           </motion.div>
           <motion.div onClick={() => setActiveVault("music")} whileHover={{ y: -5 }} style={{ ...blockStyle, backgroundColor: '#111', color: '#fff' }}>
              <span style={{ ...labelStyle, color: '#b39359' }}>MY FAVOURITE MELODIES</span>
              <h3 style={{ fontFamily: 'serif', fontSize: '18px' }}>{currentMusic.song}</h3>
           </motion.div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {posts.map((post) => (
                <motion.div key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={postCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden' }}>
                                <img src="/me.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Phindile" />
                            </div>
                            <p style={{ fontWeight: 'bold', fontSize: '12px' }}>Phindile Sandi</p>
                        </div>
                        {isAdmin && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => { setForm({ ...form, image_url: post.image_url, caption: post.caption }); setEditingId(post.id); setCreatorType("post"); setShowCreator(true); }} style={miniBtn}>EDIT</button>
                            <button onClick={() => setDeleteTarget({table: 'playground_posts', id: post.id})} style={{ ...miniBtn, color: '#ff4444' }}>DELETE</button>
                          </div>
                        )}
                    </div>

                    {post.image_url && (
                      <div style={imageWrapper}>
                        <img 
                          src={post.image_url} 
                          onClick={() => setZoomImage(post.image_url)}
                          style={containedImageStyle} 
                          alt="Post content" 
                        />
                      </div>
                    )}

                    <p style={compactCaptionStyle}>{post.caption}</p>
                    <p style={{ fontSize: '9px', color: '#ccc', marginTop: '10px' }}>{new Date(post.created_at).toLocaleDateString()}</p>
                </motion.div>
            ))}
        </div>
      </main>

      {/* FULL SCREEN ZOOM (FIXED FOR NO CROPPING) */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setZoomImage(null)} style={zoomOverlayStyle}>
            <button style={closeZoomBtn}>✕ EXIT PREVIEW</button>
            <motion.img initial={{ scale: 0.95 }} animate={{ scale: 1 }} src={zoomImage} style={zoomedImageStyle} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* VAULT MODAL */}
      <AnimatePresence>
        {activeVault && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={masterOverlay}>
            <motion.div initial={{ y: 50 }} animate={{ y: 0 }} style={vaultCard}>
              <div style={stickyHeader}>
                <h2 style={{ fontFamily: 'serif', fontSize: '24px' }}>{activeVault === "shelf" ? "The Library Shelf" : "My Favourite Melodies"}</h2>
                <button onClick={() => setActiveVault(null)} style={closeCircleBtn}>✕</button>
              </div>
              
              <div style={scrollArea}>
                {activeVault === "shelf" ? (
                  books.map((b) => (
                    <div key={b.id} style={vaultItemStyle}>
                      <div>
                        <p style={{ fontWeight: 'bold', fontSize: '15px' }}>{b.title}</p>
                        <p style={{ fontSize: '12px', color: '#b39359' }}>{b.author}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                         <span style={statusBadge}>{b.status}</span>
                         {isAdmin && <button onClick={() => { setForm({...b}); setEditingId(b.id); setCreatorType("book"); setShowCreator(true); setActiveVault(null); }} style={miniBtn}>EDIT</button>}
                      </div>
                    </div>
                  ))
                ) : (
                  musicList.map((m) => (
                    <div key={m.id} style={vaultItemStyle}>
                      <div>
                        <p style={{ fontWeight: 'bold', fontSize: '15px' }}>{m.song}</p>
                        <p style={{ fontSize: '12px', color: '#888' }}>{m.artist} — <span style={{ color: '#b39359' }}>{m.album}</span></p>
                      </div>
                      {isAdmin && <button onClick={() => { setForm({...m}); setEditingId(m.id); setCreatorType("music"); setShowCreator(true); setActiveVault(null); }} style={miniBtn}>EDIT</button>}
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
              <h2 style={{ fontFamily: 'serif', marginBottom: '20px' }}>Entry Creator</h2>
              <div style={typeTabGroup}>
                {["post", "book", "music"].map(t => (
                  <button key={t} onClick={() => setCreatorType(t as any)} style={{ ...typeBtn, backgroundColor: creatorType === t ? '#111' : '#f5f5f5', color: creatorType === t ? '#fff' : '#111' }}>{t.toUpperCase()}</button>
                ))}
              </div>
              <div style={scrollAreaCreator}>
                {creatorType === "post" && (
                  <>
                    <div onClick={() => fileInputRef.current?.click()} style={uploadAreaStyle}>
                      {form.image_url ? "Image Ready ✓" : (uploading ? "Uploading..." : "Select from Gallery")}
                    </div>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
                    <textarea value={form.caption} placeholder="Caption this moment..." onChange={e => setForm({...form, caption: e.target.value})} style={inputStyleArea} />
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
                     <input value={form.artist} placeholder="Artist Name" onChange={e => setForm({...form, artist: e.target.value})} style={inputStyle} />
                     <input value={form.album} placeholder="Album Title" onChange={e => setForm({...form, album: e.target.value})} style={inputStyle} />
                     <input value={form.song} placeholder="Song Title" onChange={e => setForm({...form, song: e.target.value})} style={inputStyle} />
                  </>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button onClick={handlePost} disabled={uploading} style={saveBtn}>PUBLISH</button>
                <button onClick={closeEditor} style={{ ...saveBtn, background: '#f5f5f5', color: '#111' }}>CANCEL</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- STYLES ---
const imageWrapper: React.CSSProperties = { width: '100%', borderRadius: '12px', overflow: 'hidden', display: 'flex', justifyContent: 'center', backgroundColor: 'transparent' };
const containedImageStyle: React.CSSProperties = { width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'contain', cursor: 'zoom-in' };
const zoomOverlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, backgroundColor: 'rgba(253, 252, 248, 0.98)', zIndex: 9999999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px', cursor: 'zoom-out', backdropFilter: 'blur(20px)' };
const zoomedImageStyle: React.CSSProperties = { maxWidth: '100%', maxHeight: '95vh', objectFit: 'contain' };
const closeZoomBtn: React.CSSProperties = { position: 'fixed', top: '30px', right: '30px', background: '#111', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '50px', fontSize: '9px', fontWeight: 'bold', letterSpacing: '2px', cursor: 'pointer' };
const stickyHeader: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 10, paddingBottom: '10px' };
const scrollArea: React.CSSProperties = { maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' };
const scrollAreaCreator: React.CSSProperties = { maxHeight: '40vh', overflowY: 'auto', paddingRight: '5px' };
const postCardStyle = { backgroundColor: '#fff', border: '1px solid #f0f0eb', borderRadius: '16px', padding: '16px', marginBottom: '10px' };
const avatarStyle = { width: '80px', height: '80px', borderRadius: '50%', border: '2px solid #b39359', margin: '0 auto 20px', overflow: 'hidden' };
const pulseBtnStyle = { padding: '12px 30px', background: '#111', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '10px', fontWeight: 'bold' as const, cursor: 'pointer', marginBottom: '20px' };
const blockStyle = { padding: '25px', borderRadius: '20px', cursor: 'pointer', textAlign: 'center' as const };
const labelStyle = { fontSize: '8px', fontWeight: 'bold' as const, letterSpacing: '2px', marginBottom: '10px', display: 'block' };
const compactCaptionStyle = { fontFamily: 'serif', fontSize: '15px', marginTop: '12px', color: '#333', lineHeight: '1.6' };
const miniBtn = { background: 'none', border: 'none', fontSize: '9px', fontWeight: 'bold', color: '#ccc', cursor: 'pointer' };
const masterOverlay: React.CSSProperties = { position: 'fixed', inset: 0, backgroundColor: 'rgba(253, 252, 248, 0.98)', zIndex: 1000000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', backdropFilter: 'blur(10px)' };
const vaultCard = { backgroundColor: '#fff', padding: '40px', borderRadius: '32px', width: '100%', maxWidth: '550px', boxShadow: '0 40px 100px rgba(0,0,0,0.08)' };
const creatorCard = { backgroundColor: '#fff', padding: '30px', borderRadius: '32px', width: '100%', maxWidth: '450px' };
const uploadAreaStyle = { width: '100%', padding: '30px', border: '1px dashed #ddd', borderRadius: '15px', textAlign: 'center' as const, cursor: 'pointer', fontSize: '12px', color: '#999', marginBottom: '15px' };
const inputStyle = { width: '100%', padding: '12px 0', background: 'none', border: 'none', borderBottom: '1px solid #f0f0f0', fontSize: '16px', fontFamily: 'serif', outline: 'none', marginBottom: '15px' };
const inputStyleArea = { width: '100%', padding: '12px 0', background: 'none', border: 'none', borderBottom: '1px solid #f0f0f0', fontSize: '16px', fontFamily: 'serif', outline: 'none', marginBottom: '15px', minHeight: '80px', resize: 'none' as const };
const saveBtn = { flex: 1, padding: '15px', border: 'none', borderRadius: '40px', background: '#111', color: '#fff', fontWeight: 'bold' as const, cursor: 'pointer', fontSize: '10px' };
const typeBtn: React.CSSProperties = { padding: '8px 16px', border: 'none', borderRadius: '20px', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer', flexShrink: 0 };
const typeTabGroup: React.CSSProperties = { display: 'flex', gap: '10px', marginBottom: '25px', overflowX: 'auto', paddingBottom: '10px' };
const closeCircleBtn = { width: '32px', height: '32px', borderRadius: '50%', border: 'none', backgroundColor: '#f5f5f5', cursor: 'pointer' };
const statusBadge = { fontSize: '9px', padding: '4px 10px', borderRadius: '20px', background: '#fdfcf8', border: '1px solid #eee', color: '#b39359' };
const vaultItemStyle = { padding: '15px 0', borderBottom: '1px solid #f9f9f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const homeBtnStyle = { display: 'block', margin: '0 auto 50px', background: '#fff', border: '1px solid #eee', padding: '10px 25px', fontSize: '9px', fontWeight: 'bold' as const, letterSpacing: '3px', cursor: 'pointer', borderRadius: '50px', color: '#999' };