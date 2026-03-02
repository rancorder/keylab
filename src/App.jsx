import { useState, useEffect } from "react";
import SalesPresentation from "./SalesPresentation.jsx";
import DiagnosisPresentation from "./DiagnosisPresentation.jsx";

/* ─── Simple hash router ─── */
function useHash() {
  const [hash, setHash] = useState(window.location.hash || "#/");
  useEffect(() => {
    const handler = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  return hash;
}

const C = "'Share Tech Mono',monospace";
const F = "'Inter','Noto Sans JP',sans-serif";
const GN = "#059669";
const BL = "#0284c7";
const AM = "#d97706";
const BG = "#f3f6f2";
const TX = "#1a2e20";
const TX2 = "#4b6b55";
const TX3 = "#8a9e8e";
const SF = "#ffffff";

/* ─── Audio ─── */
let _ac = null;
function beep(freq, type, dur, vol) {
  try {
    if (!_ac) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return; _ac = new A(); }
    if (_ac.state === "suspended") _ac.resume();
    const o = _ac.createOscillator(), g = _ac.createGain();
    o.connect(g); g.connect(_ac.destination);
    o.type = type || "sine"; o.frequency.setValueAtTime(freq, _ac.currentTime);
    g.gain.setValueAtTime(vol || 0.05, _ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, _ac.currentTime + dur);
    o.start(); o.stop(_ac.currentTime + dur);
  } catch (_) {}
}
const sfxSelect = () => { beep(440, "sine", 0.08, 0.06); setTimeout(() => beep(660, "sine", 0.12, 0.04), 80); };
const sfxHover  = () => beep(1100, "sine", 0.03, 0.012);

/* ─── Launcher home ─── */
function Launcher() {
  const [hov, setHov] = useState(null);
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 100); }, []);

  const cards = [
    {
      id: "sales",
      hash: "#/sales",
      color: BL,
      icon: "🚀",
      title: "営業プレゼン",
      titleEn: "SALES DECK",
      sub: "サービス紹介・価値提案",
      desc: "無料ユーザーへのサブスク移行提案。POINTQUICの価値を伝える11スライド。",
      slides: "11 slides",
    },
    {
      id: "diagnosis",
      hash: "#/diagnosis",
      color: GN,
      icon: "🩺",
      title: "経営課題診断",
      titleEn: "MANAGEMENT DIAGNOSIS",
      sub: "機能利用チェック＋改善提案",
      desc: "無料ユーザーの利用状況を診断し、経営改善の明るい未来を示す11スライド。",
      slides: "11 slides",
    },
  ];

  return (
    <div style={{ width: "100vw", height: "100vh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: F, position: "fixed", inset: 0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Noto+Sans+JP:wght@400;700;900&family=Inter:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glowPulse { 0%,100% { opacity: .5 } 50% { opacity: 1 } }
      `}</style>

      {/* Header */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 48, padding: "0 24px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(0,0,0,.08)", background: "rgba(243,246,242,.94)", backdropFilter: "blur(10px)", zIndex: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: GN, boxShadow: `0 0 8px ${GN}`, animation: "glowPulse 2.5s ease-in-out infinite" }} />
        <span style={{ fontFamily: C, fontSize: ".65rem", color: GN, letterSpacing: ".16em" }}>POINTQUIC</span>
        <span style={{ fontFamily: C, fontSize: ".56rem", color: TX3, letterSpacing: ".1em" }}>PRESENTATION HUB</span>
      </div>

      {/* Main */}
      <div style={{ textAlign: "center", maxWidth: 640, padding: "0 24px", opacity: vis ? 1 : 0, transition: "opacity .6s" }}>
        {/* Logo / Title */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontFamily: C, fontSize: ".65rem", color: TX3, letterSpacing: ".2em", marginBottom: ".6rem" }}>SELECT PRESENTATION</div>
          <div style={{ fontFamily: F, fontWeight: 900, fontSize: "clamp(1.6rem,5vw,2.6rem)", color: TX, lineHeight: 1.1, letterSpacing: "-.02em" }}>
            商談プレゼン<br />
            <span style={{ color: GN }}>どちらを使いますか？</span>
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: "2rem" }}>
          {cards.map((card, i) => (
            <a
              key={card.id}
              href={card.hash}
              onClick={() => sfxSelect()}
              onMouseEnter={() => { setHov(card.id); sfxHover(); }}
              onMouseLeave={() => setHov(null)}
              style={{
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                padding: "clamp(1rem,3vw,1.4rem)",
                background: SF,
                border: `1.5px solid ${hov === card.id ? card.color + "70" : "rgba(0,0,0,.09)"}`,
                borderRadius: 12,
                cursor: "pointer",
                transform: hov === card.id ? "translateY(-4px) scale(1.015)" : "translateY(0) scale(1)",
                boxShadow: hov === card.id ? `0 10px 32px ${card.color}22, 0 2px 8px rgba(0,0,0,.08)` : "0 2px 8px rgba(0,0,0,.06)",
                transition: "transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .2s, border-color .2s",
                animation: `fadeUp .4s ${i * .12}s both`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: "1.8rem" }}>{card.icon}</div>
                <span style={{ fontFamily: C, fontSize: ".58rem", padding: "2px 8px", background: `${card.color}14`, border: `1px solid ${card.color}35`, color: card.color, borderRadius: 3 }}>{card.slides}</span>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontFamily: C, fontSize: ".55rem", color: `${card.color}70`, letterSpacing: ".12em", marginBottom: 3 }}>{card.titleEn}</div>
                <div style={{ fontFamily: F, fontWeight: 800, fontSize: "clamp(.95rem,2.5vw,1.1rem)", color: TX, marginBottom: 3 }}>{card.title}</div>
                <div style={{ fontFamily: F, fontSize: ".75rem", color: card.color, fontWeight: 600, marginBottom: 5 }}>{card.sub}</div>
                <div style={{ fontFamily: F, fontSize: ".75rem", color: TX2, lineHeight: 1.6 }}>{card.desc}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, fontFamily: C, fontSize: ".62rem", color: hov === card.id ? card.color : TX3, transition: "color .2s" }}>
                開く <span style={{ transition: "transform .2s", transform: hov === card.id ? "translateX(4px)" : "none" }}>→</span>
              </div>
            </a>
          ))}
        </div>

        {/* Usage hint */}
        <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
          {[
            { icon: "⌨️", text: "← → キーで操作" },
            { icon: "👆", text: "スワイプで操作" },
            { icon: "🖱️", text: "NEXTボタンで操作" },
          ].map(h => (
            <div key={h.text} style={{ fontFamily: C, fontSize: ".58rem", color: TX3, display: "flex", alignItems: "center", gap: 4 }}>
              <span>{h.icon}</span>{h.text}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 40, display: "flex", alignItems: "center", justifyContent: "center", borderTop: "1px solid rgba(0,0,0,.07)", background: "rgba(243,246,242,.9)" }}>
        <span style={{ fontFamily: C, fontSize: ".56rem", color: TX3, letterSpacing: ".12em" }}>KEYLAB inc. / POINTQUIC — pointquic.tokyo</span>
      </div>
    </div>
  );
}

/* ─── Root router ─── */
export default function App() {
  const hash = useHash();

  if (hash.startsWith("#/sales"))     return <SalesPresentation />;
  if (hash.startsWith("#/diagnosis")) return <DiagnosisPresentation />;
  return <Launcher />;
}
