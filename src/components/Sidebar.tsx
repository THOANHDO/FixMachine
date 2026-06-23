/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  History, 
  PlusCircle, 
  AlertTriangle, 
  Settings2, 
  LogOut, 
  Wrench,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  userName: string;
  overdueCount: number;
}

export default function Sidebar({ 
  currentView, 
  onNavigate, 
  onLogout, 
  userName,
  overdueCount 
}: SidebarProps) {
  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Tổng quan', 
      icon: LayoutDashboard,
      badge: null
    },
    { 
      id: 'new-transaction', 
      label: 'Thêm mới giao dịch', 
      icon: PlusCircle,
      badge: null
    },
    { 
      id: 'history', 
      label: 'Lịch sử thông minh', 
      icon: History,
      badge: null
    },
    { 
      id: 'alerts', 
      label: 'Chú ý hàng tồn', 
      icon: AlertTriangle,
      badge: overdueCount > 0 ? overdueCount : null
    },
    { 
      id: 'settings', 
      label: 'Cấu hình hệ thống', 
      icon: Settings2,
      badge: null
    },
  ];

  return (
    <aside id="sidebar-navigation" className="w-64 bg-white border-r border-slate-200 text-slate-800 flex flex-col h-screen sticky top-0 transition-all duration-300">
      {/* Header / Brand */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg text-white">
          <Wrench className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg leading-tight text-slate-900 tracking-tight">
            FixMachine
          </h1>
          <p className="text-[10px] font-mono text-slate-400 tracking-wider uppercase mt-0.5 font-semibold">
            Quản lý Sửa chữa & SLA
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs leading-normal transition-all duration-200 group ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-600 font-bold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'
                }`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  isActive 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Operator Info & Logout */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold text-slate-800 truncate">{userName}</h4>
            <p className="text-[9px] text-slate-400 font-mono">Chế độ OP (1-2 Người)</p>
          </div>
        </div>
        <button
          id="logout-button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-red-600 bg-white hover:bg-red-50/50 rounded-lg border border-slate-200 hover:border-red-200 transition-all duration-150 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
