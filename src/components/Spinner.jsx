import React from "react";

function Spinner({ message = "Loading..." }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-600">{message}</p>
      </div>
    </div>
  );
}

export default Spinner;
