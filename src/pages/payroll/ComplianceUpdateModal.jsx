import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Calendar, FileText, CheckCircle } from 'lucide-react';

export function ComplianceUpdateModal({ isOpen, onClose, type, currentStatus, onUpdate }) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // Reset form when modal opens or type changes
  useEffect(() => {
    if (isOpen) {
      reset({
        status: currentStatus?.status || 'Pending',
        referenceId: currentStatus?.referenceId || '',
        paymentDate: currentStatus?.paymentDate || new Date().toISOString().split('T')[0],
        remarks: currentStatus?.remarks || ''
      });
    }
  }, [isOpen, type, currentStatus, reset]);

  if (!isOpen) return null;

  const onSubmit = (data) => {
    onUpdate(type, data);
    onClose();
  };

  const getTitle = () => {
    switch(type) {
      case 'pf': return 'Update PF Challan Status';
      case 'esi': return 'Update ESI Payment Status';
      case 'bonus': return 'Update Bonus Disbursement Status';
      default: return 'Update Compliance';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">{getTitle()}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          
          {/* Status Selection */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Status</label>
            <div className="flex space-x-3 mt-1">
              <label className="flex-1 relative cursor-pointer">
                <input 
                  type="radio" 
                  value="Pending" 
                  {...register("status")}
                  className="peer sr-only"
                />
                <div className="p-3 text-center border rounded-lg peer-checked:bg-yellow-50 peer-checked:border-yellow-200 peer-checked:text-yellow-700 text-slate-600 hover:bg-slate-50 transition-all">
                  Pending
                </div>
              </label>
              <label className="flex-1 relative cursor-pointer">
                <input 
                  type="radio" 
                  value="Paid" 
                  {...register("status")}
                  className="peer sr-only"
                />
                <div className="p-3 text-center border rounded-lg peer-checked:bg-green-50 peer-checked:border-green-200 peer-checked:text-green-700 text-slate-600 hover:bg-slate-50 transition-all">
                  Paid
                </div>
              </label>
            </div>
          </div>

          {/* Reference ID / Challan No */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              {type === 'pf' ? 'Challan Number' : type === 'esi' ? 'Transaction ID' : 'Batch Reference'}
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="text"
                {...register("referenceId", { required: "Reference ID is required when Paid" })}
                placeholder="e.g. TRN-2026-8829"
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
             {errors.referenceId && <span className="text-xs text-red-500">{errors.referenceId.message}</span>}
          </div>

          {/* Payment Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Payment Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="date"
                {...register("paymentDate")}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Remarks (Optional)</label>
            <textarea
              {...register("remarks")}
              rows="2"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              placeholder="Any additional notes..."
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center"
            >
              <CheckCircle size={18} className="mr-2" />
              Update Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
