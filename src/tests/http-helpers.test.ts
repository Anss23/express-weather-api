import { describe, it, expect, vi, beforeEach } from 'vitest';
import { httpGetValidated, ping } from '../helpers/http-helper';
import { z } from 'zod';

// Mock fetch globally
global.fetch = vi.fn();

describe('HTTP Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  describe('ping', () => {
    it('should return status code when request succeeds', async () => {
      const mockResponse = { status: 200 };
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any);

      const result = await ping('https://api.example.com');

      expect(result).toBe(200);
      expect(fetch).toHaveBeenCalledWith('https://api.example.com');
    });

    it('should return status code for non-200 responses', async () => {
      const mockResponse = { status: 404 };
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any);

      const result = await ping('https://api.example.com');

      expect(result).toBe(404);
      expect(fetch).toHaveBeenCalledWith('https://api.example.com');
    });

    it('should return 500 when response status is not a number', async () => {
      const mockResponse = { status: 'invalid' };
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any);

      const result = await ping('https://api.example.com');

      expect(result).toBe(500);
    });

    it('should return 0 when fetch throws an error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await ping('https://api.example.com');

      expect(result).toBe(0);
    });
  });

  describe('httpGetValidated', () => {
    const testSchema = z.object({
      id: z.number(),
      name: z.string(),
      active: z.boolean(),
    });

    it('should return parsed data when request and validation succeed', async () => {
      const mockData = { id: 1, name: 'Test', active: true };
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockData),
      };
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any);

      const result = await httpGetValidated('https://api.example.com', testSchema, 'Test-Agent');

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('https://api.example.com', {
        headers: { 'User-Agent': 'Test-Agent' },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        signal: expect.any(AbortSignal),
      });
    });

    it('should throw ZodError when response data fails schema validation', async () => {
      const invalidData = { id: 'invalid', name: 123, active: 'not-boolean' };
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValueOnce(invalidData),
      };
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any);

      await expect(httpGetValidated('https://api.example.com', testSchema, 'Test-Agent')).rejects.toThrow();
    });

    it('should throw HttpError when response is not ok', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        json: vi.fn().mockResolvedValueOnce({ error: 'Not found' }),
      };
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any);

      await expect(httpGetValidated('https://api.example.com', testSchema, 'Test-Agent')).rejects.toThrow();
    });

    it('should handle malformed JSON in error response', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: vi.fn().mockRejectedValueOnce(new Error('Invalid JSON')),
      };
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any);

      await expect(httpGetValidated('https://api.example.com', testSchema, 'Test-Agent')).rejects.toThrow(
        'HTTP Error: 500',
      );
    });

    it('should handle request timeout', async () => {
      // Simulate actual AbortController abort
      const abortError = new DOMException('The operation was aborted', 'AbortError');
      vi.mocked(fetch).mockRejectedValueOnce(abortError);

      await expect(httpGetValidated('https://api.example.com', testSchema, 'Test-Agent')).rejects.toThrow(
        'Request timeout',
      );
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network failure');
      vi.mocked(fetch).mockRejectedValueOnce(networkError);

      await expect(httpGetValidated('https://api.example.com', testSchema, 'Test-Agent')).rejects.toThrow(
        'Network failure',
      );
    });

    it('should make request without headers when header is empty', async () => {
      const mockData = { id: 1, name: 'Test', active: true };
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockData),
      };
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any);

      await httpGetValidated('https://api.example.com', testSchema, '');

      expect(fetch).toHaveBeenCalledWith('https://api.example.com', {
        headers: undefined,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        signal: expect.any(AbortSignal),
      });
    });
  });
});
