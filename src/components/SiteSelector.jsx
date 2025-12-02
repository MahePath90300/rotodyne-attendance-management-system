export default function SiteSelector({ company, setCompany, sites, setSite, onOpenSite }) {
  return (
    <div className="p-4 bg-white rounded shadow mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm text-slate-600 mb-1">Company</label>
          <select value={company} onChange={(e) => setCompany(e.target.value)}
            className="w-full border rounded px-3 py-2">
            <option value="RES">RES</option>
            <option value="REF">REF</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-1">Site</label>
          <select value={sites.selected} onChange={(e) => setSite(e.target.value)}
            className="w-full border rounded px-3 py-2">
            {sites.list.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="flex items-end">
          <button onClick={() => onOpenSite(sites.selected)} className="bg-sky-600 text-white px-4 py-2 rounded">
            Open Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
