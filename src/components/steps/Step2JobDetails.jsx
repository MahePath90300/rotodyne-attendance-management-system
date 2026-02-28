import {InputGroup, Checkbox} from "../../pages/labels";
import { Briefcase } from "lucide-react";
export default function Step2JobDetails({ onChange }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="col-span-2">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center"> <Briefcase className="mr-2 text-blue-600" size={20} />Employment Details </h3>
      </div>

      <InputGroup label="Employee Code (Auto)" disabled />
      <InputGroup label="Site" type="select" options={["GADARWARA","KANIHA","DADRI"]} />
      <InputGroup label="Category" type="select" options={["HSW","SSW","USW"]} />
      <InputGroup label="Designation" />
      <InputGroup label="Salary Type" type="select" options={["FIXED","MWB"]} />
      <InputGroup label="Salary" />

      <div className="col-span-2 mt-4">
        <h3 className="text-lg font-semibold mb-4"> Hiring Terms</h3>
      </div>
      <InputGroup label="Joining Date" type="date" />
      <InputGroup label="Exit Date" type="date" />
      <div className="col-span-2 mt-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">Purpose of Hiring / Remarks</label>
        <textarea className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={3} placeholder="Specific skills or project requirement..."></textarea>
      </div>
      <div className="col-span-2 mt-3">
        <label className="block text-sm font-medium text-slate-700 mb-2">Terms & Conditions</label>
        <textarea className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={3} placeholder="Terms and conditions if any...."></textarea>
      </div>
    </div>
  );
}
