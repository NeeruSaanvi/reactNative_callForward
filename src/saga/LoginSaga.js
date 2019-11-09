import {put, delay, call} from 'redux-saga/effects';
import API from '../service/RestApi';
import Credentials from "../service/Credentials";
import {Type as NotificationType} from '../constants/Notifications';
import {loginSuccess, loginFailed} from "../redux/AuthRedux";
import {showNotification} from "../redux/NotificationRedux";
export default function * login(action){
  const {username, password, rememberme} = action.payload;
  const api = API.instance();

  yield delay(200);

  const response = yield call(API.login, api, username, password);


  if (response.ok && response.data) {
    yield put(showNotification(NotificationType.SUCCESS, "Login Success"));

    // Delay 500ms.
    yield delay(500);

    let profile = response.data.profile;
    if (profile && profile.somos && profile.somos.ro) {
      let ros = profile.somos.ro;
      if (ros.includes(",")) {
        ros = ros.split(",");
        console.log(ros);
        Object.assign(profile.somos, {selectRo: ros[0].trim()} )
      } else {
        Object.assign(profile.somos, {selectRo: ros.trim()} )
      }
    }
    // Dispatch login success message
    const cred = Credentials.fromResponse(response.data);

    // Delete refresh token if remember me is not ticked.
    if (!rememberme)
      cred.refresh = undefined;

    yield put(loginSuccess(Credentials.fromResponse(response.data)));

  } else {
    let errorDescription = (response.data && response.data.error_description) ?
        response.data.error_description : response.problem
    const message = (response.data && response.data.message) ||
      (!response.ok && (((response.status && response.status + " : ") || "") +  errorDescription));
      
    // Dispatch login fail.
    yield put(showNotification(NotificationType.ERROR, message));

    // Dispatch login failed action
    yield put(loginFailed());
  }
}
