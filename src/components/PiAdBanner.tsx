import { useState } from "react";

export function PiAdBanner() {
  const [msg, setMsg] = useState("");
  
  const watchAd = () => {
    setMsg("⏳ Inapakia Ad...");
    setTimeout(() => {
      setMsg("✅ Umeona Ad! Code: KIZAZI10 - Pata 10% OFF! Tuma WhatsApp!");
      localStorage.setItem("kizazi_discount","KIZAZI10");
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
      textAlign:"center",
      color:"white"
    }}>
      <h3 style={{color:"#fbbf24", margin:"0 0 8px"}}>🎬 Tazama Ad Pata Punguzo 10%</h3>
      <p style={{margin:"0 0 12px", opacity:0.9}}>Tazama video fupi upate discount ya booking!</p>
      <button onClick={watchAd} style={{
        background:"#7c3aed",
        color:"white",
        border:"none",
        padding:"14px 28px",
        borderRadius:"24px",
        fontWeight:"bold",
        fontSize:"16px",
        cursor:"pointer"
      }}>🎬 Tazama Ad Sasa</button>
      <div style={{marginTop:"12px", fontWeight:"bold"}}>{msg}</div>
    </div>
  );
}
