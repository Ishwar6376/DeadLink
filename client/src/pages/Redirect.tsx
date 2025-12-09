import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

export default function RedirectPage() {
  const location = useLocation();
  // take the entire pathname (without leading slash) as the id
  const id = location.pathname.replace(/^\//, "");

  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [safety, setSafety] = useState<any>(null);

  function normalizeUrl(u: string) {
    if (!u) return u;

    if (u.startsWith("http://") || u.startsWith("https://")) {
      return u;
    }
    return "https://" + u;
  }

async function fetchRedirect(pass?: string) {
  try {
    const res = await axios.post("/api/redirect", { id, password: pass });

    setStatus(res.data.status);
    setUrl(normalizeUrl(res.data.url));
    setSafety(res.data.safety || null);
    setLoading(false);

  } catch (err: any) {
    const data = err.response?.data;
    setStatus(data?.status);   
    setError(data?.message);  
    setLoading(false);
  }
}
  useEffect(() => {
    console.log("Status",status)
    fetchRedirect();
  }, [id]);

  if (loading) return <LoaderUI />;
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

  if (status === "warning") return <WarningUI url={url} safety={safety} />;

  if (status === "safe") return <RedirectingUI url={url} />;

  return <ErrorUI msg={error || "Unknown error"} />;
}


function LoaderUI() {
  return (
    <div className="h-screen flex items-center justify-center text-white">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-white/30 border-t-blue-400 rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-400 mt-3">Checking link security…</p>
      </div>
    </div>
  );
}

function PasswordUI({
  password,
  setPassword,
  fetchRedirect,
  status
}: {
  password: string;
  setPassword: any;
  fetchRedirect: any;
  status: string;
}) {
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
            className="absolute right-3 top-3 text-slate-300 hover:text-white bg-amber-600 hover:cursor-pointer"
            type="button"
          >
            {showPass ? "Hide" : "Show"}
          </button>
        </div>

        <button
          onClick={() => fetchRedirect(password)}
          className="w-full p-3 rounded-lg bg-purple-600 hover:bg-purple-700 hover:cursor-pointer"
        >
          Unlock Link 
        </button>
      </div>
    </div>
  );
}


function WarningUI({ url, safety }: { url: string; safety: any }) {
  return (
    <div className="h-screen flex items-center justify-center text-white bg-slate-900 px-6">
      <div className="bg-red-600/10 border border-red-500 p-8 rounded-xl max-w-lg w-full text-center">
        <ul className="text-left text-red-300 mb-4">
          {safety?.safety_ai?.reasons?.map((r: string) => (
            <li key={r}>• {r}</li>
          ))}
        </ul>

        <a
          href={url}
          className="px-5 py-3 bg-red-500 rounded-lg font-bold hover:bg-red-600 transition"
        >
          Continue Anyway →
        </a>
      </div>
    </div>
  );
}

function RedirectingUI({ url }: { url: string }) {
  return (
    <div className="h-screen flex items-center justify-center text-white bg-slate-900">
      <div className="text-center bg-slate-800/60 border border-slate-700 p-8 rounded-xl shadow-xl">
        <h2 className="text-3xl font-bold mb-4 bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Link Verified ✓
        </h2>

        <p className="text-slate-400 mb-6">
          This link is safe. Click below to continue:
        </p>

        <button
          onClick={() => (window.location.href = url)}
          className="px-6 py-3 text-lg font-semibold rounded-xl 
                     bg-linear-to-r from-blue-600 to-purple-600 
                     hover:scale-105 transition inline-block hover:cursor-pointer"
        >
          Continue →
        </button>

        <p className="mt-4 text-xs text-slate-500">
          You will not be auto-redirected for safety reasons.
        </p>
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
