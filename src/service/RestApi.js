import apisauce from 'apisauce';
import qs from 'qs'

const instance = (baseURL = process.env.REACT_APP_API_POINT) => {
  // ------
  // STEP 1
  // ------
  //
  // Create and configure an apisauce-based api object.
  //
  return apisauce.create({
    // base URL is read from the "constructor"
    baseURL: baseURL,
    headers: {
      'Content-Type': 'application/json'
    },
    // 60 second timeout...
    timeout: 60 * 1000

  });
};

// Define api functions.

//login
const login = (api, username, password) => api.post('/session/login', {username, password, isLogin: false});
const logout = (api, id) => api.post('/session/logout', id);
const refreshToken = (api, token) => api.post('/session/refresh', {refreshToken: token});
const updatePassword = (api, req) => api.put('/profile/password', req);

const sendRequestNew = (api, req) => api.post('/somos/send_new', qs.stringify(Object.assign({}, req, {timeout: "60"})), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}});
const sendBulkRequest = (api, req) => api.post('/somos/cad/bulk', req);
const getReservedNumberList = (api, req) => api.post('/somos/reserved_numbers', req);
const uploadFileMnq = (api, req) => api.post('/somos/mnq/upload', req);
const activityLog = (api, req) => api.get('/somos/activityReport/list', req);
const viewMnq = (api, req) => api.get('/somos/numbers_list/view', req);
const deleteMnq = (api, req) => api.delete('/somos/numbers_list/delete', req);
const filterNumber = (api, req) => api.get('/somos/numbers_list/filterview', req);
const updateName = (api, req) => api.get('/somos/numbers_list/update_name', req);
const mnqRequest = (api, req) => api.post('/somos/mnq_request', qs.stringify(Object.assign({}, req, {timeout: "60"})), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}});

const mnqNumberListById = (api, req) => api.get('/somos/numbers_list/template/view', req);

const numberList = (api, req) => api.get('/somos/numbers_list/template', req);
const numberListById = (api, req) => api.get('/somos/numbers_list/template/edit', req);
const numberListSave = (api, req) => api.post('/somos/numbers_list/template/save', qs.stringify(Object.assign({}, req, {timeout: "60"})), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}});
const numberListDelete = (api, req) => api.delete('/somos/numbers_list/template/delete', req);
const numberListUpdate = (api, req) => api.delete('/somos/numbers_list/template/update', req);
const numberListUpdateName = (api, req) => api.get('/somos/numbers_list/template/update_name', req);
const numberListViewById = (api, req) => api.get('/somos/numbers_list/template/id', req);

export default{
  instance, login, logout, refreshToken,
  sendRequestNew, sendBulkRequest, getReservedNumberList,
  uploadFileMnq, activityLog, viewMnq, deleteMnq, mnqNumberListById,
  filterNumber, mnqRequest, updateName, updatePassword, numberList, numberListById,
  numberListSave, numberListDelete, numberListUpdateName, numberListViewById, numberListUpdate
}

