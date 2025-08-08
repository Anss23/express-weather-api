import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkServiceHealth } from '../services/weather.service';
import { HttpStatus } from '../constants';
import * as httpHelper from '../helpers';

vi.mock('../helpers');
vi.mock('../helpers/logger');

const mockPing = vi.mocked(httpHelper.ping);

describe('Service Health', () => {
  describe('checkServiceHealth', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should return true when weather service is healthy (200 OK)', async () => {
      // Mock ping returning OK status
      mockPing.mockResolvedValueOnce(HttpStatus.OK);

      const result = await checkServiceHealth();

      expect(result).toBe(true);
      expect(mockPing).toHaveBeenCalledTimes(1);
      expect(mockPing).toHaveBeenCalledWith('');
    });

    it('should return false when weather service is unhealthy (non-200 status)', async () => {
      // Mock ping returning 503 Service Unavailable
      mockPing.mockResolvedValueOnce(HttpStatus.SERVICE_UNAVAILABLE);

      const result = await checkServiceHealth();

      expect(result).toBe(false);
      expect(mockPing).toHaveBeenCalledTimes(1);
      expect(mockPing).toHaveBeenCalledWith('');
    });

    it('should return false when weather service returns 404 Not Found', async () => {
      // Mock ping returning 404 Not Found
      mockPing.mockResolvedValueOnce(HttpStatus.NOT_FOUND);

      const result = await checkServiceHealth();

      expect(result).toBe(false);
      expect(mockPing).toHaveBeenCalledTimes(1);
    });

    it('should return false when weather service returns 500 Internal Server Error', async () => {
      // Mock ping returning 500 Internal Server Error
      mockPing.mockResolvedValueOnce(HttpStatus.INTERNAL_SERVER_ERROR);

      const result = await checkServiceHealth();

      expect(result).toBe(false);
      expect(mockPing).toHaveBeenCalledTimes(1);
    });

    it('should handle ping rejections/errors', async () => {
      // Mock ping throwing an error
      mockPing.mockRejectedValueOnce(new Error('Network error'));

      await expect(checkServiceHealth()).rejects.toThrow('Network error');
      expect(mockPing).toHaveBeenCalledTimes(1);
    });
  });
});
