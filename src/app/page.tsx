"use client";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div style={{ backgroundColor: '#fdfcf8', minHeight: '100vh', width: '100%' }}>
      <Navbar />
      
      <main style={{ padding: '280px 20px 100px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <section style={{ maxWidth: '900px', width: '100%', textAlign: 'center' }}>
          
          {/* Hero Section */}
          <motion.header initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }}>
            <div style={{ width: '1px', height: '100px', backgroundColor: '#b39359', margin: '0 auto 60px', opacity: 0.4 }} />
            <h1 style={{ fontSize: 'clamp(3.5rem, 8vw, 90px)', fontFamily: 'serif', fontWeight: '400', margin: 0, lineHeight: '0.9', letterSpacing: '-4px', color: '#111' }}>
              Exploring <br />
              <span style={{ fontStyle: 'italic', color: '#b39359', opacity: 0.8 }}>Existential Faith.</span>
            </h1>
            <div style={{ marginTop: '100px' }}>
              <p style={{ fontSize: '30px', fontStyle: 'italic', color: '#666', lineHeight: '1.6', fontWeight: '300', maxWidth: '700px', margin: '0 auto' }}>
                "For I do not seek to understand that I may believe, but I believe in order to understand."
              </p>
              <p style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '6px', color: '#bbb', textTransform: 'uppercase', marginTop: '40px' }}>
                — Anselm of Canterbury
              </p>
            </div>
          </motion.header>

          {/* Bio Section */}
          <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.5 }} style={{ marginTop: '180px', borderTop: '1px solid #eee', paddingTop: '120px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '50px' }}>
              <motion.div animate={{ rotate: [0, 2, -2, 0] }} transition={{ repeat: Infinity, duration: 8 }} style={{ width: '240px', height: '240px', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', overflow: 'hidden', border: '2px solid #b39359', boxShadow: '0 20px 40px rgba(179, 147, 89, 0.1)' }}>
                <img src="/me.jpg" alt="Phindile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </motion.div>
              
              <div style={{ textAlign: 'left', maxWidth: '700px' }}>
                <h3 style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '4px', color: '#b39359', textTransform: 'uppercase', marginBottom: '25px' }}>A Note from Phindile</h3>
                <p style={{ fontSize: '22px', fontFamily: 'serif', lineHeight: '1.8', color: '#333' }}>
                  I created <strong>WhyGodWhy</strong> because my brain doesn't have an 'off' switch. Between training machine learning models and trying to figure out if my code or my soul has more bugs, I found myself constantly asking the "How" and the "Why."
                </p>
                <p style={{ fontSize: '22px', fontFamily: 'serif', lineHeight: '1.8', color: '#333', marginTop: '30px' }}>
                  I’m Phindile Sandi—a tech enthusiast with a deep love for Jesus and a very high tolerance for existential dread. Let's ask the hard questions together.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Footer Signature */}
          <footer style={{ marginTop: '200px', paddingBottom: '100px' }}>
            <div style={{ width: '40px', height: '1px', backgroundColor: '#b39359', margin: '0 auto 40px', opacity: 0.3 }} />
            <span style={{ fontSize: '10px', letterSpacing: '8px', color: '#ccc', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Digitally Handcrafted By</span>
            <span style={{ fontSize: '32px', fontFamily: 'serif', fontStyle: 'italic', fontWeight: 'bold', color: '#111' }}>Phindile Sandi</span>
          </footer>
        </section>
      </main>
    </div>
  );
}