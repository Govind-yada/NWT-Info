import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Clock, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

export const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/bookings/my-bookings');
        if (res.data.success) {
          setBookings(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Scheduled Project Bookings</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Confirmed kickoff dates synchronized with NWT Info Calendar & Google Calendar
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-28 rounded-2xl bg-slate-900 animate-pulse border border-slate-800"></div>
          ))}
        </div>
      ) : bookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((bk) => (
            <div key={bk._id} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-brand-electric">
                  {bk.bookingReference}
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                  bk.status === 'confirmed'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                  {bk.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{bk.serviceId?.name}</h3>
                <span className="text-xs text-slate-400">{bk.packageId?.name}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-4 h-4 text-brand-blue" />
                  <span>Scheduled Date: <strong className="text-white">{new Date(bk.scheduledDate).toDateString()}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>{bk.timeSlot}</span>
                </div>
              </div>

              {bk.notes && (
                <p className="text-xs text-slate-400 italic bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
                  "{bk.notes}"
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-navy-900/40 rounded-2xl border border-slate-800">
          <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-white">No scheduled bookings found</h4>
        </div>
      )}
    </div>
  );
};
