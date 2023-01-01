import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { LOCAL } from '../config/const';
import { getItemFromStorage, TOKEN_KEY } from '../utils/storage';
import { mapPostMonthsByYear, mapTasksByStatus } from '../utils/mappers';

dayjs.extend(utc);

const apiGetRequest = (url, config) => axios.get(url, config);
const apiPostRequest = (url, data, config) => axios.post(url, data, config);
const apiPutRequest = (url, data, config) => axios.put(url, data, config);
const apiPatchRequest = (url, data, config) => axios.patch(url, data, config);
const apiDeleteRequest = (url, config) => axios.delete(url, config);

const authConfig = () => ({
  headers: { authorization: getItemFromStorage(TOKEN_KEY) },
});

const redirectUnauth = (err) => {
  if (err.message === 'Request failed with status code 401') {
    window.location.replace('/auth/login');
  } else {
    throw err;
  }
};

const apiLocalGetRequest = (url) =>
  apiGetRequest(`${LOCAL}/${url}`, authConfig()).catch(redirectUnauth);
const apiLocalPostRequest = (url, data) =>
  apiPostRequest(`${LOCAL}/${url}`, data, authConfig()).catch(redirectUnauth);
const apiLocalPutRequest = (url, data) =>
  apiPutRequest(`${LOCAL}/${url}`, data, authConfig()).catch(redirectUnauth);
const apiLocalPatchRequest = (url, data) =>
  apiPatchRequest(`${LOCAL}/${url}`, data, authConfig()).catch(redirectUnauth);
const apiLocalDeleteRequest = (url) =>
  apiDeleteRequest(`${LOCAL}/${url}`, authConfig()).catch(redirectUnauth);

export const getTransactionsByMonthAndYear = (year, month) =>
  apiLocalGetRequest(`transaction?y=${year}&m=${month + 1}`).then(
    (resp) => resp.data?.data,
  );
export const postTransaction = (data) =>
  apiLocalPostRequest(`transaction`, data).then((resp) => resp.data);
export const putTransaction = (id, data) =>
  apiLocalPutRequest(`transaction/${id}`, data).then((resp) => resp.data);
export const deleteTransaction = (id) =>
  apiLocalDeleteRequest(`transaction/${id}`).then((resp) => resp.data);

export const getTransactionsCategories = () =>
  apiLocalGetRequest(`transaction-category`).then((resp) => resp.data?.data);
export const postTransactionsCategories = (data) =>
  apiLocalPostRequest(`transaction-category`, data).then((resp) => resp.data);
export const getTransactionsStatistics = () =>
  apiLocalGetRequest(`transaction?statistics=1`).then((resp) => resp.data);

export const getNoteCategories = () =>
  apiLocalGetRequest('note-category').then((resp) => resp.data?.data);
export const postNoteCategory = (data) =>
  apiLocalPostRequest('note-category', data).then((resp) => resp.data);
export const putNoteCategory = (id, data) =>
  apiLocalPutRequest(`note-category/${id}`, data).then((resp) => resp.data);
export const deleteNoteCategory = (id) =>
  apiLocalDeleteRequest(`note-category/${id}`).then((resp) => resp.data);

export const getNotes = (categoryId) =>
  apiLocalGetRequest(`note?note_category=${categoryId}`).then(
    (resp) => resp.data?.data,
  );
export const postNote = (data) =>
  apiLocalPostRequest('note', data).then((resp) => resp.data);
export const editNote = (id, data) =>
  apiLocalPatchRequest(`note/${id}`, data).then((resp) => resp.data);
export const deleteNote = (id) =>
  apiLocalDeleteRequest(`note/${id}`).then((resp) => resp.data);

export const getWishes = () =>
  apiLocalGetRequest('wish').then((resp) => resp.data?.data);
export const postWish = (data) =>
  apiLocalPostRequest('wish', data).then((resp) => resp.data);
export const putWish = (id, data) =>
  apiLocalPutRequest(`wish/${id}`, data).then((resp) => resp.data);
export const deleteWish = (id) =>
  apiLocalDeleteRequest(`wish/${id}`).then((resp) => resp.data);

export const getPosts = () =>
  apiLocalGetRequest(`posts?&$sort[date]=-1&$limit=25`).then(
    (resp) => resp.data,
  );
export const getPostsHistory = () =>
  apiLocalGetRequest(`posts-history`).then((resp) => resp.data);
export const deletePost = (id) =>
  apiLocalDeleteRequest(`posts/${id}`).then((resp) => resp.data);
export const editPost = (id, data) =>
  apiLocalPutRequest(`posts/${id}`, data).then((resp) => resp.data);
export const postComment = (data) => apiLocalPostRequest(`comments`, data);
export const postPost = (data) =>
  apiLocalPostRequest(`posts`, data).then((resp) => resp.data);

export const getYears = () =>
  apiLocalGetRequest(`posts-history?get=months`).then((resp) =>
    mapPostMonthsByYear(resp.data),
  );
export const getMonth = (month) =>
  apiLocalGetRequest(`posts-history?ym=${month}`).then((resp) => resp.data);
export const getYearLabels = (year = new Date().getFullYear()) =>
  apiLocalGetRequest(`posts-history?y=${year}&get=labels`).then(
    (resp) => resp.data,
  );
export const searchPosts = (q) => apiLocalGetRequest(`posts-search/?q=${q}`);

export const getLabels = () =>
  apiLocalGetRequest('labels').then((resp) => resp.data?.data);
export const postLabel = (data) =>
  apiLocalPostRequest('labels', data).then((resp) => resp.data);
export const putLabel = (id, data) =>
  apiLocalPutRequest(`labels/${id}`, data).then((resp) => resp.data);
export const deleteLabel = (id) =>
  apiLocalDeleteRequest(`labels/${id}`).then((resp) => resp.data);

export const deleteLabelFromPost = (postId, labelId) =>
  apiLocalDeleteRequest(
    `post-labels/?post_id=${postId}&label_id=${labelId}`,
  ).then((resp) => resp.data);
export const addLabelToPost = (postId, labelId) =>
  apiLocalPostRequest(`post-labels`, {
    post_id: postId,
    label_id: labelId,
  }).then((resp) => resp.data);

export const getProjects = () =>
  apiLocalGetRequest('projects').then((resp) => resp.data?.data);
export const getProject = (id) =>
  apiLocalGetRequest(`projects/${id}`).then((resp) => resp.data);
export const postProject = (data) =>
  apiLocalPostRequest('projects', data).then((resp) => resp.data);
export const putProject = (id, data) =>
  apiLocalPutRequest(`projects/${id}`, data).then((resp) => resp.data);
export const getTasks = (id) =>
  apiLocalGetRequest(`tasks?project_id=${id}`)
    .then((resp) => resp.data?.data)
    .then(mapTasksByStatus);

export const getInProgress = () =>
  apiLocalGetRequest(`tasks?status=in_progress`).then(
    (resp) => resp.data?.data,
  );
export const editTask = (id, data) =>
  apiLocalPatchRequest(`tasks/${id}`, data).then((resp) => resp.data);
export const postTask = (data) =>
  apiLocalPostRequest(`tasks`, data).then((resp) => resp.data);
export const deleteTask = (id) =>
  apiLocalDeleteRequest(`tasks/${id}`).then((resp) => resp.data);

export const getLts = () =>
  apiLocalGetRequest(`last-time`).then((resp) => resp.data?.data);
export const getExpiredLts = () =>
  apiLocalGetRequest(`last-time?expired=1`).then((resp) => resp.data?.data);
export const postLT = (data) =>
  apiLocalPostRequest(`last-time`, data).then((resp) => resp.data);
export const putLT = (id, data) =>
  apiLocalPutRequest(`last-time/${id}`, data).then((resp) => resp.data);
export const deleteLT = (id) =>
  apiLocalDeleteRequest(`last-time/${id}`).then((resp) => resp.data);

export const sendLogin = (data) =>
  apiPostRequest(`${LOCAL}/authentication`, { ...data, strategy: 'local' });
export const sendRegistration = (data) =>
  apiPostRequest(`${LOCAL}/register`, data);

export const getPeriods = () =>
  apiLocalGetRequest(`periods?$limit=200`).then((resp) => resp.data?.data);
export const postPeriod = (data) =>
  apiLocalPostRequest(`periods`, data).then((resp) => resp.data);
export const deletePeriod = (id) =>
  apiLocalDeleteRequest(`periods/${id}`).then((resp) => resp.data);
export const putPeriod = (id, data) =>
  apiLocalPutRequest(`periods/${id}`, data).then((resp) => resp.data);

export const getUser = () =>
  apiLocalGetRequest(`users/me`).then((resp) => resp.data);
export const editUser = (data) =>
  apiLocalPatchRequest(`users/me`, data).then((resp) => resp.data);
