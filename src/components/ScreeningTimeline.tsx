import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { TEN_STAGE_WORKFLOW, LifecycleStatus } from '../types/lst';

interface ScreeningTimelineProps {
  currentStage: number;
  status: LifecycleStatus;
  compact?: boolean;
}

export const ScreeningTimeline: React.FC<ScreeningTimelineProps> = ({
  currentStage,
  status,
  compact = false,
}) => {
  if (compact) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-medium text-[#17251D]">
            SLT Screening Stage {currentStage} of 10
          </span>
          <span className="font-mono-tabular text-[#124A32] font-semibold">
            {status}
          </span>
        </div>
        <div className="grid grid-cols-10 gap-1">
          {TEN_STAGE_WORKFLOW.map((item) => {
            const isDone = item.stage < currentStage;
            const isCurrent = item.stage === currentStage;
            return (
              <div
                key={item.stage}
                title={`${item.stage}. ${item.title}`}
                className={`h-2 rounded-sm transition-colors ${
                  status === 'Rejected' && isCurrent
                    ? 'bg-red-600'
                    : isDone
                    ? 'bg-[#82B440]'
                    : isCurrent
                    ? 'bg-[#D5AD51]'
                    : 'bg-neutral-200'
                }`}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-200">
        <div>
          <h4 className="font-serif-display text-lg font-semibold text-[#17251D]">
            10-Stage Land Screening & Registration Timeline
          </h4>
          <p className="text-xs text-neutral-600 mt-0.5">
            Human-verified site inspection, document screening, and sub-registrar coordination
          </p>
        </div>
        <div className="text-xs font-mono-tabular text-[#124A32] font-semibold">
          Current Status: {status} (Stage {currentStage}/10)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-5">
        {TEN_STAGE_WORKFLOW.map((item) => {
          const isCompleted = item.stage < currentStage || status === 'Closed';
          const isCurrent = item.stage === currentStage && status !== 'Closed';
          return (
            <div
              key={item.stage}
              className={`p-3.5 rounded-lg border transition-colors ${
                isCurrent
                  ? 'border-[#D5AD51] bg-[#D5AD51]/10'
                  : isCompleted
                  ? 'border-[#82B440]/40 bg-[#F7F9F7]'
                  : 'border-neutral-200 bg-white opacity-70'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono-tabular mb-1.5">
                <span className="font-semibold text-[#124A32]">
                  {String(item.stage).padStart(2, '0')}
                </span>
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-[#82B440]" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4 text-[#D5AD51]" />
                ) : (
                  <Circle className="w-4 h-4 text-neutral-300" />
                )}
              </div>
              <div className="text-xs font-semibold text-[#17251D] leading-snug">
                {item.title}
              </div>
              <p className="text-[11px] text-neutral-600 mt-1 leading-relaxed">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
