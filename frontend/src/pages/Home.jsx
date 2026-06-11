import { useState, useEffect, useRef } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

/* ─── Particle canvas background ─────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let pts = [];
    let raf;

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
        o: Math.random() * 0.4 + 0.1,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
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

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

/* ─── Floating label input ────────────────────────────────────────── */
function FloatingInput({ label, type = "text", name, value, onChange, required }) {
  const [focused, setFocused] = useState(false);
  const hasValue = value !== "" && value !== undefined && value !== null;
  const raised = focused || hasValue;

  return (
    <div style={{ position: "relative", marginBottom: "18px" }}>
      <label
        style={{
          position: "absolute",
          left: "14px",
          top: raised ? "-9px" : "15px",
          fontSize: raised ? "10px" : "14px",
          fontWeight: raised ? "700" : "400",
          color: focused ? "#F4B07A" : raised ? "#E8894A" : "rgba(253,246,236,0.35)",
          background: raised ? "#251A0E" : "transparent",
          padding: raised ? "0 6px" : "0",
          borderRadius: "4px",
          transition: "all 0.22s cubic-bezier(.4,0,.2,1)",
          pointerEvents: "none",
          letterSpacing: raised ? "0.08em" : "0",
          textTransform: raised ? "uppercase" : "none",
          zIndex: 1,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        style={{
          width: "100%",
          background: "rgba(253,246,236,0.04)",
          border: `1.5px solid ${focused ? "#E8894A" : "rgba(253,246,236,0.08)"}`,
          borderRadius: "12px",
          padding: "15px 14px",
          color: "#FDF6EC",
          fontSize: "14px",
          fontFamily: "Inter, sans-serif",
          outline: "none",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          boxShadow: focused ? "0 0 0 3px rgba(232,137,74,0.12)" : "none",
          boxSizing: "border-box",
          WebkitAppearance: "none",
        }}
      />
    </div>
  );
}

/* ─── Custom select ───────────────────────────────────────────────── */
function CustomSelect({ label, name, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const hasValue = !!value;
  const raised = open || hasValue;
  const selectedLabel = options.find((o) => o.value === value)?.label || "";

  const handleSelect = (optValue) => {
    onChange({ target: { name, value: optValue } });
    setOpen(false);
  };

  return (
    <div style={{ position: "relative", marginBottom: "18px" }}>
      <label
        style={{
          position: "absolute",
          left: "14px",
          top: raised ? "-9px" : "15px",
          fontSize: raised ? "10px" : "14px",
          fontWeight: raised ? "700" : "400",
          color: open ? "#F4B07A" : raised ? "#E8894A" : "rgba(253,246,236,0.35)",
          background: raised ? "#251A0E" : "transparent",
          padding: raised ? "0 6px" : "0",
          borderRadius: "4px",
          transition: "all 0.22s cubic-bezier(.4,0,.2,1)",
          pointerEvents: "none",
          letterSpacing: raised ? "0.08em" : "0",
          textTransform: raised ? "uppercase" : "none",
          zIndex: 10,
        }}
      >
        {label}
      </label>
      <div
        onClick={() => setOpen((o) => !o)}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen((o) => !o);
          if (e.key === "Escape") setOpen(false);
        }}
        style={{
          width: "100%",
          background: "rgba(253,246,236,0.04)",
          border: `1.5px solid ${open ? "#E8894A" : "rgba(253,246,236,0.08)"}`,
          borderRadius: open ? "12px 12px 0 0" : "12px",
          padding: "15px 40px 15px 14px",
          color: hasValue ? "#FDF6EC" : "transparent",
          fontSize: "14px",
          fontFamily: "Inter, sans-serif",
          outline: "none",
          cursor: "pointer",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          boxShadow: open ? "0 0 0 3px rgba(232,137,74,0.12)" : "none",
          userSelect: "none",
          minHeight: "50px",
          display: "flex",
          alignItems: "center",
          position: "relative",
        }}
      >
        {selectedLabel || "\u00A0"}
        <div
          style={{
            position: "absolute",
            right: "14px",
            top: "50%",
            transform: `translateY(-50%) rotate(${open ? "180deg" : "0deg"})`,
            transition: "transform 0.2s ease, color 0.2s",
            color: open ? "#E8894A" : "rgba(253,246,236,0.3)",
            display: "flex",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {open && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "-1.5px",
              right: "-1.5px",
              background: "#2A1C0E",
              border: "1.5px solid #E8894A",
              borderTop: "none",
              borderRadius: "0 0 12px 12px",
              zIndex: 100,
              overflow: "hidden",
              boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
              animation: "ddIn 0.15s ease",
            }}
          >
            {options.map((opt, i) => (
              <div
                key={opt.value}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(opt.value); }}
                style={{
                  padding: "12px 16px",
                  fontSize: "14px",
                  color: value === opt.value ? "#F4B07A" : "#FDF6EC",
                  background: value === opt.value ? "rgba(232,137,74,0.12)" : "transparent",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: value === opt.value ? "600" : "400",
                  borderTop: i > 0 ? "1px solid rgba(253,246,236,0.04)" : "none",
                  transition: "background 0.12s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(232,137,74,0.1)")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    value === opt.value ? "rgba(232,137,74,0.12)" : "transparent")
                }
              >
                {opt.label}
                {value === opt.value && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l4 4 6-6" stroke="#E8894A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Section label ───────────────────────────────────────────────── */
function SectionLabel({ text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "20px 0 16px" }}>
      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#E8894A" }} />
      <span
        style={{
          fontSize: "10px",
          fontWeight: "700",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#E8894A",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {text}
      </span>
      <div
        style={{
          flex: 1,
          height: "1px",
          background: "linear-gradient(to right, rgba(232,137,74,0.25), transparent)",
        }}
      />
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────────────── */
function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const cardRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "", email: "", qualification: "",
    experience: "", profession: "", careerGoal: "",
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await API.post("/submit", formData);
      navigate("/result", { state: { recommendation: res.data.recommendation } });
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* Subtle 3-D tilt on mouse move */
  useEffect(() => {
    const card = cardRef.current;
    const onMove = (e) => {
      const r = card.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const rx = ((e.clientY - cy) / r.height) * 4;
      const ry = -((e.clientX - cx) / r.width) * 4;
      card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    };
    const onLeave = () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  /* Ripple on button click */
  const addRipple = (e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const rip = document.createElement("span");
    const size = Math.max(btn.offsetWidth, btn.offsetHeight);
    Object.assign(rip.style, {
      position: "absolute",
      borderRadius: "50%",
      width: size + "px",
      height: size + "px",
      left: e.clientX - rect.left - size / 2 + "px",
      top: e.clientY - rect.top - size / 2 + "px",
      background: "rgba(255,255,255,0.25)",
      animation: "ripple 0.5s ease-out forwards",
      pointerEvents: "none",
    });
    btn.appendChild(rip);
    setTimeout(() => rip.remove(), 600);
  };

  const completedFields = Object.values(formData).filter(Boolean).length;
  const progress = (completedFields / 6) * 100;

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
        @keyframes ddIn {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ripple {
          from { transform: scale(0); opacity: 1; }
          to   { transform: scale(4); opacity: 0; }
        }
        @keyframes card-in {
          from { opacity: 0; transform: perspective(1000px) translateY(24px); }
          to   { opacity: 1; transform: perspective(1000px) translateY(0); }
        }

        .page-bg {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 20px;
          font-family: 'Inter', sans-serif;
          position: relative;
          background: #1C120A;
        }

        .card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 500px;
          background: rgba(253,246,236,0.05);
          border: 1px solid rgba(232,137,74,0.18);
          border-radius: 24px;
          padding: 40px;
          backdrop-filter: blur(24px);
          transition: transform 0.08s ease-out;
          animation: card-in 0.5s cubic-bezier(.4,0,.2,1);
        }
        .card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(to right, transparent, #E8894A, #F4B07A, transparent);
          border-radius: 24px 24px 0 0;
        }

        .compass-orb {
          width: 56px; height: 56px;
          background: linear-gradient(135deg, #C46830, #E8894A, #F4B07A);
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 22px;
          animation: orb-pulse 2.5s ease-in-out infinite;
        }

        .title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 26px; font-weight: 800;
          color: #FDF6EC;
          line-height: 1.2; margin-bottom: 6px;
          letter-spacing: -0.02em;
        }
        .subtitle { font-size: 13px; color: #8B6A4A; margin-bottom: 24px; line-height: 1.6; }

        .prog-wrap {
          background: rgba(255,255,255,0.06);
          border-radius: 99px; height: 5px;
          margin-bottom: 28px; overflow: visible; position: relative;
        }
        .prog-fill {
          height: 100%; border-radius: 99px;
          background: linear-gradient(to right, #C46830, #E8894A, #F4B07A);
          transition: width 0.5s cubic-bezier(.4,0,.2,1);
          position: relative;
        }
        .prog-fill::after {
          content: '';
          position: absolute; right: -1px; top: 50%;
          transform: translateY(-50%);
          width: 8px; height: 8px;
          background: #F4B07A; border-radius: 50%;
          box-shadow: 0 0 8px #E8894A;
          display: ${progress > 0 ? "block" : "none"};
        }

        .submit-btn {
          width: 100%; padding: 16px; border: none; border-radius: 14px;
          background: linear-gradient(135deg, #C46830 0%, #E8894A 50%, #F4B07A 100%);
          color: #1A0F00; font-size: 15px; font-weight: 800;
          font-family: 'Plus Jakarta Sans', sans-serif;
          letter-spacing: 0.01em; cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          position: relative; overflow: hidden; margin-top: 8px;
        }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(232,137,74,0.45); }
        .submit-btn:active:not(:disabled) { transform: translateY(0); box-shadow: none; }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .spinner {
          display: inline-block; width: 14px; height: 14px;
          border: 2px solid rgba(26,15,0,0.25); border-top-color: #1A0F00;
          border-radius: 50%; animation: spin 0.7s linear infinite;
          margin-right: 8px; vertical-align: middle;
        }

        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        @media (max-width: 480px) {
          .card { padding: 26px; }
          .field-row { grid-template-columns: 1fr; gap: 0; }
          .title { font-size: 22px; }
        }
      `}</style>

      <div className="page-bg">
        <ParticleCanvas />
        <div className="card" ref={cardRef}>
          <div className="compass-orb">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path
                d="M14 3L17.5 10.5L26 12L20 18L21.5 26L14 22L6.5 26L8 18L2 12L10.5 10.5L14 3Z"
                fill="rgba(26,15,0,0.85)"
                stroke="rgba(26,15,0,0.4)"
                strokeWidth="0.5"
              />
            </svg>
          </div>

          <h1 className="title">Chart Your Academic Path</h1>
          <p className="subtitle">
            A few answers. One personalized roadmap to where you want to be.
          </p>

          <div className="prog-wrap">
            <div className="prog-fill" style={{ width: `${progress}%` }} />
          </div>

          <form onSubmit={handleSubmit}>
            <SectionLabel text="Personal Info" />
            <div className="field-row">
              <FloatingInput label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
              <FloatingInput label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>

            <SectionLabel text="Background" />
            <div className="field-row">
              <CustomSelect
                label="Highest Qualification"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                options={[
                  { value: "12th", label: "12th Grade" },
                  { value: "Diploma", label: "Diploma" },
                  { value: "Bachelor", label: "Bachelor's" },
                  { value: "Master", label: "Master's" },
                  { value: "PhD", label: "PhD" },
                ]}
              />
              <FloatingInput
                label="Years Experience"
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
              />
            </div>
            <FloatingInput label="Current Profession" name="profession" value={formData.profession} onChange={handleChange} required />

            <SectionLabel text="Your Goal" />
            <FloatingInput label="Where do you want to be?" name="careerGoal" value={formData.careerGoal} onChange={handleChange} required />

            <button
              type="submit"
              className="submit-btn"
              disabled={loading || completedFields < 6}
              onClick={!loading ? addRipple : undefined}
            >
              {loading ? (
                <><span className="spinner" />Generating your pathway…</>
              ) : (
                "Get My Recommendation →"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Home;