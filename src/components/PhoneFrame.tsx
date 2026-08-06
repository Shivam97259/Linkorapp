import React from 'react';

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[420px] mx-auto h-[100dvh] bg-[#f8fafc] relative flex flex-col overflow-hidden sm:border-x sm:border-slate-200/80 shadow-2xl">
      {children}
    </div>
  );
}
