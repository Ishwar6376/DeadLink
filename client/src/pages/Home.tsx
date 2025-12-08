import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";

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
  Check,
  ChevronUp,
  ChevronDown,
  
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

interface Features {
  qr: boolean;
  quick: boolean;
  oneTime: boolean;
  password: boolean;
  custom: boolean;
}

export default function Home() {
  const [slug, setSlug] = useState("");
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [day, setDay] = useState(1);
  const [shortButton, setShortButton] = useState("Short");
  const {  isSignedIn } = useUser();

  const isLoggedIn = isSignedIn;

  const [features, setFeatures] = useState<Features>({
    qr: false,
    quick: false,
    oneTime: false,
    password: false,
    custom: false,
  });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!features.quick || document.activeElement?.tagName === "INPUT")
        return;

      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown"].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case "ArrowUp":
          setDay((d) => Math.min(d + 1, 30));
          break;
        case "ArrowDown":
          setDay((d) => Math.max(d - 1, 1));
          break;
        case "PageUp":
          setDay((d) => Math.min(d + 5, 30));
          break;
        case "PageDown":
          setDay((d) => Math.max(d - 5, 1));
          break;
        case "1":
          setDay(1);
          break;
        case "3":
          setDay(3);
          break;
        case "5":
          setDay(5);
          break;
        case "7":
          setDay(7);
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [features.quick]);

  const linearColor: Record<keyof Features, string> = {
    qr: "from-cyan-500/80 to-blue-500/80",
    quick: "from-amber-500/80 to-orange-500/80",
    oneTime: "from-rose-500/80 to-red-500/80",
    password: "from-violet-500/80 to-purple-500/80",
    custom: "from-pink-500/80 to-rose-500/80",
  };

  const shadowColor: Record<keyof Features, string> = {
    qr: "shadow-cyan-500/40",
    quick: "shadow-amber-500/40",
    oneTime: "shadow-rose-500/40",
    password: "shadow-violet-500/40",
    custom: "shadow-pink-500/40",
  };

  const borderColor: Record<keyof Features, string> = {
    qr: "border-cyan-400",
    quick: "border-amber-400",
    oneTime: "border-rose-400",
    password: "border-violet-400",
    custom: "border-pink-400",
  };

  const buttonList = [
    { key: "qr", label: "QR Code", icon: QrCode, desc: "Generate QR" },
    { key: "quick", label: "Quick Expire", icon: Clock, desc: "Auto expire" },
    { key: "oneTime", label: "One-Time", icon: Eye, desc: "Single use" },
    { key: "password", label: "Password", icon: Lock, desc: "Protected" },
    { key: "custom", label: "Custom Slug", icon: Link2, desc: "Custom URL" },
  ] as const;

  const toggleFeature = (key: keyof Features) =>
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleShorten = async () => {
    if (!url) {
      setError("Please enter a valid URL");
      return;
    }
    setShortButton("Shorting");
    try {
      const endpoint = features.custom ? "/api/slug" : "/api/short";
      const response = await axios.post(endpoint, { url });
      
      const shortUrl = response.data.shortUrl;
      setShortUrl(shortUrl);
      console.log("Short URL:", shortUrl);
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("An error occurred while shortening the URL");
      }
    }
    setShortButton("Shorted");
    setLoading(true);
    setError("");
    setCopied(false);
    setLoading(false);
  };

  useEffect(() => {
    if (!shortUrl) return;
    let cancelled = false;
    async function runFeatures() {
      // console.log("User logged in:", isLoggedIn);

      if (features.qr) {
        {
          try {
            const response = await axios.post("/api/qr", { url: shortUrl });
            if (!cancelled) setQr(response.data.qr);
          } catch (err) {
            if (!cancelled) {
              console.error(err);
              setError("Error generating QR");
            }
          }
        }
      }

      if (features.quick) {
        if (!isLoggedIn) {
          setError("Login required for Quick Expire");
        } else {
          try {
            const expiryDate = new Date(Date.now() + day * 86400000);
            await axios.post("/api/quick", {
              url: shortUrl,
              expiry: expiryDate,
            });
          } catch (err) {
            if (!cancelled) {
              console.error(err);
              setError("Error setting Quick Expire");
            }
          }
        }
      }

      if (features.password) {
        if (!isLoggedIn) {
          setError("Login required for Password Protection");
        } else {
          try {
            await axios.post("/api/pass", { url: shortUrl, pass: password });
          } catch (err) {
            if (!cancelled) {
              console.error(err);
              setError("Error setting password");
            }
          }
        }
      }
      if (features.oneTime) {
      if (features.oneTime) {
        if (!isLoggedIn) {
          setError("Login required for One Time");
        } else {
          try {
            await axios.post("/api/oneTime", { url: shortUrl });
          } catch (err) {
            if (!cancelled) {
              console.error(err);
              setError("Error setting One Time");
            }
          }
        }
      }
    }
  }
    runFeatures();
    return () => {
      cancelled = true;
    };
    }, [shortUrl]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogin = () => {
    window.location.href = "/login";
  };
  const loginRequired =
    (features.quick || features.password || features.oneTime) && !isLoggedIn;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        {/* <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4">
            <span className="bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Smart Links
            </span>
            <br />
            <span className="text-slate-200">for Modern Sharing</span>
          </h1>
          <p className="text-lg text-slate-400">
            Create powerful short links with advanced features
          </p>
        </div> */}

        {/* Input Section */}
        <div className="mb-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-75"></div>
            <div className="relative p-8 rounded-3xl bg-linear-to-br from-slate-900/80 to-slate-800/80 backdrop-blur border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 space-y-6">
              {/* URL Input */}
              <div>
                <input
                  type="url"
                  value={url}
                  placeholder="Paste your long URL here…"
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleShorten()}
                  className="w-full px-6 py-4 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-wider">
                  Select Features
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {buttonList.map(({ key, label, icon: Icon, desc }) => (
                    <button
                      key={key}
                      onClick={() => toggleFeature(key)}
                      className={`group relative overflow-hidden rounded-xl transition-all duration-300 p-4 flex flex-col items-center justify-center gap-2
                      ${features[key]
                          ? `bg-linear-to-br ${linearColor[key]} border-2 ${borderColor[key]} text-white shadow-lg ${shadowColor[key]} scale-105`
                          : "bg-slate-800/40 border-2 border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800/60"
                        }
                    `}
                    >
                      {features[key] && (
                        <div className="absolute top-2 right-2 bg-white/30 rounded-full p-1">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div
                        className={`p-2 rounded-lg transition-all ${features[key]
                          ? "bg-white/20"
                          : "bg-slate-700/30 group-hover:bg-slate-700/50"
                          }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-sm">{label}</span>
                      <span
                        className={`text-xs ${features[key] ? "text-white/80" : "text-slate-500"
                          }`}
                      >
                        {desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {features.password && (
                <div className="relative group">
                  <div className="absolute inset-0 bg-linear-to-r from-violet-500/20 to-purple-500/20 rounded-xl blur-lg opacity-50"></div>
                  <input
                    type="password"
                    value={password}
                    placeholder="Enter protection password"
                    onChange={(e) => setPassword(e.target.value)}
                    className="relative w-full px-6 py-3 rounded-xl bg-slate-800/50 border border-violet-500/30 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  />
                </div>
              )}
              {features.custom && (    // handling custom slug
                <div className="relative group">
                  <div className="absolute inset-0 bg-linear-to-r from-pink-500/20 to-rose-500/20 rounded-xl blur-lg opacity-50"></div>
                  <input
                    type="text"
                    value={slug}
                    placeholder="Enter custom slug (e.g. my-link)"
                    onChange={(e) => setSlug(e.target.value)}
                    className="relative w-full px-6 py-3 rounded-xl bg-slate-800/50 border border-pink-500/30 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                  />
                </div>
              )}
              {features.quick && !isLoggedIn && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-wider">
                    login required
                  </p>
                </div>
              )}
              {features.quick && isLoggedIn && (
                <div className="relative group mb-6">
                  <div className="absolute inset-0 bg-linear-to-r from-amber-500/20 to-orange-500/20 rounded-3xl blur-xl opacity-50"></div>

                  <div className="relative p-6 rounded-3xl bg-linear-to-br from-slate-900/80 to-slate-800/80 border border-amber-500/30 space-y-6">
                    <p className="text-sm font-semibold text-amber-400">
                      Link expires in
                    </p>

                    {/* Preset Buttons */}
                    <div className="grid grid-cols-4 gap-3">
                      {[1, 3, 5, 7].map((d) => (
                        <button
                          key={d}
                          onClick={() => setDay(d)}
                          className={`py-3 rounded-lg font-semibold transition-all duration-200
                            ${day === d
                              ? "bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/40 scale-105"
                              : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 border border-slate-700"
                            }
                          `}
                        >
                          {d}d
                        </button>
                      ))}
                    </div>

                    {/* Samsung-style picker */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-linear-to-r from-amber-500/30 to-orange-500/30 rounded-3xl blur-xl opacity-40"></div>

                      <div className="relative bg-linear-to-br from-slate-900/80 to-slate-800/80 backdrop-blur border border-amber-500/30 rounded-3xl p-8">
                        <div className="flex flex-col items-center gap-4">
                          {/* Up */}
                          <button
                            onClick={() =>
                              setDay((prev) => Math.min(prev + 1, 30))
                            }
                            className="p-3 hover:bg-slate-700/50 rounded-xl transition-colors active:scale-95"
                          >
                            <ChevronUp className="w-8 h-8 text-amber-400" />
                          </button>

                          {/* Display */}
                          <div className="relative">
                            <div className="absolute inset-0 bg-linear-to-r from-amber-500/40 to-orange-500/40 rounded-3xl blur-lg"></div>
                            <div className="relative bg-slate-800/60 border-2 border-amber-500/50 rounded-3xl px-12 py-6 flex items-center justify-center min-w-48">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={day}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, "");

                                  // Allow empty while typing
                                  if (val === "") {
                                    setDay(0);
                                    return;
                                  }

                                  setDay(Number(val));
                                }}
                                onBlur={() => {
                                  if (day < 1) setDay(1);
                                  if (day > 365) setDay(365);
                                  if (day > 365) setDay(365);
                                }}
                                placeholder="Days"
                                className="w-32 text-center text-6xl font-black text-amber-400 bg-transparent outline-none"
                              />
                            </div>
                          </div>

                          {/* Down */}
                          <button
                            onClick={() =>
                              setDay((prev) => Math.max(prev - 1, 1))
                            }
                            className="p-3 hover:bg-slate-700/50 rounded-xl transition-colors active:scale-95"
                          >
                            <ChevronDown className="w-8 h-8 text-amber-400" />
                          </button>

                          <p className="text-sm text-slate-400 font-semibold uppercase tracking-widest">
                            Days
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400">
                      Expires after{" "}
                      <span className="text-amber-400 font-bold">{day}</span>{" "}
                      day{day > 1 && "s"}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={loginRequired ? handleLogin : handleShorten}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 group
                ${
                  loading
                    ? "bg-slate-700 cursor-not-allowed"
                    : loginRequired
                    ? "bg-red-700 hover:bg-red-600"
                    : "bg-linear-to-r from-blue-600 to-purple-600 hover:shadow-xl hover:scale-105"
                }
              `}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating link...
                  </>
                ) : loginRequired ? (
                  <>
                    Login to continue
                    <Lock className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    {shortButton}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
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
                <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-75"></div>
                <div className="relative p-6 rounded-2xl bg-linear-to-br from-slate-900/80 to-slate-800/80 backdrop-blur border border-slate-700/50 hover:border-blue-500/30 transition-all duration-300 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Shield className="w-4 h-4 text-blue-400" />
                    </div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Your Short Link
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <code className="flex-1 px-4 py-3 bg-slate-800/50 rounded-lg text-blue-300 text-sm font-mono break-all border border-slate-700/50 hover:border-blue-500/30 transition-all">
                      {shortUrl}
                    </code>
                    <button
                      onClick={handleCopy}
                      className="px-4 py-3 rounded-lg bg-linear-to-r from-blue-600 to-blue-700 hover:shadow-lg hover:shadow-blue-500/40 transition-all flex items-center justify-center hover:scale-105"
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
                  <div className="absolute inset-0 bg-linear-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-75"></div>

                  <div className="relative p-6 rounded-2xl bg-linear-to-br from-slate-900/80 to-slate-800/80 backdrop-blur border border-slate-700/50 hover:border-purple-500/30 transition-all duration-300 flex flex-col items-center justify-center min-h-80">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <QrCode className="text-purple-400" />
                      </div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        QR Code
                      </p>
                    </div>
                    <div className="p-4 bg-white rounded-xl shadow-lg">
                      <img
                        src={qr}
                        alt="QR Code"
                        className="w-48 h-48 object-contain"
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => shareQR(qr)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-white font-semibold"
                      >
                        Share QR
                      </button>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          "Scan this QR:"
                        )}`}
                        className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 transition text-white font-semibold"
                        target="_blank"
                      >
                        <FaWhatsapp className="w-full h-full"/>
                      </a>

                      <a
                        href={qr}
                        download="qr.png"
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 transition text-white font-semibold"
                      >
                        Download
                      </a>
                    </div>

                    {/* Desktop fallback */}
                    {!navigator.canShare && (
                      <p className="text-xs text-slate-500 mt-2">
                        Sharing isn’t supported on this device. Download
                        instead.
                      </p>
                    )}
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

async function shareQR(qrDataUrl: string) {
  try {
    if (!navigator.canShare) {
      alert("Sharing is not supported on this device.");
      return;
    }

    const res = await fetch(qrDataUrl);
    const blob = await res.blob();
    const file = new File([blob], "qr.png", { type: blob.type });

    await navigator.share({
      title: "Scan this QR",
      text: "Here is the QR code!",
      files: [file],
    });
  } catch (e) {
    console.error("Share failed:", e);
  }
}
