'use client';

import { useState, useRef, useEffect } from 'react';
import { LengthPreset, OutputFormat, TranscribeResponse } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api-client';

type Tab = 'text' | 'url' | 'file' | 'audio';
type AudioStage = 'upload' | 'transcribing' | 'review' | 'summarizing';

interface SummaryFormProps {
  loading: boolean;
  onSummarize: (data: any) => void;
}

const TAB_LABELS: Record<Tab, string> = {
  text: 'Text',
  url: 'URL',
  file: 'File',
  audio: '🎙 Audio',
};

const LANGUAGES = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'en',   label: 'English' },
  { value: 'fr',   label: 'French' },
  { value: 'es',   label: 'Spanish' },
  { value: 'de',   label: 'German' },
  { value: 'pt',   label: 'Portuguese' },
  { value: 'it',   label: 'Italian' },
  { value: 'nl',   label: 'Dutch' },
  { value: 'ar',   label: 'Arabic' },
  { value: 'zh',   label: 'Chinese' },
  { value: 'ja',   label: 'Japanese' },
  { value: 'ko',   label: 'Korean' },
  { value: 'hi',   label: 'Hindi' },
  { value: 'yo',   label: 'Yoruba' },
  { value: 'ha',   label: 'Hausa' },
  { value: 'ig',   label: 'Igbo' },
];

export default function SummaryForm({ loading, onSummarize }: SummaryFormProps) {
  // ── Shared state ──
  const [tab, setTab] = useState<Tab>('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<LengthPreset>('medium');
  const [format, setFormat] = useState<OutputFormat>('both');
  const [language, setLanguage] = useState('auto');

  // ── Audio state ──
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioStage, setAudioStage] = useState<AudioStage>('upload');
  const [transcription, setTranscription] = useState<TranscribeResponse | null>(null);
  const [editedTranscript, setEditedTranscript] = useState('');
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // ── Mic recording state ──
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset audio state when switching away from audio tab
  useEffect(() => {
    if (tab !== 'audio') {
      setAudioStage('upload');
      setTranscription(null);
      setEditedTranscript('');
      setAudioError(null);
      stopRecording();
    }
  }, [tab]);

  // Fix: reset audioStage back to 'review' once the parent signals loading is done.
  // Without this, the button stays stuck on "Summarizing..." even after results appear.
  useEffect(() => {
    if (!loading && audioStage === 'summarizing') {
      setAudioStage('review');
    }
  }, [loading]);

  // ── Recording helpers ──
  const startRecording = async () => {
    setAudioError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const ext = mimeType.includes('webm') ? 'webm' : 'mp4';
        const recorded = new File([blob], `recording.${ext}`, { type: mimeType });
        setAudioFile(recorded);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    } catch {
      setAudioError('Microphone access denied. Please allow mic permissions and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatDuration = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // ── Stage 1: Transcribe ──
  const handleTranscribe = async () => {
    if (!audioFile) return;
    setAudioError(null);
    setAudioStage('transcribing');
    try {
      const fd = new FormData();
      fd.append('file', audioFile);
      const result = await api.transcribeAudio(fd);
      setTranscription(result);
      setEditedTranscript(result.transcript);
      setAudioStage('review');
    } catch (err: any) {
      setAudioError(err.message || 'Transcription failed.');
      setAudioStage('upload');
    }
  };

  // ── Stage 2: Summarize transcript (via existing /v1/summarize) ──
  const handleSummarizeTranscript = () => {
    setAudioStage('summarizing');
    onSummarize({
      type: 'text',
      text: editedTranscript,
      preset,
      format,
      language,
      _isAudio: true,
    });
  };

  const handleResummarize = () => {
    setTranscriptOpen(false);
    handleSummarizeTranscript();
  };

  // ── Standard form submit ──
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'text') onSummarize({ type: 'text', text, preset, format, language });
    else if (tab === 'url') onSummarize({ type: 'url', url, preset, format, language });
    else if (tab === 'file') onSummarize({ type: 'file', file, preset, format, language });
  };

  const isStandardInvalid =
    (tab === 'text' && !text.trim()) ||
    (tab === 'url' && !url.trim()) ||
    (tab === 'file' && !file);

  return (
    <div className="p-6 space-y-6">

      {/* ── Tab Switcher ── */}
      <div className="flex p-1 bg-slate-100 rounded-xl">
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2.5 text-sm font-bold rounded-lg transition-all',
              tab === t
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* ── Standard input tabs ── */}
      {tab !== 'audio' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="min-h-[180px]">
            {tab === 'text' && (
              <textarea
                className="w-full h-44 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all placeholder:text-slate-400 text-sm"
                placeholder="Paste article text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            )}
            {tab === 'url' && (
              <input
                type="url"
                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="https://example.com/news-article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            )}
            {tab === 'file' && (
              <label className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <span className="text-blue-600 font-bold text-sm">
                  {file ? file.name : 'Choose Document'}
                </span>
                <span className="text-xs text-slate-400 mt-1">PDF, DOCX, or TXT</span>
              </label>
            )}
          </div>

          <SettingsGrid
            preset={preset} format={format} language={language}
            setPreset={setPreset} setFormat={setFormat} setLanguage={setLanguage}
          />

          <Button type="submit" isLoading={loading} disabled={isStandardInvalid} className="w-full py-4 text-base">
            Summarize Content
          </Button>
        </form>
      )}

      {/* ── Audio Tab ── */}
      {tab === 'audio' && (
        <div className="space-y-6">

          {/* Stage: upload / record */}
          {(audioStage === 'upload' || audioStage === 'transcribing') && (
            <div className="space-y-4">

              {/* File upload zone */}
              <label className={cn(
                'flex flex-col items-center justify-center h-36 border-2 border-dashed rounded-xl transition-colors cursor-pointer',
                audioFile ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
              )}>
                <input
                  type="file"
                  className="hidden"
                  accept="audio/mpeg,audio/wav,audio/mp4,audio/webm,audio/m4a,audio/ogg,audio/flac,.mp3,.wav,.m4a,.webm,.ogg,.flac"
                  onChange={(e) => {
                    setAudioFile(e.target.files?.[0] || null);
                    setAudioError(null);
                  }}
                />
                <span className="text-2xl mb-1">🎵</span>
                <span className={cn('font-bold text-sm', audioFile ? 'text-blue-600' : 'text-slate-500')}>
                  {audioFile ? audioFile.name : 'Upload audio file'}
                </span>
                <span className="text-xs text-slate-400 mt-0.5">
                  MP3, WAV, M4A, WEBM, OGG, FLAC · max 25MB
                </span>
              </label>

              {/* Divider */}
              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono uppercase tracking-widest">
                <div className="flex-1 h-px bg-slate-200" />
                or record
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Mic recorder */}
              <div className="flex items-center justify-center gap-4">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                    Start Recording
                  </button>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
                      <span className="font-mono text-sm text-red-700 font-bold">
                        {formatDuration(recordingSeconds)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors"
                    >
                      Stop
                    </button>
                  </div>
                )}
              </div>

              {audioError && (
                <p className="text-xs text-red-600 text-center font-medium">{audioError}</p>
              )}

              <SettingsGrid
                preset={preset} format={format} language={language}
                setPreset={setPreset} setFormat={setFormat} setLanguage={setLanguage}
              />

              <Button
                type="button"
                isLoading={audioStage === 'transcribing'}
                disabled={!audioFile || audioStage === 'transcribing'}
                onClick={handleTranscribe}
                className="w-full py-4 text-base"
              >
                {audioStage === 'transcribing' ? 'Transcribing...' : 'Transcribe Audio'}
              </Button>
            </div>
          )}

          {/* Stage: review + summarize */}
          {(audioStage === 'review' || audioStage === 'summarizing') && transcription && (
            <div className="space-y-4">

              {/* Audio metadata */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                  ✓ Transcribed
                </span>
                {transcription.duration_seconds && (
                  <span className="text-xs text-slate-400 font-mono">
                    {formatDuration(Math.round(transcription.duration_seconds))} · {transcription.word_count.toLocaleString()} words · {transcription.detected_language}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => { setAudioStage('upload'); setAudioFile(null); setTranscription(null); }}
                  className="ml-auto text-xs text-slate-400 hover:text-slate-600 underline"
                >
                  Use different file
                </button>
              </div>

              {/* Collapsible transcript panel */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setTranscriptOpen(o => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-semibold text-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <span>📄</span> Transcript
                    <span className="text-xs font-normal text-slate-400">(click to review or edit)</span>
                  </span>
                  <span className="text-slate-400 text-xs">{transcriptOpen ? '▲ Hide' : '▼ Show'}</span>
                </button>

                {transcriptOpen && (
                  <div className="p-4 space-y-3 border-t border-slate-200 bg-white">
                    <textarea
                      className="w-full h-48 p-3 text-sm text-slate-700 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                      value={editedTranscript}
                      onChange={(e) => setEditedTranscript(e.target.value)}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        {editedTranscript !== transcription.transcript
                          ? '✏️ Edited — re-summarize to apply changes'
                          : 'Edit transcript above to improve accuracy'}
                      </span>
                      {editedTranscript !== transcription.transcript && (
                        <button
                          type="button"
                          onClick={handleResummarize}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 underline"
                        >
                          Re-summarize with edits →
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <SettingsGrid
                preset={preset} format={format} language={language}
                setPreset={setPreset} setFormat={setFormat} setLanguage={setLanguage}
              />

              <Button
                type="button"
                isLoading={loading || audioStage === 'summarizing'}
                disabled={!editedTranscript.trim() || loading}
                onClick={handleSummarizeTranscript}
                className="w-full py-4 text-base"
              >
                Summarize Transcript
              </Button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

// ── Shared settings grid ─────────────────────────────────────────
interface SettingsGridProps {
  preset: LengthPreset;
  format: OutputFormat;
  language: string;
  setPreset: (v: LengthPreset) => void;
  setFormat: (v: OutputFormat) => void;
  setLanguage: (v: string) => void;
}

function SettingsGrid({ preset, format, language, setPreset, setFormat, setLanguage }: SettingsGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-5">
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Length</label>
        <select
          value={preset}
          onChange={(e) => setPreset(e.target.value as LengthPreset)}
          className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white outline-none"
        >
          <option value="short">Short</option>
          <option value="medium">Medium</option>
          <option value="long">Long</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Format</label>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as OutputFormat)}
          className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white outline-none"
        >
          <option value="paragraph">Paragraph</option>
          <option value="bullet_points">Bullets</option>
          <option value="both">Both</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Output Language
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white outline-none"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}