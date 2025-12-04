import { useState } from "react";
import {
  Copy,
  CheckCircle,
  QrCode,
  Lock,
  Link2,
  Clock,
  Eye,
  Shield,
} from "lucide-react";
import axios from "axios";

interface Features {
  qr: boolean;
  quick: boolean;
  oneTime: boolean;
  password: boolean;
  custom: boolean;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const [features, setFeatures] = useState<Features>({
    qr: false,
    quick: false,
    oneTime: false,
    password: false,
    custom: false,
  });

  const borderColor: Record<keyof Features, string> = {
    qr: "border-cyan-400",
    quick: "border-yellow-400",
    oneTime: "border-red-400",
    password: "border-purple-400",
    custom: "border-pink-400",
  };

  const buttonList = [
    { key: "qr", label: "QR", icon: QrCode },
    { key: "quick", label: "Quick", icon: Clock },
    { key: "oneTime", label: "One-Time", icon: Eye },
    { key: "password", label: "Locked", icon: Lock },
    { key: "custom", label: "Custom", icon: Link2 },
  ] as const;

  const toggleFeature = (key: keyof Features) =>
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleShorten = async () => {
    if (!url) {
      setError("Please enter a valid URL");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setCopied(false);

      const res = await axios.post("/api/sort", {
        url,
        options: features,
        password: features.password ? password : null,
      });

      const short = res.data.shortUrl;
      setShortUrl(short);

      if (features.qr) {
        const qrRes = await axios.post("/api/qr", { url: short });
        setQr(qrRes.data.qr);
      } else {
        setQr("");
      }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="max-w-4xl mx-auto pt-20 px-4">
        {/* HERO */}
        <h1 className="text-5xl sm:text-6xl font-black text-center bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Smart Link Shortener
        </h1>
        <p className="mt-4 text-center text-slate-400">
          Expiring links, One-time access, Password protection, QR codes — All
          in one.
        </p>

        {/* INPUT */}
        <div className="w-full px-6 py-4 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-lg shadow-inner"
>
          <input
            type="url"
            value={url}
            placeholder="Paste long URL here…"
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleShorten()}
            className="w-full rounded-lg p-4 bg-slate-800 border border-slate-700 focus:ring-2 ring-blue-500 outline-none"
          />

          {/* FEATURE SELECTOR */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
            {buttonList.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => toggleFeature(key)}
                className={`group relative p-3 rounded-lg border-2 font-medium transition-colors duration-200 flex items-center justify-center gap-2
                ${
                  features[key]
                    ? `bg-slate-900 ${borderColor[key]} text-white shadow-md`
                    : "bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-700/40"
                }
              `}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* PASSWORD */}
          {features.password && (
            <input
              type="password"
              value={password}
              placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
              className="mt-4 w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
            />
          )}

          {/* BUTTON */}
          <button
            disabled={loading}
            onClick={handleShorten}
            className={`mt-6 w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2
              ${
                loading
                  ? "bg-slate-700 cursor-not-allowed"
                  : "bg-linear-to-r from-blue-600 to-purple-600 hover:opacity-90"
              }
            `}
          >
            {loading ? "Creating..." : "Shorten URL"}
          </button>

          {/* ERROR */}
          {error && (
            <div className="mt-4 bg-red-500/10 text-red-300 p-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* RESULT */}
        {shortUrl && (
          <div className="mt-10 grid sm:grid-cols-2 gap-6 animate-fadeIn">
            <div className="p-5 bg-slate-900 border border-slate-700 rounded-xl">
              <p className="text-sm text-slate-400 flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4" /> Short Link
              </p>
              <div className="flex gap-2">
                <code className="flex-1 break-all p-3 bg-slate-800 rounded-lg text-blue-300">
                  {shortUrl}
                </code>
                <button
                  onClick={handleCopy}
                  className="p-3 rounded-lg bg-blue-600 hover:bg-blue-700"
                >
                  {copied ? <CheckCircle /> : <Copy />}
                </button>
              </div>
            </div>

            {qr && (
              <div className="p-5 bg-slate-900 border border-slate-700 rounded-xl flex justify-center">
                <img src={qr} className="w-40" alt="QR Code" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
