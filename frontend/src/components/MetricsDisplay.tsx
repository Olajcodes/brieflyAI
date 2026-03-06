import { SummaryResponse } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export default function MetricsDisplay({ metrics }: { metrics: SummaryResponse['metrics'] }) {
  const items = [
    { label: 'Compression', value: `${(metrics.compression_ratio * 100).toFixed(0)}%` },
    { label: 'Time Saved', value: `${metrics.estimated_minutes_saved}m` },
    { label: 'Input Words', value: formatNumber(metrics.input_stats.word_count) },
    { label: 'Output Words', value: formatNumber(metrics.summary_stats.word_count) },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{item.label}</p>
          <p className="text-lg font-semibold text-slate-900">{item.value}</p>
        </div>
      ))}
    </div>
  );
}