'use client';

import React from 'react';
import { CircleDot, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface TokenMeterProps {
  balance: number;
  max: number;
  className?: string;
}

export default function TokenMeter({ balance, max = 3, className }: TokenMeterProps) {
  const percentage = (balance / max) * 100;
  
  return (
    <div className={cn("glass-card p-6 rounded-2xl border border-slate-100 flex flex-col justify-between", className)}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Remaining Allowance
          </span>
          <h3 className="font-sora font-extrabold text-2xl text-slate-800 mt-1">
            {balance} / {max} Books
          </h3>
        </div>
        <div className="flex items-center gap-1.5 mt-1 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
          {Array.from({ length: max }).map((_, idx) => (
            <CircleDot
              key={idx}
              size={14}
              className={cn(
                "transition-all duration-300",
                idx < balance ? "text-accent fill-accent animate-pulse" : "text-slate-200 fill-transparent"
              )}
            />
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={cn(
              "h-full rounded-full transition-all duration-300",
              balance === 0 ? "bg-rose-500" : balance === 1 ? "bg-amber-500" : "bg-accent"
            )}
          />
        </div>

        {/* Dynamic Context Warnings */}
        {balance === 0 ? (
          <div className="flex items-start gap-2 text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
            <span className="text-[11px] leading-relaxed">
              <strong>Limit Reached!</strong> Please return an active borrowed book to release a token before requesting another book.
            </span>
          </div>
        ) : balance === 1 ? (
          <div className="flex items-start gap-2 text-amber-600 bg-amber-50 border border-amber-100 p-2.5 rounded-xl">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
            <span className="text-[11px] leading-relaxed">
              <strong>Allowance low.</strong> You only have 1 token left in your account.
            </span>
          </div>
        ) : (
          <p className="text-[11px] text-slate-400">
            Each active book issue consumes 1 token. Tokens are restored automatically upon checked-in returns.
          </p>
        )}
      </div>
    </div>
  );
}
