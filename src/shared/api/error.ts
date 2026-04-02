import { AxiosError, isAxiosError } from 'axios';

const toReadableDetails = (value: unknown): string => {
  if (!value) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => toReadableDetails(item))
      .filter(Boolean)
      .join('; ');
  }
  if (typeof value === 'object') {
    const detailsObj = value as Record<string, unknown>;
    if (typeof detailsObj.message === 'string') {
      return detailsObj.message;
    }
    return Object.entries(detailsObj)
      .map(([key, item]) => `${key}: ${toReadableDetails(item)}`)
      .filter((item) => item && !item.endsWith(': '))
      .join(', ');
  }

  return String(value);
};

const getMessageFromAxiosError = (error: AxiosError): string => {
  const payload = error.response?.data as
    | {
        message?: string;
        error?: string;
        errors?: unknown;
      }
    | undefined;

  const payloadMessage = payload?.message || payload?.error;
  const payloadDetails = toReadableDetails(payload?.errors);
  const statusCode = error.response?.status;

  if (payloadMessage && payloadMessage !== 'General error') {
    return payloadDetails
      ? `${payloadMessage} (${payloadDetails})`
      : payloadMessage;
  }

  if (payloadMessage === 'General error' && payloadDetails) {
    return `General error (${payloadDetails})`;
  }

  if (payloadDetails) {
    return payloadDetails;
  }

  if (typeof statusCode === 'number') {
    return `Request failed (${statusCode})`;
  }

  return error.message || 'Request failed';
};

export const getApiErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    return getMessageFromAxiosError(error);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
};
