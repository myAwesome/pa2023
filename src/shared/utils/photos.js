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

export const getPhotosOnDate = async (_authToken, date, ranges, nextPageToken) => {
  let photos = [];
  let error = null;

  try {
    const params = new URLSearchParams();
    params.set('pageSize', '24');
    if (nextPageToken) {
      params.set('pageToken', nextPageToken);
    }
    if (date) {
      params.set('date', new Date(date).toISOString());
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
      error = result.error || { code: response.status, message: 'Failed to get media' };
    }
  } catch (err) {
    error = err;
  }

  return { photos, error };
};

export const initMediaUpload = async ({ filename, mimeType, capturedAt }) => {
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
      }),
    });
    const result = await response.json();
    if (response.ok && !result.error) {
      data = result;
    } else {
      error = result.error || { code: response.status, message: 'Failed to init upload' };
    }
  } catch (err) {
    error = err;
  }

  return { data, error };
};

export const uploadFileToPresignedUrl = async ({ uploadUrl, file, mimeType }) => {
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

export const photosSignIn = () => Promise.resolve('');

export const photosVerifyToken = async () => true;
