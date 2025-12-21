import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { publicApi } from "../hooks/useApi";

export default function RedirectPage() {
  const location = useLocation();
  const id = location.pathname.replace(/^\//, "");

  const [error, setError] = useState("");
  const [url, setUrl] = useState("");

  const [status, setStatus] = useState("");       
  const [loading, setLoading] = useState(true);

  const [password, setPassword] = useState("");

  const [summary, setSummary] = useState("");     
  const [safety, setSafety] = useState<any>(null); 
  const [analyzing, setAnalyzing] = useState(false);


  function normalizeUrl(u: string) {
    if (!u) return u;
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    return "https://" + u;
  }

  
  async function analyzeWeb() {
    try {
      setAnalyzing(true);

      const res = await publicApi.post("/api/analyze", { id:id });
      console.log(res);
      setSummary(res.data.summary || "No summary available");
      setSafety(res.data.safety || null);

    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  }

  async function fetchRedirect(pass?: string) {
    try {
      const res = await publicApi.post("/api/redirect", { id:id, password: pass });
      console.log(res.data);
      setStatus(res.data.status);
      setUrl(normalizeUrl(res.data.url));
      setLoading(false);

    } catch (err: any) {
  const data = err.response?.data;

  setStatus(data?.status);

  if (
    data?.status !== "password_required" &&
    data?.status !== "wrong_password"
  ) {
    setError(data?.message || "Something went wrong");
  }

  setLoading(false);
}
  }

  useEffect(() => {
    fetchRedirect();
  }, [id]);


  if (loading) return <LoaderUI />;
  if(error) return <ErrorUI msg={error} />

  if (status === "expired") return <ErrorUI msg="This link has expired." />;
  if (status === "used") return <ErrorUI msg="This link has already been used." />;

  if (status === "password_required" || status === "wrong_password") {
    return (
      <PasswordUI
        status={status}
        password={password}
        setPassword={setPassword}
        fetchRedirect={fetchRedirect}
      />
    );
  }

  // After redirect → show analyze button
  return (
    <AnalyzePageUI
      url={url}
      summary={summary}
      safety={safety}
      analyzeWeb={analyzeWeb}
      analyzing={analyzing}
    />
  );
}


function LoaderUI() {
  return (
    <div className="h-screen flex items-center justify-center text-white">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-white/30 border-t-blue-400 rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-400 mt-3">Redirecting…</p>
      </div>
    </div>
  );
}


function PasswordUI({ password, setPassword, fetchRedirect, status }: any) {
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="h-screen flex items-center justify-center text-white bg-slate-900">
      <div className="bg-slate-800/60 p-8 rounded-xl max-w-sm w-full border border-slate-700">
        <h2 className="text-xl font-bold mb-4 text-purple-300">
          This link is password protected
        </h2>

        {status === "wrong_password" && (
          <p className="text-red-400 text-sm mb-3">Incorrect password</p>
        )}

        <div className="relative">
          <input
            className="w-full p-3 bg-slate-600 border border-slate-700 rounded-lg mb-4 pr-12"
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password..."
          />
          <button
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-3 text-slate-300 hover:text-white"
          >
            {showPass ? "Hide" : "Show"}
          </button>
        </div>

        <button
          onClick={() => fetchRedirect(password)}
          className="w-full p-3 rounded-lg bg-purple-600 hover:bg-purple-700"
        >
          Unlock Link
        </button>
      </div>
    </div>
  );
}
function AnalyzePageUI({ url, summary, safety, analyzing, analyzeWeb }: any) {
  const hasAnalysis = summary || safety;

  return (
    <div className="min-h-screen flex items-center justify-center text-white bg-slate-900 px-6 py-10">
      <div className="max-w-2xl w-full space-y-6 bg-slate-800/40 p-8 rounded-xl border border-slate-700">

        <h2 className="text-2xl font-bold text-blue-400 text-center">
          Link Ready — Analyze Before Visiting
        </h2>

        {/* Analyze button */}
        <button
          onClick={analyzeWeb}
          disabled={analyzing}
          className="w-full p-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition"
        >
          {analyzing ? "Analyzing…" : "Analyze Website"}
        </button>

        {hasAnalysis && (
          <>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-300 mb-2">Summary</h3>
              <p className="text-slate-200 whitespace-pre-line">{summary}</p>
            </div>

            {safety?.safety_ai?.reasons?.length > 0 && (
              <div className="bg-red-600/10 p-4 border border-red-500 rounded-lg">
                <h3 className="text-red-400 font-bold mb-2">Warning</h3>
                <ul className="text-red-300 text-left">
                  {safety.safety_ai.reasons.map((r: string) => (
                    <li key={r}>• {r}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        <a
          href={url}
          className="w-full block text-center mt-4 p-3 rounded-xl bg-green-600 hover:bg-green-700 transition font-bold"
        >
          Continue →
        </a>
      </div>
    </div>
  );
}


function ErrorUI({ msg }: { msg: string }) {
  return (
    <div className="h-screen flex items-center justify-center text-white bg-slate-900">
      <div className="bg-red-500/10 border border-red-500 p-6 rounded-xl">
        <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
        <p>{msg}</p>
      </div>
    </div>
  );
}
