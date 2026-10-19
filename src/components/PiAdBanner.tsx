import { useState } from "react";

export function PiAdBanner() {
  const [msg, setMsg] = useState("");
  const watchAd = () => {
    setMsg("⏳ Loading Ad...");
    setTimeout(() => {
      setMsg("✅ You Watched Ad! Code: KIZAZI10 - Get 10% OFF! Send on WhatsApp!");
      localStorage.setItem("kizazi_discount", "KIZAZI10");
    }, 2500);
  };
  return (
    <div style={{
      background:"linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)",
      border:"2px solid #fbbf24",
      borderRadius:"16px",
      padding:"24px",
      margin:"24px auto",
      maxWidth:"600px",
      textAlign:"center" as const
    }}>
      <h3 style={{color:"#fbbf24", fontSize:"20px", fontWeight:"bold", marginBottom:"8px"}}>🎬 Watch Ad Get 10% OFF</h3>
      <p style={{color:"white", marginBottom:"16px"}}>Watch a short video and get instant booking discount!</p>
      <button onClick={watchAd} style={{background:"#7c3aed", color:"white", padding:"12px 32px", borderRadius:"9999px", fontSize:"18px", border:"none"}}>
        🎬 Watch Ad Now
      </button>
      {msg && <div style={{color:"#4ade80", marginTop:"16px", fontWeight:"bold"}}>{msg}</div>}
    </div>
  );
}
