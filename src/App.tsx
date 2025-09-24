import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./index.css";
import { useAuth } from "./state/AuthContext";

type Doc = {
  id: string;
  originalName: string;
  storedName: string;
  status: "uploaded" | "ingesting" | "ready" | "error";
  size: number;
};

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

function App() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState("");
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const refreshDocs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/documents`);
      setDocs(res.data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (user) void refreshDocs();
  }, [user]);

  const onUpload = async () => {
    if (!file) return;
    setError("");
    const form = new FormData();
    form.append("file", file);
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { docId } = res.data;
      setSelectedDocId(docId);
      await refreshDocs();
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  const onAsk = async () => {
    if (!selectedDocId || !question) return;
    setError("");
    setAnswer("");
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/ask`, {
        docId: selectedDocId,
        question,
      });
      setAnswer(res.data.answer || "");
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold">PDF QA System</h1>
            <nav className="text-sm text-slate-600 flex gap-3">
              <Link to="/">Home</Link>
              {user && <Link to="/chat">Chat</Link>}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500">Backend: {API_BASE}</span>
            {user ? (
              <>
                <span className="text-slate-700">{user.email}</span>
                <button
                  className="px-2 py-1 rounded bg-slate-200"
                  onClick={logout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  className="px-2 py-1 rounded bg-blue-600 text-white"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
                <button
                  className="px-2 py-1 rounded bg-slate-200"
                  onClick={() => navigate("/signup")}
                >
                  Sign up
                </button>
                <button
                  className="px-2 py-1 rounded bg-green-600 text-white"
                  onClick={() => navigate("/contact")}
                >
                  Contact Us
                </button>
              </>
            )}
          </div>
        </header>

        {!user ? (
          // 🚀 Landing view if user not logged in
          <section className="bg-white rounded-lg shadow p-10 text-center space-y-6">
            <h2 className="text-2xl font-bold">Welcome to PDF QA System</h2>
            <p className="text-slate-600">
              Upload PDFs, ask questions, and chat with your documents — but
              first login or sign up!
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="px-4 py-2 rounded bg-slate-200"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </button>
              <button
                className="px-4 py-2 rounded bg-green-600 text-white"
                onClick={() => navigate("/contact")}
              >
                Contact Us
              </button>
            </div>
          </section>
        ) : (
          // 🔐 Authenticated view: your old UI
          <>
            <section className="bg-white rounded-lg shadow p-4 space-y-4">
              <h2 className="font-medium">Upload PDF</h2>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <button
                  className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
                  onClick={onUpload}
                  disabled={!file || loading}
                >
                  {loading ? "Uploading..." : "Upload"}
                </button>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
            </section>

            <section className="bg-white rounded-lg shadow p-4 space-y-4">
              <h2 className="font-medium">Documents</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="py-2">Select</th>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docs.map((d) => (
                      <tr key={d.id} className="border-t">
                        <td className="py-2">
                          <input
                            type="radio"
                            name="doc"
                            checked={selectedDocId === d.id}
                            onChange={() => setSelectedDocId(d.id)}
                          />
                        </td>
                        <td>{d.originalName}</td>
                        <td>
                          <span className="px-2 py-1 rounded text-xs bg-slate-100">
                            {d.status}
                          </span>
                        </td>
                        <td>{(d.size / 1024).toFixed(1)} KB</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-white rounded-lg shadow p-4 space-y-4">
              <h2 className="font-medium">Ask a question</h2>
              <div className="flex gap-3">
                <input
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="Type your question..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
                <button
                  className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
                  onClick={onAsk}
                  disabled={!selectedDocId || !question || loading}
                >
                  {loading ? "Asking..." : "Ask"}
                </button>
                <button
                  className="px-4 py-2 rounded bg-slate-700 text-white"
                  onClick={() => navigate("/chat")}
                >
                  Go to Chat
                </button>
              </div>
              {answer && (
                <div className="border rounded p-3 bg-slate-50 text-slate-800 whitespace-pre-wrap">
                  {answer}
                </div>
              )}
            </section>
          </>
        )}

        <footer className="text-center text-xs text-slate-400">
          Built with React, Express, and LlamaIndex
        </footer>
      </div>
    </div>
  );
}

export default App;
