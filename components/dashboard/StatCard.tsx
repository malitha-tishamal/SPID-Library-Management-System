'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  iconColorClass?: string;
  iconBgClass?: string;
  className?: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColorClass = "text-accent",
  iconBgClass = "bg-accent/10",
  className,
  trend
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "glass-card p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden transition-all duration-300",
        className
      )}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {title}
          </span>
          <h3 className="font-sora font-extrabold text-3xl text-slate-800 leading-tight">
            {value}
          </h3>
        </div>
        
        <div className={cn("p-3 rounded-2xl flex items-center justify-center shadow-inner", iconBgClass)}>
          <Icon className={cn("h-6 w-6", iconColorClass)} />
        </div>
      </div>

      {/* Footer trends/descriptions */}
      {(trend || description) && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
          {trend ? (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full font-bold text-[10px]",
                  trend.isPositive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-slate-400">{trend.label}</span>
            </div>
          ) : (
            <span className="text-slate-500 leading-normal">{description}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
