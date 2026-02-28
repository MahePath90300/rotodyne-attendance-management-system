import { InputGroup } from "../../pages/labels";
import { User, FileText } from "lucide-react";
export default function Step1BasicKYC({ onChange }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="col-span-2">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <User className="mr-2 text-blue-600" size={20} />
          Personal Information & &nbsp;
          <FileText className="mr-2 text-blue-600" size={20} />
          KYC Details
        </h3>
      </div>

      <InputGroup label="Name" />
      <InputGroup label="Father Name" />
      <InputGroup label="Date Of Birth" type="date" />
      <InputGroup label="Contact Number" />
      <InputGroup label="Emergency Contact Number" />
      <InputGroup label="Email" />
      <InputGroup label="Current Address" />
      <InputGroup label="Permenant Address" />
      <InputGroup label="Aadhaar Number" />
      <InputGroup label="PAN Number" />
      <InputGroup label="Bank Account Number" />
      <InputGroup label="IFSC Code" />
    </div>
  );
}
