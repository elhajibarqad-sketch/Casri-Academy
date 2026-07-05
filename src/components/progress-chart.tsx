"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ProgressPoint = { label: string; progress: number };

export function ProgressChart({ data }: { data: ProgressPoint[] }) {
  if (data.length === 0) {
    return <div className="grid h-[260px] place-items-center rounded-3xl bg-slate-50 text-sm text-slate-500 dark:bg-white/5">No progress yet.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data}>
        <XAxis dataKey="label" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip />
        <Area dataKey="progress" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.18} strokeWidth={3} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
