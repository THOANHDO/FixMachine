/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HistoryRecord, PurposeType } from '../types';
import { Sparkles, HelpCircle, Save, AlertTriangle } from 'lucide-react';

interface TransactionFormProps {
  onSubmit: (record: Omit<HistoryRecord, 'id' | 'created_at' | 'is_overdue'>) => void;
  isLoading?: boolean;
}

export default function TransactionForm({ onSubmit, isLoading }: TransactionFormProps) {
  const [purpose, setPurpose] = useState<PurposeType>('Customer');
  const [machineName, setMachineName] = useState('');
  const [color, setColor] = useState('');
  const [imei, setImei] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [price, setPrice] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Quick helper to fill in test/template data
  const handleAutofill = () => {
    setMachineName('iPhone 15 Pro Back Glass Replacement');
    setColor('Natural Titanium');
    setImei('359142850381948');
    setCustomerName('Cynthia Thorne');
    setPhone('+1 (555) 777-8899');
    setPrice('189.99');
    setReason('Laser remove broken rear back ceramic panel and seal replacement. Water seal required.');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!machineName.trim()) newErrors.machineName = 'Tên máy hoặc thiết bị không được để trống';
    if (!color.trim()) newErrors.color = 'Màu sắc thiết bị không được để trống';
    
    // Valid phone and customer only if purpose is 'Customer'
    if (purpose === 'Customer') {
      if (!customerName.trim()) newErrors.customerName = 'Tên khách hàng là bắt buộc đối với sửa chữa cá nhân';
      if (!phone.trim()) newErrors.phone = 'Số điện thoại là bắt buộc để gửi thông báo';
    }

    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      newErrors.price = 'Vui lòng nhập đơn giá hợp lệ lớn hơn hoặc bằng 0 (ví dụ: 150.00)';
    }

    if (!reason.trim()) newErrors.reason = 'Mô tả lý do lỗi / trạng thái chi tiết không được để trống';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      purpose,
      machine_name: machineName,
      color,
      imei: imei.trim() || 'N/A',
      customer_name: purpose === 'Customer' ? customerName : 'Shop Refurbish',
      phone: purpose === 'Customer' ? phone : 'N/A',
      price: Number(price),
      reason,
      status: 'Pending'
    });

    // Reset Form
    setMachineName('');
    setColor('');
    setImei('');
    setCustomerName('');
    setPhone('');
    setPrice('');
    setReason('');
    setErrors({});
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Form Header */}
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-905">Ghi nhận giao dịch sửa chữa</h3>
          <p className="text-xs text-slate-500 mt-1">
            Bắt đầu nhật ký sửa chữa ưu tiên cao với giám sát SLA 24 giờ tự động.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAutofill}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] text-indigo-600 font-bold uppercase tracking-wider hover:bg-indigo-50 rounded-lg border border-indigo-100 transition-all duration-200 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tự động điền</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Purpose selector */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">
            Mục đích & Phân loại dịch vụ
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['Customer', 'Shop', 'Defective'] as PurposeType[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPurpose(p);
                  // Clean errors on switch
                  const copy = { ...errors };
                  delete copy.customerName;
                  delete copy.phone;
                  setErrors(copy);
                }}
                className={`py-3 px-4 rounded-xl text-center border font-bold text-xs uppercase tracking-wider transition-all duration-200 flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  purpose === p
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-600 shadow-xs'
                    : 'bg-slate-50/50 border-slate-200 text-slate-500 hover:border-slate-350 hover:text-slate-900'
                }`}
              >
                <span>
                  {p === 'Customer' && 'Thay khách'}
                  {p === 'Shop' && 'Máy tiệm'}
                  {p === 'Defective' && 'Dính xương / Trả lại sỉ'}
                </span>
                <span className="text-[9px] lowercase font-semibold text-slate-400 tracking-normal normal-case">
                  {p === 'Customer' && 'Cảnh báo SLA: Liên hệ riêng'}
                  {p === 'Shop' && 'Cảnh báo SLA: Tồn kho nội bộ'}
                  {p === 'Defective' && 'Cảnh báo SLA: RMA Nhà cung cấp'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Core fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Machine Name */}
          <div>
            <label htmlFor="machine-name-input" className="text-xs font-bold text-slate-500 block mb-2">
              Tên máy <span className="text-rose-500">*</span>
            </label>
            <input
              id="machine-name-input"
              type="text"
              placeholder="Ví dụ: Sửa iPad Pro, bo mạch máy tiện..."
              value={machineName}
              onChange={(e) => setMachineName(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg bg-slate-50 border text-slate-800 text-xs font-medium focus:outline-none transition-colors duration-200 ${
                errors.machineName ? 'border-rose-300 bg-rose-50 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
            {errors.machineName && (
              <p className="text-xs text-rose-600 mt-1.5 font-bold">{errors.machineName}</p>
            )}
          </div>

          {/* Color & Build */}
          <div>
            <label htmlFor="color-input" className="text-xs font-bold text-slate-500 block mb-2">
              Màu sắc <span className="text-rose-500">*</span>
            </label>
            <input
              id="color-input"
              type="text"
              placeholder="Ví dụ: Xám không gian, Xanh titan"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg bg-slate-50 border text-slate-800 text-xs font-medium focus:outline-none transition-colors duration-200 ${
                errors.color ? 'border-rose-300 bg-rose-50 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
            {errors.color && (
              <p className="text-xs text-rose-600 mt-1.5 font-bold">{errors.color}</p>
            )}
          </div>

          {/* IMEI/Serial */}
          <div>
            <label htmlFor="imei-input" className="text-xs font-bold text-slate-500 block mb-1">
              IMEI / Part Serial <span className="text-slate-400 font-bold text-[10px]">(Không bắt buộc)</span>
            </label>
            <span className="text-[10px] text-slate-400 block mb-1">Xác minh linh kiện / thiết bị tồn kho</span>
            <input
              id="imei-input"
              type="text"
              placeholder="Ví dụ: Số IMEI hoặc mã linh kiện"
              value={imei}
              onChange={(e) => setImei(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-indigo-500 transition-colors duration-200"
            />
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price-input" className="text-xs font-bold text-slate-500 block mb-2">
              Đơn giá ($ USD) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
              <input
                id="price-input"
                type="text"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`w-full pl-8 pr-4 py-2.5 rounded-lg bg-slate-50 border text-slate-800 text-xs font-medium focus:outline-none transition-colors duration-200 ${
                  errors.price ? 'border-rose-300 bg-rose-50 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                }`}
              />
            </div>
            {errors.price ? (
              <p className="text-xs text-rose-600 mt-1.5 font-bold">{errors.price}</p>
            ) : (
              <p className="text-[10px] text-slate-450 mt-1.5 italic font-medium">Tổng chi phí ước tính bao gồm linh kiện & công sửa chữa</p>
            )}
          </div>
        </div>

        {/* Conditional customer details */}
        {purpose === 'Customer' && (
          <div className="p-4 bg-slate-50/50 border border-slate-200 rounded-xl space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Hồ sơ liên hệ khách hàng
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customer-name-input" className="text-xs font-bold text-slate-500 block mb-1.5">
                  Tên khách hàng <span className="text-rose-500">*</span>
                </label>
                <input
                  id="customer-name-input"
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-lg bg-slate-50 border text-slate-800 text-xs font-medium focus:outline-none transition-colors duration-200 ${
                    errors.customerName ? 'border-rose-300 bg-rose-50 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                  }`}
                />
                {errors.customerName && (
                  <p className="text-xs text-rose-600 mt-1 font-bold">{errors.customerName}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone-input" className="text-xs font-bold text-slate-500 block mb-1.5">
                  Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <input
                  id="phone-input"
                  type="text"
                  placeholder="Ví dụ: 0901234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-lg bg-slate-50 border text-slate-800 text-xs font-medium focus:outline-none transition-colors duration-200 ${
                    errors.phone ? 'border-rose-300 bg-rose-50 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                  }`}
                />
                {errors.phone && (
                  <p className="text-xs text-rose-600 mt-1 font-bold">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reason / Diagnostics */}
        <div>
          <label htmlFor="reason-textarea" className="text-xs font-bold text-slate-500 block mb-2">
            Lý do lỗi / Trạng thái <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="reason-textarea"
            rows={3}
            placeholder="Mô tả chính xác vấn đề lỗi, linh kiện khuyết tật, yêu cầu chi tiết và bộ phận cần thay thế..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-lg bg-slate-50 border text-slate-855 text-xs font-medium focus:outline-none transition-colors duration-200 ${
              errors.reason ? 'border-rose-300 bg-rose-50 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
            }`}
          />
          {errors.reason && (
            <p className="text-xs text-rose-600 mt-1.5 font-bold">{errors.reason}</p>
          )}
        </div>

        {/* SLA Notice */}
        <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-100 rounded-lg">
          <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed font-semibold">
            <strong>Chính sách SLA 24H được kích hoạt:</strong> Bằng cách xác nhận đơn sửa chữa này, bạn sẽ liên kết bản ghi này với trình theo dõi SLA. Nếu trạng thái tiếp tục là <strong>"Chưa xử lý"</strong> sau 24 giờ kể từ lúc tạo, hệ thống tự động sẽ kích hoạt Discord webhook và gửi cảnh báo nghiêm trọng.
          </p>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            id="submit-record-button"
            disabled={isLoading}
            className={`bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-xs tracking-wider uppercase font-bold flex items-center gap-2 shadow-xs active:translate-y-px transition-all duration-200 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Đang lưu bản ghi...' : 'Xác nhận Giao dịch'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
