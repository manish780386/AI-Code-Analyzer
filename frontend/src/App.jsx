import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";

const LANGUAGES = [
  { value: "python", label: "Python", icon: "🐍" },
  { value: "javascript", label: "JavaScript", icon: "⚡" },
  { value: "typescript", label: "TypeScript", icon: "🔷" },
  { value: "java", label: "Java", icon: "☕" },
  { value: "cpp", label: "C++", icon: "⚙️" },
  { value: "c", label: "C", icon: "🔧" },
  { value: "go", label: "Go", icon: "🐹" },
  { value: "rust", label: "Rust", icon: "🦀" },
  { value: "php", label: "PHP", icon: "🐘" },
  { value: "ruby", label: "Ruby", icon: "💎" },
];

const SAMPLE_CODES = {
  python: `def calculate_average(numbers):
    total = 0
    for n in numbers:
        total = total + n
    average = total / len(numbers)
    return average

result = calculate_average([10, 20, 30, 40, 50])
print("Average:", result)`,
  javascript: `function fetchUserData(userId) {
  var data = null;
  fetch('https://api.example.com/users/' + userId)
    .then(response => response.json())
    .then(json => {
      data = json;
      console.log(data);
    });
  return data;
}`,
  java: `public class Calculator {
    public int divide(int a, int b) {
        return a / b;
    }
    
    public static void main(String[] args) {
        Calculator calc = new Calculator();
        System.out.println(calc.divide(10, 0));
    }
}`,
};

function ScoreRing({ score }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 10) * circumference;
  const color = score >= 8 ? "#00ff88" : score >= 5 ? "#ffcc00" : "#ff4444";

  return (
    <div style={{ position: "relative", width: 72, height: 72 }}>
      <svg width="72" height="72" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="36" cy="36" r={radius} fill="none" stroke="#1a1a2e" strokeWidth="6" />
        <circle
          cx="36" cy="36" r={radius} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease, stroke 0.5s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        fontSize: 18, fontWeight: 800, color,
        fontFamily: "'JetBrains Mono', monospace"
      }}>
        {score}
      </div>
    </div>
  );
}

function ReviewSection({ icon, title, items, color }) {
  const [open, setOpen] = useState(true);
  if (!items || items.length === 0) return null;
  return (
    <div style={{
      marginBottom: 16,
      border: `1px solid ${color}22`,
      borderRadius: 12,
      overflow: "hidden",
      background: `${color}08`
    }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", cursor: "pointer",
          borderBottom: open ? `1px solid ${color}22` : "none"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <span style={{ color, fontWeight: 700, fontSize: 14, letterSpacing: "0.05em", fontFamily: "'JetBrains Mono', monospace" }}>{title}</span>
          <span style={{
            background: color, color: "#0a0a0f", borderRadius: 20,
            padding: "1px 8px", fontSize: 11, fontWeight: 800
          }}>{items.length}</span>
        </div>
        <span style={{ color, fontSize: 12 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ padding: "12px 16px" }}>
          {items.map((item, i) => (
            <div key={i} style={{
              display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start"
            }}>
              <span style={{ color, fontSize: 12, marginTop: 2, flexShrink: 0 }}>◆</span>
              <span style={{ color: "#c8c8e0", fontSize: 13, lineHeight: 1.6 }}>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function parseReview(reviewText) {
  const result = {
    bugs: [], optimization: [], security: [],
    bestPractices: [], score: null, improvedCode: null, summary: null
  };

  if (!reviewText) return result;

  // Extract score
  const scoreMatch = reviewText.match(/📊[^:]*:\s*(\d+(?:\.\d+)?)\s*\/\s*10/);
  if (scoreMatch) result.score = parseFloat(scoreMatch[1]);

  // Extract improved code
  const codeMatch = reviewText.match(/```[\w]*\n([\s\S]*?)```/);
  if (codeMatch) result.improvedCode = codeMatch[1].trim();

  // Extract summary
  const summaryMatch = reviewText.match(/📝[^:]*:\n?([\s\S]*?)(?:\n\n|\n(?=🐞|⚡|🔒|💡|📊|✅)|$)/);
  if (summaryMatch) result.summary = summaryMatch[1].trim();

  // Extract sections
  const extractItems = (text, pattern) => {
    const match = text.match(pattern);
    if (!match) return [];
    return match[1].split('\n')
      .map(l => l.replace(/^[-•*◆]\s*/, '').trim())
      .filter(l => l && l !== '...' && l.length > 3);
  };

  result.bugs = extractItems(reviewText, /🐞[^\n]*\n([\s\S]*?)(?=\n[⚡🔒💡📊✅]|\n\n[⚡🔒💡📊✅]|$)/);
  result.optimization = extractItems(reviewText, /⚡[^\n]*\n([\s\S]*?)(?=\n[🐞🔒💡📊✅]|\n\n[🐞🔒💡📊✅]|$)/);
  result.security = extractItems(reviewText, /🔒[^\n]*\n([\s\S]*?)(?=\n[🐞⚡💡📊✅]|\n\n[🐞⚡💡📊✅]|$)/);
  result.bestPractices = extractItems(reviewText, /💡[^\n]*\n([\s\S]*?)(?=\n[🐞⚡🔒📊✅]|\n\n[🐞⚡🔒📊✅]|$)/);

  return result;
}

export default function App() {
  const [code, setCode] = useState(SAMPLE_CODES.python);
  const [language, setLanguage] = useState("python");
  const [review, setReview] = useState(null);
  const [rawReview, setRawReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("structured");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [charCount, setCharCount] = useState(0);
  const reviewRef = useRef(null);

  useEffect(() => {
    setCharCount(code ? code.length : 0);
  }, [code]);

  useEffect(() => {
    const saved = localStorage.getItem("reviewHistory");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    if (SAMPLE_CODES[lang]) setCode(SAMPLE_CODES[lang]);
  };

  const handleReview = async () => {
    if (!code || code.trim().length < 5) {
      setError("Bhai kuch toh code likho! 😅");
      return;
    }
    setLoading(true);
    setError("");
    setReview(null);
    setRawReview("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/review/", {
        code, language,
      });
      const reviewText = response.data.review;
      setRawReview(reviewText);
      setReview(parseReview(reviewText));

      // Save to history
      const entry = {
        id: Date.now(),
        language,
        codeSnippet: code.substring(0, 80) + (code.length > 80 ? "..." : ""),
        score: parseReview(reviewText).score,
        timestamp: new Date().toLocaleTimeString(),
        review: reviewText,
      };
      const newHistory = [entry, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem("reviewHistory", JSON.stringify(newHistory));

      setTimeout(() => reviewRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      setError(err.response?.data?.error || "Backend se connect nahi ho pa raha 😢 Check karo server chal raha hai ya nahi.");
    }
    setLoading(false);
  };

  const copyImprovedCode = () => {
    if (review?.improvedCode) {
      navigator.clipboard.writeText(review.improvedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const loadFromHistory = (entry) => {
    setRawReview(entry.review);
    setReview(parseReview(entry.review));
    setShowHistory(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#07070f",
      color: "#e0e0f0",
      fontFamily: "'Syne', sans-serif",
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0d0d1a; }
        ::-webkit-scrollbar-thumb { background: #3a3a5c; border-radius: 3px; }
        .lang-btn:hover { background: #1a1a2e !important; transform: translateY(-1px); }
        .review-btn:hover { filter: brightness(1.1); transform: translateY(-2px); }
        .tab-btn:hover { color: #a78bfa !important; }
        .hist-item:hover { background: #1a1a2e !important; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slideIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes gradientShift {
          0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%}
        }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1a1a2e",
        padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64,
        background: "linear-gradient(135deg, #0a0a18 0%, #07070f 100%)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, boxShadow: "0 0 20px #7c3aed44"
          }}>⚡</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff" }}>
              CodeScan <span style={{ color: "#7c3aed" }}>AI</span>
            </div>
            <div style={{ fontSize: 10, color: "#5a5a8a", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono', monospace" }}>
              POWERED BY GEMINI
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{
              background: showHistory ? "#1a1a2e" : "transparent",
              border: "1px solid #2a2a3e",
              color: "#a0a0c0", padding: "8px 16px",
              borderRadius: 8, cursor: "pointer", fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              display: "flex", alignItems: "center", gap: 6
            }}
          >
            📋 History ({history.length})
          </button>
          <button
            onClick={() => setEditorTheme(t => t === "vs-dark" ? "light" : "vs-dark")}
            style={{
              background: "transparent", border: "1px solid #2a2a3e",
              color: "#a0a0c0", padding: "8px 12px",
              borderRadius: 8, cursor: "pointer", fontSize: 14
            }}
          >
            {editorTheme === "vs-dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 32px", display: "flex", gap: 24 }}>

        {/* LEFT: Editor Panel */}
        <div style={{ flex: "0 0 55%", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Language Selector */}
          <div style={{
            background: "#0d0d1a", borderRadius: 14,
            border: "1px solid #1a1a2e", padding: 16
          }}>
            <div style={{ fontSize: 11, color: "#5a5a8a", letterSpacing: "0.12em", marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>
              SELECT LANGUAGE
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {LANGUAGES.map(lang => (
                <button
                  key={lang.value}
                  className="lang-btn"
                  onClick={() => handleLanguageChange(lang.value)}
                  style={{
                    background: language === lang.value ? "linear-gradient(135deg, #7c3aed22, #3b82f622)" : "transparent",
                    border: language === lang.value ? "1px solid #7c3aed" : "1px solid #1e1e32",
                    color: language === lang.value ? "#a78bfa" : "#606080",
                    padding: "6px 14px", borderRadius: 8, cursor: "pointer",
                    fontSize: 12, fontWeight: 600, transition: "all 0.2s",
                    fontFamily: "'JetBrains Mono', monospace",
                    display: "flex", alignItems: "center", gap: 5
                  }}
                >
                  <span>{lang.icon}</span> {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Code Editor */}
          <div style={{
            background: "#0d0d1a", borderRadius: 14,
            border: "1px solid #1a1a2e", overflow: "hidden",
            flex: 1
          }}>
            <div style={{
              padding: "12px 16px", borderBottom: "1px solid #1a1a2e",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
                <span style={{ color: "#3a3a5a", fontSize: 12, marginLeft: 8, fontFamily: "'JetBrains Mono', monospace" }}>
                  {language}.{language === "python" ? "py" : language === "javascript" ? "js" : language === "typescript" ? "ts" : language === "java" ? "java" : language === "go" ? "go" : language === "rust" ? "rs" : language === "ruby" ? "rb" : language}
                </span>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ color: "#3a3a5a", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                  {charCount} chars
                </span>
                <button
                  onClick={() => setCode("")}
                  style={{
                    background: "transparent", border: "1px solid #2a2a3e",
                    color: "#606080", padding: "3px 10px", borderRadius: 6,
                    cursor: "pointer", fontSize: 11
                  }}
                >Clear</button>
              </div>
            </div>
            <Editor
              height="420px"
              language={language === "cpp" ? "cpp" : language}
              value={code}
              theme={editorTheme}
              onChange={(value) => setCode(value || "")}
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                renderLineHighlight: "gutter",
                padding: { top: 16 },
                smoothScrolling: true,
              }}
            />
          </div>

          {/* Review Button */}
          <button
            className="review-btn"
            onClick={handleReview}
            disabled={loading}
            style={{
              background: loading
                ? "#1a1a2e"
                : "linear-gradient(135deg, #7c3aed 0%, #3b82f6 50%, #06b6d4 100%)",
              backgroundSize: "200% 200%",
              animation: loading ? "none" : "gradientShift 3s ease infinite",
              border: "none",
              color: "#fff",
              padding: "16px 32px",
              borderRadius: 12, cursor: loading ? "not-allowed" : "pointer",
              fontSize: 15, fontWeight: 700, letterSpacing: "0.03em",
              transition: "all 0.3s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: loading ? "none" : "0 0 30px #7c3aed44",
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: 18, height: 18, border: "2px solid #3a3a5a",
                  borderTopColor: "#7c3aed", borderRadius: "50%",
                  animation: "spin 0.8s linear infinite"
                }} />
                Analyzing code...
              </>
            ) : (
              <>⚡ Analyze Code with AI</>
            )}
          </button>

          {error && (
            <div style={{
              background: "#ff444412", border: "1px solid #ff444444",
              borderRadius: 10, padding: "14px 16px",
              color: "#ff8888", fontSize: 13
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* RIGHT: Review Panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }} ref={reviewRef}>

          {/* History Dropdown */}
          {showHistory && (
            <div style={{
              background: "#0d0d1a", borderRadius: 14,
              border: "1px solid #1a1a2e", padding: 16,
              animation: "slideIn 0.2s ease"
            }}>
              <div style={{ fontSize: 11, color: "#5a5a8a", letterSpacing: "0.12em", marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                REVIEW HISTORY
              </div>
              {history.length === 0 ? (
                <div style={{ color: "#3a3a5a", fontSize: 13, textAlign: "center", padding: 20 }}>No history yet</div>
              ) : (
                history.map(entry => (
                  <div
                    key={entry.id}
                    className="hist-item"
                    onClick={() => loadFromHistory(entry)}
                    style={{
                      padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                      marginBottom: 6, border: "1px solid #1a1a2e",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      transition: "background 0.2s"
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 11, color: "#7c3aed", fontFamily: "'JetBrains Mono', monospace" }}>
                        {LANGUAGES.find(l => l.value === entry.language)?.icon} {entry.language}
                      </span>
                      <div style={{ fontSize: 12, color: "#6060a0", marginTop: 2 }}>
                        {entry.codeSnippet}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: entry.score >= 8 ? "#00ff88" : entry.score >= 5 ? "#ffcc00" : "#ff4444" }}>
                        {entry.score}/10
                      </div>
                      <div style={{ fontSize: 10, color: "#3a3a5a" }}>{entry.timestamp}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {!review && !loading && (
            <div style={{
              background: "#0d0d1a", borderRadius: 14,
              border: "1px solid #1a1a2e",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: 60, textAlign: "center", flex: 1
            }}>
              <div style={{ fontSize: 56, marginBottom: 20 }}>🔍</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                Ready to Analyze
              </div>
              <div style={{ fontSize: 13, color: "#4a4a6a", maxWidth: 240, lineHeight: 1.6 }}>
                Paste your code on the left and hit "Analyze Code with AI" to get a detailed review
              </div>
            </div>
          )}

          {loading && (
            <div style={{
              background: "#0d0d1a", borderRadius: 14,
              border: "1px solid #1a1a2e",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: 60, textAlign: "center", flex: 1
            }}>
              <div style={{ fontSize: 48, marginBottom: 20, animation: "pulse 1.5s ease infinite" }}>🤖</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#a78bfa", marginBottom: 8 }}>
                AI is reviewing your code...
              </div>
              <div style={{ fontSize: 12, color: "#4a4a6a" }}>Checking for bugs, security issues & optimizations</div>
            </div>
          )}

          {review && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "slideIn 0.3s ease" }}>

              {/* Score Card */}
              <div style={{
                background: "linear-gradient(135deg, #0d0d1a, #1a0a2e)",
                borderRadius: 14, border: "1px solid #2a1a4e",
                padding: 20, display: "flex", alignItems: "center", gap: 20
              }}>
                {review.score !== null && <ScoreRing score={review.score} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>
                    Code Quality: {review.score !== null ? `${review.score}/10` : "Analyzed"}
                  </div>
                  <div style={{ fontSize: 13, color: "#7060a0", marginTop: 4, lineHeight: 1.5 }}>
                    {review.summary || "Review complete — see details below"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
                  {[
                    { label: "Bugs", count: review.bugs.length, color: "#ff4444" },
                    { label: "Issues", count: review.security.length, color: "#ff9944" },
                    { label: "Tips", count: review.optimization.length + review.bestPractices.length, color: "#44aaff" },
                  ].map(stat => (
                    <div key={stat.label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: stat.color }}>{stat.count}</div>
                      <div style={{ fontSize: 10, color: "#5a5a8a", letterSpacing: "0.08em" }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div style={{
                background: "#0d0d1a", borderRadius: 14,
                border: "1px solid #1a1a2e", overflow: "hidden"
              }}>
                <div style={{
                  display: "flex", borderBottom: "1px solid #1a1a2e",
                  padding: "0 16px"
                }}>
                  {["structured", "raw", "improved"].map(tab => (
                    <button
                      key={tab}
                      className="tab-btn"
                      onClick={() => setActiveTab(tab)}
                      style={{
                        background: "transparent",
                        border: "none", borderBottom: activeTab === tab ? "2px solid #7c3aed" : "2px solid transparent",
                        color: activeTab === tab ? "#a78bfa" : "#4a4a6a",
                        padding: "14px 16px", cursor: "pointer",
                        fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
                        fontFamily: "'JetBrains Mono', monospace",
                        transition: "color 0.2s",
                        textTransform: "uppercase"
                      }}
                    >
                      {tab === "structured" ? "📊 Analysis" : tab === "raw" ? "📄 Raw" : "✅ Fixed Code"}
                    </button>
                  ))}
                </div>

                <div style={{ padding: 16, maxHeight: 480, overflowY: "auto" }}>
                  {activeTab === "structured" && (
                    <div>
                      <ReviewSection icon="🐞" title="BUGS FOUND" items={review.bugs} color="#ff4444" />
                      <ReviewSection icon="🔒" title="SECURITY ISSUES" items={review.security} color="#ff9944" />
                      <ReviewSection icon="⚡" title="OPTIMIZATION" items={review.optimization} color="#44aaff" />
                      <ReviewSection icon="💡" title="BEST PRACTICES" items={review.bestPractices} color="#a78bfa" />
                      {review.bugs.length === 0 && review.security.length === 0 && review.optimization.length === 0 && (
                        <div style={{ textAlign: "center", padding: 30, color: "#00ff88" }}>
                          <div style={{ fontSize: 32 }}>✅</div>
                          <div style={{ marginTop: 8, fontSize: 14 }}>Code looks clean!</div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "raw" && (
                    <pre style={{
                      whiteSpace: "pre-wrap", wordBreak: "break-word",
                      color: "#c0c0e0", fontSize: 12, lineHeight: 1.8,
                      fontFamily: "'JetBrains Mono', monospace"
                    }}>
                      {rawReview}
                    </pre>
                  )}

                  {activeTab === "improved" && (
                    <div>
                      {review.improvedCode ? (
                        <>
                          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                            <button
                              onClick={copyImprovedCode}
                              style={{
                                background: copied ? "#00ff8822" : "#1a1a2e",
                                border: `1px solid ${copied ? "#00ff88" : "#2a2a3e"}`,
                                color: copied ? "#00ff88" : "#a0a0c0",
                                padding: "6px 14px", borderRadius: 8,
                                cursor: "pointer", fontSize: 12,
                                fontFamily: "'JetBrains Mono', monospace",
                                transition: "all 0.2s"
                              }}
                            >
                              {copied ? "✅ Copied!" : "📋 Copy Code"}
                            </button>
                          </div>
                          <pre style={{
                            background: "#080810", borderRadius: 10,
                            padding: 16, overflowX: "auto",
                            color: "#c8e6c9", fontSize: 12, lineHeight: 1.8,
                            fontFamily: "'JetBrains Mono', monospace",
                            border: "1px solid #1a2a1a"
                          }}>
                            {review.improvedCode}
                          </pre>
                        </>
                      ) : (
                        <div style={{ textAlign: "center", padding: 30, color: "#4a4a6a" }}>
                          No improved code in this review
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}