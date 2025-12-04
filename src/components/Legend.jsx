// src/components/Legend.jsx
import React from "react";

export default function Legend() {
  return (
    <div className="mt-4 border rounded-md bg-slate-50 p-4 text-sm">
      <h3 className="font-semibold mb-3">Legend &amp; Shortcuts</h3>

      {/* Row 1: colour / badge indicators */}
      <div className="flex flex-wrap items-center gap-6 mb-4">
        {/* Sunday */}
        <div className="flex items-center gap-2">
          <span className="inline-block h-4 w-4 rounded bg-orange-100 border border-orange-300" />
          <span>Sunday</span>
        </div>

        {/* Holiday */}
        <div className="flex items-center gap-2">
          <span className="inline-block h-4 w-4 rounded bg-rose-100 border border-rose-300" />
          <span>Holiday</span>
        </div>

        {/* >2 consecutive absences */}
        <div className="flex items-center gap-2">
          <span className="inline-block h-4 w-4 rounded border-2 border-yellow-400" />
          <span>&gt; 2 consecutive absences</span>
        </div>

        {/* Holiday working flagged */}
        <div className="flex items-center gap-2">
          <span className="inline-block h-4 w-4 rounded border-2 border-emerald-400" />
          <span>Holiday working flagged</span>
        </div>

        {/* Supply / BOQ badges */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center rounded px-2 py-1 text-xs font-semibold bg-sky-100 text-sky-700 border border-sky-300">
            Supply
          </span>
          <span>Supply worker badge</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center rounded px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300">
            BOQ
          </span>
          <span>BOQ worker badge</span>
        </div>
      </div>

      {/* Row 2: Status shortcuts */}
      <div>
        <div className="font-semibold mb-2">Status Shortcuts</div>
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
          {/* Present */}
          <LegendStatus code="P"  label="Present (½ day)" />
          <LegendStatus code="PP" label="Present (full day)" />

          {/* Absent */}
          <LegendStatus code="A"  label="Absent (½ day)" />
          <LegendStatus code="AA" label="Absent (full day)" />

          {/* OT / HW / LL */}
          <LegendStatus code="OT" label="Overtime" />
          <LegendStatus code="HW" label="Holiday Work" />
          <LegendStatus code="LL" label="Leave" />
        </div>
      </div>
    </div>
  );
}

function LegendStatus({ code, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border bg-white text-xs font-semibold text-slate-800">
        {code}
      </span>
      <span>{label}</span>
    </div>
  );
}
