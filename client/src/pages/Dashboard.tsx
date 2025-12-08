import { useState, useEffect } from "react";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/clerk-react";
import { BarChart3, Link2, Shield, Clock, QrCode, RefreshCw } from "lucide-react";
import axios from "axios";
export default function Dashboard() {
  const { user } = useUser();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    loadStats();
  },[user])

  const loadStats = async () => {
    if (!user) return;
    try {
      console.log("Loading stats");
      setLoading(true);
      const res = await axios.get("/api/me"); 
      console.log("Stats",res);

      setStats(res);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
    }
  };

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-slate-950 text-white px-6 py-10">
          <div className="max-w-6xl mx-auto flex items-center justify-between mb-10">
            <div>
              <h1 className="text-4xl font-black bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-slate-400 mt-1">
                Welcome back, <span className="text-purple-300">{user?.fullName}</span>
              </p>
            </div>

            <button
              onClick={loadStats}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* STATS CARDS */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Links"
              value={stats?.links || 12}
              icon={<Link2 className="w-6 h-6 text-blue-400" />}
              color="from-blue-500/20 to-cyan-500/20"
            />

            <StatCard
              title="Protected Links"
              value={stats?.protected || 3}
              icon={<Shield className="w-6 h-6 text-purple-400" />}
              color="from-purple-500/20 to-pink-500/20"
            />

            <StatCard
              title="QR Generated"
              value={stats?.qr || 8}
              icon={<QrCode className="w-6 h-6 text-green-400" />}
              color="from-green-500/20 to-emerald-500/20"
            />

            <StatCard
              title="Expired Links"
              value={stats?.expired || 1}
              icon={<Clock className="w-6 h-6 text-amber-400" />}
              color="from-amber-500/20 to-orange-500/20"
            />
          </div>

          {/* ANALYTICS SECTION */}
          <div className="max-w-6xl mx-auto mt-16">
            <h2 className="text-2xl font-bold mb-4">Analytics Overview</h2>

            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center">
              <BarChart3 className="w-10 h-10 text-blue-400 mb-3" />
              <p className="text-slate-400 text-center">
                Advanced analytics coming soon…  
                <br />Track link clicks, device info, geolocation & more.
              </p>
            </div>
          </div>

        </div>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

/* -------------------- STAT CARD COMPONENT --------------------- */

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
}) {
  return (
    <div className="relative group">
      <div
        className={`absolute inset-0 bg-linear-to-r ${color} rounded-2xl blur-xl opacity-70 group-hover:blur-2xl transition-all`}
      ></div>

      <div className="relative p-6 rounded-2xl bg-slate-900/80 border border-slate-700 flex flex-col justify-between h-40 hover:border-blue-500/40 transition-all">
        <div className="flex items-center justify-between">
          <h3 className="text-sm text-slate-400">{title}</h3>
          <div className="p-2 bg-slate-800 rounded-xl">{icon}</div>
        </div>

        <p className="text-4xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {value}
        </p>
      </div>
    </div>
  );
}
