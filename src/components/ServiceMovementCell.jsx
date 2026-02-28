import React, { useState } from "react";

const LOCATIONS = [
  "HOME",
  "HO",
  "FACTORY",
  "KANIHA",
  "SIMHADRI",
  "PANIPAT",
  "IEPL",
];

export default function ServiceMovementCell({
  value = {},
  editable,
  onChange,
}) {
  const [open, setOpen] = useState(false);

  const update = (field, val) => {
    onChange({
      ...value,
      [field]: val,
    });
  };

  const badgeColor = () => {
    if (value.to === "HOME") return "bg-red-100";
    if (value.from && value.to) return "bg-blue-100";
    return "bg-green-100";
  };

  // ===== VIEW MODE =====
  if (!editable) {
    if (!value?.to) return null;

    return (
      <div className={`text-[10px] p-1 rounded ${badgeColor()}`}>
        <div className="font-semibold">{value.to}</div>
        <div>
          {value.from?.[0]}→{value.to?.[0]} {value.startTime}
        </div>
      </div>
    );
  }

  // ===== COMPACT MODE =====
  if (!open) {
    return (
      <div
        onClick={() => setOpen(true)}
        className={`cursor-pointer text-[10px] p-1 rounded border ${badgeColor()}`}
      >
        {value.to ? (
          <>
            <div className="font-semibold">{value.to}</div>
            <div>
              {value.from?.[0]}→{value.to?.[0]} {value.startTime}
            </div>
          </>
        ) : (
          <span className="text-slate-400">+ Move</span>
        )}
      </div>
    );
  }

  // ===== EXPANDED MODE =====
  return (
    <div className="bg-white border rounded p-2 text-[10px] space-y-1 shadow">
      <select
        value={value.from || ""}
        onChange={(e) => update("from", e.target.value)}
        className="w-full border rounded"
      >
        <option value="">From</option>
        {LOCATIONS.map((l) => (
          <option key={l}>{l}</option>
        ))}
      </select>

      <select
        value={value.to || ""}
        onChange={(e) => update("to", e.target.value)}
        className="w-full border rounded"
      >
        <option value="">To</option>
        {LOCATIONS.map((l) => (
          <option key={l}>{l}</option>
        ))}
      </select>

      <div className="flex gap-1">
        <input
          type="time"
          value={value.startTime || ""}
          onChange={(e) => update("startTime", e.target.value)}
          className="w-full border rounded"
        />
        <input
          type="time"
          value={value.endTime || ""}
          onChange={(e) => update("endTime", e.target.value)}
          className="w-full border rounded"
        />
      </div>

      <button
        onClick={() => setOpen(false)}
        className="w-full bg-sky-500 text-white rounded py-1"
      >
        Done
      </button>
    </div>
  );
}
