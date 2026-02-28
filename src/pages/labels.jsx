import { Filter, Search, Plus, MoreVertical, } from "lucide-react";
export function LabeledInput({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        {...props}
        className="border rounded px-3 py-2 w-full focus:ring-1 focus:ring-blue-400 focus:outline-none"
      />
    </div>
  );
}

export function LabeledSelect({ label, children, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        {...props}
        className="border rounded px-3 py-2 w-full bg-white focus:ring-1 focus:ring-blue-400 focus:outline-none"
      >
        {children}
      </select>
    </div>
  );
}

export function Checkbox({ label, checked, onChange, ...props }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
      <input type="checkbox" {...props} checked={checked} onChange={onChange} className="h-4 w-4" />
      {label}
    </label>
  );
}

export function InputGroup({ label, placeholder, type = 'text', options }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      {type === 'select' ? (
        <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
          <option value="">Select...</option>
          {options.map((opt) => <option key={opt}>{opt}</option>)}
        </select>
      ) : (
        <input 
          type={type} 
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
        />
      )}
    </div>
  );
}

export function EmployeeRow({ index }) {
  const roles = ['Fitter', 'Engineer', 'Supervisor', 'Technician', 'Helper'];
  const sites = ['NTPC Dadri', 'HO Hyderabad', 'Factory', 'Reliance Jamnagar', 'IOCL Panipat'];
  const status = ['Active', 'Active', 'On Leave', 'Active', 'Probation'];

  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
            {['RJ', 'MK', 'AS', 'PL', 'DR'][index % 5]}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-slate-900">Rajesh Kumar {index}</div>
            <div className="text-xs text-slate-500">rajesh.k{index}@rotodyne.co</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-slate-900 font-medium">EMP-{202400 + index}</div>
        <div className="text-xs text-slate-500">{roles[index % 5]}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
          {sites[index % 5]}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          status[index % 5] === 'Active' ? 'bg-green-100 text-green-800' : 
          status[index % 5] === 'Probation' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status[index % 5]}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
        12 Jan 2024
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-slate-400 hover:text-blue-600">
          <MoreVertical size={18} />
        </button>
      </td>
    </tr>
  );
}


export function StatCard({ title, value, subtext, icon, trend }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{value}</h3>
          <p className={`text-xs mt-1 ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-blue-600' :
            trend === 'bad' ? 'text-red-600' : 'text-slate-500'
          }`}>
            {subtext}
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}

export function ActionButton({ icon, label, desc, highlight }) {
  return (
    <button className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all
      ${highlight 
        ? 'border-blue-200 bg-blue-50 hover:bg-blue-100' 
        : 'border-slate-100 hover:bg-slate-50'
      }`}>
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${highlight ? 'bg-blue-200 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
          {icon}
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-slate-900">{label}</p>
          <p className="text-xs text-slate-500">{desc}</p>
        </div>
      </div>
      <div className="text-slate-400">→</div>
    </button>
  );
}
