'use client';

import React from 'react';
import IssueBookWizard from '@/components/issue/IssueBookWizard';

export default function LibrarianIssuePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-sora font-extrabold text-2xl text-slate-800 tracking-tight">
          Checkout Center
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Perform a secure five-step book borrowing checkout for students.
        </p>
      </div>
      
      <IssueBookWizard />
    </div>
  );
}
