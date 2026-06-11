import { useLocation, Link } from "react-router-dom";
import { useEffect, useRef } from "react";

function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let pts = [], raf;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const n = Math.floor((canvas.width * canvas.height) / 18000);
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        o: Math.random() * 0.35 + 0.08,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,137,74,${p.o})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: "fixed", top: 0, left: 0,
      width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 0,
    }} />
  );
}

function SectionLabel({ text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#E8894A" }} />
      <span style={{
        fontSize: "10px", fontWeight: "700", letterSpacing: "0.12em",
        textTransform: "uppercase", color: "#E8894A", fontFamily: "Inter, sans-serif",
      }}>{text}</span>
      <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, rgba(232,137,74,0.25), transparent)" }} />
    </div>
  );
}

function Result() {
  const location = useLocation();
  const recommendation = location.state?.recommendation;
  const cardRef = useRef(null);

  const paragraphs = recommendation
    ? recommendation.split("\n").filter(p => p.trim().length > 0)
    : [];

  useEffect(() => {
    const card = cardRef.current;
    const onMove = (e) => {
      const r = card.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const rx = ((e.clientY - cy) / r.height) * 4;
      const ry = -((e.clientX - cx) / r.width) * 4;
      card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    };
    const onLeave = () => { card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)"; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseleave", onLeave); };
  }, []);

  const addRipple = (e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const rip = document.createElement("span");
    const size = Math.max(btn.offsetWidth, btn.offsetHeight);
    Object.assign(rip.style, {
      position: "absolute", borderRadius: "50%",
      width: size + "px", height: size + "px",
      left: e.clientX - rect.left - size / 2 + "px",
      top: e.clientY - rect.top - size / 2 + "px",
      background: "rgba(255,255,255,0.2)",
      animation: "ripple 0.5s ease-out forwards", pointerEvents: "none",
    });
    btn.appendChild(rip);
    setTimeout(() => rip.remove(), 600);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #1C120A; min-height: 100vh; }

        @keyframes orb-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(232,137,74,0.4), 0 8px 24px rgba(232,137,74,0.3); }
          50%      { box-shadow: 0 0 0 12px rgba(232,137,74,0), 0 8px 32px rgba(232,137,74,0.5); }
        }
        @keyframes card-in {
          from { opacity: 0; transform: perspective(1000px) translateY(28px); }
          to   { opacity: 1; transform: perspective(1000px) translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes drawLine {
          from { stroke-dashoffset: 24; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes ripple {
          from { transform: scale(0); opacity: 1; }
          to   { transform: scale(4); opacity: 0; }
        }

        .result-bg {
          min-height: 100vh;
          display: flex; justify-content: center; align-items: flex-start;
          padding: 48px 20px;
          background:
            radial-gradient(ellipse at 15% 15%, rgba(232,137,74,0.08) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 85%, rgba(196,104,48,0.06) 0%, transparent 55%),
            #1C120A;
          font-family: 'Inter', sans-serif;
          position: relative;
        }

        .result-card {
          position: relative; z-index: 2;
          width: 100%; max-width: 520px;
          background: rgba(253,246,236,0.05);
          border: 1px solid rgba(232,137,74,0.18);
          border-radius: 24px; padding: 40px;
          backdrop-filter: blur(24px);
          transition: transform 0.08s ease-out;
          animation: card-in 0.55s cubic-bezier(.4,0,.2,1);
        }
        .result-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(to right, transparent, #E8894A, #F4B07A, transparent);
          border-radius: 24px 24px 0 0;
        }

        .success-orb {
          width: 56px; height: 56px;
          background: linear-gradient(135deg, #C46830, #E8894A, #F4B07A);
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 22px;
          animation: orb-pulse 2.5s ease-in-out infinite;
        }

        .eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #E8894A; margin-bottom: 8px; }
        .result-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 26px; font-weight: 800; color: #FDF6EC; line-height: 1.2; margin-bottom: 6px; letter-spacing: -0.02em; }
        .result-subtitle { font-size: 13px; color: #8B6A4A; margin-bottom: 24px; line-height: 1.6; }

        .progress-strip { display: flex; gap: 6px; margin-bottom: 20px; animation: fadeUp 0.4s 0.2s ease both; }
        .strip-seg { height: 3px; border-radius: 99px; flex: 1; background: linear-gradient(to right, #C46830, #E8894A); }

        .divider { height: 1px; background: linear-gradient(to right, rgba(232,137,74,0.2), transparent); margin-bottom: 24px; }

        .recommendation-box {
          background: rgba(232,137,74,0.06);
          border: 1px solid rgba(232,137,74,0.15);
          border-radius: 14px; padding: 24px; margin-bottom: 28px;
          animation: floatIn 0.5s 0.3s cubic-bezier(.4,0,.2,1) both;
        }

        .rec-para {
          font-size: 14px; color: #C8B49A; line-height: 1.8;
          animation: fadeUp 0.4s ease both;
        }
        .rec-para + .rec-para {
          margin-top: 14px;
          border-top: 1px solid rgba(232,137,74,0.08);
          padding-top: 14px;
        }

        .back-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 24px;
          background: rgba(232,137,74,0.08);
          border: 1.5px solid rgba(232,137,74,0.25);
          border-radius: 12px; color: #E8894A;
          font-size: 14px; font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          text-decoration: none; cursor: pointer;
          transition: all 0.2s ease; letter-spacing: 0.01em;
          position: relative; overflow: hidden;
          animation: fadeUp 0.4s 0.5s ease both;
        }
        .back-btn:hover { background: rgba(232,137,74,0.16); border-color: rgba(232,137,74,0.45); color: #F4B07A; transform: translateX(-3px); }
        .back-btn:active { transform: translateX(0); }

        .checkmark-path {
          stroke-dasharray: 24;
          stroke-dashoffset: 24;
          animation: drawLine 0.5s 0.25s ease forwards;
        }

        @media (max-width: 480px) {
          .result-card { padding: 26px; }
          .result-title { font-size: 22px; }
        }
      `}</style>

      <div className="result-bg">
        <ParticleCanvas />
        <div className="result-card" ref={cardRef}>

          <div className="success-orb">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path className="checkmark-path" d="M5 13l6 6L21 7"
                stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <p className="eyebrow">Your Pathway</p>
          <h1 className="result-title">Academic Recommendation</h1>
          <p className="result-subtitle">Here's a personalized roadmap based on your background and goals.</p>

          <div className="progress-strip">
            {[...Array(6)].map((_, i) => <div key={i} className="strip-seg" />)}
          </div>

          <div className="divider" />

          <div className="recommendation-box">
            <SectionLabel text="Recommendation" />
            {paragraphs.length > 0 ? (
              paragraphs.map((para, i) => (
                <p key={i} className="rec-para" style={{ animationDelay: `${i * 0.1}s` }}>{para}</p>
              ))
            ) : (
              <p className="rec-para" style={{ color: "#6B5040", fontStyle: "italic" }}>
                No recommendation available.
              </p>
            )}
          </div>

          <Link to="/" className="back-btn" onClick={addRipple}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Form
          </Link>

        </div>
      </div>
    </>
  );
}

export default Result;