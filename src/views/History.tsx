/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HistoryRecord, TransactionStatus } from '../types';
import TransactionTable from '../components/TransactionTable';
import { Database, Download, RefreshCw, FileSpreadsheet } from 'lucide-react';

interface HistoryViewProps {
  records: HistoryRecord[];
  onStatusChange: (id: string, nextStatus: TransactionStatus) => void;
  onDeleteRecord: (id: string) => void;
  onRefresh: () => void;
}

export default function HistoryView({ 
  records, 
  onStatusChange, 
  onDeleteRecord,
  onRefresh 
}: HistoryViewProps) {
  
  // Calculate handy metrics
  const totalLogs = records.length;
  const pendingCount = records.filter(r => r.status === 'Pending').length;
  const resolvedCount = records.filter(r => r.status === 'Resolved').length;

  const handleExportCSV = () => {
    // Generate simple CSV download for user convenience
    if (records.length === 0) return;
    
    const headers = ['id', 'created_at', 'purpose', 'machine_name', 'color', 'imei', 'customer_name', 'phone', 'price', 'status', 'is_overdue'];
    const rows = records.map(r => [
      r.id,
      r.created_at,
      r.purpose,
      `"${r.machine_name.replace(/"/g, '""')}"`,
      `"${r.color.replace(/"/g, '""')}"`,
      r.imei,
      `"${r.customer_name.replace(/"/g, '""')}"`,
      r.phone,
      r.price,
      r.status,
      r.is_overdue
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(","))].join("\n");
    // Prefix UTF-8 Byte Order Mark (BOM) to support correct display of special characters (Vietnamese accents) in Excel
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `repair_history_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">Lịch sử thông minh</h2>
          <p className="text-sm text-slate-500 mt-1">
            Bảng theo dõi và kiểm soát trạng thái cho tất cả các linh kiện, máy móc sửa chữa.
          </p>
        </div>
        
        {/* Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            id="refresh-database-btn"
            onClick={onRefresh}
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer font-semibold"
            title="Tải lại danh sách bản ghi"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-xs">Đồng bộ</span>
          </button>
 
          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Xuất file CSV</span>
          </button>
        </div>
      </div>

      {/* Database stats tags */}
      <div className="flex flex-wrap items-center gap-4 py-1.5 px-1 font-medium">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-xs text-slate-500">
          <Database className="w-3.5 h-3.5 text-indigo-600" />
          <span>Trạng thái: <strong className="text-slate-700 font-bold">Lưu trữ Ngoại tuyến</strong></span>
        </span>
        <span className="text-xs text-slate-300 hidden md:inline">|</span>
        <span className="text-xs text-slate-500">
          Tổng số bản ghi: <strong className="text-slate-850 font-bold">{totalLogs}</strong>
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-slate-300 hidden md:inline"></span>
        <span className="text-xs text-amber-600">
          Chưa xử lý: <strong className="font-bold">{pendingCount}</strong>
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-slate-300 hidden md:inline"></span>
        <span className="text-xs text-emerald-600">
          Đã xử lý / Hoàn thành: <strong className="font-bold">{resolvedCount}</strong>
        </span>
      </div>

      {/* Shared Transaction Ledger Table with search debounce inbuilt */}
      <TransactionTable 
        records={records} 
        onStatusChange={onStatusChange} 
        onDeleteRecord={onDeleteRecord}
      />

    </div>
  );
}
