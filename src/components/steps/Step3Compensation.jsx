import { useEffect, useState } from "react";
import {InputGroup, Checkbox} from "../../pages/labels";
export default function Step3Compensation() {
     const [form, setForm] = useState({
        pfApplicable: false,
        esiApplicable: false,
        isTemporary: false,
        uan: "",
        esiNumber: "",
      });
    
      const handleCheck = (key, checked) => {
        setForm((prev) => {
          const next = { ...prev, [key]: checked };
    
          // auto-clear dependent fields
          if (key === "pfApplicable" && !checked) next.uan = "";
          if (key === "esiApplicable" && !checked) next.esiNumber = "";
    
          return next;
        });
      };
  return (
    <div className="grid grid-cols-2 gap-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center" >Statutory</h3>

      <div className="flex gap-6 col-span-2">
        <Checkbox label="PF Applicable" onChange={(e) => handleCheck("pfApplicable", e.target.checked)}/>
        <Checkbox label="ESI Applicable" onChange={(e) => handleCheck("pfApplicable", e.target.checked)}/>
        <Checkbox label="Temporary Employee" />
      </div>

       {/* Conditional Inputs */}
            <div className="grid grid-cols-2 gap-6">
              {form.pfApplicable && (
                <InputGroup
                  label="UAN"
                  value={form.uan}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, uan: e.target.value }))
                  }
                />
              )}
      
              {form.esiApplicable && (
                <InputGroup
                  label="ESI Number"
                  value={form.esiNumber}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, esiNumber: e.target.value }))
                  }
                />
              )}
            </div>
    </div>
  );
}
