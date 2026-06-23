/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HistoryRecord } from '../types';
import TransactionForm from '../components/TransactionForm';
import { Sparkles, Terminal, ArrowLeft } from 'lucide-react';

interface NewTransactionViewProps {
  onNavigate: (view: string) => void;
  onAddTransaction: (record: Omit<HistoryRecord, 'id' | 'created_at' | 'is_overdue'>) => void;
}

export default function NewTransactionView({ onNavigate, onAddTransaction }: NewTransactionViewProps) {
  const [success, setSuccess] = useState(false);
  const [lastId, setLastId] = useState('');

  const handleSubmit = (formData: Omit<HistoryRecord, 'id' | 'created_at' | 'is_overdue'>) => {
    onAddTransaction(formData);
    // Mimic quick success feedback notification
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onNavigate('history');
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      
      {/* Title Layout */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="p-2.5 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">Khởi tạo giao dịch sửa chữa</h2>
          <p className="text-sm text-slate-500 mt-1">
            Tạo một giao dịch sửa chữa linh kiện mới, dựng lại thiết bị hoặc làm mới kho linh kiện nội bộ.
          </p>
        </div>
      </div>

      {success && (
        <div id="success-notification" className="p-4 bg-emerald-50 bg-opacity-70 border border-emerald-100 rounded-xl flex items-center justify-between text-xs text-emerald-800 font-medium">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong className="text-emerald-950 font-bold">Lưu giao dịch thành công!</strong>
              <p className="text-xs text-slate-500 mt-0.5">Tiến trình đếm ngược SLA đã khởi chạy. Đang điều hướng về trang Lịch sử thông minh...</p>
            </div>
          </div>
          <span className="text-[10px] bg-white font-bold text-slate-400 py-1 px-2 rounded border border-slate-200">
            BẢN_GHI_HOÀN_TẤT
          </span>
        </div>
      )}

      {/* Main Form container */}
      <div className="relative">
        <TransactionForm onSubmit={handleSubmit} isLoading={success} />
      </div>

      {/* Sidebar tips */}
      <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-start gap-3.5">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 shrink-0">
          <Terminal className="w-4.5 h-4.5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-widest font-mono">
            Hướng dẫn cho kỹ thuật viên
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed font-semibold">
            Hãy đảm bảo <strong>IMEI / Serial thiết bị</strong> được ghi nhận chính xác để phục vụ tra cứu linh kiện. Khi lập phiếu lỗi trả sỉ (Dính xương / Trả bảo hành RMA), đơn giá nhập nên ghi nhận theo giá linh kiện nội bộ thay vì giá bán lẻ của thị trường.
          </p>
        </div>
      </div>

    </div>
  );
}
