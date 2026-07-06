import React from "react";

interface ExpiryDuration {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface ExpiryInputProps {
  value: ExpiryDuration;
  onChange: (value: ExpiryDuration) => void;
}

export function ExpiryInput({ value, onChange }: ExpiryInputProps) {
  const updateField = (field: keyof ExpiryDuration, val: number, max: number) => {
    let newVal = Math.max(0, Math.min(val, max));
    onChange({ ...value, [field]: newVal });
  };

  const renderInput = (
    label: string,
    field: keyof ExpiryDuration,
    max: number
  ) => (
    <div className="flex items-center bg-slate-800/60 border border-amber-500/40 rounded-xl px-3 py-2 gap-2 shadow-inner">
      <input
        type="number"
        value={value[field] || ""}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, "");
          if (val === "") {
            onChange({ ...value, [field]: 0 });
            return;
          }
          updateField(field, Number(val), max);
        }}
        onBlur={() => {
          if (value[field] < 0) updateField(field, 0, max);
          if (value[field] > max) updateField(field, max, max);
        }}
        placeholder="0"
        className="w-10 text-center text-lg font-bold text-amber-400 bg-transparent outline-none appearance-none"
      />
      <span className="text-xs text-slate-400 font-medium tracking-wide">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 w-full">
      {renderInput("d", "days", 365)}
      <div className="text-xl font-bold text-amber-500/30">:</div>
      {renderInput("h", "hours", 23)}
      <div className="text-xl font-bold text-amber-500/30">:</div>
      {renderInput("m", "minutes", 59)}
      <div className="text-xl font-bold text-amber-500/30">:</div>
      {renderInput("s", "seconds", 59)}
    </div>
  );
}
