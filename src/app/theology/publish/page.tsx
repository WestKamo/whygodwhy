"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function TheologyEditor() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", content: "", category: "Systematic", img: "" });
  const [isSaving, setIsSaving] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handlePublish = async () => {
    setIsSaving(true);
    const { error } = await supabase.from("articles").insert([{ ...form, is_published: true }]);
    if (!error) {
      alert("Treatise Published to the Library.");
      router.push("/theology");
    }
    setIsSaving(false);
  };

  return (
    <div style={{ backgroundColor: '#fdfcf8', minHeight: '100vh', display: 'flex' }}>
      {/* 1. Left Sidebar: Metadata & Controls */}
      <aside style={{ width: '350px', borderRight: '1px solid #eee', padding: '60px 40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        <div>
          <button onClick={() => router.push("/theology")} style={{ background: 'none', border: 'none', fontSize: '10px', letterSpacing: '3px', color: '#ccc', cursor: 'pointer' }}>
            ← EXIT TO LIBRARY
          </button>
        </div>

        <div>
          <label style={labelStyle}>Category</label>
          <select 
            onChange={e => setForm({...form, category: e.target.value})}
            style={inputStyle}
          >
            <option>Systematic Theology</option>
            <option>Existentialism</option>
            <option>Christology</option>
            <option>Ecclesiology</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Cover Atmosphere (URL)</label>
          <input 
            placeholder="https://images.unsplash.com/..." 
            onChange={e => setForm({...form, img: e.target.value})}
            style={inputStyle} 
          />
        </div>

        <button 
          onClick={handlePublish}
          disabled={isSaving}
          style={{ 
            marginTop: 'auto', padding: '20px', background: '#111', color: '#fff', 
            border: 'none', fontWeight: 'bold', letterSpacing: '4px', cursor: 'pointer',
            opacity: isSaving ? 0.5 : 1
          }}
        >
          {isSaving ? "SYNCING..." : "PUBLISH TREATISE"}
        </button>
      </aside>

      {/* 2. Main Editor: Zen Mode */}
      <main style={{ flex: 1, padding: '100px 100px' }}>
        <input 
          placeholder="Title of the Inquiry..."
          onChange={e => setForm({...form, title: e.target.value})}
          style={{ 
            width: '100%', fontSize: '64px', fontFamily: 'serif', border: 'none', 
            background: 'none', outline: 'none', color: '#111', marginBottom: '50px' 
          }} 
        />
        
        <textarea 
          placeholder="Begin the treatise here..."
          onChange={e => setForm({...form, content: e.target.value})}
          style={{ 
            width: '100%', height: '60vh', fontSize: '22px', fontFamily: 'serif', 
            lineHeight: '1.8', border: 'none', background: 'none', outline: 'none', 
            color: '#444', resize: 'none' 
          }}
        />
      </main>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '9px', fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase' as const, color: '#b39359', marginBottom: '15px' };
const inputStyle = { width: '100%', padding: '15px', background: '#fff', border: '1px solid #eee', fontSize: '14px', outline: 'none' };