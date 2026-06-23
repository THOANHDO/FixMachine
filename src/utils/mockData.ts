/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HistoryRecord, AppAlert } from '../types';

// Let's generate dates in the past for realistic records
const getPastDateString = (hoursAgo: number): string => {
  const date = new Date();
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
};

export const INITIAL_RECORDS: HistoryRecord[] = [
  {
    id: 'tx_1',
    created_at: getPastDateString(28), // 28 hours ago -> Overdue!
    purpose: 'Customer',
    machine_name: 'Thay màn hình iPhone 15 Pro Max',
    color: 'Titanium Xám',
    imei: '358920110394821',
    customer_name: 'Sơn Tùng M-TP',
    phone: '0901234567',
    price: 349.99,
    reason: 'Kính màn hình trước bị vỡ nát, tấm nền OLED vẫn hoạt động bình thường',
    status: 'Pending',
    is_overdue: true,
  },
  {
    id: 'tx_2',
    created_at: getPastDateString(48), // 48 hours ago but Resolved -> Not overdue
    purpose: 'Shop',
    machine_name: 'Thay pin Samsung Galaxy S24 Ultra',
    color: 'Titanium Tím',
    imei: '862094850239481',
    customer_name: 'Kho linh kiện FixIt (Nội bộ)',
    phone: '',
    price: 89.00,
    reason: 'Pin bị phù nề, cần tháo dỡ và xử lý rác thải nguy hại ngay lập tức',
    status: 'Resolved',
    is_overdue: false,
  },
  {
    id: 'tx_3',
    created_at: getPastDateString(4), // 4 hours ago -> Recent, not overdue
    purpose: 'Defective',
    machine_name: 'Sửa chân sạc USB-C iPad Pro 12.9 inch',
    color: 'Xám không gian',
    imei: 'DMPY5K91QL6L',
    customer_name: 'Hoàng Thùy Linh',
    phone: '0987654321',
    price: 120.00,
    reason: 'Cáp sạc gốc bị đứt, cần thay thế cụm mạch sạc mới',
    status: 'Pending',
    is_overdue: false,
  },
  {
    id: 'tx_4',
    created_at: getPastDateString(72), // 3 days ago, Pending -> Overdue!
    purpose: 'Customer',
    machine_name: 'Sửa MacBook Air M2 vào nước',
    color: 'Đen đêm muộn',
    imei: 'CO2HG50KQ6L4',
    customer_name: 'Phan Mạnh Quỳnh',
    phone: '0912345678',
    price: 850.00,
    reason: 'Mạch chính bị rỉ sét do ngấm nước, khách yêu cầu sao lưu dữ liệu trước',
    status: 'Pending',
    is_overdue: true,
  },
  {
    id: 'tx_5',
    created_at: getPastDateString(3), // 3 hours ago -> Recent
    purpose: 'Shop',
    machine_name: 'Kính camera Google Pixel 8 Pro',
    color: 'Xanh vương quốc',
    imei: '357284910283948',
    customer_name: 'Tân trang tồn kho',
    phone: '',
    price: 45.00,
    reason: 'Tân trang linh kiện nội bộ cho thiết bị trưng bày',
    status: 'Resolved',
    is_overdue: false,
  }
];

export const INITIAL_ALERTS: AppAlert[] = [
  {
    id: 'alt_1',
    type: 'danger',
    message: 'Thiết bị Thay màn hình iPhone 15 Pro Max đã trôi qua 4 giờ kể từ thời hạn sửa chữa (vượt quá 24H).',
    machine_name: 'Thay màn hình iPhone 15 Pro Max',
    created_at: getPastDateString(28),
    record_id: 'tx_1'
  },
  {
    id: 'alt_2',
    type: 'danger',
    message: 'Thiết bị Sửa MacBook Air M2 vào nước đã trôi qua 48 giờ kể từ thời hạn sửa chữa (vượt quá 24H).',
    machine_name: 'Sửa MacBook Air M2 vào nước',
    created_at: getPastDateString(72),
    record_id: 'tx_4'
  },
  {
    id: 'alt_3',
    type: 'info',
    message: 'Cảnh báo kho linh kiện: Keo tản nhiệt và keo dán màn hình đã giảm dưới mức tối thiểu quy định.',
    machine_name: 'Hậu cần chung',
    created_at: getPastDateString(1)
  }
];

/**
 * Persists data to LocalStorage for offline-first operation when Supabase connection is inactive
 */
export const getStoredRecords = (): HistoryRecord[] => {
  try {
    const data = localStorage.getItem('repair_system_records');
    if (!data) {
      try {
        localStorage.setItem('repair_system_records', JSON.stringify(INITIAL_RECORDS));
      } catch (err) {}
      return INITIAL_RECORDS;
    }
    const records = JSON.parse(data) as HistoryRecord[];
    // Dynamically recalculate "is_overdue" status on load based on a 24H window (for demo)
    return records.map(rec => {
      const hoursDiff = (Date.now() - new Date(rec.created_at).getTime()) / (1000 * 60 * 60);
      const overdue = hoursDiff > 24 && rec.status === 'Pending';
      return { ...rec, is_overdue: overdue };
    });
  } catch (e) {
    return INITIAL_RECORDS;
  }
};

export const saveStoredRecords = (records: HistoryRecord[]) => {
  try {
    localStorage.setItem('repair_system_records', JSON.stringify(records));
  } catch (e) {
    console.warn("localStorage.setItem failed for records:", e);
  }
};

export const getStoredAlerts = (records?: HistoryRecord[]): AppAlert[] => {
  // If records are provided, we can dynamically build overdue alerts, plus static log alerts
  let baseAlerts: AppAlert[] = INITIAL_ALERTS;
  try {
    const data = localStorage.getItem('repair_system_alerts');
    if (data) {
      baseAlerts = JSON.parse(data) as AppAlert[];
    }
  } catch (e) {
    baseAlerts = INITIAL_ALERTS;
  }

  if (records) {
    // Generate dynamic overdue alerts based on pending overdue records
    const overdueRecords = records.filter(rec => rec.is_overdue && rec.status === 'Pending');
    const dynamicAlerts = overdueRecords.map(rec => {
      const hoursPast = Math.floor((Date.now() - new Date(rec.created_at).getTime()) / (1000 * 60 * 60)) - 24;
      return {
        id: `dyn_alt_${rec.id}`,
        type: 'danger' as const,
        message: `Thiết bị "${rec.machine_name}" đã quá hạn! Vượt quá giới hạn SLA 24 giờ khoảng ${hoursPast > 0 ? hoursPast : 0} giờ.`,
        machine_name: rec.machine_name,
        created_at: rec.created_at,
        record_id: rec.id
      };
    });

    // Combine static custom alerts + dynamic active ones
    const combined = [...dynamicAlerts, ...baseAlerts.filter(a => !a.id.startsWith('dyn_alt_'))];
    // Deduplicate by ID
    const seen = new Set();
    return combined.filter(el => {
      const duplicate = seen.has(el.id);
      seen.add(el.id);
      return !duplicate;
    });
  }

  return baseAlerts;
};

export const saveStoredAlerts = (alerts: AppAlert[]) => {
  try {
    localStorage.setItem('repair_system_alerts', JSON.stringify(alerts));
  } catch (e) {
    console.warn("localStorage.setItem failed for alerts:", e);
  }
};
