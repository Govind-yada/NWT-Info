import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import {
  Terminal as TerminalIcon,
  Play,
  RotateCcw,
  Sparkles,
  Server,
  Database,
  ShoppingBag,
  CreditCard,
  Users,
  Layers,
  QrCode,
  Sliders,
  Cpu,
  Trash2,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const AdminTerminal = () => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState([
    {
      id: 1,
      command: 'welcome',
      output: {
        type: 'welcome',
        message: 'NWT INFO ADMIN TERMINAL v2.4.0 [CONNECTED: PRODUCTION KERNEL]',
        subtext: 'Type "help" to view directory of commands, or click any quick-run diagnostic pill below.',
      },
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [cmdHistoryList, setCmdHistoryList] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll on new output
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  // Focus input on click anywhere in terminal
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const executeCommand = async (commandToRun) => {
    const trimmed = (commandToRun || inputVal).trim();
    if (!trimmed) return;

    // Handle client-side clear immediately
    if (trimmed.toLowerCase() === 'clear' || trimmed.toLowerCase() === 'cls') {
      setHistory([]);
      setInputVal('');
      setHistoryIndex(-1);
      return;
    }

    // Add to command history navigation
    setCmdHistoryList((prev) => [trimmed, ...prev]);
    setHistoryIndex(-1);

    const newEntry = {
      id: Date.now(),
      command: trimmed,
      output: null,
      timestamp: new Date().toLocaleTimeString(),
    };

    setLoading(true);
    setInputVal('');

    try {
      const res = await api.post('/admin/terminal/execute', { command: trimmed });
      if (res.data.output?.type === 'clear') {
        setHistory([]);
      } else {
        newEntry.output = res.data.output;
        setHistory((prev) => [...prev, newEntry]);
      }
    } catch (err) {
      newEntry.output = {
        type: 'error',
        message: err.response?.data?.message || err.message || 'Execution failed on host.',
      };
      setHistory((prev) => [...prev, newEntry]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistoryList.length > 0) {
        const nextIdx = Math.min(historyIndex + 1, cmdHistoryList.length - 1);
        setHistoryIndex(nextIdx);
        setInputVal(cmdHistoryList[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(cmdHistoryList[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    }
  };

  const quickPills = [
    { label: 'status', icon: Server, cmd: 'status' },
    { label: 'db:status', icon: Database, cmd: 'db:status' },
    { label: 'orders:summary', icon: ShoppingBag, cmd: 'orders:summary' },
    { label: 'payments:audit', icon: CreditCard, cmd: 'payments:audit' },
    { label: 'upi:config', icon: QrCode, cmd: 'upi:config' },
    { label: 'users:list', icon: Users, cmd: 'users:list' },
    { label: 'services:list', icon: Layers, cmd: 'services:list' },
    { label: 'sysinfo', icon: Cpu, cmd: 'sysinfo' },
    { label: 'settings:get', icon: Sliders, cmd: 'settings:get' },
    { label: 'help', icon: Sparkles, cmd: 'help' },
    { label: 'clear', icon: Trash2, cmd: 'clear' },
  ];

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Header Card */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-violet-500/20 shadow-glow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-300">
              <TerminalIcon className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Admin Diagnostic Terminal
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  SHELL LIVE
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Interactive real-time systems console, payment audit ledger, and server diagnostic hub
              </p>
            </div>
          </div>
        </div>

        {/* Server Telemetry Badge */}
        <div className="flex items-center gap-3 text-xs bg-navy-950/70 border border-slate-800 rounded-xl px-3.5 py-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-slate-300">API GATEWAY: ONLINE</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-violet-400">SESSION: SUPER_ADMIN</span>
        </div>
      </div>

      {/* Quick Run Action Command Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Quick Commands:
        </span>
        {quickPills.map((pill) => {
          const Icon = pill.icon;
          return (
            <button
              key={pill.cmd}
              onClick={() => executeCommand(pill.cmd)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-900/80 hover:bg-violet-600/20 border border-slate-800 hover:border-violet-500/40 text-xs text-slate-300 hover:text-white transition font-mono whitespace-nowrap shadow-sm group"
            >
              <Icon className="w-3 h-3 text-violet-400 group-hover:scale-110 transition-transform" />
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>

      {/* Terminal Console Viewport */}
      <div
        onClick={handleContainerClick}
        className="rounded-2xl border border-slate-800/90 bg-[#090d16] shadow-2xl overflow-hidden font-mono text-xs cursor-text"
      >
        {/* Terminal Title Bar */}
        <div className="px-4 py-2.5 bg-navy-950/90 border-b border-slate-800 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600/50"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600/50"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600/50"></div>
            <span className="text-[11px] text-slate-400 font-semibold ml-2">
              admin@nwt-info: ~ (bash / node {process.env.NODE_ENV || 'production'})
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setHistory([]);
            }}
            title="Clear Terminal Output"
            className="text-slate-500 hover:text-slate-300 p-1 rounded transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable Terminal Screen */}
        <div className="p-5 min-h-[460px] max-h-[580px] overflow-y-auto space-y-4 custom-scrollbar text-slate-300">
          {history.map((item) => (
            <div key={item.id} className="space-y-2">
              {/* Command Input Echo */}
              {item.command !== 'welcome' && (
                <div className="flex items-center gap-2 text-violet-300 font-semibold">
                  <span className="text-emerald-400">admin@nwt-info</span>
                  <span className="text-slate-500">:</span>
                  <span className="text-blue-400">~</span>
                  <span className="text-slate-500">$</span>
                  <span className="text-white">{item.command}</span>
                  <span className="text-[10px] text-slate-600 font-normal ml-auto">{item.timestamp}</span>
                </div>
              )}

              {/* Formatted Output Renderer */}
              {item.output && (
                <div className="pl-3 border-l-2 border-violet-500/30 text-slate-200">
                  {/* Welcome Message */}
                  {item.output.type === 'welcome' && (
                    <div className="space-y-1 py-1">
                      <div className="text-emerald-400 font-bold">{item.output.message}</div>
                      <div className="text-slate-400 text-[11px]">{item.output.subtext}</div>
                    </div>
                  )}

                  {/* Plain Text Lines */}
                  {item.output.type === 'text' && (
                    <div className="space-y-1">
                      {item.output.lines?.map((line, i) => (
                        <div key={i} className="text-slate-300">{line}</div>
                      ))}
                    </div>
                  )}

                  {/* Error Output */}
                  {item.output.type === 'error' && (
                    <div className="flex items-center gap-2 text-rose-400 bg-rose-950/30 border border-rose-900/50 p-2.5 rounded-lg">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{item.output.message}</span>
                    </div>
                  )}

                  {/* Help Directory Output */}
                  {item.output.type === 'help' && (
                    <div className="space-y-3 py-1">
                      <div className="text-violet-400 font-bold tracking-wide">
                        {item.output.title}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                        {item.output.commands?.map((c) => (
                          <div
                            key={c.cmd}
                            onClick={() => executeCommand(c.cmd)}
                            className="p-2 rounded-lg bg-navy-950 border border-slate-800/80 hover:border-violet-500/40 cursor-pointer transition flex items-center justify-between"
                          >
                            <span className="text-emerald-400 font-bold">{c.cmd}</span>
                            <span className="text-slate-400 text-right truncate max-w-[240px]">
                              {c.desc}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Server Status Output */}
                  {item.output.type === 'status' && (
                    <div className="p-3 bg-navy-950/80 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-bold text-white flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          SERVER STATE: {item.output.data.serverStatus}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          PID: {item.output.data.pid}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                        <div className="bg-navy-900/60 p-2 rounded-lg border border-slate-800/60">
                          <span className="text-slate-500 block">System Uptime</span>
                          <span className="font-bold text-emerald-400">{item.output.data.uptime}</span>
                        </div>
                        <div className="bg-navy-900/60 p-2 rounded-lg border border-slate-800/60">
                          <span className="text-slate-500 block">Node Runtime</span>
                          <span className="font-bold text-blue-400">{item.output.data.nodeVersion}</span>
                        </div>
                        <div className="bg-navy-900/60 p-2 rounded-lg border border-slate-800/60">
                          <span className="text-slate-500 block">Heap Memory</span>
                          <span className="font-bold text-violet-400">{item.output.data.heapUsed}</span>
                        </div>
                        <div className="bg-navy-900/60 p-2 rounded-lg border border-slate-800/60">
                          <span className="text-slate-500 block">OS Platform</span>
                          <span className="font-bold text-slate-300">{item.output.data.platform}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sysinfo Output */}
                  {item.output.type === 'sysinfo' && (
                    <div className="p-3 bg-navy-950/80 border border-slate-800 rounded-xl space-y-2 text-[11px]">
                      <div className="font-bold text-white">HARDWARE & KERNEL METRICS</div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-navy-900/60 p-2.5 rounded-lg border border-slate-800/60">
                          <span className="text-slate-500 block">CPU Architecture</span>
                          <span className="font-bold text-white">{item.output.data.architecture} ({item.output.data.cpuCores} cores)</span>
                          <span className="text-[10px] text-slate-400 block truncate">{item.output.data.cpuModel}</span>
                        </div>
                        <div className="bg-navy-900/60 p-2.5 rounded-lg border border-slate-800/60">
                          <span className="text-slate-500 block">RAM Utilization</span>
                          <span className="font-bold text-amber-400">{item.output.data.usedMemory} Used</span>
                          <span className="text-[10px] text-slate-400 block">Total: {item.output.data.totalMemory}</span>
                        </div>
                        <div className="bg-navy-900/60 p-2.5 rounded-lg border border-slate-800/60">
                          <span className="text-slate-500 block">Kernel / OS</span>
                          <span className="font-bold text-white">{item.output.data.osType}</span>
                          <span className="text-[10px] text-slate-400 block truncate">{item.output.data.osRelease}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Database Status Output */}
                  {item.output.type === 'db' && (
                    <div className="p-3 bg-navy-950/80 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-bold text-white flex items-center gap-2">
                          <Database className="w-4 h-4 text-emerald-400" />
                          DATABASE: {item.output.data.databaseName}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {item.output.data.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[11px]">
                        {Object.entries(item.output.data.collections || {}).map(([coll, count]) => (
                          <div key={coll} className="bg-navy-900/60 p-2 rounded-lg border border-slate-800/60 text-center">
                            <span className="text-slate-500 block uppercase text-[9px] font-bold">{coll}</span>
                            <span className="font-bold text-white text-sm">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Orders Summary Output */}
                  {item.output.type === 'orders' && (
                    <div className="p-3 bg-navy-950/80 border border-slate-800 rounded-xl space-y-3 text-[11px]">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-bold text-white">ORDER LIFECYCLE SUMMARY</span>
                        <span className="text-emerald-400 font-bold">TOTAL: {item.output.data.total} ORDERS</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
                        <div className="p-2 rounded bg-amber-950/40 border border-amber-800/40">
                          <span className="text-amber-400 block text-[10px]">PENDING</span>
                          <span className="font-bold text-white">{item.output.data.breakdown.pending}</span>
                        </div>
                        <div className="p-2 rounded bg-blue-950/40 border border-blue-800/40">
                          <span className="text-blue-400 block text-[10px]">CONFIRMED</span>
                          <span className="font-bold text-white">{item.output.data.breakdown.confirmed}</span>
                        </div>
                        <div className="p-2 rounded bg-indigo-950/40 border border-indigo-800/40">
                          <span className="text-indigo-400 block text-[10px]">IN PROGRESS</span>
                          <span className="font-bold text-white">{item.output.data.breakdown.inProgress}</span>
                        </div>
                        <div className="p-2 rounded bg-purple-950/40 border border-purple-800/40">
                          <span className="text-purple-400 block text-[10px]">CLIENT REVIEW</span>
                          <span className="font-bold text-white">{item.output.data.breakdown.review}</span>
                        </div>
                        <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800/40">
                          <span className="text-emerald-400 block text-[10px]">COMPLETED</span>
                          <span className="font-bold text-white">{item.output.data.breakdown.completed}</span>
                        </div>
                        <div className="p-2 rounded bg-rose-950/40 border border-rose-800/40">
                          <span className="text-rose-400 block text-[10px]">CANCELLED</span>
                          <span className="font-bold text-white">{item.output.data.breakdown.cancelled}</span>
                        </div>
                      </div>

                      {/* Recent 5 Orders Table */}
                      <div className="pt-2">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                          Recent 5 Project Orders:
                        </span>
                        <div className="space-y-1">
                          {item.output.data.recent?.map((ord) => (
                            <div key={ord.orderNumber} className="flex items-center justify-between p-1.5 rounded bg-navy-900/60 border border-slate-800/60">
                              <span className="text-violet-400 font-bold">{ord.orderNumber}</span>
                              <span className="text-white truncate max-w-[150px]">{ord.title}</span>
                              <span className="text-slate-400 truncate max-w-[120px]">{ord.client}</span>
                              <span className="text-emerald-400 font-bold">{ord.amount}</span>
                              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                {ord.projectStatus}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payments Audit Output */}
                  {item.output.type === 'payments' && (
                    <div className="p-3 bg-navy-950/80 border border-slate-800 rounded-xl space-y-3 text-[11px]">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-bold text-white">FINANCIAL REVENUE & PAYMENT AUDIT</span>
                        <span className="text-emerald-400 font-bold">TOTAL REVENUE: {item.output.data.totalGross}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="p-2 rounded bg-navy-900/60 border border-slate-800/60">
                          <span className="text-slate-500 block text-[10px]">30% Advances Collected</span>
                          <span className="font-bold text-emerald-400">{item.output.data.advanceReceived}</span>
                        </div>
                        <div className="p-2 rounded bg-navy-900/60 border border-slate-800/60">
                          <span className="text-slate-500 block text-[10px]">70% Balances Collected</span>
                          <span className="font-bold text-blue-400">{item.output.data.remainingReceived}</span>
                        </div>
                        <div className="p-2 rounded bg-navy-900/60 border border-slate-800/60">
                          <span className="text-slate-500 block text-[10px]">UPI QR Transactions</span>
                          <span className="font-bold text-purple-400">{item.output.data.upiTransactions}</span>
                        </div>
                        <div className="p-2 rounded bg-navy-900/60 border border-slate-800/60">
                          <span className="text-slate-500 block text-[10px]">Razorpay Transactions</span>
                          <span className="font-bold text-cyan-400">{item.output.data.razorpayTransactions}</span>
                        </div>
                      </div>

                      {/* Recent Ledger Rows */}
                      <div className="pt-1 space-y-1">
                        {item.output.data.recent?.map((p) => (
                          <div key={p.ref} className="flex items-center justify-between p-1.5 rounded bg-navy-900/60 border border-slate-800/60">
                            <span className="text-slate-400">{p.ref}</span>
                            <span className="text-white font-semibold">{p.amount}</span>
                            <span className="text-violet-400 uppercase text-[10px]">{p.type}</span>
                            <span className="text-slate-400 uppercase text-[10px]">{p.method}</span>
                            <span className="text-emerald-400 uppercase font-bold text-[10px]">{p.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Users Output */}
                  {item.output.type === 'users' && (
                    <div className="p-3 bg-navy-950/80 border border-slate-800 rounded-xl space-y-3 text-[11px]">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-bold text-white">USER DIRECTORY SUMMARY</span>
                        <span className="text-blue-400 font-bold">{item.output.data.totalAccounts} Registered Accounts</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2.5 rounded bg-navy-900/60 border border-slate-800/60">
                          <span className="text-slate-500 block">Customers</span>
                          <span className="text-lg font-bold text-emerald-400">{item.output.data.customers}</span>
                        </div>
                        <div className="p-2.5 rounded bg-navy-900/60 border border-slate-800/60">
                          <span className="text-slate-500 block">Administrators</span>
                          <span className="text-lg font-bold text-violet-400">{item.output.data.administrators}</span>
                        </div>
                      </div>
                      <div className="space-y-1 pt-1">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                          Recent Registered Accounts:
                        </span>
                        {item.output.data.recent?.map((u, idx) => (
                          <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-navy-900/60 border border-slate-800/60">
                            <span className="text-white font-medium">{u.name}</span>
                            <span className="text-slate-400">{u.email}</span>
                            <span className="text-violet-400 font-mono text-[10px] uppercase">{u.role}</span>
                            <span className="text-slate-500">{u.joined}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Services Output */}
                  {item.output.type === 'services' && (
                    <div className="p-3 bg-navy-950/80 border border-slate-800 rounded-xl space-y-2 text-[11px]">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-bold text-white">DIGITAL SERVICES DIRECTORY</span>
                        <span className="text-emerald-400 font-bold">{item.output.data.totalServices} Services</span>
                      </div>
                      <div className="space-y-1">
                        {item.output.data.list?.map((s, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded bg-navy-900/60 border border-slate-800/60">
                            <span className="text-white font-bold">{s.name}</span>
                            <span className="text-slate-400 text-[10px] uppercase">{s.category}</span>
                            <span className="text-blue-400 font-semibold">{s.packageCount} Tier Packages</span>
                            <span className="text-emerald-400 font-bold">From {s.basePrice}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* UPI QR Config Output */}
                  {item.output.type === 'upi' && (
                    <div className="p-3 bg-navy-950/80 border border-slate-800 rounded-xl space-y-2 text-[11px]">
                      <div className="font-bold text-white border-b border-slate-800 pb-2">
                        PAYMENT GATEWAYS & UPI CONFIGURATION
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-2.5 rounded bg-navy-900/60 border border-slate-800/60">
                          <span className="text-slate-500 block">Company UPI ID</span>
                          <span className="font-bold text-emerald-400 font-mono text-sm">{item.output.data.companyUpiId}</span>
                        </div>
                        <div className="p-2.5 rounded bg-navy-900/60 border border-slate-800/60">
                          <span className="text-slate-500 block">Company Payee Name</span>
                          <span className="font-bold text-white">{item.output.data.companyPayeeName}</span>
                        </div>
                        <div className="p-2.5 rounded bg-navy-900/60 border border-slate-800/60">
                          <span className="text-slate-500 block">UPI QR Gateway</span>
                          <span className="font-bold text-emerald-400">{item.output.data.upiQrStatus}</span>
                        </div>
                        <div className="p-2.5 rounded bg-navy-900/60 border border-slate-800/60">
                          <span className="text-slate-500 block">Razorpay Gateway</span>
                          <span className="font-bold text-cyan-400">{item.output.data.razorpayStatus}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Settings Output */}
                  {item.output.type === 'settings' && (
                    <div className="p-3 bg-navy-950/80 border border-slate-800 rounded-xl space-y-2 text-[11px]">
                      <div className="font-bold text-white border-b border-slate-800 pb-2">
                        DYNAMIC PLATFORM SETTINGS
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-2 rounded bg-navy-900/60 border border-slate-800/60">
                          <span className="text-slate-500 block">Organization</span>
                          <span className="font-bold text-white">{item.output.data.companyName}</span>
                          <span className="text-[10px] text-slate-400 block">{item.output.data.tagline}</span>
                        </div>
                        <div className="p-2 rounded bg-navy-900/60 border border-slate-800/60">
                          <span className="text-slate-500 block">Support Contact</span>
                          <span className="font-bold text-white">{item.output.data.supportEmail}</span>
                          <span className="text-[10px] text-slate-400 block">{item.output.data.supportPhone}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Pending Spinner */}
          {loading && (
            <div className="flex items-center gap-2 text-violet-400 text-xs py-1">
              <span className="animate-spin">⠋</span>
              <span>Executing diagnostic task on cluster...</span>
            </div>
          )}

          <div ref={terminalEndRef} />
        </div>

        {/* Command Line Input Footer */}
        <div className="px-4 py-3 bg-navy-950/95 border-t border-slate-800 flex items-center gap-2">
          <span className="text-emerald-400 font-bold shrink-0">admin@nwt-info</span>
          <span className="text-slate-500">:</span>
          <span className="text-blue-400 shrink-0">~</span>
          <span className="text-slate-500 shrink-0">$</span>
          
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type command (e.g. status, db:status, orders:summary, upi:config) or 'help'..."
            className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none placeholder:text-slate-600"
            disabled={loading}
          />

          <button
            onClick={() => executeCommand()}
            disabled={loading || !inputVal.trim()}
            className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:hover:bg-violet-600 text-white font-bold text-xs flex items-center gap-1 transition shrink-0"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Run</span>
          </button>
        </div>
      </div>
    </div>
  );
};
