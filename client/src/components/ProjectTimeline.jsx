import React from 'react';
import { CheckCircle2, Clock, PlayCircle, Eye, Award, XCircle } from 'lucide-react';

const STAGES = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed (30% Adv.)', icon: CheckCircle2 },
  { key: 'in_progress', label: 'In Progress', icon: PlayCircle },
  { key: 'review', label: 'Client Review', icon: Eye },
  { key: 'completed', label: 'Completed & Delivered', icon: Award },
];

export const ProjectTimeline = ({ currentStatus, timeline = [] }) => {
  const getStageIndex = (status) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'in_progress':
        return 2;
      case 'review':
        return 3;
      case 'completed':
        return 4;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const activeIndex = getStageIndex(currentStatus);
  const isCancelled = currentStatus === 'cancelled';

  return (
    <div className="space-y-6">
      {/* Visual Stepper */}
      {isCancelled ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300">
          <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span className="text-xs font-semibold">This project order has been marked as Cancelled.</span>
        </div>
      ) : (
        <div className="relative">
          <div className="flex items-center justify-between">
            {STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isPast = activeIndex > idx;
              const isCurrent = activeIndex === idx;

              return (
                <div key={stage.key} className="flex flex-col items-center flex-1 relative z-10">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      isPast
                        ? 'bg-emerald-500 text-white shadow-glow-sm'
                        : isCurrent
                        ? 'bg-brand-blue text-white ring-4 ring-blue-500/30 shadow-glow'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[11px] mt-2 font-medium text-center ${
                      isCurrent
                        ? 'text-brand-electric font-bold'
                        : isPast
                        ? 'text-slate-300'
                        : 'text-slate-500'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Stepper background track */}
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-800 -z-0">
            <div
              className="bg-gradient-to-r from-emerald-500 to-brand-blue h-full transition-all duration-500"
              style={{
                width: `${(activeIndex / (STAGES.length - 1)) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Audit Log Timeline */}
      {timeline && timeline.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-800">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Project Milestone Updates
          </h5>
          <div className="space-y-4">
            {timeline.slice().reverse().map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-brand-blue mt-1.5 shrink-0 shadow-glow-sm"></div>
                <div className="flex-1 bg-navy-950 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white">{item.status}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-400">{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
