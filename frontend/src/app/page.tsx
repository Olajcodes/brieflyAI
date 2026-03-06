'use client';

import { useState } from 'react';
import { api } from '@/lib/api-client';
import { SummaryResponse } from '@/lib/types';
import SummaryForm from '@/components/SummaryForm';
import SummaryDisplay from '@/components/SummaryDisplay';
import MetricsDisplay from '@/components/MetricsDisplay';
import { Card } from '@/components/ui/Card';

export default function Home() {
  const [result, setResult] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async (formData: any) => {
    setLoading(true);
    setError(null);
    setResult(null); // Clear previous results while loading new ones

    try {
      let res: SummaryResponse;
      if (formData.type === 'text') {
        res = await api.summarizeText({
          text: formData.text,
          length_preset: formData.preset,
          output_format: formData.format,
          target_word_count: formData.target_word_count
        });
      } else if (formData.type === 'url') {
        res = await api.summarizeUrl({
          url: formData.url,
          length_preset: formData.preset,
          output_format: formData.format,
          target_word_count: formData.target_word_count
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
      console.error("Summarization Error:", err);
      setError(err.message || 'Summarization failed. Please check your backend connection and OpenAI API key.');
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
    <div className="min-h-screen bg-slate-25 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Hero Section */}
        <section className="text-center space-y-3">
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight italic">Briefly.</h1>
          <p className="text-slate-500 text-lg max-w-md mx-auto">
            AI-driven grounded summarization. No hallucinations, just the facts.
          </p>
        </section>

        {/* Input Card */}
        <Card className="shadow-xl shadow-slate-200/50 border-slate-200">
          <SummaryForm loading={loading} onSummarize={handleSummarize} />
        </Card>

        {/* Error Handling */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium animate-in fade-in">
            <span className="font-bold mr-2">Error:</span> {error}
          </div>
        )}

        {/* Loading State Placeholder */}
        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="h-24 bg-slate-100 rounded-xl" />
            <div className="h-64 bg-slate-100 rounded-xl" />
          </div>
        )}

        {/* Results Area - Condition: Only show if result exists and NOT loading */}
        {result && !loading && (
          <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <MetricsDisplay metrics={result.metrics} />
            <SummaryDisplay data={result} onDownload={handleDownload} />
          </div>
        )}
      </div>
    </div>
  );
}