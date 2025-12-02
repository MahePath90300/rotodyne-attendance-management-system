export default function Legend() {
  const items = [
    { color: 'bg-orange-100', label: 'Sunday' },
    { color: 'bg-red-100', label: 'Holiday' },
    { color: 'ring-yellow-300', label: '>2 consecutive absences' },
    { color: 'ring-green-300', label: 'Holiday working flagged' },
    { color: 'bg-blue-100', label: 'Supply worker badge' },
    { color: 'bg-amber-100', label: 'BOQ worker badge' },
  ];

  const shortcuts = [
    { code: 'P', meaning: 'Present' },
    { code: 'A', meaning: 'Absent' },
    { code: 'PP', meaning: 'Paid Permit / Paid Present' },
    { code: 'OT', meaning: 'Overtime' },
    { code: 'HW', meaning: 'Holiday Work' },
    { code: 'LL', meaning: 'Leave - LWP or as defined' },
  ];

  return (
    <div className="bg-white p-3 rounded border">
      <div className="mb-3"><b>Legend & Shortcuts</b></div>
      <div className="flex gap-4 flex-wrap mb-3">
        {items.map(it => (
          <div key={it.label} className="flex items-center gap-2">
            <div className={`${it.color} w-6 h-6 rounded`} />
            <div className="text-sm text-slate-700">{it.label}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="text-sm font-medium mb-2">Status Shortcuts</div>
        <div className="grid grid-cols-3 gap-2">
          {shortcuts.map(s => (
            <div key={s.code} className="flex items-center gap-2">
              <div className="px-2 py-1 bg-slate-100 rounded font-medium">{s.code}</div>
              <div className="text-sm text-slate-600">{s.meaning}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
