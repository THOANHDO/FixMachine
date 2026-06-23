/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HistoryRecord, AppAlert } from './types';
import Sidebar from './components/Sidebar';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import NewTransactionView from './views/NewTransaction';
import HistoryView from './views/History';
import AlertsView from './views/Alerts';
import SettingsView from './views/Settings';
import { 
  getStoredRecords, 
  saveStoredRecords, 
  getStoredAlerts, 
  saveStoredAlerts,
  INITIAL_ALERTS
} from './utils/mockData';
import { Wrench, Shield } from 'lucide-react';

export default function App() {
  // Authentication & Guards
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [operatorName, setOperatorName] = useState('');
  const [isSupabaseConnection, setIsSupabaseConnection] = useState(false);

  // Active routing view state
  const [currentView, setCurrentView] = useState('dashboard');

  // Database application State
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [alerts, setAlerts] = useState<AppAlert[]>([]);

  // Hydrate states on init
  useEffect(() => {
    // Check if operator name was cached
    try {
      const cachedName = sessionStorage.getItem('operator_session_name');
      if (cachedName) {
        setOperatorName(cachedName);
        setIsLoggedIn(true);
      }
    } catch (e) {
      console.warn("sessionStorage is blocked or inaccessible:", e);
    }

    try {
      const loadedRecs = getStoredRecords();
      setRecords(loadedRecs);
      setAlerts(getStoredAlerts(loadedRecs));
    } catch (e) {
      console.warn("Storage loading failed:", e);
    }
  }, []);

  // Sync state to LocalStorage
  const handleSaveRecords = (newRecords: HistoryRecord[]) => {
    setRecords(newRecords);
    saveStoredRecords(newRecords);
    
    // Dynamically rebuild alerts from overdue states
    const nextAlerts = getStoredAlerts(newRecords);
    setAlerts(nextAlerts);
    saveStoredAlerts(nextAlerts);
  };

  // Automated Overdue cron/verification simulator (runs every 10 seconds client-side)
  useEffect(() => {
    if (records.length === 0) return;

    const interval = setInterval(() => {
      let changed = false;
      const updated = records.map(rec => {
        if (rec.status === 'Pending' && !rec.is_overdue) {
          const hoursPassed = (Date.now() - new Date(rec.created_at).getTime()) / (1000 * 60 * 60);
          if (hoursPassed > 24) {
            changed = true;
            return { ...rec, is_overdue: true };
          }
        }
        return rec;
      });

      if (changed) {
        handleSaveRecords(updated);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [records]);

  // Handler: Form Submission
  const handleAddTransaction = (formData: Omit<HistoryRecord, 'id' | 'created_at' | 'is_overdue'>) => {
    const timestamp = new Date().toISOString();
    const prefix = formData.purpose === 'Customer' ? 'CUST' : formData.purpose === 'Shop' ? 'SHOP' : 'RMA';
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const newId = `tx_${prefix.toLowerCase()}_${randomId}`;

    const newLabel: HistoryRecord = {
      ...formData,
      id: newId,
      created_at: timestamp,
      is_overdue: false,
    };

    const nextRecords = [newLabel, ...records];
    handleSaveRecords(nextRecords);
  };

  // Handler: Status transition (Pending <-> Resolved)
  const handleStatusChange = (id: string, nextStatus: 'Pending' | 'Resolved') => {
    const updated = records.map(rec => {
      if (rec.id === id) {
        return {
          ...rec,
          status: nextStatus,
          // If status resolved, clear overdue flag
          is_overdue: nextStatus === 'Resolved' ? false : rec.is_overdue
        };
      }
      return rec;
    });
    handleSaveRecords(updated);
  };

  // Handler: Delete Record
  const handleDeleteRecord = (id: string) => {
    const next = records.filter(r => r.id !== id);
    handleSaveRecords(next);
  };

  // Handler: User Session Trigger
  const handleLoginSuccess = (operator: string, isSupabase: boolean) => {
    setOperatorName(operator);
    setIsSupabaseConnection(isSupabase);
    setIsLoggedIn(true);
    try {
      sessionStorage.setItem('operator_session_name', operator);
    } catch (e) {
      console.warn("sessionStorage.setItem failed:", e);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setOperatorName('');
    try {
      sessionStorage.removeItem('operator_session_name');
    } catch (e) {
      console.warn("sessionStorage.removeItem failed:", e);
    }
  };

  const handleClearAlert = (id: string) => {
    const nextAlerts = alerts.filter(a => a.id !== id);
    setAlerts(nextAlerts);
    saveStoredAlerts(nextAlerts);
  };

  const handleRefreshRecords = () => {
    const refreshed = getStoredRecords();
    setRecords(refreshed);
    setAlerts(getStoredAlerts(refreshed));
  };

  // Route Guards / Render Engine
  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Active Alert Badge count matching pending overdue actions
  const overdueCount = records.filter(r => r.status === 'Pending' && r.is_overdue).length;

  return (
    <div className="flex bg-[#F9FAFB] font-sans text-slate-800 min-h-screen relative selection:bg-indigo-500/10 selection:text-indigo-900">
      
      {/* Global left sidebar navigation */}
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        onLogout={handleLogout}
        userName={operatorName}
        overdueCount={overdueCount}
      />

      {/* Main View layout pane */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* Top telemetry bar */}
        <header className="px-8 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">
              Mức độ bảo mật phiên: <strong className="text-emerald-600">Đã ủy quyền</strong>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 py-1 px-2.5 rounded-lg border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Máy chủ Supabase trực tuyến</span>
            </div>
          </div>
        </header>

        {/* View content container layout */}
        <div className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          {currentView === 'dashboard' && (
            <Dashboard 
              records={records} 
              onNavigate={setCurrentView} 
              onStatusChange={handleStatusChange} 
            />
          )}

          {currentView === 'new-transaction' && (
            <NewTransactionView 
              onNavigate={setCurrentView} 
              onAddTransaction={handleAddTransaction} 
            />
          )}

          {currentView === 'history' && (
            <HistoryView 
              records={records} 
              onStatusChange={handleStatusChange} 
              onDeleteRecord={handleDeleteRecord}
              onRefresh={handleRefreshRecords}
            />
          )}

          {currentView === 'alerts' && (
            <AlertsView 
              alerts={alerts} 
              records={records} 
              onNavigate={setCurrentView}
              onClearAlert={handleClearAlert}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView onSaveConfig={handleRefreshRecords} />
          )}
        </div>

      </main>
    </div>
  );
}
