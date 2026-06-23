/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PurposeType = 'Shop' | 'Customer' | 'Defective';
export type TransactionStatus = 'Pending' | 'Resolved';

export interface HistoryRecord {
  id: string;
  created_at: string;
  purpose: PurposeType;
  machine_name: string;
  color: string;
  imei: string;
  customer_name: string;
  phone: string;
  price: number;
  reason: string;
  status: TransactionStatus;
  is_overdue: boolean;
}

export interface AppAlert {
  id: string;
  type: 'warning' | 'info' | 'danger';
  message: string;
  machine_name: string;
  created_at: string;
  record_id?: string;
}

export interface SystemConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  discordWebhookUrl: string;
  overdueThresholdHours: number;
}
