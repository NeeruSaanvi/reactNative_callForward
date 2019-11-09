import React, {Component} from 'react';
import { DropdownItem, DropdownMenu, DropdownToggle, 
  Dropdown, Input, Label, Nav,
  Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import {  Col, Button, Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import {AppHeaderDropdown, AppNavbarBrand, AppSidebarToggler} from '@coreui/react';
import {connect} from "react-redux";
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import ReactToolTip from 'react-tooltip';
import 'react-circular-progressbar/dist/styles.css';
import { logout as logOutActionCreator, selectRo } from '../../redux/AuthRedux';
import RestApi from "../../service/RestApi";
import {callApi} from "../../redux/ApiRedux";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import 'react-overlay-loader/styles.css';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      progress: [],
      dropdownOpen: false,
      modal: false,
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
      validated: false
    };
  }

  componentDidMount() {
    this.backPressureEvent();
  }

  handleChange = (ev) => {
    const { name, value } = ev.target;
    this.setState({[name]: value});
  }

  toggle = () => {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  changePassword = (ev) => {
    ev.preventDefault();
    this.setState({validated: true});
    let isValidForm = true;
    if(this.state.newPassword !== this.state.confirmPassword) {
      toast.error("Password does not match");
      isValidForm = false; return false;
    }

    const form = ev.currentTarget;
    if(form.checkValidity() === true && isValidForm === true) {
      let req = { oldPassword: this.state.oldPassword, newPassword: this.state.newPassword };
      this.props.callApi(RestApi.updatePassword, (response) => {
        if (response.ok) {
          this.setState({modal: false, validated: false, 
            oldPassword: "", newPassword: "", confirmPassword: ""});
        }
      }, req);
    }
  }

  toggleModal = () => {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }

  logout = () => {
    this.props.logout()
    // this.props.callApi2(RestApi.logout, {id: this.props.profile.id}).then(res => {
    //   if(res.ok) this.props.logout();
    // })
  }

  backPressureEvent = () => {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }
    if (!this.props.token) return;

    const eventSource = new EventSource(process.env.REACT_APP_API_POINT + '/backpressure_events/?access_token=' + this.props.token, {withCredentials: false});
    eventSource.onmessage = (event) => {
      console.log("Event Source data", JSON.parse(event.data));
      try {
        const data = JSON.parse(event.data);
        this.setState({progress: data})
      } catch(ex){
        console.log(ex);
      }
    };
    this.eventSource = eventSource
  };
  handle = (ev) => {
    console.log(ev.target.value);
    this.props.selectRo(ev.target.value)
  }
  render() {
    const { children, profile, ...attributes } = this.props;
    let data = [];
    if (profile.somos.ro) {
      let ros = profile.somos.ro;
      if (ros.includes(",")) {
        data = ros.split(",");
      } else {
        data.push(ros);
      }
    }
    let name = [];
    if (profile.firstName || profile.lastName) {
      name.push(profile.firstName);
      name.push(profile.lastName);
    } else {
      name.push(profile.username)
    }

    return (
      <React.Fragment>
        <AppSidebarToggler className="d-lg-none" display="md" mobile />
        <Label><strong style={{fontSize: 40}} className="ml-5">CPS</strong></Label>
        <Nav className="ml-7" navbar>
          {/*<NavItem className="d-md-down-none">*/}
            {/*<NavLink href="#"><i className="icon-bell"/><Badge pill color="danger">5</Badge></NavLink>*/}
          {/*</NavItem>*/}
          {this.state.progress.map(prog => {
            let {description, progress, category } = prog;
            progress = Math.round(progress * 100);

            return <div style={{width: 110}} className="mr-3">
              <a data-tip data-for="cadBulk">
                <CircularProgressbarWithChildren value={progress} strokeWidth={11}>
                  <div style={{ fontSize: 12}}><strong>{progress}%</strong></div>
                </CircularProgressbarWithChildren>
              </a>
              <ReactToolTip id='cadBulk' type='dark' effect="solid"><span>{description}</span></ReactToolTip>
            </div>
          })}
          <span className="mr-2">RO: </span>
          <Input type="select" bsSize='sm' onChange={this.handle} className="mr-4">
            {data.map((d, i) => <option key={i} value={d.trim()}>{d.trim()}</option>)}
          </Input>
          {name.map((n, i) => <span key={i} className="mr-1">{n}</span>)}
          <Dropdown className="mr-4" isOpen={this.state.dropdownOpen} toggle={this.toggle}>
            <DropdownToggle nav>
              <img src='../assets/img/avatars/avatar.png' style={{width: 100, height:42}} className="img-avatar"/>
            </DropdownToggle>
            <DropdownMenu right style={{ right: 'auto' }}>
              {/*<DropdownItem><i className="fa fa-user"/> Profile</DropdownItem>*/}
              <DropdownItem onClick={this.toggleModal}><i className="fa fa-lock"/> Change Password</DropdownItem>
              <DropdownItem onClick={this.logout}><i className="fa fa-lock"/> Logout</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </Nav>

        <Modal isOpen={this.state.modal} toggle={this.toggleModal} size="lg">
          <Form noValidate validated={this.state.validated} onSubmit={this.changePassword}>
            <ModalHeader toggle={this.toggleModal}>Change Password</ModalHeader>
            <ModalBody>
              <Form.Row>
                <Form.Group md="4" as={Col} controlId="oldPassword">
                  <Form.Label>Old Password</Form.Label>
                  <Form.Control required type="password" placeholder="Old Password"
                    name="oldPassword" onChange={this.handleChange}
                    defaultValue={this.state.oldPassword}
                  />
                </Form.Group>
                <Form.Group md="4" as={Col} controlId="newPassword">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control required type="password" placeholder="New Password"
                    name="newPassword" onChange={this.handleChange}
                    defaultValue={this.state.newPassword}
                  />
                </Form.Group>
                <Form.Group md="4" as={Col} controlId="confirmPassword">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control required type="password" placeholder="Confirm Password"
                    name="confirmPassword" onChange={this.handleChange}
                    defaultValue={this.state.confirmPassword}
                  />
                </Form.Group>
              </Form.Row>
            </ModalBody>
            <ModalFooter className="text-center">
              <Button color="primary"  type="submit">Change</Button>
              <Button color="danger" onClick={this.toggleModal}>Cancel</Button>
            </ModalFooter>
          </Form>
        </Modal>
      </React.Fragment>
    );
  }
}

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;


export default connect(
  state => ({
    profile: state.auth.profile,
    token: state.auth.token
  }),
  dispatch => ({
    logout: () => dispatch(logOutActionCreator()),
    selectRo: (ro) => dispatch(selectRo(ro)),
    callApi: (method, callback, ...args) => dispatch(callApi(method, callback, ...args)),
    callApi2: (method, ...args) => new Promise((resolve, _) => {
      dispatch(callApi(method, resolve, ...args))
    }), 
  }))(Header)
