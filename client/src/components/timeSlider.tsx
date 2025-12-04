import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function DaysPicker() {
  const [days, setDays] = useState(1);

  const incrementDays = () => setDays((prev) => (prev < 30 ? prev + 1 : 30));
  const decrementDays = () => setDays((prev) => (prev > 1 ? prev - 1 : 1));

  const presetDays = [1, 3, 5, 7];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          Expiration Time
        </h1>
        <p className="text-slate-400 text-center mb-8">Set when link expires</p>

        {/* Preset Days */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {presetDays.map((day) => (
            <button
              key={day}
              onClick={() => setDays(day)}
              className={`py-3 rounded-lg font-semibold transition-all duration-200
                ${
                  days === day
                    ? "bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/40 scale-105"
                    : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 border border-slate-700"
                }
              `}
            >
              {day}d
            </button>
          ))}
        </div>

        {/* Samsung-Style Days Picker */}
        <div className="relative">
          <div className="absolute inset-0 bg-linear-to-r from-amber-500/20 to-orange-500/20 rounded-3xl blur-xl opacity-50"></div>

          <div className="relative bg-linear-to-br from-slate-900/80 to-slate-800/80 backdrop-blur border border-amber-500/30 rounded-3xl p-12">
            {/* Days Picker Container */}
            <div className="flex flex-col items-center gap-6">
              <button
                onClick={incrementDays}
                className="p-3 hover:bg-slate-700/50 rounded-xl transition-colors active:scale-95"
              >
                <ChevronUp className="w-8 h-8 text-amber-400" />
              </button>

              {/* Display */}
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-amber-500/40 to-orange-500/40 rounded-3xl blur-lg"></div>
                <div className="relative bg-slate-800/60 border-2 border-amber-500/50 rounded-3xl px-12 py-8 flex items-center justify-center min-w-48">
                  <span className="text-7xl font-black text-amber-400">
                    {String(days).padStart(2, "0")}
                  </span>
                </div>
              </div>

              <button
                onClick={decrementDays}
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

        {/* Summary */}
        <div className="mt-8 p-6 bg-slate-800/40 border border-slate-700 rounded-2xl text-center">
          <p className="text-slate-400 text-sm mb-2">Link expires in:</p>
          <p className="text-3xl font-bold text-amber-400">
            {days} day{days > 1 ? "s" : ""}
          </p>
        </div>

        {/* Action Button */}
        <button className="w-full mt-6 py-4 rounded-xl font-bold text-lg bg-linear-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/40 transition-all duration-300 hover:scale-105 active:scale-95">
          Set Expiration
        </button>
      </div>
    </div>
  );
}