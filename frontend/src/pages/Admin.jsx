import { useEffect, useState, useRef } from "react";
import API from "../services/api";

/* ─── Particle canvas (same as Home) ───────────────────────────── */
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
    resize(); draw();
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

function Admin() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");
  const [removing, setRemoving] = useState(new Set());

  useEffect(() => {
    API.get("/submissions")
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this submission?")) return;
    setRemoving((prev) => new Set(prev).add(id));
    try {
      await API.delete(`/submissions/${id}`);
      setTimeout(() => {
        setData((prev) => prev.filter((item) => item.id !== id));
        setRemoving((prev) => { const s = new Set(prev); s.delete(id); return s; });
      }, 300);
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
      setRemoving((prev) => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  const filtered = data.filter(
    (item) =>
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.email?.toLowerCase().includes(search.toLowerCase()) ||
      item.career_goal?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #1C120A; min-height: 100vh; }

        .admin-bg {
          min-height: 100vh;
          background: #1C120A;
          padding: 48px 32px;
          font-family: 'Inter', sans-serif;
          position: relative;
        }

        .admin-inner { position: relative; z-index: 1; }

        .admin-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 32px;
        }

        /* Orb — matches Home's compass orb */
        .header-icon {
          width: 50px; height: 50px;
          background: linear-gradient(135deg, #C46830, #E8894A, #F4B07A);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 14px;
          animation: orb-pulse 2.5s ease-in-out infinite;
        }

        @keyframes orb-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(232,137,74,0.4), 0 8px 24px rgba(232,137,74,0.3); }
          50%      { box-shadow: 0 0 0 12px rgba(232,137,74,0), 0 8px 32px rgba(232,137,74,0.5); }
        }

        .eyebrow {
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #E8894A; margin-bottom: 4px;
        }

        .admin-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 28px; font-weight: 800;
          color: #FDF6EC; letter-spacing: -0.02em;
          margin-bottom: 4px;
        }

        .admin-subtitle { font-size: 13px; color: #8B6A4A; }

        .badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px;
          background: rgba(232,137,74,0.1);
          border: 1px solid rgba(232,137,74,0.25);
          border-radius: 99px;
          font-size: 12px; font-weight: 600; color: #E8894A;
          font-family: 'Inter', sans-serif;
        }

        .badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #E8894A;
          animation: blink 2s ease-in-out infinite;
        }

        @keyframes blink {
          0%,100% { opacity: 1; } 50% { opacity: 0.25; }
        }

        /* Search */
        .search-wrap { position: relative; margin-bottom: 20px; max-width: 360px; }

        .search-icon {
          position: absolute; left: 12px; top: 50%;
          transform: translateY(-50%);
          color: #8B6A4A; pointer-events: none;
        }

        .search-input {
          width: 100%;
          background: rgba(253,246,236,0.04);
          border: 1.5px solid rgba(232,137,74,0.15);
          border-radius: 10px;
          padding: 11px 14px 11px 38px;
          color: #FDF6EC; font-size: 13px;
          font-family: 'Inter', sans-serif; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .search-input::placeholder { color: #5A4030; }
        .search-input:focus {
          border-color: #E8894A;
          box-shadow: 0 0 0 3px rgba(232,137,74,0.15);
        }

        /* Table card */
        .table-card {
          background: rgba(253,246,236,0.03);
          border: 1px solid rgba(232,137,74,0.12);
          border-radius: 18px;
          overflow: hidden;
          position: relative;
        }

        .table-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(to right, transparent, rgba(232,137,74,0.55), transparent);
        }

        table { width: 100%; border-collapse: collapse; }

        thead tr {
          background: rgba(232,137,74,0.05);
          border-bottom: 1px solid rgba(232,137,74,0.1);
        }

        th {
          padding: 13px 20px;
          text-align: left; font-size: 10px;
          font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: #8B6A4A;
          font-family: 'Inter', sans-serif; white-space: nowrap;
        }

        tbody tr {
          border-bottom: 1px solid rgba(253,246,236,0.04);
          cursor: pointer;
          transition: background 0.2s ease, opacity 0.3s ease, transform 0.3s ease;
          opacity: 0; transform: translateY(8px);
          animation: rowIn 0.4s ease forwards;
        }

        @keyframes rowIn { to { opacity: 1; transform: translateY(0); } }

        tbody tr.removing {
          opacity: 0 !important;
          transform: translateX(20px) !important;
          transition: opacity 0.3s ease, transform 0.3s ease !important;
        }

        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: rgba(232,137,74,0.06); }

        td {
          padding: 15px 20px; font-size: 13px;
          color: #D4C9BC;
          font-family: 'Inter', sans-serif; vertical-align: top;
        }

        .td-serial { color: #5A4030; font-size: 12px; font-weight: 600; width: 48px; }
        .td-name { font-weight: 600; color: #FDF6EC; font-size: 14px; }
        .td-email { color: #8B6A4A; font-size: 12px; }
        .td-goal { max-width: 180px; }

        .goal-pill {
          display: inline-block;
          background: rgba(232,137,74,0.1);
          border: 1px solid rgba(232,137,74,0.22);
          color: #F4B07A;
          border-radius: 6px;
          padding: 3px 10px; font-size: 12px; font-weight: 500;
          max-width: 100%; overflow: hidden;
          text-overflow: ellipsis; white-space: nowrap;
        }

        .rec-preview {
          max-width: 260px; overflow: hidden;
          text-overflow: ellipsis; white-space: nowrap;
          color: #8B6A4A; font-size: 12px;
        }

        .rec-expanded {
          max-width: 300px; white-space: normal;
          line-height: 1.6; color: #D4C9BC; font-size: 12px;
        }

        .expand-btn {
          background: none; border: none;
          color: #E8894A; font-size: 11px; font-weight: 600;
          cursor: pointer; font-family: 'Inter', sans-serif;
          padding: 0; margin-top: 4px; display: block;
          letter-spacing: 0.03em;
          transition: color 0.15s;
        }

        .expand-btn:hover { color: #F4B07A; }

        .delete-btn {
          background: rgba(232,137,74,0.08);
          border: 1px solid rgba(232,137,74,0.2);
          color: #E8894A; font-size: 12px; font-weight: 600;
          font-family: 'Inter', sans-serif;
          padding: 5px 12px; border-radius: 7px; cursor: pointer;
          transition: background 0.15s, border-color 0.15s, transform 0.1s;
          white-space: nowrap;
        }

        .delete-btn:hover {
          background: rgba(232,137,74,0.18);
          border-color: rgba(232,137,74,0.4);
          transform: scale(1.04);
        }

        .delete-btn:active { transform: scale(0.97); }

        /* Empty state */
        .empty-state {
          padding: 64px 20px; text-align: center; color: #5A4030;
        }

        .empty-state svg { margin: 0 auto 16px; display: block; opacity: 0.3; }

        .empty-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 16px; font-weight: 700; color: #D4C9BC; margin-bottom: 6px;
        }

        .empty-sub { font-size: 13px; }

        /* Skeleton */
        .skeleton {
          height: 14px; border-radius: 6px;
          background: linear-gradient(90deg,
            rgba(232,137,74,0.04) 25%,
            rgba(232,137,74,0.1) 50%,
            rgba(232,137,74,0.04) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 768px) {
          .admin-bg { padding: 32px 16px; }
          .td-goal, .rec-preview, .rec-expanded { max-width: 120px; }
          th:nth-child(3), td:nth-child(3),
          th:nth-child(5), td:nth-child(5) { display: none; }
        }
      `}</style>

      <div className="admin-bg">
        <ParticleCanvas />
        <div className="admin-inner">

          {/* Header */}
          <div className="admin-header">
            <div>
              <div className="header-icon">
                <svg width="24" height="24" viewBox="0 0 22 22" fill="none">
                  <rect x="2" y="5" width="18" height="14" rx="2" stroke="rgba(26,15,0,0.85)" strokeWidth="1.5"/>
                  <path d="M6 2v4M16 2v4M2 9h18" stroke="rgba(26,15,0,0.85)" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M6 13h4M6 16h6" stroke="rgba(26,15,0,0.85)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="eyebrow">Admin Panel</p>
              <h1 className="admin-title">All Submissions</h1>
              <p className="admin-subtitle">Review every recommendation request and its result.</p>
            </div>
            <div className="badge">
              <span className="badge-dot" />
              {loading ? "Loading…" : `${data.length} record${data.length !== 1 ? "s" : ""}`}
            </div>
          </div>

          {/* Search */}
          <div className="search-wrap">
            <span className="search-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
            <input
              className="search-input"
              placeholder="Search by name, email, or goal…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Name</th><th>Email</th>
                  <th>Career Goal</th><th>Recommendation</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} style={{ cursor: "default" }}>
                      {[40, 120, 160, 110, 200, 60].map((w, j) => (
                        <td key={j}><div className="skeleton" style={{ width: w }} /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr style={{ cursor: "default" }}>
                    <td colSpan={6}>
                      <div className="empty-state">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                          <circle cx="20" cy="20" r="16" stroke="#8B6A4A" strokeWidth="1.5"/>
                          <path d="M14 20h12M20 14v12" stroke="#8B6A4A" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <p className="empty-title">{search ? "No matches found" : "No submissions yet"}</p>
                        <p className="empty-sub">{search ? "Try a different search term." : "Submissions will appear here once people complete the form."}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, index) => (
                    <tr
                      key={item.id}
                      className={removing.has(item.id) ? "removing" : ""}
                      style={{ animationDelay: `${index * 0.06}s` }}
                      onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                    >
                      <td className="td-serial">{index + 1}</td>
                      <td>
                        <div className="td-name">{item.name}</div>
                        <div className="td-email">{item.email}</div>
                      </td>
                      <td><div className="td-email">{item.email}</div></td>
                      <td className="td-goal">
                        <span className="goal-pill" title={item.career_goal}>{item.career_goal}</span>
                      </td>
                      <td>
                        {expanded === item.id ? (
                          <div className="rec-expanded">{item.recommendation}</div>
                        ) : (
                          <div className="rec-preview">{item.recommendation}</div>
                        )}
                        {item.recommendation?.length > 80 && (
                          <button className="expand-btn">
                            {expanded === item.id ? "↑ Collapse" : "↓ Expand"}
                          </button>
                        )}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button className="delete-btn" onClick={() => handleDelete(item.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </>
  );
}

export default Admin;