// client/src/App.jsx – TrustPause placeholder page (scaffold)
import "./App.css";
import { ShieldCheck } from "lucide-react";

export default function App() {
  return (
    <>
      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="tp-header" style={{ width: "100%" }}>
        <ShieldCheck size={28} color="#0E8F8E" strokeWidth={2.5} />
        <div>
          <h1>TrustPause</h1>
          <p className="tp-tagline">Pause. Verify. Pay safely.</p>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────────────── */}
      <main className="tp-main">
        <div className="tp-card">
          <span className="tp-badge">
            <ShieldCheck size={14} />
            Scaffold ready
          </span>
          <h2>AI Payment-Safety Copilot</h2>
          <p>
            Paste a suspicious message or upload a screenshot and TrustPause
            will explain why it&rsquo;s risky, score it, and tell you what to
            do next.
          </p>
          <p style={{ color: "#0E8F8E", fontWeight: 600, fontSize: "0.9rem" }}>
            🚧 UI coming soon — API is live at{" "}
            <code style={{ fontFamily: "monospace" }}>/api/health</code>
          </p>
        </div>

        <p className="tp-disclaimer">
          This is a safety recommendation, not a guarantee. TrustPause does not
          stop fraud.
        </p>
      </main>
    </>
  );
}
