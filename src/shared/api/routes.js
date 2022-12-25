import axios from 'axios';
import { LOCAL } from '../config/const';
import { getItemFromStorage, TOKEN_KEY } from '../utils/storage';
import { mapLabel, mapPeriod, mapPost, mapTasksByStatus } from '../utils/mappers';
import moment from 'moment/moment';

const apiGetRequest = (url, config) => axios.get(url, config);
const apiPostRequest = (url, data, config) => axios.post(url, data, config);
const apiPutRequest = (url, data, config) => axios.put(url, data, config);
const apiDeleteRequest = (url, config) => axios.delete(url, config);

const authConfig = () => ({
  headers: { authorization: getItemFromStorage(TOKEN_KEY) },
});

const redirectUnauth = (err) => {
  if (err.message === 'Request failed with status code 401') {
    window.location.replace('/signin');
  } else {
    throw err;
  }
};

const apiLocalGetRequest = (url) =>
  apiGetRequest(`${LOCAL}/api/${url}`, authConfig()).catch(redirectUnauth);
const apiLocalPostRequest = (url, data) =>
  apiPostRequest(`${LOCAL}/api/${url}`, data, authConfig()).catch(redirectUnauth);
const apiLocalPutRequest = (url, data) =>
  apiPutRequest(`${LOCAL}/api/${url}`, data, authConfig()).catch(redirectUnauth);
const apiLocalDeleteRequest = (url) =>
  apiDeleteRequest(`${LOCAL}/api/${url}`, authConfig()).catch(redirectUnauth);

export const getTransactionsByMonthAndYear = (year, month) =>
  apiLocalGetRequest(`transactions?y=${year}&m=${month}`).then((resp) => resp.data);
export const postTransactionsToMonthAndYear = (year, month, data) =>
  apiLocalPostRequest(`transactions`, data).then((resp) => resp.data);
export const putTransaction = (id, data) =>
  apiLocalPutRequest(`transactions/${id}`, data).then((resp) => resp.data);
export const deleteTransaction = (id) =>
  apiLocalDeleteRequest(`transactions/${id}`).then((resp) => resp.data);

export const getTransactionsCategories = () =>
  apiLocalGetRequest(`transaction-categories`).then((resp) => resp.data);
export const postTransactionsCategories = (data) =>
  apiLocalPostRequest(`transaction-categories`, data).then((resp) => resp.data);
export const getTransactionsStatistics = () =>
  apiLocalGetRequest(`transaction-statistics`).then((resp) => resp.data);

export const getNoteCategories = () =>
  apiLocalGetRequest('note-categories').then((resp) => resp.data);
export const postNoteCategory = (data) =>
  apiLocalPostRequest('note-categories', data).then((resp) => resp.data);
export const putNoteCategory = (id, data) =>
  apiLocalPutRequest(`note-categories/${id}`, data).then((resp) => resp.data);
export const deleteNoteCategory = (id) =>
  apiLocalDeleteRequest(`note-categories/${id}`).then((resp) => resp.data);

export const getNotes = (categoryId) =>
  apiLocalGetRequest(`notes?note_category=${categoryId}`).then((resp) => resp.data);
export const postNote = (data) => apiLocalPostRequest('notes', data).then((resp) => resp.data);
export const putNote = (id, data) =>
  apiLocalPutRequest(`notes/${id}`, data).then((resp) => resp.data);
export const deleteNote = (id) => apiLocalDeleteRequest(`notes/${id}`).then((resp) => resp.data);

export const getWishes = () => apiLocalGetRequest('wishes').then((resp) => resp.data);
export const postWish = (data) => apiLocalPostRequest('wishes', data).then((resp) => resp.data);
export const putWish = (id, data) =>
  apiLocalPutRequest(`wishes/${id}`, data).then((resp) => resp.data);
export const deleteWish = (id) => apiLocalDeleteRequest(`wishes/${id}`).then((resp) => resp.data);

export const getPosts = () =>
  apiLocalGetRequest(`posts?sort=-date`).then((resp) => resp.data.map(mapPost));
export const getPostsHistory = () =>
  apiLocalGetRequest(`posts-history`).then((resp) => resp.data.map(mapPost));
export const deletePost = (id) => apiLocalDeleteRequest(`posts/${id}`).then((resp) => resp.data);
export const editPost = (id, data) =>
  apiLocalPutRequest(`posts/${id}`, data).then((resp) => resp.data);
export const postComment = (data) => apiLocalPostRequest(`comments`, data);
export const postPost = (data) => apiLocalPostRequest(`posts`, data).then((resp) => resp.data);

export const getYears = () => apiLocalGetRequest(`posts-months/`).then((resp) => resp.data);
export const getMonth = (month) =>
  apiLocalGetRequest(`posts-by-month/?ym=${month}`).then((resp) => resp.data.map(mapPost));
export const searchPosts = (q) => apiLocalGetRequest(`posts-search/?q=${q}`);

export const getLabels = () => apiLocalGetRequest('labels').then((resp) => resp.data.map(mapLabel));
export const postLabel = (data) => apiLocalPostRequest('labels', data).then((resp) => resp.data);
export const putLabel = (id, data) =>
  apiLocalPutRequest(`labels/${id}`, data).then((resp) => resp.data);
export const deleteLabel = (id) => apiLocalDeleteRequest(`labels/${id}`).then((resp) => resp.data);

export const deleteLabelFromPost = (postId, labelId) =>
  apiLocalGetRequest(`posts-delete-label/?post_id=${postId}&label_id=${labelId}`).then(
    (resp) => resp.data,
  );
export const addLabelToPost = (postId, labelId) =>
  apiLocalGetRequest(`posts-add-label/?post_id=${postId}&label_id=${labelId}`).then(
    (resp) => resp.data,
  );

export const getProjects = () => apiLocalGetRequest('projects').then((resp) => resp.data);
export const getProject = (id) => apiLocalGetRequest(`projects/${id}`).then((resp) => resp.data);
export const postProject = (data) =>
  apiLocalPostRequest('projects', data).then((resp) => resp.data);
export const putProject = (id, data) =>
  apiLocalPutRequest(`projects/${id}`, data).then((resp) => resp.data);
export const getTasks = (id) =>
  apiLocalGetRequest(`projects/${id}/tasks`)
    .then((resp) => resp.data)
    .then(mapTasksByStatus);

export const getInProgress = () =>
  apiLocalGetRequest(`tasks-in-progress`).then((resp) => resp.data);
export const editTask = (id, data) =>
  apiLocalPutRequest(`tasks/${id}`, data).then((resp) => resp.data);
export const postTask = (data) => apiLocalPostRequest(`tasks`, data).then((resp) => resp.data);
export const deleteTask = (id) => apiLocalDeleteRequest(`tasks/${id}`).then((resp) => resp.data);

export const getLts = () => apiLocalGetRequest(`lts`).then((resp) => resp.data);
export const getExpiredLts = () => apiLocalGetRequest(`lts-expired`).then((resp) => resp.data);
export const postLT = (data) => apiLocalPostRequest(`lt`, data).then((resp) => resp.data);
export const putLT = (id, data) => apiLocalPutRequest(`lt/${id}`, data).then((resp) => resp.data);
export const deleteLT = (id) => apiLocalDeleteRequest(`lt/${id}`).then((resp) => resp.data);

export const sendLogin = (data) => apiPostRequest(`${LOCAL}/login`, data);
export const sendRegistration = (data) => apiPostRequest(`${LOCAL}/register`, data);

export const getPeriods = () =>
  apiLocalGetRequest(`periods`).then((resp) => resp.data.map(mapPeriod));
export const postPeriod = (data) => apiLocalPostRequest(`periods`, data).then((resp) => resp.data);
export const deletePeriod = (id) =>
  apiLocalDeleteRequest(`periods/${id}`).then((resp) => resp.data);
export const putPeriod = (id, values) => {
  const data = {
    End: values.isendInProgress ? null : moment.utc(values.end).format(),
    Start: moment.utc(values.start).format(),
    Name: values.name,
  };
  return apiLocalPutRequest(`periods/${id}`, data).then((resp) => resp.data);
};

export const getUser = () => apiLocalGetRequest(`user`);
export const putUser = (data) => apiLocalPutRequest(`user`, data);
