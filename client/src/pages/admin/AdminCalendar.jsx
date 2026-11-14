import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Lock,
  Clock,
  User,
  AlertCircle,
  X,
  CheckCircle2,
} from 'lucide-react';

export const AdminCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Block Modal
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockDateVal, setBlockDateVal] = useState('');
  const [blockTitle, setBlockTitle] = useState('Reserved / Maintenance Slot');
  const [blockReason, setBlockReason] = useState('High production capacity limit reached');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const res = await api.get(`/calendar?month=${month}&year=${year}`);
      if (res.data.success) {
        setEvents(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching calendar events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const getEventsForDay = (day) => {
    if (!day) return [];
    return events.filter((ev) => {
      const evDate = new Date(ev.date);
      return (
        evDate.getFullYear() === year &&
        evDate.getMonth() === month &&
        evDate.getDate() === day
      );
    });
  };

  const handleBlockSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);

    try {
      await api.post('/admin/calendar/block', {
        date: blockDateVal,
        title: blockTitle,
        reason: blockReason,
      });
      setBlockModalOpen(false);
      await fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || 'Error blocking date');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblock = async (id) => {
    if (window.confirm('Reopen this date for customer bookings?')) {
      try {
        await api.delete(`/admin/calendar/unblock/${id}`);
        await fetchEvents();
      } catch (err) {
        alert(err.response?.data?.message || 'Error unblocking date');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Production Calendar & Slot Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            View customer bookings, track upcoming milestones, and block blackout dates
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setBlockDateVal(new Date().toISOString().split('T')[0]);
              setError(null);
              setBlockModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold hover:bg-rose-600/40 transition"
          >
            <Lock className="w-3.5 h-3.5" /> Block Date / Slot
          </button>

          {/* Month Navigation */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button onClick={prevMonth} className="p-1 text-slate-400 hover:text-white transition">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-white min-w-[110px] text-center">
              {monthNames[month]} {year}
            </span>
            <button onClick={nextMonth} className="p-1 text-slate-400 hover:text-white transition">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800">
        <div className="grid grid-cols-7 gap-2 mb-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
            const dayEvents = getEventsForDay(day);
            const isToday =
              day &&
              new Date().getFullYear() === year &&
              new Date().getMonth() === month &&
              new Date().getDate() === day;

            return (
              <div
                key={idx}
                className={`min-h-[110px] p-2 rounded-xl border flex flex-col justify-between transition ${
                  !day
                    ? 'border-transparent bg-transparent'
                    : isToday
                    ? 'border-violet-500/80 bg-violet-600/10'
                    : 'border-slate-800/80 bg-navy-950/60 hover:border-slate-700'
                }`}
              >
                {day && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-bold ${isToday ? 'text-violet-400' : 'text-slate-300'}`}>
                        {day}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[10px] text-slate-500">
                          {dayEvents.length} event{dayEvents.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 mt-1 max-h-20 overflow-y-auto">
                      {dayEvents.map((ev, eIdx) => (
                        <div
                          key={eIdx}
                          title={`${ev.title} - ${ev.description}`}
                          className={`p-1 rounded text-[10px] flex items-center justify-between font-medium ${
                            ev.isBlocked
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-violet-600/30 text-violet-200 border border-violet-500/40'
                          }`}
                        >
                          <span className="truncate">{ev.title}</span>
                          {ev.isBlocked && (
                            <button
                              onClick={() => handleUnblock(ev._id)}
                              title="Unblock this date"
                              className="ml-1 text-rose-400 hover:text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Block Date Modal */}
      {blockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-navy-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Block Date from Bookings</h3>
              <button onClick={() => setBlockModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleBlockSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Date to Block *</label>
                <input
                  type="date"
                  required
                  value={blockDateVal}
                  onChange={(e) => setBlockDateVal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Title / Label *</label>
                <input
                  type="text"
                  required
                  value={blockTitle}
                  onChange={(e) => setBlockTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Reason (Displayed to internal team)</label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setBlockModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold disabled:opacity-50"
                >
                  {actionLoading ? 'Blocking...' : 'Block Date Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
