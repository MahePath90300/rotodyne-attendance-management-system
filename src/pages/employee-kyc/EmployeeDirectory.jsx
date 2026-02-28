import { useState, useEffect } from "react";
import EmployeeOnboardingModal from "../../components/employee/EmployeeOnboardingModal";
import { getEmployees } from "../../api/employee";
import { Filter, Search, Plus, MoreVertical } from "lucide-react";
import { EmployeeRow } from "../labels";

export default function EmployeeDirectory() {
  const [emps, setEmps] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  async function loadEmployees() {
    const res = await getEmployees();
    setEmps(res.data.data || []);
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  const filteredEmps = emps.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      String(e.empNo).includes(search),
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="relative w-full sm:w-96">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by name, code or designation..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium">
            <Filter size={18} />
            <span>Filters</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm shadow-blue-200"
          >
            <Plus size={18} />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl flex-1 overflow-hidden flex flex-col shadow-sm">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Code / Role
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Site / Dept
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Joining Date
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <EmployeeRow key={i} index={i} />
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
          <span className="text-sm text-slate-500">
            Showing 1-10 of 182 employees
          </span>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-slate-300 rounded bg-white text-sm disabled:opacity-50">
              Previous
            </button>
            <button className="px-3 py-1 border border-slate-300 rounded bg-white text-sm">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <EmployeeOnboardingModal
          onClose={() => setShowModal(false)}
          onSuccess={loadEmployees}
        />
      )}
    </div>
  );
}
