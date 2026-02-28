import React from "react";

export default function Spinner({ size = "md", message = "Loading..." }) {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-12 h-12 border-3",
    lg: "w-16 h-16 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div
        className={`${sizeClasses[size]} border-blue-200 border-t-blue-600 rounded-full animate-spin`}
      />
      {message && (
        <p className="text-sm text-slate-600 font-medium">{message}</p>
      )}
    </div>
  );
}
