import { SummaryResponse } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface Props {
  data: SummaryResponse;
  onDownload: () => void;
}

export default function SummaryDisplay({ data, onDownload }: Props) {
  const copyToClipboard = () => {
    const text = data.summary_paragraph || data.summary_bullets.join('\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <Card className="p-8 space-y-8 animate-fade-in-up">
      {/* Header with Grounded Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-slate-900">Summary</h2>
          <Badge variant="success">Grounded</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copyToClipboard} className="px-3 py-1.5 text-xs">Copy</Button>
          <Button variant="outline" onClick={onDownload} className="px-3 py-1.5 text-xs">Download .txt</Button>
        </div>
      </div>

      {/* Main Content */}
      <article className="prose prose-slate max-w-none">
        {data.summary_paragraph && (
          <p className="text-lg leading-relaxed text-slate-700 font-medium">{data.summary_paragraph}</p>
        )}
        
        {data.summary_bullets.length > 0 && (
          <ul className="mt-6 space-y-3">
            {data.summary_bullets.map((bullet, i) => (
              <li key={i} className="text-slate-600 leading-snug">{bullet}</li>
            ))}
          </ul>
        )}
      </article>

      {/* Takeaways Section */}
      <div className="pt-8 border-t border-slate-100">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Key Takeaways</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.key_takeaways.map((point, i) => (
            <div key={i} className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm text-slate-700 leading-relaxed italic">
              "{point}"
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}