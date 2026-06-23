/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppAlert, HistoryRecord } from '../types';
import { AlertTriangle, Clock, ShieldCheck, Flame, Bell, Trash2, ArrowUpRight } from 'lucide-react';

interface AlertsViewProps {
  alerts: AppAlert[];
  records: HistoryRecord[];
  onNavigate: (view: string) => void;
  onClearAlert: (id: string) => void;
}

export default function AlertsView({ 
  alerts, 
  records, 
  onNavigate,
  onClearAlert 
}: AlertsViewProps) {
  
  // Calculate critical overdue items
  const overdueTickets = records.filter(r => r.status === 'Pending' && r.is_overdue);

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">Cảnh báo SLA hoạt động</h2>
        <p className="text-sm text-slate-500 mt-1">
          Các cảnh báo ưu tiên cao được kích hoạt khi thời gian sửa chữa vượt quá hạn định mức SLA 24 giờ tuyệt đối.
        </p>
      </div>

      {overdueTickets.length > 0 && (
        <div className="p-5 bg-rose-50 border border-rose-100 rounded-xl space-y-4">
          <div className="flex items-start gap-4">
            <Flame className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h3 className="font-bold text-rose-900 text-sm">Phát hiện vi phạm SLA nghiêm trọng ({overdueTickets.length})</h3>
              <p className="text-xs text-rose-800 leading-relaxed font-semibold mt-1">
                Các bản ghi sửa chữa sau đây đã mở hơn 24 giờ mà chưa được chuyển trạng thái <strong>"Đã xử lý"</strong> chính thức. Yêu cầu kỹ thuật viên kiểm tra hoặc can thiệp ngay lập tức.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overdueTickets.map((ticket) => {
              const hoursPassed = Math.floor((Date.now() - new Date(ticket.created_at).getTime()) / (1000 * 60 * 60));
              return (
                <div 
                  key={ticket.id} 
                  className="p-4 bg-white border border-rose-200 rounded-lg flex items-start justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-rose-600">{ticket.id}</span>
                      <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-1.5 py-0.5 rounded uppercase border border-rose-100">
                        {ticket.purpose === 'Customer' ? 'Thay khách' : ticket.purpose === 'Shop' ? 'Máy tiệm' : 'Dính xương / Trả sỉ'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 block pt-1">{ticket.machine_name}</span>
                    <p className="text-xs text-slate-500">
                      Đã mở: <strong className="text-slate-800 font-bold">{hoursPassed} giờ trước</strong>
                    </p>
                    <p className="text-[11px] text-slate-400 font-semibold pt-0.5">Khách hàng: {ticket.customer_name}</p>
                  </div>
                  <button
                    onClick={() => onNavigate('history')}
                    className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded text-xs font-bold transition-all border border-rose-100 cursor-pointer"
                  >
                    Xử lý →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Alert List */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-base">Nhật ký giám sát liên tục</h3>
            <p className="text-xs text-slate-500 mt-1">Mạng lưới giám sát tự động và các ghi chú hệ thống kiểm soát SLA.</p>
          </div>
          <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-500 font-bold py-1 px-2.5 rounded">
            TỰ_ĐỘNG_HÓA_ĐANG_CHẠY: CÓ
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="p-12 text-center bg-slate-50/40 rounded-xl border border-dashed border-slate-200">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 border border-indigo-150 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-slate-800 font-bold text-sm">Tất cả kênh giám sát bình thường</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 font-medium leading-relaxed">
              Không phát hiện vi phạm SLA, lỗi linh kiện hoặc can thiệp thủ công nào trong phạm vi vận hành này.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                id={`alert-card-${alert.id}`}
                className="p-4 bg-slate-50/50 border border-slate-200 hover:border-slate-300 rounded-xl flex items-start gap-3.5 justify-between group transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                    alert.type === 'danger' 
                      ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                      : alert.type === 'warning'
                      ? 'bg-amber-50 text-amber-600 border border-amber-100'
                      : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                  }`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                    <p className="text-sm font-bold text-slate-700 mt-1 leading-snug">
                      {alert.message}
                    </p>
                    {alert.machine_name && (
                      <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 rounded-md px-1.5 py-0.5 inline-block mt-2 font-bold uppercase tracking-wider font-mono">
                        Thiết bị liên quan: {alert.machine_name}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  id={`clear-alert-${alert.id}`}
                  onClick={() => onClearAlert(alert.id)}
                  className="p-1 px-2.5 bg-white hover:bg-slate-50 text-slate-500 hover:text-rose-600 rounded-lg border border-slate-200 text-xs font-bold cursor-pointer transition-colors shadow-xs shrink-0"
                >
                  Xác nhận
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SLA Automation Background info */}
      <div className="p-4.5 bg-indigo-50/55 border border-indigo-100 rounded-xl space-y-2.5">
        <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-widest font-mono">
          🚨 Thiết kế tự động hóa Webhook & Cron của SLA
        </h4>
        <p className="text-xs text-slate-600 font-semibold leading-relaxed">
          Cơ chế tự động hóa SLA 24H được thiết kế để chạy trên máy chủ tiêu chuẩn hoặc Supabase Edge Functions. Hệ thống quét vòng lặp SQL kiểm soát các bản ghi <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-100 font-mono text-[11px] font-bold">status = 'Pending'</code> quá <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-100 font-mono text-[11px] font-bold">24 giờ</code>, để tự động gửi thông báo lỗi đến địa chỉ <strong>Discord webhook URL</strong>.
        </p>
        <button
          onClick={() => onNavigate('settings')}
          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-bold hover:underline bg-transparent border-0 p-0 cursor-pointer"
        >
          <span>Thiết lập Discord Webhook trong Cấu hình hệ thống</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
