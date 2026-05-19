'use client';

import React from 'react';
import ReturnBookFlow from '@/components/return/ReturnBookFlow';

export default function LibrarianReturnPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-sora font-extrabold text-2xl text-slate-800 tracking-tight">
          Return Check-In Center
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Perform digital check-in returns, evaluate overdue statuses, and process pending fine invoices.
        </p>
      </div>

      <ReturnBookFlow />
    </div>
  );
}
