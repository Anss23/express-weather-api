import { z } from 'zod';
import { createDetailedHttpError, HttpError } from '../helpers/errors/http-error';
import { HttpStatus } from '../constants';

/**
 * Sends http GET request. Has built in checks for various error types and also a mechanism to cancel
 * the request after timeout limit exceeds
 * @param url
 * @param header
 * @param timeoutMs
 * @returns unknown
 */
async function httpGet(url: string, header: string | null = null, timeoutMs: number = 10000): Promise<unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: header
        ? {
            'User-Agent': header,
          }
        : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      try {
        const errorBody: unknown = await response.json();
        createDetailedHttpError(response, errorBody, url);
      } catch {
        throw new HttpError(response.status, `HTTP Error: ${response.status}`, undefined, undefined, undefined, url);
      }
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new HttpError(
        HttpStatus.REQUEST_TIMEOUT,
        'Request timeout',
        'Request Timeout',
        `Request to ${url} timed out after ${timeoutMs}ms`,
        undefined,
        url,
      );
    }

    throw error;
  }
}

/**
 * Fetches data via GET and type checks it
 * @param url
 * @param schema
 * @param header
 * @returns T
 */
export async function httpGetValidated<T>(url: string, schema: z.ZodType<T>, header: string): Promise<T> {
  const rawData = await httpGet(url, header);
  return schema.parse(rawData);
}

/**
 * Just a harmless ping helper
 * @param url
 * @returns number
 */
export async function ping(url: string): Promise<number> {
  try {
    const response = await fetch(url);
    return typeof response.status === 'number' ? response.status : 500;
  } catch {
    return 0; // Ping failed
  }
}
