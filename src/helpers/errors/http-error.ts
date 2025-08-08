import { ZodError } from 'zod';

type ErrorBody = {
  message?: string;
  title?: string;
  detail?: string;
  correlationId?: string;
};

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public title?: string,
    public detail?: string,
    public correlationId?: string,
    public url?: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export class NWSApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public operation: string,
    public coordinates?: string,
    public originalError?: HttpError | ZodError,
  ) {
    super(message);
    this.name = 'NWSApiError';
  }
}

export const createDetailedHttpError = (response: Response, errorBody: unknown, url: string): never => {
  // Checking if error is of type ErrorBody
  if (isErrorBody(errorBody)) {
    const typedErrorBody = errorBody;

    if (typedErrorBody.title) {
      throw new HttpError(
        response.status,
        `${typedErrorBody.title}: ${typedErrorBody.detail || ''}`,
        typedErrorBody.title,
        typedErrorBody.detail,
        typedErrorBody.correlationId,
        url,
      );
    }

    const detail = typedErrorBody.detail || typedErrorBody.message || 'Unknown error';
    throw new HttpError(response.status, `HTTP ${response.status}: ${detail}`, undefined, detail, undefined, url);
  }

  throw new HttpError(
    response.status,
    `HTTP ${response.status}: Unknown error format`,
    undefined,
    'Unknown error',
    undefined,
    url,
  );
};

const isErrorBody = (obj: unknown): obj is ErrorBody => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    (typeof (obj as ErrorBody).message === 'string' || (obj as ErrorBody).message === undefined) &&
    (typeof (obj as ErrorBody).title === 'string' || (obj as ErrorBody).title === undefined) &&
    (typeof (obj as ErrorBody).detail === 'string' || (obj as ErrorBody).detail === undefined) &&
    (typeof (obj as ErrorBody).correlationId === 'string' || (obj as ErrorBody).correlationId === undefined)
  );
};
