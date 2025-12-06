import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function RedirectPage() {
  const { id } = useParams();
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRedirect() {
      try {
        console.log("iddd",id);
        const res = await axios.post("/api/redirect", { id });
        console.log(res)
        let redirectUrl = res.data.url;
        if (
          !redirectUrl.startsWith("http://") &&
          !redirectUrl.startsWith("https://")
        ) {
          redirectUrl = "https://" + redirectUrl;
        }

        setUrl(redirectUrl);
        setLoading(false);

      } catch (err: any) {
        setLoading(false);
        setError(err.response?.data || "Invalid or expired link.");
      }
    }

    fetchRedirect();
  }, [id]);
  return (
    <div className="flex flex-col items-center justify-center h-screen text-white bg-slate-900 px-6">
      <div className="bg-slate-800/60 border border-slate-700 p-8 rounded-2xl max-w-lg w-full text-center shadow-xl">

        <h1 className="text-3xl font-bold mb-4 bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Redirecting...
        </h1>


        {loading && (
          <div className="flex flex-col items-center gap-3 my-6">
            <div className="w-10 h-10 border-4 border-white/30 border-t-blue-400 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm">Performing quick security check…</p>
          </div>
        )}
        
        {!loading && !error && (
          <div className="mt-4">
            <p className="text-slate-400 mb-2 text-sm">
              You are being redirected to:
            </p>

            <p className="text-blue-300 font-mono break-all mb-4">{url}</p>

            <a
              href={url}
              className="px-6 py-3 text-lg font-semibold rounded-xl bg-linear-to-r from-blue-600 to-purple-600 hover:scale-105 transition inline-block"
            >
              Go Now →
            </a>

            <p className="mt-3 text-xs text-slate-500">
              If the security check takes too long, click the button above.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-400/30">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
