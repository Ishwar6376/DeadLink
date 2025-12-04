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
  ArrowRight,
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
    { key: "qr", label: "QR Code", icon: QrCode },
    { key: "quick", label: "Quick Expire", icon: Clock },
    { key: "oneTime", label: "One-Time", icon: Eye },
    { key: "password", label: "Password", icon: Lock },
    { key: "custom", label: "Custom Slug", icon: Link2 },
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

      const res = await axios.post("/api/short", {
        url,
        options: features,
        password: features.password ? password : null,
      });

      const short = res.data.shortUrl;
      console.log(short);
      setShortUrl(short);
      if (features.qr) {
        const qrRes = await axios.post("/api/qr", { url: short });
        setQr(qrRes.data.qr);
        console.log(qrRes);
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
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 text-white ">
      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        {/* Hero Section */}
        <div className="text-center mb-16"></div>

        {/* Input Section */}
        <div className="mb-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-75"></div>
            <div className="relative p-8 rounded-2xl bg-linear-to-br from-slate-900/80 to-slate-800/80 backdrop-blur border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
              <div className="mb-6 bg-slate-800 rounded-2xl">
                <input
                  type="url"
                  value={url}
                  placeholder="Paste your long URL here…"
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleShorten()}
                  className="w-full px-5 py-4 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                />
              </div>

              {/* Feature Selector */}
              <div className="mb-6 bg-slate-700 rounded-2xl">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {buttonList.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => toggleFeature(key)}
                      className={`group relative p-3 rounded-xl border-2 font-medium transition-all duration-300 flex flex-col items-center justify-center gap-2 text-sm
  ${
    features[key]
      ? `bg-linear-to-br from-red-500 to-orange-500 
         ${borderColor[key]} 
         text-white 
         scale-105
         shadow-lg shadow-red-500/40`
      : "bg-slate-800/40 border-slate-700 text-slate-400 hover:border-orange-400 hover:bg-slate-800/70"
  }
`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Password Input */}
              {features.password && (
                <div className="mb-6 bg-slate-700">
                  <input
                    type="password"
                    value={password}
                    placeholder="Enter protection password"
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-3 rounded-xl  border border-red-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
              )}

              {/* Action Button */}
              <button
                disabled={loading}
                onClick={handleShorten}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 group
                  ${
                    loading
                      ? "bg-slate-700 cursor-not-allowed"
                      : "bg-linear-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/30"
                  }
                `}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating link...
                  </>
                ) : (
                  <>
                    Shorten URL
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm font-medium">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {shortUrl && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Short URL Card */}
              <div className="group relative">
                <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                <div className="relative p-6 rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Your Short Link
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <code className="flex-1 px-4 py-3 bg-slate-800/50 rounded-xl text-blue-300 text-sm font-mono break-all border border-slate-700/50">
                      {shortUrl}
                    </code>
                    <button
                      onClick={handleCopy}
                      className="px-4 py-3 rounded-xl bg-linear-to-r from-blue-600 to-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center"
                    >
                      {copied ? (
                        <CheckCircle className="w-5 h-5 text-green-300" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* QR Code Card */}
              {qr && (
                <div className="group relative">
                  <div className="absolute inset-0 bg-linear-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <div className="relative p-6 rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 flex flex-col items-center justify-center min-h-64">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                      QR Code
                    </p>
                    <img
                      src={qr}
                      className="w-48 h-48 rounded-lg"
                      alt="QR Code"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
