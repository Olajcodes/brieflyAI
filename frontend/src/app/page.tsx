import Link from 'next/link';

export const metadata = {
  title: 'Briefly — AI Summarization',
  description: 'Grounded, hallucination-free summaries from text, URLs, and documents.',
};

export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --ink: #0d0d0d;
          --ink-soft: #3a3a3a;
          --ink-mute: #888;
          --paper: #f7f5f0;
          --paper-white: #ffffff;
          --accent: #1a56db;
          --accent-light: #dbeafe;
          --rule: #e0ddd6;
          --serif: 'DM Serif Display', Georgia, serif;
          --sans: 'DM Sans', system-ui, sans-serif;
          --mono: 'JetBrains Mono', monospace;
        }

        .landing { font-family: var(--sans); background: var(--paper); color: var(--ink); overflow-x: hidden; }

        /* NAV */
        .l-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 5vw; height: 64px;
          background: rgba(247,245,240,0.88); backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--rule);
        }
        .l-nav-logo { font-family: var(--serif); font-size: 1.4rem; font-style: italic; color: var(--ink); text-decoration: none; letter-spacing: -0.02em; }
        .l-nav-links { display: flex; align-items: center; gap: 2rem; list-style: none; }
        .l-nav-links a { font-size: 0.78rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-soft); text-decoration: none; transition: color 0.2s; }
        .l-nav-links a:hover { color: var(--ink); }
        .l-nav-cta { background: var(--ink) !important; color: var(--paper) !important; padding: 0.45rem 1.1rem; border-radius: 6px; font-size: 0.72rem !important; font-weight: 600 !important; }

        /* HERO */
        .l-hero { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; padding-top: 64px; }
        .l-hero-left { display: flex; flex-direction: column; justify-content: center; padding: 8vh 5vw 8vh 8vw; border-right: 1px solid var(--rule); }
        .l-hero-right { display: flex; flex-direction: column; justify-content: center; padding: 8vh 7vw 8vh 5vw; background: var(--paper-white); }

        .l-eyebrow { font-family: var(--mono); font-size: 0.68rem; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.6rem; }
        .l-eyebrow::before { content: ''; width: 24px; height: 1px; background: var(--accent); flex-shrink: 0; }

        .l-hero-title { font-family: var(--serif); font-size: clamp(3.5rem, 5.5vw, 6.5rem); line-height: 0.95; letter-spacing: -0.03em; color: var(--ink); margin-bottom: 2rem; }
        .l-hero-title em { font-style: italic; color: var(--ink-soft); }

        .l-hero-sub { font-size: 1.05rem; color: var(--ink-soft); line-height: 1.75; max-width: 400px; margin-bottom: 3rem; }

        .l-hero-actions { display: flex; align-items: center; gap: 1.2rem; flex-wrap: wrap; }

        .l-btn-primary { background: var(--ink); color: var(--paper); padding: 0.85rem 2rem; border-radius: 8px; font-weight: 600; font-size: 0.9rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; transition: transform 0.15s, box-shadow 0.15s; }
        .l-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(0,0,0,0.15); }

        .l-btn-ghost { color: var(--ink-soft); font-size: 0.85rem; font-weight: 500; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem; transition: color 0.2s; }
        .l-btn-ghost:hover { color: var(--ink); }

        .l-stat-row { margin-top: 4rem; display: flex; gap: 3rem; padding-top: 2rem; border-top: 1px solid var(--rule); }
        .l-stat-val { font-family: var(--serif); font-size: 2rem; color: var(--ink); line-height: 1; }
        .l-stat-key { font-size: 0.68rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-mute); margin-top: 0.3rem; }

        /* DEMO CARD */
        .l-demo-card { background: var(--paper-white); border: 1px solid var(--rule); border-radius: 16px; overflow: hidden; box-shadow: 0 24px 64px rgba(0,0,0,0.08); animation: l-float 6s ease-in-out infinite; }
        @keyframes l-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

        .l-demo-header { padding: 0.9rem 1.2rem; border-bottom: 1px solid var(--rule); display: flex; align-items: center; gap: 0.45rem; background: var(--paper); }
        .l-dot { width: 10px; height: 10px; border-radius: 50%; }
        .l-dot-r { background: #ff5f57; } .l-dot-y { background: #febc2e; } .l-dot-g { background: #28c840; }
        .l-demo-title-bar { font-family: var(--mono); font-size: 0.62rem; color: var(--ink-mute); margin-left: auto; }

        .l-demo-body { padding: 1.4rem; }
        .l-demo-label { font-family: var(--mono); font-size: 0.58rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-mute); margin-bottom: 0.5rem; }
        .l-demo-input { background: var(--paper); border: 1px solid var(--rule); border-radius: 8px; padding: 0.85rem; font-size: 0.76rem; color: var(--ink-soft); line-height: 1.65; margin-bottom: 0.9rem; font-style: italic; }
        .l-demo-tags { display: flex; gap: 0.45rem; margin-bottom: 0.9rem; flex-wrap: wrap; }
        .l-tag { font-family: var(--mono); font-size: 0.58rem; padding: 0.25rem 0.6rem; border-radius: 4px; background: var(--accent-light); color: var(--accent); font-weight: 500; }
        .l-tag-n { background: var(--paper); color: var(--ink-mute); border: 1px solid var(--rule); }
        .l-demo-btn { width: 100%; background: var(--ink); color: var(--paper); border: none; border-radius: 8px; padding: 0.7rem; font-size: 0.78rem; font-weight: 600; margin-bottom: 1.1rem; cursor: default; }
        .l-demo-result { border-left: 3px solid var(--accent); padding-left: 0.85rem; font-size: 0.77rem; color: var(--ink-soft); line-height: 1.7; font-style: italic; }
        .l-demo-metrics { margin-top: 1rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
        .l-demo-metric { background: var(--paper); border-radius: 8px; padding: 0.6rem; text-align: center; }
        .l-demo-metric-val { font-family: var(--serif); font-size: 1.05rem; color: var(--ink); display: block; }
        .l-demo-metric-key { font-family: var(--mono); font-size: 0.52rem; color: var(--ink-mute); letter-spacing: 0.08em; text-transform: uppercase; }

        /* MARQUEE */
        .l-marquee { border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); padding: 0.95rem 0; overflow: hidden; background: var(--paper-white); }
        .l-marquee-track { display: flex; width: max-content; animation: l-marquee 35s linear infinite; }
        @keyframes l-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .l-marquee-item { font-family: var(--mono); font-size: 0.66rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-mute); white-space: nowrap; padding: 0 2.5rem; display: flex; align-items: center; gap: 2.5rem; }
        .l-marquee-item::after { content: '·'; color: var(--accent); font-size: 1.4rem; line-height: 0; }

        /* SECTIONS */
        .l-section { padding: 8rem 8vw; }
        .l-section-label { font-family: var(--mono); font-size: 0.62rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent); margin-bottom: 0.8rem; }
        .l-section-title { font-family: var(--serif); font-size: clamp(2rem, 3.5vw, 3.5rem); line-height: 1.05; letter-spacing: -0.025em; color: var(--ink); margin-bottom: 1rem; }
        .l-section-sub { font-size: 1rem; color: var(--ink-soft); max-width: 480px; line-height: 1.75; margin-bottom: 4rem; }

        /* STEPS */
        .l-steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid var(--rule); border-radius: 16px; overflow: hidden; background: var(--paper-white); }
        .l-step { padding: 2.5rem; border-right: 1px solid var(--rule); transition: background 0.25s; }
        .l-step:last-child { border-right: none; }
        .l-step:hover { background: var(--paper); }
        .l-step-num { font-family: var(--serif); font-size: 3.5rem; line-height: 1; color: var(--rule); margin-bottom: 1.2rem; letter-spacing: -0.04em; }
        .l-step-icon { width: 40px; height: 40px; background: var(--accent-light); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; font-size: 1rem; }
        .l-step-title { font-weight: 600; font-size: 0.95rem; color: var(--ink); margin-bottom: 0.45rem; }
        .l-step-desc { font-size: 0.83rem; color: var(--ink-soft); line-height: 1.75; }

        /* FEATURES */
        .l-features { background: var(--ink); padding: 8rem 8vw; }
        .l-features .l-section-label { color: #60a5fa; }
        .l-features .l-section-title { color: #f7f5f0; }
        .l-features .l-section-sub { color: #666; }
        .l-features-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: #1e1e1e; border: 1px solid #1e1e1e; border-radius: 16px; overflow: hidden; }
        .l-feature { background: #111; padding: 2.5rem; transition: background 0.2s; position: relative; overflow: hidden; }
        .l-feature::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(26,86,219,0.3), transparent); }
        .l-feature:hover { background: #151515; }
        .l-feature-icon { width: 42px; height: 42px; background: rgba(26,86,219,0.12); border: 1px solid rgba(26,86,219,0.25); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.2rem; font-size: 1rem; }
        .l-feature-title { font-weight: 600; font-size: 0.93rem; color: #f0ede8; margin-bottom: 0.45rem; }
        .l-feature-desc { font-size: 0.81rem; color: #5a5a5a; line-height: 1.8; }

        /* INPUTS */
        .l-inputs { background: var(--paper-white); }
        .l-inputs-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
        .l-input-card { border: 1px solid var(--rule); border-radius: 16px; padding: 2rem; background: var(--paper); transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s; }
        .l-input-card:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(0,0,0,0.08); border-color: var(--accent); }
        .l-input-icon { font-size: 2rem; margin-bottom: 1rem; }
        .l-input-title { font-weight: 600; font-size: 1rem; color: var(--ink); margin-bottom: 0.4rem; }
        .l-input-desc { font-size: 0.82rem; color: var(--ink-soft); line-height: 1.75; margin-bottom: 1.1rem; }
        .l-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .l-chip { font-family: var(--mono); font-size: 0.58rem; padding: 0.22rem 0.55rem; background: var(--paper-white); border: 1px solid var(--rule); border-radius: 4px; color: var(--ink-soft); }

        /* OUTPUTS */
        .l-outputs { background: var(--paper); }
        .l-outputs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .l-output-card { background: var(--paper-white); border: 1px solid var(--rule); border-radius: 16px; padding: 2rem; transition: transform 0.2s, box-shadow 0.2s; }
        .l-output-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.07); }
        .l-output-badge { font-family: var(--mono); font-size: 0.58rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); background: var(--accent-light); padding: 0.25rem 0.6rem; border-radius: 4px; display: inline-block; margin-bottom: 1rem; }
        .l-output-title { font-weight: 600; font-size: 0.95rem; color: var(--ink); margin-bottom: 0.4rem; }
        .l-output-desc { font-size: 0.82rem; color: var(--ink-soft); line-height: 1.75; }
        .l-output-preview { margin-top: 1.2rem; padding: 1rem; background: var(--paper); border-radius: 10px; font-size: 0.75rem; color: var(--ink-soft); line-height: 1.7; font-style: italic; border-left: 3px solid var(--rule); }

        /* CTA */
        .l-cta { text-align: center; padding: 10rem 8vw 8rem; background: var(--paper); border-top: 1px solid var(--rule); position: relative; overflow: hidden; }
        .l-cta-watermark { position: absolute; font-family: var(--serif); font-style: italic; font-size: 18vw; color: var(--rule); bottom: -4vw; left: 50%; transform: translateX(-50%); white-space: nowrap; pointer-events: none; user-select: none; letter-spacing: -0.05em; line-height: 1; }
        .l-cta-title { font-family: var(--serif); font-size: clamp(2.5rem, 5vw, 5rem); line-height: 1; letter-spacing: -0.03em; color: var(--ink); margin-bottom: 1rem; position: relative; }
        .l-cta-sub { font-size: 1rem; color: var(--ink-soft); margin-bottom: 2.5rem; position: relative; }
        .l-cta-actions { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; position: relative; }

        /* FOOTER */
        .l-footer { background: var(--ink); color: #555; padding: 2.5rem 8vw; display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; flex-wrap: wrap; gap: 1rem; }
        .l-footer-logo { font-family: var(--serif); font-style: italic; font-size: 1.1rem; color: var(--paper); text-decoration: none; }
        .l-footer-links { display: flex; gap: 1.5rem; }
        .l-footer-links a { color: #555; text-decoration: none; transition: color 0.2s; }
        .l-footer-links a:hover { color: #aaa; }

        /* RESPONSIVE */
        @media (max-width: 960px) {
          .l-hero { grid-template-columns: 1fr; }
          .l-hero-left { border-right: none; border-bottom: 1px solid var(--rule); padding: 6vh 6vw; }
          .l-hero-right { padding: 4vh 6vw 6vh; }
          .l-steps-grid, .l-inputs-grid, .l-features-grid, .l-outputs-grid { grid-template-columns: 1fr; }
          .l-step { border-right: none; border-bottom: 1px solid var(--rule); }
          .l-step:last-child { border-bottom: none; }
          .l-section, .l-features { padding: 5rem 6vw; }
        }
        @media (max-width: 600px) {
          .l-nav-links li:not(:last-child) { display: none; }
          .l-stat-row { gap: 2rem; }
        }
      `}</style>

      <div className="landing">

        {/* NAV */}
        <nav className="l-nav">
          <a href="#" className="l-nav-logo">Briefly.</a>
          <ul className="l-nav-links">
            <li><a href="#how-it-works">How it works</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#inputs">Input types</a></li>
            <li><Link href="/app" className="l-nav-cta">Try it free →</Link></li>
          </ul>
        </nav>

        {/* HERO */}
        <div className="l-hero">
          <div className="l-hero-left">
            <p className="l-eyebrow">Grounded AI Summarization</p>
            <h1 className="l-hero-title">
              Less to<br />read.<br /><em>More to</em><br />know.
            </h1>
            <p className="l-hero-sub">
              Briefly distills articles, documents, and web pages into accurate, grounded summaries — with zero hallucinations and full source fidelity.
            </p>
            <div className="l-hero-actions">
              <Link href="/app" className="l-btn-primary">
                Start summarizing
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <a href="#how-it-works" className="l-btn-ghost">
                See how it works
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
              </a>
            </div>
            <div className="l-stat-row">
              <div><div className="l-stat-val">~80%</div><div className="l-stat-key">Compression</div></div>
              <div><div className="l-stat-val">4</div><div className="l-stat-key">Input types</div></div>
              <div><div className="l-stat-val">0</div><div className="l-stat-key">Hallucinations</div></div>
            </div>
          </div>

          <div className="l-hero-right">
            <div className="l-demo-card">
              <div className="l-demo-header">
                <div className="l-dot l-dot-r" /><div className="l-dot l-dot-y" /><div className="l-dot l-dot-g" />
                <span className="l-demo-title-bar">briefly — summarize</span>
              </div>
              <div className="l-demo-body">
                <div className="l-demo-label">Source Text</div>
                <div className="l-demo-input">"The Federal Reserve held interest rates steady on Wednesday, signaling caution as policymakers weigh persistent inflation against signs of a slowing labor market..."</div>
                <div className="l-demo-tags">
                  <span className="l-tag">Medium</span>
                  <span className="l-tag">Both formats</span>
                  <span className="l-tag l-tag-n">auto-detect lang</span>
                </div>
                <div className="l-demo-btn">Summarize Content</div>
                <div className="l-demo-label">Summary</div>
                <div className="l-demo-result">The Fed maintained interest rates, citing inflation concerns while monitoring labor market conditions — avoiding premature cuts.</div>
                <div className="l-demo-metrics">
                  <div className="l-demo-metric"><span className="l-demo-metric-val">76%</span><span className="l-demo-metric-key">Compressed</span></div>
                  <div className="l-demo-metric"><span className="l-demo-metric-val">2.4m</span><span className="l-demo-metric-key">Time saved</span></div>
                  <div className="l-demo-metric"><span className="l-demo-metric-val">GPT-4o</span><span className="l-demo-metric-key">Model</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MARQUEE */}
        <div className="l-marquee">
          <div className="l-marquee-track">
            {['Text Summarization','URL Extraction','PDF Support','DOCX Support','Audio Transcription','Whisper STT','Mic Recording','SSRF Protection','Grounded Output','Key Takeaways','Compression Metrics','GPT-4o Powered','Zero Hallucinations','16 Languages',
              'Text Summarization','URL Extraction','PDF Support','DOCX Support','Audio Transcription','Whisper STT','Mic Recording','SSRF Protection','Grounded Output','Key Takeaways','Compression Metrics','GPT-4o Powered','Zero Hallucinations','16 Languages'
            ].map((item, i) => <span key={i} className="l-marquee-item">{item}</span>)}
          </div>
        </div>

        {/* HOW IT WORKS */}
        <section className="l-section" id="how-it-works">
          <p className="l-section-label">How it works</p>
          <h2 className="l-section-title">Three steps to clarity.</h2>
          <p className="l-section-sub">No setup, no fluff. Drop in your content and Briefly does the rest.</p>
          <div className="l-steps-grid">
            {[
              { n: '01', icon: '📥', title: 'Input your content', desc: 'Paste raw text, drop in a URL, upload a file (PDF, DOCX, TXT), or submit an audio recording. Briefly handles extraction and transcription automatically.' },
              { n: '02', icon: '⚙️', title: 'Configure your output', desc: 'Choose your length preset (short, medium, or long) and output format — paragraph, bullet points, or both.' },
              { n: '03', icon: '✅', title: 'Get your summary', desc: 'Receive a grounded summary with key takeaways and compression metrics. Audio inputs also show a reviewable, editable transcript alongside the summary.' },
            ].map((s) => (
              <div key={s.n} className="l-step">
                <div className="l-step-num">{s.n}</div>
                <div className="l-step-icon">{s.icon}</div>
                <div className="l-step-title">{s.title}</div>
                <p className="l-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section className="l-features" id="features">
          <p className="l-section-label">Features</p>
          <h2 className="l-section-title">Built to be trustworthy.</h2>
          <p className="l-section-sub">Every design decision prioritizes accuracy, safety, and transparency over flashy output.</p>
          <div className="l-features-grid">
            {[
              { icon: '🔒', title: 'Zero hallucinations', desc: 'The model is strictly instructed to use only facts from your source text — no external knowledge, no invented details, ever.' },
              { icon: '🌐', title: 'Safe URL fetching', desc: 'Built-in SSRF protection blocks requests to private IP ranges. Content is fetched securely with clean extraction via Readability.' },
              { icon: '🎙️', title: 'Audio transcription', desc: 'Powered by OpenAI Whisper — upload MP3, WAV, M4A, WEBM and more, or record directly from your microphone. Transcripts are shown for review before summarizing.' },
              { icon: '✏️', title: 'Editable transcripts', desc: 'After transcription, review and edit the transcript before summarizing. Fix mishears, remove filler, or trim sections — then re-summarize with one click.' },
              { icon: '📊', title: 'Compression metrics', desc: 'Every summary includes word counts, compression ratio, and estimated reading time saved — full transparency on what was distilled.' },
              { icon: '🌍', title: '16 output languages', desc: 'Summarize into any of 16 supported languages including English, French, Arabic, Chinese, Yoruba, Hausa, and Igbo — regardless of the source language.' },
              { icon: '📄', title: 'Multi-format file support', desc: 'Upload PDFs (with scanned-doc detection), DOCX, or plain text files up to 15MB and 25,000 words. Smart parsing handles each.' },
              { icon: '🎯', title: 'Precision length control', desc: 'Use presets or set an exact target word count. The model is constrained to hit your range — no padding, no cutting short.' },
            ].map((f) => (
              <div key={f.title} className="l-feature">
                <div className="l-feature-icon">{f.icon}</div>
                <div className="l-feature-title">{f.title}</div>
                <p className="l-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* INPUT TYPES */}
        <section className="l-section l-inputs" id="inputs">
          <p className="l-section-label">Input types</p>
          <h2 className="l-section-title">Whatever you have, Briefly handles it.</h2>
          <p className="l-section-sub">Three flexible ways to get your content in — no copy-pasting required.</p>
          <div className="l-inputs-grid">
            {[
              { icon: '✏️', title: 'Plain Text', desc: 'Paste any text directly — article excerpts, meeting notes, research summaries, or anything else.', chips: ['up to 25k words', 'any language'] },
              { icon: '🔗', title: 'URL', desc: 'Drop in any public URL — news articles, blog posts, reports. Briefly fetches and extracts readable content automatically.', chips: ['http / https', 'SSRF-safe', 'auto-extract'] },
              { icon: '📎', title: 'File Upload', desc: 'Upload a document and let Briefly extract and summarize the content. Supports PDFs, Word docs, and plain text files.', chips: ['.pdf', '.docx', '.txt', 'max 15MB'] },
              { icon: '🎙️', title: 'Audio', desc: 'Upload a recording or speak directly into your mic. Whisper transcribes it first — you review, edit if needed, then summarize.', chips: ['.mp3', '.wav', '.m4a', '.webm', 'live mic', 'max 25MB'] },
            ].map((c) => (
              <div key={c.title} className="l-input-card">
                <div className="l-input-icon">{c.icon}</div>
                <div className="l-input-title">{c.title}</div>
                <p className="l-input-desc">{c.desc}</p>
                <div className="l-chips">{c.chips.map(ch => <span key={ch} className="l-chip">{ch}</span>)}</div>
              </div>
            ))}
          </div>
        </section>

        {/* OUTPUT FORMATS */}
        <section className="l-section l-outputs">
          <p className="l-section-label">Output formats</p>
          <h2 className="l-section-title">Your summary, your way.</h2>
          <p className="l-section-sub">Choose how you want your summary delivered — or get everything at once.</p>
          <div className="l-outputs-grid">
            {[
              { badge: 'Paragraph', title: 'Flowing prose', desc: 'A coherent paragraph that reads naturally — ideal for sharing or including in reports.', preview: '"The Federal Reserve maintained interest rates, citing persistent inflation as the primary concern while monitoring labor market signals..."' },
              { badge: 'Bullets', title: 'Scannable points', desc: 'Structured bullet points for fast scanning — great for briefings, slide decks, and quick reviews.', preview: '• Fed held rates steady amid inflation\n• Labor market showing early slowdown\n• No rate cuts expected near-term' },
              { badge: 'Both', title: 'Full picture', desc: 'Get both formats plus key takeaways — the most complete summary for thorough understanding.', preview: 'Paragraph + bullets + 3–7 key takeaways, compression ratio, and reading time saved.' },
            ].map((o) => (
              <div key={o.badge} className="l-output-card">
                <span className="l-output-badge">{o.badge}</span>
                <div className="l-output-title">{o.title}</div>
                <p className="l-output-desc">{o.desc}</p>
                <div className="l-output-preview" style={{ whiteSpace: 'pre-line' }}>{o.preview}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="l-cta">
          <div className="l-cta-watermark">briefly.</div>
          <p className="l-section-label" style={{ position: 'relative' }}>Ready to read less?</p>
          <h2 className="l-cta-title">Start summarizing<br /><em>for free.</em></h2>
          <p className="l-cta-sub">No account required. Just paste, click, and understand.</p>
          <div className="l-cta-actions">
            <Link href="/app" className="l-btn-primary">
              Open Briefly
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="l-footer">
          <a href="#" className="l-footer-logo">Briefly.</a>
          <div className="l-footer-links">
            <a href="#">API Docs</a>
            <a href="#">GitHub</a>
            <a href="#">Privacy</a>
          </div>
          <span>Built with FastAPI · GPT-4o · Whisper</span>
        </footer>

      </div>
    </>
  );
}