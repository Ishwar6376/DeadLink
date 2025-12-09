import React, { useEffect, useState } from "react";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/clerk-react";
import axios from "axios";
import {
  Link2,
  Shield,
  Clock,
  QrCode,
  RefreshCw,
  Copy,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";


type Url = {
  _id: string;
  url: string;
  shortUrl: string;
  password?: string | null;
  expiry?: string | null;
  clicks: number;
  isSingleValid?: boolean;
  linkCntLimit?: number | null;
  isPublic?: boolean;
  qr?: boolean;
  createdAt?: string | Date;
};

type EditForm = {
  url: string;
  password: "yes" | "no";
  passValue: string;
  expiry: string;
  oneTime: boolean;
  clicksLimit: string | number;
  isPublic: boolean;
};



export default function Dashboard(){
  const { user } = useUser();

  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copyState, setCopyState] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "protected" | "qr" | "expired">(
    "all"
  );
  const [sortBy, setSortBy] = useState<"recent" | "clicks">("recent");

  const [editLink, setEditLink] = useState<Url | null>(null);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/me");
      setUrls(res.data.urls || []);
    } catch (err) {
      console.error("Failed to load URLs", err);
    }
    setLoading(false);
  };

  const generateQrFor = async (link: Url) => {
    try {
      const res = await axios.post("/api/qr", { url: link.shortUrl });
      const qr = res.data.qr;
      setUrls((prev) => prev.map((u) => (u._id === link._id ? { ...u, qr } : u)));
    } catch (err) {
      console.error("Failed to generate QR", err);
    }
  };

  const removePassword = async (link: Url) => {
    try {
      await axios.post("/api/removePass", { shortUrl: link.shortUrl });
      setUrls((prev) => prev.map((u) => (u._id === link._id ? { ...u, password: null } : u)));
    } catch (err) {
      console.error("Failed to remove password", err);
    }
  };

  const handleCopy = async (txt: string, id: string) => {
    try {
      await navigator.clipboard.writeText(txt);
      setCopyState(id);
      setTimeout(() => setCopyState(null), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const deleteUrl = async (id: string) => {
    try {
      await axios.delete(`/api/delete/${id}`);
      setUrls((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Failed to delete URL", err);
    }
  };

  /* ---------------- filter + sort ---------------- */
  const filtered = urls.filter((u) => {
    const q = searchTerm.trim().toLowerCase();
    const match =
      u.shortUrl.toLowerCase().includes(q) ||
      u.url.toLowerCase().includes(q) ||
      u._id.toLowerCase().includes(q);

    if (filterType === "protected") return Boolean(u.password) && match;
    if (filterType === "qr") return Boolean(u.qr) && match;
    if (filterType === "expired")
      return Boolean(u.expiry && new Date(u.expiry) < new Date()) && match;

    return match;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "recent") {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    }
    if (sortBy === "clicks") return b.clicks - a.clicks;
    return 0;
  });

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-[radial-linear(ellipse_at_top_left,var(--tw-linear-stops))] from-slate-900/60 via-slate-950 to-slate-900 text-white">
          {/* subtle background blur layers */}
          <div className="fixed inset-0 pointer-events-none -z-10">
            <div className="absolute -left-48 -top-40 w-152 h-52 rounded-full bg-linear-to-br from-indigo-600/12 to-sky-500/6 blur-3xl" />
            <div className="absolute -right-48 -bottom-40 w-3xl h-192 rounded-full bg-linear-to-tr from-purple-600/10 to-pink-500/6 blur-3xl" />
          </div>

          <div className="max-w-6xl mx-auto px-6 py-12">
            <Header user={user} loading={loading} reload={loadData} />
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="backdrop-blur-sm bg-white/3 border border-white/6 rounded-2xl p-5 shadow-glass">
                  <SearchAndFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filterType={filterType}
                    setFilterType={setFilterType}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                  />
                </div>

                <div>
                  <UrlList
                    urls={sorted}
                    loading={loading}
                    copyState={copyState}
                    handleCopy={handleCopy}
                    deleteUrl={deleteUrl}
                    openEdit={(link) => setEditLink(link)}
                    generateQrFor={(l) => generateQrFor(l)}
                    removePassword={(l) => removePassword(l)}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="backdrop-blur-sm bg-white/3 border border-white/6 rounded-2xl p-5 shadow-glass">
                  <StatsBoard urls={urls} />
                </div>

                <div className="backdrop-blur-sm bg-white/3 border border-white/6 rounded-2xl p-5 shadow-glass">
                  <QuickActions reload={loadData} loading={loading} />
                </div>
              </div>
            </div>

            {editLink && (
              <EditModal
                link={editLink}
                close={() => setEditLink(null)}
                update={(updated: Url) => {
                  setUrls((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
                }}
                reload={loadData}
                addLink={(n) => setUrls((prev) => [n, ...prev])}
              />
            )}
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}



function Header({ user, loading, reload }: any) {
  return (
    <header className="flex items-center justify-between gap-6">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-indigo-300 to-pink-300">
          Link Dashboard
        </h1>
        <p className="text-slate-300 mt-1">
          Welcome back, <span className="text-indigo-200">{user?.fullName}</span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={reload}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 transition shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
    </header>
  );
}

/* ---------------- Search & Filters (Neo-Glass) ---------------- */

function SearchAndFilters({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  sortBy,
  setSortBy,
}: {
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  filterType: "all" | "protected" | "qr" | "expired";
  setFilterType: (f: "all" | "protected" | "qr" | "expired") => void;
  sortBy: "recent" | "clicks";
  setSortBy: (s: "recent" | "clicks") => void;
}) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search links, URLs or IDs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/6 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>

      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex gap-2 flex-wrap">
          {(["all", "protected", "qr", "expired"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterType === t
                  ? "bg-linear-to-r from-indigo-600 to-sky-600 text-white shadow"
                  : "bg-white/3 text-slate-200 border border-white/6 hover:bg-white/4"
              }`}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "recent" | "clicks")}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/6 text-white"
          >
            <option value="recent">Most Recent</option>
            <option value="clicks">Most Clicks</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function StatsBoard({ urls }: { urls: Url[] }) {
  const total = urls.length;
  const protectedLinks = urls.filter((u) => u.password).length;
  const expired = urls.filter((u) => u.expiry && new Date(u.expiry) < new Date()).length;
  const qrCount = urls.filter((u) => u.qr).length;
  const totalClicks = urls.reduce((s, u) => s + (u.clicks || 0), 0);

  const items = [
    { title: "Total Links", value: total, icon: <Link2 /> },
    { title: "Protected", value: protectedLinks, icon: <Shield /> },
    { title: "Expired", value: expired, icon: <Clock /> },
    { title: "QR Codes", value: qrCount, icon: <QrCode /> },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Overview</h3>
        <div className="text-sm text-slate-400">Clicks: <span className="font-medium text-white">{totalClicks}</span></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map((it, i) => (
          <div key={i} className="p-3 rounded-xl bg-white/3 border border-white/6 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/5">
              {React.cloneElement(it.icon as any, { className: "w-5 h-5 text-white/90" })}
            </div>
            <div>
              <div className="text-slate-300 text-xs">{it.title}</div>
              <div className="text-white font-semibold text-lg">{it.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function QuickActions({ reload, loading }: { reload: () => void; loading: boolean }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
      <div className="flex flex-col gap-3">
        <button
          onClick={reload}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-indigo-600 to-sky-600 hover:scale-[1.01] transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Links
        </button>

        <a
          href="/"
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/6 hover:bg-white/6 transition"
        >
          Create New Link
        </a>
      </div>
    </div>
  );
}


function UrlList({
  urls,
  loading,
  copyState,
  handleCopy,
  deleteUrl,
  openEdit,
  generateQrFor,
  removePassword,
}: {
  urls: Url[];
  loading: boolean;
  copyState: string | null;
  handleCopy: (txt: string, id: string) => void;
  deleteUrl: (id: string) => void;
  openEdit: (link: Url) => void;
  generateQrFor: (link: Url) => Promise<void>;
  removePassword: (link: Url) => Promise<void>;
}) {
  if (loading)
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-12 h-12 border-4 border-white/10 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!urls || urls.length === 0)
    return (
      <div className="py-10 text-center text-slate-400">
        No links yet — create your first short link.
      </div>
    );

  return (
    <div className="space-y-4">
      {urls.map((link) => (
        <UrlCard
          key={link._id}
          link={link}
          copyState={copyState}
          handleCopy={handleCopy}
          deleteUrl={deleteUrl}
          openEdit={openEdit}
          generateQrFor={generateQrFor}
          removePassword={removePassword}
        />
      ))}
    </div>
  );
}

function UrlCard({
  link,
  copyState,
  handleCopy,
  deleteUrl,
  openEdit,
  generateQrFor,
  removePassword,
}: {
  link: Url;
  copyState: string | null;
  handleCopy: (txt: string, id: string) => void;
  deleteUrl: (id: string) => void;
  openEdit: (link: Url) => void;
  generateQrFor: (link: Url) => Promise<void>;
  removePassword: (link: Url) => Promise<void>;
}) {
  
  const [open, setOpen] = useState<boolean>(false);
  const expired = Boolean(link.expiry && new Date(link.expiry) < new Date());

  return (
    <article className="relative group">
      <div className="backdrop-blur-sm bg-white/2 border border-white/6 rounded-2xl p-4 flex flex-col gap-3 shadow-glass hover:scale-[1.004] transition-transform">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-indigo-200 truncate">{link.shortUrl}</p>
              {expired && <span className="text-amber-300 text-xs bg-amber-900/20 px-2 py-0.5 rounded-md">Expired</span>}
            </div>
            <p className="text-slate-300 text-sm mt-1 truncate">→ {link.url}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(link.shortUrl, link._id)}
              className={`px-3 py-2 rounded-md text-sm ${copyState === link._id ? "bg-emerald-700/30 text-emerald-200" : "bg-white/3 text-slate-100 hover:bg-white/4"}`}
            >
              {copyState === link._id ? "Copied" : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={() => openEdit(link)}
              className="px-3 py-2 rounded-md bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-100 text-sm"
            >
              Edit
            </button>

            <button
              onClick={() => generateQrFor(link)}
              className="px-3 py-2 rounded-md bg-pink-600/20 hover:bg-pink-600/30 text-pink-200 text-sm"
              title="Generate / View QR"
            >
              <QrCode className="w-4 h-4" />
            </button>

            {link.password && (
              <button
                onClick={() => removePassword(link)}
                className="px-3 py-2 rounded-md bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 text-sm"
                title="Remove password"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => deleteUrl(link._id)}
              className="p-2 rounded-md bg-red-600/20 hover:bg-red-600/30 text-red-200"
              title="Delete link"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setOpen((s) => !s)}
              className="p-2 rounded-md bg-white/3 hover:bg-white/4 text-slate-200"
            >
              {open ? <ChevronUp /> : <ChevronDown />}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {link.password && <Badge label="Protected" color="purple" />}
          {link.isSingleValid && <Badge label="One-time" color="rose" />}
          {typeof link.linkCntLimit === "number" && <Badge label={`${link.linkCntLimit} max`} color="green" />}
          {link.qr && <Badge label="QR" color="pink" />}
          {!link.isPublic && <Badge label="Private" color="red" />}
        </div>

        {open && (
          <div className="mt-3 border-t border-white/6 pt-3 text-sm text-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white/3 rounded-md p-3">
              <div className="text-xs text-slate-400">Clicks</div>
              <div className="font-medium text-white">{link.clicks}</div>
            </div>
            <div className="bg-white/3 rounded-md p-3">
              <div className="text-xs text-slate-400">Status</div>
              <div className={`font-medium ${expired ? "text-amber-300" : "text-emerald-300"}`}>{expired ? "Expired" : "Active"}</div>
            </div>
            <div className="bg-white/3 rounded-md p-3">
              <div className="text-xs text-slate-400">Created</div>
              <div className="font-medium">{link.createdAt ? new Date(link.createdAt).toLocaleString() : "—"}</div>
            </div>
          </div>
        )}
        {open && link.qr && (
          <div className="mt-3">
            <div className="text-xs text-slate-400 mb-2">QR Code</div>
            <div className="p-3 bg-white/5 rounded-md inline-block">
              <img src={link.qr as any} alt="QR code" className="w-40 h-40" />
            </div>
          </div>
        )}
        {/* removed duplicate large QR display; keep single compact QR above */}
      </div>
    </article>
  );
}

/* ---------------- Badge ---------------- */

function Badge({ label, color }: { label: string; color: "purple" | "rose" | "green" | "pink" | "red" }) {
  const map: Record<string, string> = {
    purple: "bg-purple-900/30 text-purple-300",
    rose: "bg-rose-900/30 text-rose-300",
    green: "bg-emerald-900/30 text-emerald-300",
    pink: "bg-pink-900/30 text-pink-300",
    red: "bg-red-900/30 text-red-300",
  };
  return <span className={`px-2 py-1 rounded-md text-xs font-medium ${map[color]}`}>{label}</span>;
}

/* ---------------- Edit Modal (Neo-Glass) ---------------- */

function EditModal({ link, close, update, reload, addLink }: { link: Url; close: () => void; update: (u: Url) => void; reload?: () => Promise<void> | (() => void); addLink?: (n: Url) => void }) {
  const [form, setForm] = useState<EditForm>({
    url: link.url,
    password: link.password ? "yes" : "no",
    passValue: "",
    expiry: link.expiry ? (typeof link.expiry === "string" ? link.expiry.slice(0, 10) : new Date(link.expiry).toISOString().slice(0, 10)) : "",
    oneTime: Boolean(link.isSingleValid),
    clicksLimit: link.linkCntLimit ?? "",
    isPublic: link.isPublic ?? true,
  });

  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [customSlug, setCustomSlug] = useState<string>("");
  const [slugLoading, setSlugLoading] = useState<boolean>(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    // small validation
    if (!form.url || !form.url.startsWith("http")) {
      setError("Please enter a valid URL (must start with http/https).");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        url: form.url,
        password: form.password === "yes" ? form.passValue || true : null,
        expiry: form.expiry || null,
        isSingleValid: form.oneTime,
        linkCntLimit: form.clicksLimit || null,
        isPublic: form.isPublic,
      };

      const res = await axios.post(`/api/update/${link._id}`, payload);
      const updated: Url = res.data.updated ?? res.data ?? { ...link, ...payload };
      update(updated);
      close();
    } catch (err: any) {
      console.error("Failed to save edits", err);
      setError(err?.response?.data?.error || "Save failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const createCustomSlug = async () => {
    setSlugError(null);
    if (!customSlug || customSlug.length < 3) {
      setSlugError("Slug must be at least 3 characters");
      return;
    }
    setSlugLoading(true);
    try {
      const res = await axios.post(`/api/slug`, { url: form.url, slug: customSlug });
      const created: Url | undefined = res.data?.created;
      // If parent passed addLink, insert directly; otherwise fall back to reload
      if (created && addLink) {
        addLink(created);
      } else if (reload) {
        await reload();
      }
      close();
    } catch (err: any) {
      console.error("Failed to create slug", err);
      setSlugError(err?.response?.data?.message || "Failed to create slug");
    } finally {
      setSlugLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />

      <div className="relative w-full max-w-xl mx-4">
        <div className="transform transition-all duration-300 scale-100">
          <div className="bg-white/4 border border-white/6 rounded-2xl p-6 shadow-xl backdrop-blur-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">Edit Link</h3>
                <p className="text-sm text-slate-300 mt-1">Change link details, password, expiry, and visibility.</p>
              </div>
              <button onClick={close} className="p-2 rounded-md hover:bg-white/6">
                <X className="w-5 h-5 text-slate-200" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <label className="text-sm text-slate-300">Original URL</label>
              <input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="w-full p-3 rounded-lg bg-white/5 border border-white/6 text-white placeholder-slate-400"
                placeholder="https://example.com/..."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-300">Password protection</label>
                  <select
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value as "yes" | "no" })}
                    className="mt-1 w-full p-2 rounded-lg bg-white/5 border border-white/6 text-white"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-300">Expiry</label>
                  <input
                    type="date"
                    value={form.expiry}
                    onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                    className="mt-1 w-full p-2 rounded-lg bg-white/5 border border-white/6 text-white"
                  />
                </div>
              </div>

              {form.password === "yes" && (
                <div>
                  <label className="text-sm text-slate-300">Set Password</label>
                  <input
                    type="text"
                    value={form.passValue}
                    onChange={(e) => setForm({ ...form, passValue: e.target.value })}
                    className="mt-1 w-full p-3 rounded-lg bg-white/5 border border-white/6 text-white"
                    placeholder="Enter a password to protect this link"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="flex items-center gap-3">
                  <ToggleSwitch checked={form.oneTime} onChange={(v) => setForm({ ...form, oneTime: v })} />
                  <div>
                    <div className="text-sm font-medium">One-time link</div>
                    <div className="text-xs text-slate-400">Invalidate after first use</div>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-300">Click limit</label>
                  <input
                    type="number"
                    value={String(form.clicksLimit)}
                    onChange={(e) => setForm({ ...form, clicksLimit: e.target.value })}
                    className="mt-1 w-full p-2 rounded-lg bg-white/5 border border-white/6 text-white"
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ToggleSwitch checked={form.isPublic} onChange={(v) => setForm({ ...form, isPublic: v })} />
                <div>
                  <div className="text-sm font-medium">Public link</div>
                  <div className="text-xs text-slate-400">If off, only owners can access</div>
                </div>
              </div>

              {error && <div className="text-sm text-rose-300">{error}</div>}

              <div className="mt-4 border-t border-white/6 pt-4">
                <label className="text-sm text-slate-300">Create Custom Slug</label>
                <div className="flex gap-2 mt-2">
                  <input
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value)}
                    placeholder="my-link"
                    className="flex-1 p-2 rounded-lg bg-white/5 border border-white/6 text-white"
                  />
                  <button
                    onClick={createCustomSlug}
                    disabled={slugLoading}
                    className="px-4 py-2 rounded-lg bg-pink-600/60 hover:opacity-90"
                  >
                    {slugLoading ? "Creating..." : "Create"}
                  </button>
                </div>
                {slugError && <div className="text-xs text-rose-300 mt-2">{slugError}</div>}
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button onClick={close} className="px-4 py-2 rounded-lg bg-white/6 hover:bg-white/8">
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-linear-to-r from-indigo-600 to-sky-600 hover:opacity-95"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-12 h-7 rounded-full p-1 transition-colors ${checked ? "bg-indigo-500" : "bg-white/6"}`}
      aria-pressed={checked}
    >
      <span
        className={`block w-5 h-5 rounded-full bg-white shadow transform transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

