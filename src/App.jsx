import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Activity, Upload, Pill, FolderClock, Stethoscope, Newspaper,
  Plus, Trash2, RefreshCw, Send, FileText, Image as ImageIcon,
  Download, Sun, Moon, AlertTriangle, CheckCircle2, Loader2, User, Camera
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ReferenceLine
} from "recharts";

/* ------------------------------------------------------------------ */
/* Design tokens — white background, dark text, status colors kept    */
/* ------------------------------------------------------------------ */
const T = {
  bg: "#F7F8FA",        // app background (soft white)
  panel: "#FFFFFF",     // card white
  panelSoft: "#EEF1F6", // raised soft
  line: "#E1E5EC",      // hairline
  gold: "#A07C2C",      // accent (darkened for white bg)
  goldBright: "#C9A24B",
  text: "#16202F",      // near black
  dim: "#5C6B82",
  green: "#179A52",
  yellow: "#C78A00",
  red: "#D6453C",
};

const STATUS = {
  green: { color: T.green, label: "GOOD" },
  yellow: { color: T.yellow, label: "WATCH" },
  red: { color: T.red, label: "CRITICAL" },
};

const PROFILE = { name: "Mikail Kocak", dob: "1979-07-23", dobLabel: "July 23, 1979" };
function ageNow() {
  const b = new Date(1979, 6, 23);
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n.getMonth() < 6 || (n.getMonth() === 6 && n.getDate() < 23)) a--;
  return a;
}

/* ------------------------------------------------------------------ */
/* Clinical categorization (ADA / AHA standard ranges)                */
/* ------------------------------------------------------------------ */
function glucoseStatus(v) {
  const n = Number(v);
  if (!n || isNaN(n)) return "yellow";
  if (n < 70) return "red";
  if (n <= 99) return "green";
  if (n <= 125) return "yellow";
  return "red";
}
function bpStatus(sys, dia) {
  const s = Number(sys), d = Number(dia);
  if (!s || !d) return "yellow";
  if (s >= 140 || d >= 90) return "red";
  if (s >= 120 || d >= 80) return "yellow";
  return "green";
}
function worst(list) {
  if (list.includes("red")) return "red";
  if (list.includes("yellow")) return "yellow";
  return "green";
}

/* ------------------------------------------------------------------ */
/* Storage                                                            */
/* ------------------------------------------------------------------ */
const KEY = "mk-health-center-v1";
const EMPTY = { readings: [], labs: [], meds: [], docs: [], chat: [], news: null, photo: null };

async function loadAll() {
  try {
    const v = localStorage.getItem(KEY);
    return v ? { ...EMPTY, ...JSON.parse(v) } : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}
async function saveAll(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { console.error("save failed", e); }
}

/* ------------------------------------------------------------------ */
/* Anthropic API helpers                                              */
/* ------------------------------------------------------------------ */
async function callClaude(messages, tools) {
  const body = { model: "claude-3-5-sonnet-20241022", max_tokens: 1000, messages };
  if (tools) body.tools = tools;
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("API error " + res.status);
  const data = await res.json();
  return (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
}
function parseJSON(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found");
  return JSON.parse(clean.slice(start, end + 1));
}
function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });
}
function resizePhoto(file, size = 200) {
  return new Promise((res, rej) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = size; c.height = size;
      const ctx = c.getContext("2d");
      const m = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, size, size);
      URL.revokeObjectURL(url);
      res(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("Image load failed")); };
    img.src = url;
  });
}

/* ------------------------------------------------------------------ */
/* Small UI pieces                                                    */
/* ------------------------------------------------------------------ */
function StatusDot({ status, size = 10 }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size, borderRadius: "50%",
      background: STATUS[status]?.color || T.dim,
      boxShadow: `0 0 ${size * 0.8}px ${STATUS[status]?.color || T.dim}55`
    }} />
  );
}
function Panel({ children, style }) {
  return (
    <div style={{
      background: T.panel, border: `1px solid ${T.line}`,
      borderRadius: 14, padding: 18, boxShadow: "0 1px 3px rgba(22,32,47,0.05)", ...style
    }}>{children}</div>
  );
}
function Eyebrow({ children }) {
  return (
    <div style={{
      fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
      color: T.gold, fontWeight: 700, marginBottom: 8
    }}>{children}</div>
  );
}
function Btn({ children, onClick, disabled, kind = "gold", style }) {
  const bg = kind === "gold" ? T.goldBright : kind === "ghost" ? "transparent" : T.panelSoft;
  const fg = kind === "gold" ? "#FFFFFF" : T.text;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: bg, color: fg, border: kind === "ghost" ? `1px solid ${T.line}` : "none",
      borderRadius: 10, padding: "10px 16px", fontWeight: 600, fontSize: 13,
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
      display: "inline-flex", alignItems: "center", gap: 8, ...style
    }}>{children}</button>
  );
}
const inputStyle = {
  background: "#FFFFFF", border: `1px solid ${T.line}`, borderRadius: 10,
  color: T.text, padding: "10px 12px", fontSize: 14, outline: "none", width: "100%"
};

/* ================================================================== */
/* MAIN APP                                                           */
/* ================================================================== */
export default function HealthCommandCenter() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const photoRef = useRef(null);

  useEffect(() => { loadAll().then(setData); }, []);

  const update = useCallback((fn) => {
    setData(prev => {
      const next = fn(structuredClone(prev));
      saveAll(next);
      return next;
    });
  }, []);

  async function pickPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizePhoto(file);
      update(d => { d.photo = dataUrl; return d; });
    } catch (err) { console.error(err); }
    if (photoRef.current) photoRef.current.value = "";
  }

  if (!data) {
    return (
      <div style={{ background: T.bg, minHeight: 480, display: "flex", alignItems: "center", justifyContent: "center", color: T.dim, fontFamily: "system-ui" }}>
        <Loader2 size={20} style={{ marginRight: 8 }} className="spin" /> Loading your health center…
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "upload", label: "Upload Labs", icon: Upload },
    { id: "meds", label: "Medications", icon: Pill },
    { id: "history", label: "History", icon: FolderClock },
    { id: "doctor", label: "AI Doctor", icon: Stethoscope },
    { id: "news", label: "Health News", icon: Newspaper },
  ];

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::placeholder { color: ${T.dim}99; }
        button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible { outline: 2px solid ${T.goldBright}; outline-offset: 2px; }
      `}</style>

      {/* Header with personal profile */}
      <div style={{ padding: "20px 20px 0", maxWidth: 980, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, margin: 0, fontWeight: 600 }}>
              Health <span style={{ color: T.gold }}>Command Center</span>
            </h1>
            <div style={{ marginTop: 6, display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{PROFILE.name}</span>
              <span style={{ fontSize: 13, color: T.dim }}>Born {PROFILE.dobLabel} · {ageNow()} years</span>
            </div>
          </div>

          {/* Profile photo */}
          <input ref={photoRef} type="file" accept="image/*" onChange={pickPhoto} style={{ display: "none" }} />
          <button onClick={() => photoRef.current?.click()} aria-label="Change profile photo" style={{
            width: 72, height: 72, borderRadius: "50%", padding: 0, cursor: "pointer",
            border: `3px solid ${T.goldBright}`, background: T.panelSoft, overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            boxShadow: "0 2px 8px rgba(22,32,47,0.12)", position: "relative"
          }}>
            {data.photo
              ? <img src={data.photo} alt="Mikail Kocak" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ display: "flex", flexDirection: "column", alignItems: "center", color: T.dim }}>
                  <Camera size={20} />
                  <span style={{ fontSize: 9, marginTop: 2 }}>Add photo</span>
                </span>}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginTop: 16, overflowX: "auto", paddingBottom: 2 }}>
          {tabs.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                background: active ? "#FFFFFF" : "transparent",
                border: `1px solid ${active ? T.goldBright : T.line}`,
                color: active ? T.gold : T.dim,
                borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 7, cursor: "pointer", whiteSpace: "nowrap"
              }}>
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: 20, display: "grid", gap: 16 }}>
        {tab === "dashboard" && <Dashboard data={data} />}
        {tab === "upload" && <UploadTab data={data} update={update} />}
        {tab === "meds" && <MedsTab data={data} update={update} />}
        {tab === "history" && <HistoryTab data={data} update={update} />}
        {tab === "doctor" && <DoctorTab data={data} update={update} />}
        {tab === "news" && <NewsTab data={data} update={update} />}

        <div style={{ fontSize: 11, color: T.dim, textAlign: "center", padding: "8px 0 20px", lineHeight: 1.5 }}>
          This app is for personal tracking and general information only — it is not medical advice,
          diagnosis, or treatment. Always
