/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Wrench, Shield, Key, AlertCircle, Sparkles } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (operatorName: string, isSupabase: boolean) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin đăng nhập.');
      return;
    }
    
    setIsLoading(true);
    // Mimic quick authentication processing
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(email.split('@')[0].toUpperCase(), false);
    }, 800);
  };

  const handleQuickOperatorLogin = (name: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(name, false);
    }, 450);
  };

  return (
    <div className="min-screen bg-slate-50 flex flex-col justify-center items-center p-6 relative overflow-hidden" style={{ minHeight: '100vh' }}>
      
      {/* Visual background ambient details */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-8 relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-8">
          <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 border border-indigo-100 shadow-xs">
            <Wrench className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">Hệ thống FixMachine</h2>
            <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-normal">
              Hệ thống Quản lý Sửa chữa Linh kiện & SLA Nội bộ (Chế độ vận hành của kỹ thuật viên được ủy quyền)
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-700 font-semibold">{error}</p>
          </div>
        )}

        {/* Manual Login */}
        <form onSubmit={handleManualLogin} className="space-y-4">
          <div>
            <label htmlFor="email-input" className="text-[10px] font-bold text-slate-400 tracking-wider block mb-2 uppercase">
              Email Kỹ thuật viên
            </label>
            <input
              id="email-input"
              type="email"
              placeholder="kythuatvien@fixmachine.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-500 transition-colors font-medium"
            />
          </div>

          <div>
            <label htmlFor="password-input" className="text-[10px] font-bold text-slate-400 tracking-wider block mb-2 uppercase">
              Mã an toàn / Mật khẩu
            </label>
            <div className="relative">
              <input
                id="password-input"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-500 transition-colors font-medium"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Key className="w-4 h-4" />
              </span>
            </div>
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm active:translate-y-px transition-all duration-200 cursor-pointer"
          >
            {isLoading ? 'Đang xác thực kỹ thuật viên...' : 'Đăng nhập hệ thống'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <span className="relative px-3.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Hoặc chọn nhanh
          </span>
        </div>

        {/* Fast Operator Selection */}
        <div className="space-y-2.5">
          <button
            id="quick-login-op1"
            type="button"
            onClick={() => handleQuickOperatorLogin('OPERATOR_ONE')}
            className="w-full py-2.5 px-4 bg-slate-50/50 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200 flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <div className="text-left">
                <span className="text-xs font-semibold block text-slate-800">Kỹ thuật viên 1</span>
                <span className="text-[10px] font-medium text-slate-400">Kỹ sư trưởng</span>
              </div>
            </div>
            <span className="text-xs text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform">
              Bắt đầu →
            </span>
          </button>

          <button
            id="quick-login-op2"
            type="button"
            onClick={() => handleQuickOperatorLogin('OPERATOR_TWO')}
            className="w-full py-2.5 px-4 bg-slate-50/50 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200 flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
              <div className="text-left">
                <span className="text-xs font-semibold block text-slate-800">Kỹ thuật viên 2</span>
                <span className="text-[10px] font-medium text-slate-400">Quản lý kho & Chất lượng</span>
              </div>
            </div>
            <span className="text-xs text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform">
              Bắt đầu →
            </span>
          </button>
        </div>

        <div className="mt-8 text-center flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium">
          <Shield className="w-3.5 h-3.5 text-indigo-500" />
          <span>Bảo mật phiên làm việc AES-256 hoạt động</span>
        </div>

      </div>
    </div>
  );
}
