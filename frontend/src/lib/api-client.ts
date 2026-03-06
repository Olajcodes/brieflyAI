const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BASE_URL) {
  console.warn("Warning: NEXT_PUBLIC_BACKEND_URL is not defined. API calls will default to relative paths.");
}
export async function handleApiResponse(response: Response) {
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
    }).then(handleApiResponse),

  summarizeUrl: (data: any): Promise<SummaryResponse> =>
    fetch(`${BASE_URL}/v1/summarize-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleApiResponse),

  summarizeFile: (formData: FormData): Promise<SummaryResponse> =>
    fetch(`${BASE_URL}/v1/summarize-file`, {
      method: 'POST',
      body: formData, // Browser sets boundary automatically
    }).then(handleApiResponse),
};