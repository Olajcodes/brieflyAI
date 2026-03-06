export type LengthPreset = 'short' | 'medium' | 'long';
export type OutputFormat = 'paragraph' | 'bullet_points' | 'both';

export interface SummarizeRequest {
  text: string;
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
  source?: {
    type: 'url' | 'file';
    url?: string;
    filename?: string;
    extraction_quality?: 'good' | 'low' | 'failed';
  };
}