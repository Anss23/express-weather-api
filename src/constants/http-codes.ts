export const HttpStatus = {
  OK: 200, // Ok
  SERVICE_UNAVAILABLE: 503, // Service Unavailable
  VALIDATION_FAILED: 422, // Unprocessable Entity
  TOO_MANY_REQUESTS: 429, // Rate Limiting
  INTERNAL_SERVER_ERROR: 500, // General server error
  NOT_FOUND: 404, // Resource not found
  BAD_REQUEST: 400, // Bad request
  REQUEST_TIMEOUT: 408, // Request timeout
} as const;
