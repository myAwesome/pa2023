import axios, { AxiosRequestConfig } from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { LOCAL } from '../config/const';
import { getItemFromStorage, TOKEN_KEY } from '../utils/storage';
import { mapPostMonthsByYear, mapTasksByStatus } from '../utils/mappers';

dayjs.extend(utc);

const http = axios.create();

http.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    console.log(error);
    if (error.response.status === 401) {
      window.location.replace('/auth/login');
    }
    return Promise.reject(error);
  },
);

const apiGetRequest = (url: string, config: AxiosRequestConfig) =>
  http.get(url, config);
const apiPostRequest = (url: string, data: any, config?: AxiosRequestConfig) =>
  http.post(url, data, config);
const apiPutRequest = (url: string, data: any, config: AxiosRequestConfig) =>
  http.put(url, data, config);
const apiPatchRequest = (url: string, data: any, config: AxiosRequestConfig) =>
  http.patch(url, data, config);
const apiDeleteRequest = (url: string, config: AxiosRequestConfig) =>
  http.delete(url, config);

const authConfig = () => ({
  headers: { authorization: getItemFromStorage(TOKEN_KEY) },
});

const apiLocalGetRequest = (url: string, config?: AxiosRequestConfig) =>
  apiGetRequest(`${LOCAL}/${url}`, { ...config, ...authConfig() });
const apiLocalPostRequest = (url: string, data: any) =>
  apiPostRequest(`${LOCAL}/${url}`, data, authConfig());
const apiLocalPutRequest = (url: string, data: any) =>
  apiPutRequest(`${LOCAL}/${url}`, data, authConfig());
const apiLocalPatchRequest = (url: string, data: any) =>
  apiPatchRequest(`${LOCAL}/${url}`, data, authConfig());
const apiLocalDeleteRequest = (url: string) =>
  apiDeleteRequest(`${LOCAL}/${url}`, authConfig());

export const getTransactionsByMonthAndYear = (year: number, month: number) =>
  apiLocalGetRequest(
    `transaction?y=${year}&m=${month + 1}&$sort[date]=-1`,
  ).then((resp) => resp.data?.data);
export const postTransaction = (data: any) =>
  apiLocalPostRequest(`transaction`, data).then((resp) => resp.data);
export const putTransaction = (id: number, data: any) =>
  apiLocalPutRequest(`transaction/${id}`, data).then((resp) => resp.data);
export const deleteTransaction = (id: number) =>
  apiLocalDeleteRequest(`transaction/${id}`).then((resp) => resp.data);

export const getTransactionsCategories = () =>
  apiLocalGetRequest(`transaction-category`).then((resp) => resp.data?.data);
export const postTransactionsCategories = (data: any) =>
  apiLocalPostRequest(`transaction-category`, data).then((resp) => resp.data);
export const patchTransactionCategory = (id: number | string, data: any) =>
  apiLocalPatchRequest(`transaction-category/${id}`, data).then(
    (resp) => resp.data,
  );
export const deleteTransactionCategory = (id: number | string) =>
  apiLocalDeleteRequest(`transaction-category/${id}`).then((resp) => resp.data);
export const getTransactionsStatistics = () =>
  apiLocalGetRequest(`transaction?statistics=1`).then((resp) => resp.data);

export const getNoteCategories = () =>
  apiLocalGetRequest('note-category').then((resp) => resp.data?.data);
export const postNoteCategory = (data: any) =>
  apiLocalPostRequest('note-category', data).then((resp) => resp.data);
export const putNoteCategory = (id: number, data: any) =>
  apiLocalPutRequest(`note-category/${id}`, data).then((resp) => resp.data);
export const deleteNoteCategory = (id: number) =>
  apiLocalDeleteRequest(`note-category/${id}`).then((resp) => resp.data);

export const getNotes = (categoryId: number | string) =>
  apiLocalGetRequest(`note?note_category=${categoryId}`).then(
    (resp) => resp.data?.data,
  );
export const postNote = (data: any) =>
  apiLocalPostRequest('note', data).then((resp) => resp.data);
export const editNote = (id: number, data: any) =>
  apiLocalPatchRequest(`note/${id}`, data).then((resp) => resp.data);
export const deleteNote = (id: number) =>
  apiLocalDeleteRequest(`note/${id}`).then((resp) => resp.data);

export const getWishes = () =>
  apiLocalGetRequest('wish').then((resp) => resp.data?.data);
export const postWish = (data: any) =>
  apiLocalPostRequest('wish', data).then((resp) => resp.data);
export const putWish = (id: number, data: any) =>
  apiLocalPutRequest(`wish/${id}`, data).then((resp) => resp.data);
export const deleteWish = (id: number) =>
  apiLocalDeleteRequest(`wish/${id}`).then((resp) => resp.data);

export const getPosts = () =>
  apiLocalGetRequest(`posts?&$sort[date]=-1&$limit=25`).then(
    (resp) => resp.data,
  );
export const getPostsHistory = () =>
  apiLocalGetRequest(`posts-history`).then((resp) => resp.data);
export const deletePost = (id: number) =>
  apiLocalDeleteRequest(`posts/${id}`).then((resp) => resp.data);
export const editPost = (id: number, data: any) =>
  apiLocalPutRequest(`posts/${id}`, data).then((resp) => resp.data);
export const postComment = (data: any) => apiLocalPostRequest(`comments`, data);
export const postPost = (data: any) =>
  apiLocalPostRequest(`posts`, data).then((resp) => resp.data);

export const getYears = () =>
  apiLocalGetRequest(`posts-history?get=months`).then((resp) =>
    mapPostMonthsByYear(resp.data),
  );
export const getMonth = (month: string) =>
  apiLocalGetRequest(`posts-history?ym=${month}`).then((resp) => resp.data);
export const getYearLabels = (year = new Date().getFullYear()) =>
  apiLocalGetRequest(`posts-history?y=${year}&get=labels`).then(
    (resp) => resp.data,
  );
export const searchPosts = (q: string) =>
  apiLocalGetRequest(`posts?body[$like]=${encodeURIComponent(`%${q}%`)}`);

export const getLabels = () =>
  apiLocalGetRequest('labels').then((resp) => resp.data?.data);
export const postLabel = (data: any) =>
  apiLocalPostRequest('labels', data).then((resp) => resp.data);
export const putLabel = (id: number, data: any) =>
  apiLocalPutRequest(`labels/${id}`, data).then((resp) => resp.data);
export const deleteLabel = (id: number) =>
  apiLocalDeleteRequest(`labels/${id}`).then((resp) => resp.data);

export const deleteLabelFromPost = (postId: number, labelId: number) =>
  apiLocalDeleteRequest(
    `post-labels/?post_id=${postId}&label_id=${labelId}`,
  ).then((resp) => resp.data);
export const addLabelToPost = (postId: number, labelId: number) =>
  apiLocalPostRequest(`post-labels`, {
    post_id: postId,
    label_id: labelId,
  }).then((resp) => resp.data);

export const getProjects = () =>
  apiLocalGetRequest('projects').then((resp) => resp.data?.data);
export const getProject = (id: number | string) =>
  apiLocalGetRequest(`projects/${id}`).then((resp) => resp.data);
export const postProject = (data: any) =>
  apiLocalPostRequest('projects', data).then((resp) => resp.data);
export const putProject = (id: number, data: any) =>
  apiLocalPutRequest(`projects/${id}`, data).then((resp) => resp.data);
export const getTasks = (id: number | string) =>
  apiLocalGetRequest(`tasks?project_id=${id}`)
    .then((resp) => resp.data?.data)
    .then(mapTasksByStatus);

export const getInProgress = () =>
  apiLocalGetRequest(`tasks?status=in_progress`).then(
    (resp) => resp.data?.data,
  );
export const editTask = (id: number, data: any) =>
  apiLocalPatchRequest(`tasks/${id}`, data).then((resp) => resp.data);
export const postTask = (data: any) =>
  apiLocalPostRequest(`tasks`, data).then((resp) => resp.data);
export const deleteTask = (id: number) =>
  apiLocalDeleteRequest(`tasks/${id}`).then((resp) => resp.data);

export const getLts = () =>
  apiLocalGetRequest(`last-time`).then((resp) => resp.data?.data);
export const getExpiredLts = () =>
  apiLocalGetRequest(`last-time?expired=1`).then((resp) => resp.data?.data);
export const postLT = (data: any) =>
  apiLocalPostRequest(`last-time`, data).then((resp) => resp.data);
export const editLT = (id: number, data: any) =>
  apiLocalPatchRequest(`last-time/${id}`, data).then((resp) => resp.data);
export const deleteLT = (id: number) =>
  apiLocalDeleteRequest(`last-time/${id}`).then((resp) => resp.data);

export const sendLogin = (data: any) =>
  apiPostRequest(`${LOCAL}/authentication`, { ...data, strategy: 'local' });
export const sendRegistration = (data: any) =>
  apiPostRequest(`${LOCAL}/register`, data);

export const getPeriods = () =>
  apiLocalGetRequest(`periods?$limit=200`).then((resp) => resp.data?.data);
export const postPeriod = (data: any) =>
  apiLocalPostRequest(`periods`, data).then((resp) => resp.data);
export const deletePeriod = (id: number) =>
  apiLocalDeleteRequest(`periods/${id}`).then((resp) => resp.data);
export const putPeriod = (id: number, data: any) =>
  apiLocalPutRequest(`periods/${id}`, data).then((resp) => resp.data);

export const getUser = () =>
  apiLocalGetRequest(`users/me`).then((resp) => resp.data);
export const editUser = (data: any) =>
  apiLocalPatchRequest(`users/me`, data).then((resp) => resp.data);

export const getCountdowns = () =>
  apiLocalGetRequest(`countdown`).then((resp) => resp.data?.data);
export const postCountdown = (data: any) =>
  apiLocalPostRequest(`countdown`, data).then((resp) => resp.data);
export const deleteCountdown = (id: number) =>
  apiLocalDeleteRequest(`countdown/${id}`).then((resp) => resp.data);
export const editCountdown = (id: number, data: any) =>
  apiLocalPutRequest(`countdown/${id}`, data).then((resp) => resp.data);

export const getWatch = (params?: Record<string, any>) =>
  apiLocalGetRequest(`watch`, { params }).then((resp) => resp.data?.data);
export const postWatch = (data: any) =>
  apiLocalPostRequest(`watch`, data).then((resp) => resp.data);
export const editWatch = (id: number, data: any) =>
  apiLocalPatchRequest(`watch/${id}`, data).then((resp) => resp.data);
export const deleteWatch = (id: number) =>
  apiLocalDeleteRequest(`watch/${id}`).then((resp) => resp.data);
