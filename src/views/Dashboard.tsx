/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HistoryRecord } from '../types';
import MetricCard from '../components/MetricCard';
import { 
  DollarSign, 
  Clock, 
  Hourglass, 
  CheckCircle,
  TrendingUp, 
  ArrowUpRight,
  PlusCircle, 
  BellRing,
  AlertTriangle,
  Flame
} from 'lucide-react';

interface DashboardProps {
  records: HistoryRecord[];
  onNavigate: (view: string) => void;
  onStatusChange: (id: string, nextStatus: 'Pending' | 'Resolved') => void;
}

export default function Dashboard({ records, onNavigate, onStatusChange }: DashboardProps) {
  // Stats Calculations
  const totalRepairs = records.length;
  const pendingRepairs = records.filter(r => r.status === 'Pending').length;
  const resolvedRepairs = records.filter(r => r.status === 'Resolved').length;
  const overdueRepairs = records.filter(r => r.status === 'Pending' && r.is_overdue).length;
  
  const estimatedRevenue = records.reduce((sum, r) => sum + r.price, 0);
  const pendingRevenue = records.filter(r => r.status === 'Pending').reduce((sum, r) => sum + r.price, 0);

  // Business metrics count grouped by Purpose
  const shopCount = records.filter(r => r.purpose === 'Shop').length;
  const customerCount = records.filter(r => r.purpose === 'Customer').length;
  const defectiveCount = records.filter(r => r.purpose === 'Defective').length;

  const totalPurposeCount = (shopCount + customerCount + defectiveCount) || 1;
  const shopPercent = Math.round((shopCount / totalPurposeCount) * 100);
  const customerPercent = Math.round((customerCount / totalPurposeCount) * 100);
  const defectivePercent = Math.round((defectiveCount / totalPurposeCount) * 100);

  // Get active pending repairs
  const activePendingRepairs = records
    .filter(r => r.status === 'Pending')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const getRemainingSLA = (createdAtStr: string) => {
    const createdDate = new Date(createdAtStr);
    const millisecondsPassed = Date.now() - createdDate.getTime();
    const hoursPassed = millisecondsPassed / (1000 * 60 * 60);
    const hoursRemaining = 24 - hoursPassed;

    if (hoursRemaining <= 0) {
      const positiveHoursPast = Math.floor(Math.abs(hoursRemaining));
      return {
        text: `Quá hạn ${positiveHoursPast} giờ`,
        isOverdue: true,
        percent: 100,
        colorClass: 'text-rose-600 bg-rose-50'
      };
    } else {
      const remainingInt = Math.floor(hoursRemaining);
      const percent = Math.max(0, Math.min(100, Math.round(((24 - hoursRemaining) / 24) * 100)));
      return {
        text: `Còn lại ${remainingInt} giờ`,
        isOverdue: false,
        percent,
        colorClass: remainingInt < 6 ? 'text-amber-600 bg-amber-50' : 'text-indigo-600 bg-indigo-50'
      };
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">Tổng quan hệ thống</h2>
          <p className="text-sm text-slate-500 mt-1">
            Trạng thái vận hành thực tế đối với dịch vụ linh kiện và giám sát tuân thủ hệ thống SLA 24H.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="workspace-new-repair-btn"
            onClick={() => onNavigate('new-transaction')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm mới giao dịch SLA</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          id="metric-total"
          title="Tổng giao dịch ghi nhận"
          value={totalRepairs}
          subtitle="Tất cả các bản ghi lịch sử"
          icon={TrendingUp}
          variant="slate"
        />
        <MetricCard
          id="metric-pending"
          title="Đang xử lý (Hoạt động)"
          value={pendingRepairs}
          subtitle="Giao dịch đang tiến hành"
          icon={Hourglass}
          variant="sky"
          onClick={() => onNavigate('history')}
        />
        <MetricCard
          id="metric-overdue"
          title="Vi phạm hạn SLA"
          value={overdueRepairs}
          subtitle="Trôi qua quá 24h quy định"
          icon={Flame}
          variant={overdueRepairs > 0 ? "rose" : "slate"}
          onClick={() => onNavigate('alerts')}
        />
        <MetricCard
          id="metric-revenue"
          title="Giá trị danh mục ước tính"
          value={`${estimatedRevenue.toLocaleString(undefined, { minimumFractionDigits: 0 })}`}
          subtitle={`${pendingRevenue.toLocaleString()} đang chờ xử lý`}
          icon={DollarSign}
          variant="emerald"
        />
      </div>

      {/* Main Insights Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: List of SLA Trackers */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-bold text-base text-slate-905">Theo dõi thời hạn SLA trực tiếp</h3>
                <p className="text-xs text-slate-500 mt-1">Các tiến trình sửa chữa được theo dõi theo giới hạn SLA 24H</p>
              </div>
              <span className="text-[10px] bg-slate-50 font-bold text-slate-400 px-2 py-1 rounded border border-slate-200">
                Ưu tiên thời gian trước
              </span>
            </div>

            {activePendingRepairs.length === 0 ? (
              <div className="p-8 text-center bg-slate-50/50 border border-slate-200 rounded-xl">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-800">Đã hoàn tất! Không có giao dịch đang chờ</h4>
                <p className="text-xs text-slate-500 mt-1">Mọi giao dịch sửa chữa đã được giải quyết hoặc trả thành công.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activePendingRepairs.slice(0, 4).map((ticket) => {
                  const sla = getRemainingSLA(ticket.created_at);
                  return (
                    <div 
                      key={ticket.id} 
                      id={`ticket-${ticket.id}`}
                      className="p-4 bg-slate-50/50 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{ticket.id}</span>
                            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-100 text-slate-500 border border-slate-200">
                              {ticket.purpose === 'Customer' ? 'Thay khách' : ticket.purpose === 'Shop' ? 'Máy tiệm' : 'Dính xương / Trả sỉ'}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-800 mt-1.5 leading-snug">
                            {ticket.machine_name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Khách hàng: <strong className="text-slate-700 font-medium">{ticket.customer_name}</strong>
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${sla.colorClass}`}>
                          {sla.text}
                        </span>
                      </div>

                      {/* Progress visual bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-medium">
                          <span className="text-slate-400">Thanh tiến trình SLA (Tuyệt đối 24H)</span>
                          <span className={`${sla.isOverdue ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>{sla.percent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              sla.isOverdue 
                                ? 'bg-gradient-to-r from-rose-500 to-red-600' 
                                : sla.percent > 75 
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                                : 'bg-indigo-600'
                            }`}
                            style={{ width: `${sla.percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Quick click resolve */}
                      <div className="mt-3.5 flex justify-end">
                        <button
                          id={`dash-resolve-${ticket.id}`}
                          onClick={() => onStatusChange(ticket.id, 'Resolved')}
                          className="bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 font-semibold"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Hoàn thành & đóng giao dịch</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
                {activePendingRepairs.length > 4 && (
                  <button
                    onClick={() => onNavigate('history')}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 rounded-lg text-xs font-semibold border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
                  >
                    Xem {activePendingRepairs.length - 4} giao dịch đang chờ còn lại →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Workload composition & quick statistics */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Workload breakdown visually */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-display font-bold text-base text-slate-905">Phân bổ phân loại sửa chữa</h3>
            <p className="text-xs text-slate-500 mt-1">Tỷ lệ phân bổ các hệ thống đã ghi nhận theo mục đích sử dụng</p>

            <div className="my-6 space-y-5">
              {/* Customer */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-indigo-600">👤 Thay khách</span>
                  <span className="text-slate-600 font-mono font-bold">{customerCount} ({customerPercent}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${customerPercent}%` }}></div>
                </div>
              </div>

              {/* Shop */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-emerald-600">🏢 Máy tiệm</span>
                  <span className="text-slate-600 font-mono font-bold">{shopCount} ({shopPercent}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${shopPercent}%` }}></div>
                </div>
              </div>

              {/* Defective */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-amber-600">⚠️ Dính xương / Trả sỉ</span>
                  <span className="text-slate-600 font-mono font-bold">{defectiveCount} ({defectivePercent}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${defectivePercent}%` }}></div>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl">
              <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wide flex items-center gap-1.5">
                <Hourglass className="w-3.5 h-3.5" />
                <span>Kiểm tra SLA định kỳ</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-medium">
                Hệ thống SLA 24 giờ hoạt động tự động phía máy khách. Nếu giao dịch sửa chữa trôi qua quá 24h tuyệt đối, bộ kích hoạt cảnh báo sẽ ngay lập tức được thông báo tương tác.
              </p>
            </div>
          </div>

          {/* Quick SLA Action Board */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-slate-905">Phím tắt quy trình nhanh</h3>
            <p className="text-xs text-slate-500">Các nút tương tác nhanh giúp tăng tốc vận hành ứng dụng</p>
            
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                id="dash-quick-history"
                onClick={() => onNavigate('history')}
                className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-left transition-all duration-200 group cursor-pointer"
              >
                <div className="text-indigo-600 group-hover:scale-105 transition-transform mb-1.5">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 block">Lịch sử thông minh</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Tìm kiếm có debounce</span>
              </button>

              <button
                id="dash-quick-alerts"
                onClick={() => onNavigate('alerts')}
                className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-left transition-all duration-200 group cursor-pointer"
              >
                <div className="text-rose-600 group-hover:scale-105 transition-transform mb-1.5">
                  <BellRing className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 block">Chú ý hàng tồn</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Các vi phạm hoạt động</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
