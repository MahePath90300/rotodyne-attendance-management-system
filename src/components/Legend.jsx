const Pill = ({ className = "", children }) => (
  <span
    className={`inline-flex items-center justify-center min-w-[32px] px-2 py-[2px] rounded-md text-xs font-semibold border ${className}`}
  >
    {children}
  </span>
);

export default function Legend() {
  return (
    <div className="mt-3 mb-4 border rounded-lg p-3 bg-slate-50">
      <h3 className="text-sm font-semibold mb-2">Colour codes & Shortcuts</h3>
      <div className="grid gap-3 md:grid-cols-2 text-xs">
        {/* Calendar markers */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded bg-amber-100 border border-amber-300" />
            <span>Sunday</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded bg-rose-100 border border-rose-300" />
            <span>Public Holiday</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded bg-lime-200 border border-lime-400" />
            <span>Holiday work (HW on holiday)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded bg-rose-50 border border-rose-500 ring-2 ring-rose-400/70" />
            <span>
              Cell highlighted – worker absent (&quot;A&quot; / &quot;AA&quot;)
              for greate than 2 consecutive days
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Pill className="inline-block w-3 h-3 rounded border bg-sky-200" />
            <span>Supply manpower section</span>
          </div>
          <div className="flex items-center gap-2">
            <Pill className="inline-block w-3 h-3 rounded border bg-violet-200" />
            <span>BOQ manpower section</span>
          </div>
        </div>

        {/* Status codes */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Pill className="bg-emerald-100 text-emerald-900 border-emerald-300">
              PP
            </Pill>
            <span> - Present – Full day</span>
          </div>
          <div className="flex items-center gap-2">
            <Pill className="bg-emerald-50 text-emerald-800 border-emerald-300">
              P
            </Pill>
            <span> - Present – Half day</span>
          </div>
          <div className="flex items-center gap-2">
            <Pill className="bg-rose-100 text-rose-800 border-rose-400">
              AA
            </Pill>
            <span> - Absent – Full day</span>
          </div>
          <div className="flex items-center gap-2">
            <Pill className="bg-rose-50 text-rose-700 border-rose-400">A</Pill>
            <span> - Absent – Half day</span>
          </div>
          <div className="flex items-center gap-2">
            <Pill className="bg-lime-200 text-lime-900 border-lime-400">
              HW
            </Pill>
            <span> - Holiday Work (attendance on holiday)</span>
          </div>
          <div className="flex items-center gap-2">
            <Pill className="bg-indigo-100 text-indigo-800 border-indigo-300">
              LL
            </Pill>
            <span> - Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <Pill className="bg-indigo-100 text-indigo-800 border-indigo-300">
              WW
            </Pill>
            <span> - Week Off</span>
          </div>
          <div className="flex items-center gap-2">
            <Pill className="bg-indigo-100 text-indigo-800 border-indigo-300">
              CC
            </Pill>
            <span> - Casual Leave</span>
          </div>
        </div>
      </div>
    </div>
  );
}
