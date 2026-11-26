"use client";

type LimitProps = {
  label: string;
  used: string;
  total: string;
  percent: number;
};

export default function Limit({ label, used, total, percent }: LimitProps) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-[#929b96]">{used} / {total}</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-[#edf0ee]">
        <div className="h-2 rounded-full bg-[#277d62]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
