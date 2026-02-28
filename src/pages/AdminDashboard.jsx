import { StatCard, ActionButton } from "./labels";
import { 
  Users, 
  MapPin, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  Clock,
  Briefcase,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const data = [
  { name: 'Mon', present: 145, absent: 12, late: 5 },
  { name: 'Tue', present: 150, absent: 8, late: 4 },
  { name: 'Wed', present: 148, absent: 10, late: 6 },
  { name: 'Thu', present: 152, absent: 6, late: 2 },
  { name: 'Fri', present: 149, absent: 9, late: 8 },
  { name: 'Sat', present: 120, absent: 5, late: 2 }, // Half day/Site specific
];
export default function AdminDashboard() {
  return (
<>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Workforce" 
          value="182" 
          subtext="+4 this month" 
          icon={<Users size={24} className="text-blue-600" />} 
          trend="up"
        />
        <StatCard 
          title="Active Sites (AMC)" 
          value="12" 
          subtext="3 ending < 30 days" 
          icon={<MapPin size={24} className="text-orange-600" />}
          trend="neutral"
        />
        <StatCard 
          title="Pending Wages" 
          value="₹ 4.2L" 
          subtext="Due in 5 days" 
          icon={<DollarSign size={24} className="text-green-600" />}
          trend="down"
        />
        <StatCard 
          title="Attendance Issues" 
          value="8" 
          subtext="Requires Action" 
          icon={<AlertTriangle size={24} className="text-red-600" />}
          trend="bad"
        />
      </div>

      {/* Charts + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">
            Weekly Attendance Trends
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="present" name="Present" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="late" name="Late" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <ActionButton 
              icon={<Users size={18} />} 
              label="Onboard New Employee" 
              desc="KYC & Documentation" 
            />
            <ActionButton 
              icon={<Clock size={18} />} 
              label="Review Site Attendance" 
              desc="4 sites pending review" 
              highlight
            />
            <ActionButton 
              icon={<FileText size={18} />} 
              label="Generate Monthly Report" 
              desc="Payroll & PF/ESI" 
            />
            <ActionButton 
              icon={<Briefcase size={18} />} 
              label="Renew Contracts" 
              desc="Site B & C Expiring" 
            />
          </div>
        </div>
      </div>

      {/* Contract Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-6">
        <h3 className="font-semibold text-slate-800 mb-4">
          Contract Expiry & Renewals (AMC)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-4 py-3">Site / Client</th>
                <th className="px-4 py-3">Contract End</th>
                <th className="px-4 py-3">Employees</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-3 font-medium">NTPC Dadri (Steam Turbine)</td>
                <td className="px-4 py-3 text-red-600 font-medium">15 Days Left</td>
                <td className="px-4 py-3">24</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                    Action Required
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-blue-600 hover:underline">Review</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
