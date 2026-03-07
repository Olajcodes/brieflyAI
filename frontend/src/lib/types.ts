export type LengthPreset = 'short' | 'medium' | 'long';
export type OutputFormat = 'paragraph' | 'bullet_points' | 'both';

export interface SummarizeRequest {
  text: string;
  length_preset: LengthPreset;
  target_word_count?: number;
  output_format: OutputFormat;
  language?: string;
}

export interface SummarizeUrlRequest {
  url: string;
  length_preset: LengthPreset;
  target_word_count?: number;
  output_format: OutputFormat;
  language?: string;
}

export interface SummaryResponse {
  request_id: string;
  summary_paragraph: string | null;
  summary_bullets: string[];
  key_takeaways: string[];
  metrics: {
    compression_ratio: number;
    input_stats: { word_count: number; char_count: number };
    summary_stats: { word_count: number; char_count: number };
    estimated_minutes_saved: number;
  };
  model_info: { provider: string; model: string };
  // Present on audio responses — used to populate the transcript review panel
  transcript?: string;
  source?: {
    type: 'url' | 'file' | 'audio';
    url?: string;
    title?: string | null;
    filename?: string;
    file_type?: string;
    page_count?: number | null;
    extraction_quality?: 'good' | 'low' | 'failed';
    detected_language?: string;
    duration_seconds?: number | null;
  };
}

// Returned by /v1/transcribe-audio (Stage 1 — before summarization)
export interface TranscribeResponse {
  request_id: string;
  transcript: string;
  detected_language: string;
  duration_seconds: number | null;
  word_count: number;
}