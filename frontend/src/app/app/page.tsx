'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { SummaryResponse } from '@/lib/types';
import SummaryForm from '@/components/SummaryForm';
import SummaryDisplay from '@/components/SummaryDisplay';
import MetricsDisplay from '@/components/MetricsDisplay';

export default function AppPage() {
  const [result, setResult] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async (formData: any) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let res: SummaryResponse;
      if (formData.type === 'text') {
        res = await api.summarizeText({
          text: formData.text,
          length_preset: formData.preset,
          output_format: formData.format,
          target_word_count: formData.target_word_count,
        });
      } else if (formData.type === 'url') {
        res = await api.summarizeUrl({
          url: formData.url,
          length_preset: formData.preset,
          output_format: formData.format,
          target_word_count: formData.target_word_count,
        });
      } else {
        const fd = new FormData();
        fd.append('file', formData.file);
        fd.append('length_preset', formData.preset);
        fd.append('output_format', formData.format);
        if (formData.target_word_count) {
          fd.append('target_word_count', formData.target_word_count.toString());
        }
        res = await api.summarizeFile(fd);
      }
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Summarization failed. Check your backend connection and OpenAI API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const content = `
Briefly AI Summary
Request ID: ${result.request_id}
--------------------------------------------------
${result.summary_paragraph ? `SUMMARY:\n${result.summary_paragraph}\n` : ''}
${result.summary_bullets.length > 0 ? `\nBULLETS:\n- ${result.summary_bullets.join('\n- ')}` : ''}

KEY TAKEAWAYS:
- ${result.key_takeaways.join('\n- ')}

METRICS:
Compression: ${(result.metrics.compression_ratio * 100).toFixed(0)}%
Time Saved: ${result.metrics.estimated_minutes_saved} minutes
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary-${result.request_id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0]" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* Top bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 h-14 border-b border-[#e0ddd6] bg-[#f7f5f0]/90 backdrop-blur-md">
        <Link
          href="/"
          className="font-serif italic text-xl tracking-tight text-[#0d0d0d] hover:opacity-70 transition-opacity"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          Briefly.
        </Link>
        <div className="flex items-center gap-2 text-xs text-[#888] font-mono uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
          GPT-4o
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-8">

        {/* Page heading */}
        <div className="text-center space-y-1.5 pt-2">
          <h1
            className="text-4xl font-bold italic tracking-tight text-[#0d0d0d]"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            Summarize anything.
          </h1>
          <p className="text-sm text-[#888]">
            Grounded output — only facts from your source, never invented.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-[#e0ddd6] shadow-sm overflow-hidden">
          <SummaryForm loading={loading} onSummarize={handleSummarize} />
        </div>

        {/* Error */}
        {error && (
          <div className="flex gap-3 items-start p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm animate-in fade-in">
            <span className="text-base leading-none mt-0.5">⚠️</span>
            <div>
              <span className="font-semibold">Error: </span>{error}
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-20 bg-[#f0ede8] rounded-2xl" />
            <div className="h-56 bg-[#f0ede8] rounded-2xl" />
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-5 pb-16 animate-fade-in-up">
            <MetricsDisplay metrics={result.metrics} />
            <SummaryDisplay data={result} onDownload={handleDownload} />

            {/* Model info footer */}
            <p className="text-center text-[10px] font-mono uppercase tracking-widest text-[#bbb]">
              Summarized by {result.model_info.provider} · {result.model_info.model} · ID: {result.request_id.slice(0, 8)}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}