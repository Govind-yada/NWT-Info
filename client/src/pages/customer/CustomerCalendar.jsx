import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Sparkles } from 'lucide-react';

export const CustomerCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Project Kickoff Schedule</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Confirmed calendar slots & delivery windows
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
          <button onClick={prevMonth} className="p-1 text-slate-400 hover:text-white transition">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-white min-w-[120px] text-center">
            {monthNames[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-1 text-slate-400 hover:text-white transition">
            <ChevronRight className="w-5 h-5" />
          </button>
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
                className={`min-h-[90px] p-2 rounded-xl border flex flex-col justify-between transition ${
                  !day
                    ? 'border-transparent bg-transparent'
                    : isToday
                    ? 'border-blue-500/80 bg-blue-600/10'
                    : 'border-slate-800/80 bg-navy-950/60 hover:border-slate-700'
                }`}
              >
                {day && (
                  <>
                    <span className={`text-xs font-bold ${isToday ? 'text-brand-electric' : 'text-slate-300'}`}>
                      {day}
                    </span>

                    <div className="space-y-1 mt-1">
                      {dayEvents.map((ev, eIdx) => (
                        <div
                          key={eIdx}
                          title={ev.title}
                          className={`p-1 rounded text-[10px] truncate font-medium ${
                            ev.isBlocked
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-blue-600/30 text-blue-200 border border-blue-500/40'
                          }`}
                        >
                          {ev.title}
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

    </div>
  );
};
