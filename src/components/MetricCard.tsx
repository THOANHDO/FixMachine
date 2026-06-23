/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'sky' | 'emerald' | 'amber' | 'rose' | 'slate';
  onClick?: () => void;
}

export default function MetricCard({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'slate',
  onClick
}: MetricCardProps) {
  const themes = {
    sky: 'bg-indigo-50 border-indigo-100 text-indigo-600',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    amber: 'bg-amber-50 border-amber-100 text-amber-600',
    rose: 'bg-rose-50 border-rose-100 text-rose-600',
    slate: 'bg-slate-50 border-slate-200 text-slate-600'
  };

  const cardBorderThemes = {
    sky: 'hover:border-indigo-300 focus:border-indigo-300',
    emerald: 'hover:border-emerald-300 focus:border-emerald-300',
    amber: 'hover:border-amber-300 focus:border-amber-300',
    rose: 'hover:border-rose-300 focus:border-rose-300',
    slate: 'hover:border-slate-400 focus:border-slate-400'
  };

  return (
    <div
      id={id}
      onClick={onClick}
      className={`p-6 bg-white border border-slate-200 shadow-xs rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-start justify-between ${
        onClick ? 'cursor-pointer select-none' : ''
      } ${cardBorderThemes[variant]}`}
    >
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          {title}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            {value}
          </span>
        </div>
        {subtitle && (
          <p className="text-xs font-medium text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl border ${themes[variant]} shrink-0 shadow-xs`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}
