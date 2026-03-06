'use client';
import { useState } from 'react';
import { LengthPreset, OutputFormat } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface SummaryFormProps {
  loading: boolean;
  onSummarize: (data: any) => void;
}

export default function SummaryForm({ loading, onSummarize }: SummaryFormProps) {
  const [tab, setTab] = useState<'text' | 'url' | 'file'>('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<LengthPreset>('medium');
  const [format, setFormat] = useState<OutputFormat>('both');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'text') onSummarize({ type: 'text', text, preset, format });
    else if (tab === 'url') onSummarize({ type: 'url', url, preset, format });
    else onSummarize({ type: 'file', file, preset, format });
  };

  const isInvalid = (tab === 'text' && !text) || (tab === 'url' && !url) || (tab === 'file' && !file);

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Tab Switcher */}
      <div className="flex p-1 bg-slate-100 rounded-xl">
        {(['text', 'url', 'file'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2.5 text-sm font-bold rounded-lg transition-all",
              tab === t ? "bg-white shadow-sm text-brand-600" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="min-h-[180px]">
        {tab === 'text' && (
          <textarea
            className="w-full h-44 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none transition-all placeholder:text-slate-400"
            placeholder="Paste article text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        )}
        {tab === 'url' && (
          <input
            type="url"
            className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            placeholder="https://example.com/news-article"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        )}
        {tab === 'file' && (
          <label className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
            <input type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <span className="text-brand-600 font-bold">{file ? file.name : "Choose Document"}</span>
            <span className="text-xs text-slate-400 mt-1">PDF, DOCX, or TXT</span>
          </label>
        )}
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Length</label>
          <select value={preset} onChange={(e) => setPreset(e.target.value as LengthPreset)} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white outline-none">
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value as OutputFormat)} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white outline-none">
            <option value="paragraph">Paragraph</option>
            <option value="bullet_points">Bullets</option>
            <option value="both">Both</option>
          </select>
        </div>
      </div>

      <Button type="submit" isLoading={loading} disabled={isInvalid} className="w-full py-4 text-lg">
        Summarize Content
      </Button>
    </form>
  );
}