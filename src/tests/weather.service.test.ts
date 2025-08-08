import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getForecastByGeolocation } from '../services/weather.service';
import * as httpHelper from '../helpers/http-helper';
import { ZodError } from 'zod';
import { HttpError } from '../helpers/errors/http-error';

vi.mock('../helpers/http-helper');
vi.mock('../helpers/logger');

const mockHttpGetValidated = vi.mocked(httpHelper.httpGetValidated);

describe('weather.service', () => {
  describe('getForecastByGeolocation', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
    it('should return weather forecast for valid USA coordinates', async () => {
      // NYC coordinates
      const lat = 40.7128;
      const lng = -74.006;

      const mockPointsResponse = {
        properties: {
          forecast: 'https://api.weather.gov/gridpoints/OKX/32,34/forecast',
          relativeLocation: {
            properties: {
              city: 'New York',
              state: 'NY',
            },
          },
        },
      };

      // Mock forecast endpoint response
      const mockForecastResponse = {
        properties: {
          periods: [
            {
              temperature: 72,
              temperatureUnit: 'F',
              shortForecast: 'Partly cloudy',
              startTime: '2024-01-15T10:00:00-05:00',
            },
          ],
        },
      };

      // Setup mocks
      mockHttpGetValidated.mockResolvedValueOnce(mockPointsResponse).mockResolvedValueOnce(mockForecastResponse);

      // Execute
      const result = await getForecastByGeolocation(lat, lng);

      // Assert
      expect(result).toEqual({
        feel: 'moderate',
        forecast: 'Partly cloudy',
        location: 'New York, NY',
        date: '2024-01-15',
      });

      // Verify API calls
      expect(mockHttpGetValidated).toHaveBeenCalledTimes(2);
      expect(mockHttpGetValidated).toHaveBeenNthCalledWith(
        1,
        '//points/40.7128,-74.006',
        expect.any(Object),
        'Test Weather API Client/1.0',
      );
      expect(mockHttpGetValidated).toHaveBeenNthCalledWith(
        2,
        'https://api.weather.gov/gridpoints/OKX/32,34/forecast',
        expect.any(Object),
        'Test Weather API Client/1.0',
      );
    });

    it('should throw error when points API returns no forecast URL', async () => {
      const lat = 40.7128;
      const lng = -74.006;

      // Mock points response with missing forecast URL
      const mockPointsResponse = {
        properties: {
          forecast: null,
          relativeLocation: {
            properties: {
              city: 'New York',
              state: 'NY',
            },
          },
        },
      };

      mockHttpGetValidated.mockResolvedValueOnce(mockPointsResponse);

      await expect(getForecastByGeolocation(lat, lng)).rejects.toThrow(
        'No forecast URL available for coordinates 40.7128,-74.006',
      );

      expect(mockHttpGetValidated).toHaveBeenCalledTimes(1);
    });

    it('should handle ZodError from malformed API response', async () => {
      const lat = 40.7128;
      const lng = -74.006;

      // Mock ZodError being thrown during schema validation
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['properties', 'forecast'],
          message: 'Expected string, received number',
        } as any,
      ]);

      mockHttpGetValidated.mockRejectedValueOnce(zodError);

      await expect(getForecastByGeolocation(lat, lng)).rejects.toThrow(
        'Weather service returned invalid data format for coordinates 40.7128,-74.006',
      );

      expect(mockHttpGetValidated).toHaveBeenCalledTimes(1);
    });

    it('should handle HttpError from network/API failures', async () => {
      const lat = 40.7128;
      const lng = -74.006;

      // Mock HttpError being thrown during HTTP request
      const httpError = new HttpError(503, 'Service Unavailable');

      mockHttpGetValidated.mockRejectedValueOnce(httpError);

      await expect(getForecastByGeolocation(lat, lng)).rejects.toThrow(
        'Failed to get weather forecast for coordinates 40.7128,-74.006',
      );

      expect(mockHttpGetValidated).toHaveBeenCalledTimes(1);
    });

    it('should handle empty periods array from forecast API', async () => {
      const lat = 40.7128;
      const lng = -74.006;

      const mockPointsResponse = {
        properties: {
          forecast: 'https://api.weather.gov/gridpoints/OKX/32,34/forecast',
          relativeLocation: {
            properties: {
              city: 'New York',
              state: 'NY',
            },
          },
        },
      };

      // Mock forecast response with empty periods array
      const mockForecastResponse = {
        properties: {
          periods: [], // Empty array
        },
      };

      mockHttpGetValidated.mockResolvedValueOnce(mockPointsResponse).mockResolvedValueOnce(mockForecastResponse);

      // This should throw because periods[0] will be undefined
      await expect(getForecastByGeolocation(lat, lng)).rejects.toThrow();

      expect(mockHttpGetValidated).toHaveBeenCalledTimes(2);
    });

    it('should handle missing location data from points API', async () => {
      const lat = 40.7128;
      const lng = -74.006;

      const mockPointsResponse = {
        properties: {
          forecast: 'https://api.weather.gov/gridpoints/OKX/32,34/forecast',
          relativeLocation: null, // Missing location data
        },
      };

      const mockForecastResponse = {
        properties: {
          periods: [
            {
              temperature: 72,
              temperatureUnit: 'F',
              shortForecast: 'Partly cloudy',
              startTime: '2024-01-15T10:00:00-05:00',
            },
          ],
        },
      };

      mockHttpGetValidated.mockResolvedValueOnce(mockPointsResponse).mockResolvedValueOnce(mockForecastResponse);

      const result = await getForecastByGeolocation(lat, lng);

      // Should handle gracefully with undefined location
      expect(result).toEqual({
        feel: 'moderate',
        forecast: 'Partly cloudy',
        location: 'undefined, undefined',
        date: '2024-01-15',
      });

      expect(mockHttpGetValidated).toHaveBeenCalledTimes(2);
    });
  });
});
