import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  FileText,
  User,
  Briefcase,
  Download,
  CheckCircle,
  XCircle,
} from "lucide-react";
export default function Step4Documents() {
  return (
    <div className="space-y-6">
      <FileUploadBox title="Education Certificates" />
      <FileUploadBox title="Experience Certificates" />
      <FileUploadBox title="ID Proofs" />
      <FileUploadBox title="Bank Passbook" />

      <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg">
        <input type="checkbox" className="mt-1 w-4 h-4" />
        <p className="text-sm text-slate-600">
          I confirm that all the above information is verified and true.
        </p>
      </div>
    </div>
  );
}

function FileUploadBox({ title }) {
  return (
    <div className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-slate-50">
      <Download size={24} className="mx-auto text-blue-600 mb-2" />
      <h4 className="font-semibold">{title}</h4>
      <p className="text-sm text-slate-500">Drag & drop or click to upload</p>
    </div>
  );
}
