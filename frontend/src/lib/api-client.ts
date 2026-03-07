import { SummarizeRequest, SummarizeUrlRequest, SummaryResponse, TranscribeResponse } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

if (!BASE_URL) {
  console.warn('Warning: NEXT_PUBLIC_BACKEND_URL is not defined. Defaulting to relative paths.');
}

export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.detail || 'Request failed');
    (error as any).status = response.status;
    throw error;
  }
  return response.json();
}

export const api = {
  summarizeText: (data: SummarizeRequest): Promise<SummaryResponse> =>
    fetch(`${BASE_URL}/v1/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleApiResponse<SummaryResponse>),

  summarizeUrl: (data: SummarizeUrlRequest): Promise<SummaryResponse> =>
    fetch(`${BASE_URL}/v1/summarize-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleApiResponse<SummaryResponse>),

  summarizeFile: (formData: FormData): Promise<SummaryResponse> =>
    fetch(`${BASE_URL}/v1/summarize-file`, {
      method: 'POST',
      body: formData,
    }).then(handleApiResponse<SummaryResponse>),

  // Stage 1: transcribe only — returns transcript for user review
  transcribeAudio: (formData: FormData): Promise<TranscribeResponse> =>
    fetch(`${BASE_URL}/v1/transcribe-audio`, {
      method: 'POST',
      body: formData,
    }).then(handleApiResponse<TranscribeResponse>),

  // Combined: transcribe + summarize in one shot
  summarizeAudio: (formData: FormData): Promise<SummaryResponse> =>
    fetch(`${BASE_URL}/v1/summarize-audio`, {
      method: 'POST',
      body: formData,
    }).then(handleApiResponse<SummaryResponse>),
};