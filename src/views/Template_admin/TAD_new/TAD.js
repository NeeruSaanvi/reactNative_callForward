import React from 'react';
import {connect} from "react-redux";
import renderMixin from './TAD.render';
import methodMixin from './TAD.method';
import {template} from "../../../redux/AuthRedux";

import {withAuthApiLoadingNotification} from "../../../components/HOC/withLoadingAndNotification";

class Component extends React.Component {}
const TAD = renderMixin(methodMixin(Component));
export default connect((state) => ({somos: state.auth.profile.somos}),
  dispatch => ({
    template:(types, ladData) => dispatch(template({types, ladData}))
  })
  )(withAuthApiLoadingNotification(TAD));
