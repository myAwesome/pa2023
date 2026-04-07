import { LOCAL } from '../config/const';
import { getItemFromStorage, TOKEN_KEY } from './storage';

const authHeaders = () => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  authorization: getItemFromStorage(TOKEN_KEY) || '',
});

const normalizeRanges = (ranges = []) =>
  ranges.map((r) => ({
    start: r.start,
    end: r.end,
  }));

const toDayParam = (value) => {
  if (!value) return null;

  if (typeof value === 'string') {
    const dayMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (dayMatch?.[1]) {
      return dayMatch[1];
    }
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const yyyy = parsed.getUTCFullYear();
  const mm = String(parsed.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(parsed.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const getPhotosOnDate = async (
  _authToken,
  date,
  ranges,
  nextPageToken,
) => {
  let photos = [];
  let error = null;

  try {
    const params = new URLSearchParams();
    params.set('pageSize', '24');
    if (nextPageToken) {
      params.set('pageToken', nextPageToken);
    }
    if (date) {
      const dayParam = toDayParam(date);
      if (dayParam) {
        params.set('date', dayParam);
      }
    }
    if (ranges?.length) {
      params.set('ranges', JSON.stringify(normalizeRanges(ranges)));
    }

    const response = await fetch(`${LOCAL}/media?${params.toString()}`, {
      method: 'GET',
      headers: authHeaders(),
    });
    const result = await response.json();

    if (response.ok && !result.error) {
      photos = result;
    } else {
      error = result.error || {
        code: response.status,
        message: 'Failed to get media',
      };
    }
  } catch (err) {
    error = err;
  }

  return { photos, error };
};

const toHex = (buffer) =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

export const computeFileSha256 = async (file) => {
  if (!file) return null;
  const arrayBuffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', arrayBuffer);
  return toHex(digest);
};

export const initMediaUpload = async ({
  filename,
  mimeType,
  capturedAt,
  sizeBytes,
  sha256,
}) => {
  let data = null;
  let error = null;

  try {
    const response = await fetch(`${LOCAL}/media`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        action: 'init-upload',
        filename,
        mimeType,
        capturedAt,
        sizeBytes,
        sha256,
      }),
    });
    const result = await response.json();
    if (response.ok && !result.error) {
      data = result;
    } else {
      error = result.error || {
        code: response.status,
        message: 'Failed to init upload',
      };
    }
  } catch (err) {
    error = err;
  }

  return { data, error };
};

export const completeMediaUpload = async ({
  key,
  mimeType,
  capturedAt,
  sizeBytes,
  sha256,
}) => {
  let data = null;
  let error = null;

  try {
    const response = await fetch(`${LOCAL}/media`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        action: 'complete-upload',
        key,
        mimeType,
        capturedAt,
        sizeBytes,
        sha256,
      }),
    });
    const result = await response.json();
    if (response.ok && !result.error) {
      data = result;
    } else {
      error = result.error || {
        code: response.status,
        message: 'Failed to complete upload',
      };
    }
  } catch (err) {
    error = err;
  }

  return { data, error };
};

export const failMediaUpload = async ({ key, reason }) => {
  let data = null;
  let error = null;

  try {
    const response = await fetch(`${LOCAL}/media`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        action: 'fail-upload',
        key,
        reason,
      }),
    });
    const result = await response.json();
    if (response.ok && !result.error) {
      data = result;
    } else {
      error = result.error || {
        code: response.status,
        message: 'Failed to report upload failure',
      };
    }
  } catch (err) {
    error = err;
  }

  return { data, error };
};

export const uploadFileToPresignedUrl = async ({
  uploadUrl,
  file,
  mimeType,
}) => {
  let error = null;
  try {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': mimeType || 'application/octet-stream',
      },
      body: file,
    });
    if (!response.ok) {
      error = { code: response.status, message: 'Upload failed' };
    }
  } catch (err) {
    error = err;
  }
  return { error };
};

export const deleteMediaByKey = async (key) => {
  let error = null;
  let data = null;
  try {
    const params = new URLSearchParams();
    params.set('key', key);
    const response = await fetch(`${LOCAL}/media?${params.toString()}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const result = await response.json();
    if (response.ok && !result.error) {
      data = result;
    } else {
      error = result.error || {
        code: response.status,
        message: 'Delete failed',
      };
    }
  } catch (err) {
    error = err;
  }
  return { data, error };
};

export const photosSignIn = () => Promise.resolve('');

export const photosVerifyToken = async () => true;
