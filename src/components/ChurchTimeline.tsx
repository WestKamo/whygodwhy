"use client";

const history = [
  { date: "33 AD", event: "Resurrection" },
  { date: "325 AD", event: "Nicaea" },
  { date: "1054 AD", event: "Schism" },
  { date: "1517 AD", event: "Reformation" },
  { date: "1962 AD", event: "Vatican II" },
  { date: "Now", event: "Witness" }
];

export default function ChurchTimeline() {
  return (
    <div style={{ width: '100%', padding: '8px 0 12px', backgroundColor: '#fdfcf8' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '12px', left: '20px', right: '20px', height: '1px', backgroundColor: '#b39359', opacity: 0.15 }} />
        {history.map((h, i) => (
          <div key={i} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
            <div style={{ width: '5px', height: '5px', backgroundColor: '#b39359', borderRadius: '50%', marginBottom: '5px' }} />
            <span style={{ fontSize: '8px', fontWeight: 'bold', letterSpacing: '1px', color: '#b39359' }}>{h.date}</span>
            <span style={{ fontSize: '7px', textTransform: 'uppercase', color: '#bbb', letterSpacing: '0.5px' }}>{h.event}</span>
          </div>
        ))}
      </div>
    </div>
  );
}