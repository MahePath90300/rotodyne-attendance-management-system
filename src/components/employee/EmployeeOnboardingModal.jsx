import { useState } from "react";
import Step1BasicKYC from "../steps/Step1BasicKYC";
import Step2JobDetails from "../steps/Step2JobDetails";
import Step3Compensation from "../steps/Step3Compensation";
import Step5Documents from "../steps/Step5Documents";
import Step4PPEKit from "../steps/Step4PPEKit";
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

export default function EmployeeOnboardingModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              New Employee Onboarding
            </h2>
            <p className="text-sm text-slate-500">
              Complete all steps to generate Employee Code
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <XCircle size={24} />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-6 py-4 bg-white border-b border-slate-100">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-100 -z-10"></div>

            {[
              { id: 1, label: "Basic & KYC" },
              { id: 2, label: "Job Details" },
              { id: 3, label: "Statuatory" },
              { id: 4, label: "PPE Kit" },
              { id: 5, label: "Documents" },
            ].map((s) => (
              <div
                key={s.id}
                className="flex flex-col items-center bg-white px-2"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1 transition-colors
                  ${step >= s.id ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}
                >
                  {step > s.id ? <CheckCircle size={16} /> : s.id}
                </div>
                <span
                  className={`text-xs font-medium ${
                    step >= s.id ? "text-blue-600" : "text-slate-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8">
          {step === 1 && <Step1BasicKYC />}
          {step === 2 && <Step2JobDetails />}
          {step === 3 && <Step3Compensation />}
          {step === 4 && <Step4PPEKit />}
          {step === 5 && <Step5Documents />}
        </div>

        {/* Footer Buttons */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end space-x-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-white"
            >
              Back
            </button>
          )}

          <button
            onClick={() => (step < 5 ? setStep(step + 1) : onClose())}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md"
          >
            {step === 5 ? "Finish & Generate Code" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
