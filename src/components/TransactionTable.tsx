/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HistoryRecord, PurposeType, TransactionStatus } from '../types';
import { Search, Filter, Calendar, DollarSign, Tag, CheckCircle2, Clock, Trash2, ArrowUpRight } from 'lucide-react';

interface TransactionTableProps {
  records: HistoryRecord[];
  onStatusChange: (id: string, nextStatus: TransactionStatus) => void;
  onDeleteRecord?: (id: string) => void;
  onFilterChange?: (search: string, purpose: string, status: string) => void;
}

export default function TransactionTable({ 
  records, 
  onStatusChange, 
  onDeleteRecord 
}: TransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [selectedPurpose, setSelectedPurpose] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Performance Requirement: Implement 300ms debounce for the search bar
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Apply filters client-side for superb instantaneous speed and reliability
  const filteredRecords = records.filter(record => {
    // 1. Debounced Search match
    const searchString = `${record.machine_name} ${record.customer_name} ${record.imei} ${record.reason}`.toLowerCase();
    const matchesSearch = searchString.includes(debouncedSearch.toLowerCase());

    // 2. Purpose Match
    const matchesPurpose = selectedPurpose === 'All' || record.purpose === selectedPurpose;

    // 3. Status Match
    const matchesStatus = selectedStatus === 'All' || record.status === selectedStatus;

    return matchesSearch && matchesPurpose && matchesStatus;
  });

  const getPurposeBadge = (purpose: PurposeType) => {
    const colors = {
      Customer: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      Shop: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      Defective: 'bg-amber-50 text-amber-600 border-amber-100',
    };
    const labels = {
      Customer: 'Thay khách',
      Shop: 'Máy tiệm',
      Defective: 'Dính xương / Trả lại sỉ',
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${colors[purpose]}`}>
        {labels[purpose] || purpose}
      </span>
    );
  };

  const getStatusBadge = (status: TransactionStatus, isOverdue: boolean) => {
    if (status === 'Resolved') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Đã xử lý / Hoàn thành</span>
        </span>
      );
    }
    
    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-rose-50 text-rose-600 border border-rose-100 animate-pulse">
          <Clock className="w-3.5 h-3.5 text-rose-600" />
          <span>Quá hạn SLA</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-slate-50 text-slate-500 border border-slate-200">
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        <span>Chưa xử lý</span>
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { 
         month: 'short', 
         day: 'numeric', 
         hour: '2-digit', 
         minute: '2-digit' 
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Multi-Filter Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
        {/* Search Input with Spinner indicated debouncing mechanism */}
        <div className="lg:col-span-6 relative">
          <label htmlFor="search-input" className="sr-only">Search</label>
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            id="search-input"
            type="text"
            placeholder="Tìm kiếm theo linh kiện, máy, IMEI, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-450 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {searchTerm !== debouncedSearch && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
              <span className="text-[9px] font-mono text-slate-400 ml-1.5">Đang lọc...</span>
            </div>
          )}
        </div>

        {/* Purpose Filter */}
        <div className="lg:col-span-3 flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phân loại:</span>
          <select
            aria-label="Filter by purpose"
            value={selectedPurpose}
            onChange={(e) => setSelectedPurpose(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="All">Tất cả phân loại</option>
            <option value="Customer">Thay khách</option>
            <option value="Shop">Máy tiệm</option>
            <option value="Defective">Dính xương / Trả lại sỉ</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="lg:col-span-3 flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">T.Thái:</span>
          <select
            aria-label="Filter by status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="All">Tất cả trạng thái</option>
            <option value="Pending">Chưa xử lý</option>
            <option value="Resolved">Đã xử lý / Hoàn thành</option>
          </select>
        </div>
      </div>

      {/* Results Header Info */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-slate-500">
          Đang hiển thị <span className="text-slate-800 font-bold">{filteredRecords.length}</span> trong số <span className="text-slate-400">{records.length}</span> bản ghi nhật ký
        </p>
        {debouncedSearch && (
          <p className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md border border-indigo-100 font-bold">
            Truy vấn tìm kiếm: "{debouncedSearch}"
          </p>
        )}
      </div>

      {/* Main Responsive Grid/Table container */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center select-none bg-slate-50/50">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4 border border-slate-200">
              <Filter className="w-5 h-5" />
            </div>
            <h4 className="text-slate-800 font-semibold text-sm">Không tìm thấy bản ghi phù hợp</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-normal font-medium">
              Thử thay đổi cài đặt bộ lọc, xóa truy vấn tìm kiếm hoặc ghi nhận một giao dịch sửa chữa mới.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                  <th className="p-4">Thời gian ghi nhận</th>
                  <th className="p-4">Phân loại</th>
                  <th className="p-4">Tên máy & Thông tin thiết bị</th>
                  <th className="p-4">Tên khách hàng & SĐT</th>
                  <th className="p-4 text-right">Đơn giá (USD)</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-center">Thao tác SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((record) => (
                  <tr 
                    key={record.id} 
                    id={`row-${record.id}`}
                    className="hover:bg-slate-50/40 transition-all duration-150 text-xs"
                  >
                    {/* Timestamp */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-700 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(record.created_at)}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 block mt-0.5">{record.id}</span>
                    </td>

                    {/* Classification */}
                    <td className="p-4 whitespace-nowrap">
                      {getPurposeBadge(record.purpose)}
                    </td>

                    {/* Machine Detail */}
                    <td className="p-4 max-w-xs">
                      <div className="font-bold text-slate-900 tracking-tight leading-tight truncate text-sm">
                        {record.machine_name}
                      </div>
                      <div className="text-xs font-mono text-slate-500 flex items-center gap-1.5 mt-1">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">{record.color}</span>
                        {record.imei && record.imei !== 'N/A' && (
                          <span className="text-[10px] font-bold text-slate-400 truncate">S/N: {record.imei}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-1 font-semibold">
                        {record.reason}
                      </p>
                    </td>

                    {/* Contact Profile */}
                    <td className="p-4">
                      {record.purpose === 'Customer' ? (
                        <>
                          <div className="text-slate-800 font-bold">{record.customer_name}</div>
                          <div className="text-[10px] text-slate-400 font-bold mt-0.5">{record.phone}</div>
                        </>
                      ) : (
                        <div className="text-slate-400 font-semibold text-xs italic">Máy tiệm (Nội bộ)</div>
                      )}
                    </td>

                    {/* Value */}
                    <td className="p-4 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                      ${record.price.toFixed(2)}
                    </td>

                    {/* Repair State */}
                    <td className="p-4 whitespace-nowrap">
                      {getStatusBadge(record.status, record.is_overdue)}
                    </td>

                    {/* Quick SLA Action */}
                    <td className="p-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {record.status === 'Pending' ? (
                          <button
                            id={`resolve-btn-${record.id}`}
                            onClick={() => onStatusChange(record.id, 'Resolved')}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-2.5 py-1.5 rounded-lg border border-indigo-100 font-bold text-xs transition-all duration-150 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                            <span>Đã xử lý</span>
                          </button>
                        ) : (
                          <button
                            id={`reopen-btn-${record.id}`}
                            onClick={() => onStatusChange(record.id, 'Pending')}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 font-bold text-xs transition-all duration-150 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Mở lại</span>
                          </button>
                        )}
                         {onDeleteRecord && (
                          deletingId === record.id ? (
                            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 p-1 rounded-lg animate-fade-in shadow-xs">
                              <span className="text-[10px] font-bold text-rose-700 px-1">Xóa?</span>
                              <button
                                id={`confirm-yes-${record.id}`}
                                onClick={() => {
                                  onDeleteRecord(record.id);
                                  setDeletingId(null);
                                }}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded text-[10px] cursor-pointer shadow-xs"
                              >
                                Có
                              </button>
                              <button
                                id={`confirm-no-${record.id}`}
                                onClick={() => setDeletingId(null)}
                                className="px-2 py-1 bg-white hover:bg-slate-50 text-slate-600 font-bold border border-slate-200 rounded text-[10px] cursor-pointer"
                              >
                                Không
                              </button>
                            </div>
                          ) : (
                            <button
                              id={`delete-btn-${record.id}`}
                              onClick={() => setDeletingId(record.id)}
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-700 rounded-lg border border-rose-100 transition-all duration-150 cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
