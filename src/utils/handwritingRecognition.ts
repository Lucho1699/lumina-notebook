import type { DrawingStroke } from '../types/notebook';

export interface HandwritingRecognitionResult {
  success: boolean;
  text: string;
  candidates: string[];
  error?: string;
}

export async function recognizeHandwritingStrokes(
  strokes: DrawingStroke[],
  language = 'es'
): Promise<HandwritingRecognitionResult> {
  const inkingStrokes = strokes.filter(
    (s) => s.tool !== 'eraser' && Array.isArray(s.points) && s.points.length > 0
  );

  if (inkingStrokes.length === 0) {
    return {
      success: false,
      text: '',
      candidates: [],
      error: 'No hay trazos de pluma o lápiz para reconocer en la hoja.',
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch('/api/handwriting/recognize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        strokes: inkingStrokes,
        language,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `Error del servidor (${response.status})`);
    }

    const data = await response.json();
    if (data.success && data.text) {
      return {
        success: true,
        text: data.text.trim(),
        candidates: Array.isArray(data.candidates) ? data.candidates : [data.text.trim()],
      };
    }

    return {
      success: false,
      text: '',
      candidates: [],
      error: data.message || 'No se pudo interpretar el texto de los trazos.',
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error
        ? err.name === 'AbortError'
          ? 'El reconocimiento tardó demasiado tiempo. Por favor verifica tu conexión.'
          : err.message
        : 'Error desconocido al conectar con el motor de reconocimiento.';

    return {
      success: false,
      text: '',
      candidates: [],
      error: errorMsg,
    };
  }
}
