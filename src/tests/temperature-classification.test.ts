import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getForecastByGeolocation } from '../services/weather.service';
import * as httpHelper from '../helpers/http-helper';

vi.mock('../helpers/http-helper');
vi.mock('../helpers/logger');

const mockHttpGetValidated = vi.mocked(httpHelper.httpGetValidated);

describe('Temperature Classification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockResponses = (temperature: number, unit: 'F' | 'C') => {
    const mockPointsResponse = {
      properties: {
        forecast: 'https://api.weather.gov/gridpoints/OKX/32,34/forecast',
        relativeLocation: {
          properties: {
            city: 'Test City',
            state: 'TS',
          },
        },
      },
    };

    const mockForecastResponse = {
      properties: {
        periods: [
          {
            temperature,
            temperatureUnit: unit,
            shortForecast: 'Test weather',
            startTime: '2024-01-15T10:00:00-05:00',
          },
        ],
      },
    };

    return { mockPointsResponse, mockForecastResponse };
  };

  describe('Fahrenheit temperature classification', () => {
    it('should classify 80°F as hot', async () => {
      const { mockPointsResponse, mockForecastResponse } = createMockResponses(80, 'F');

      mockHttpGetValidated.mockResolvedValueOnce(mockPointsResponse).mockResolvedValueOnce(mockForecastResponse);

      const result = await getForecastByGeolocation(40.7128, -74.006);
      expect(result.feel).toBe('hot');
    });

    it('should classify 50°F as cold', async () => {
      const { mockPointsResponse, mockForecastResponse } = createMockResponses(50, 'F');

      mockHttpGetValidated.mockResolvedValueOnce(mockPointsResponse).mockResolvedValueOnce(mockForecastResponse);

      const result = await getForecastByGeolocation(40.7128, -74.006);
      expect(result.feel).toBe('cold');
    });

    it('should classify 65°F as moderate', async () => {
      const { mockPointsResponse, mockForecastResponse } = createMockResponses(65, 'F');

      mockHttpGetValidated.mockResolvedValueOnce(mockPointsResponse).mockResolvedValueOnce(mockForecastResponse);

      const result = await getForecastByGeolocation(40.7128, -74.006);
      expect(result.feel).toBe('moderate');
    });
  });

  describe('Celsius temperature classification', () => {
    it('should classify 27°C as hot', async () => {
      const { mockPointsResponse, mockForecastResponse } = createMockResponses(27, 'C');

      mockHttpGetValidated.mockResolvedValueOnce(mockPointsResponse).mockResolvedValueOnce(mockForecastResponse);

      const result = await getForecastByGeolocation(40.7128, -74.006);
      expect(result.feel).toBe('hot');
    });

    it('should classify 10°C as cold', async () => {
      const { mockPointsResponse, mockForecastResponse } = createMockResponses(10, 'C');

      mockHttpGetValidated.mockResolvedValueOnce(mockPointsResponse).mockResolvedValueOnce(mockForecastResponse);

      const result = await getForecastByGeolocation(40.7128, -74.006);
      expect(result.feel).toBe('cold');
    });

    it('should classify 18°C as moderate', async () => {
      const { mockPointsResponse, mockForecastResponse } = createMockResponses(18, 'C');

      mockHttpGetValidated.mockResolvedValueOnce(mockPointsResponse).mockResolvedValueOnce(mockForecastResponse);

      const result = await getForecastByGeolocation(40.7128, -74.006);
      expect(result.feel).toBe('moderate');
    });
  });
});
