import React, { Component } from 'react'
import _ from 'lodash';
import {
  Button, Card, CardBody, Col, Input, Label, Modal, ModalHeader, ModalBody,
  Nav, NavItem, NavLink, Row, TabContent, TabPane, FormGroup
} from "reactstrap";
import PropTypes from "prop-types";
import '../../../scss/react-table.css'
import { withAuthApiLoadingNotification } from "../../../components/HOC/withLoadingAndNotification";
import RestApi from "../../../service/RestApi";
import { connect } from 'react-redux'


class ViewMnqListModal extends Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    toggle: PropTypes.func,
    handler: PropTypes.func,
    id: PropTypes.number,
    data: PropTypes.object,
    ...Modal.propTypes,
  };

  static defaultProps = {
    isEditable: true
  };

  constructor(props) {
    super(props);
    this.state = {
      respOrgList: this.props.data.respOrg || [],
      statusList: this.props.data.status || [],
      status: "",
      respOrg: "",
      numberList: [],
      name: this.props.data.name,
      totalCount: this.props.data.totalCount,
      noRecords: this.props.data.noRecords
    };
  }

  componentWillUpdate(nextProps, nextState, nextContext) {
    if (nextProps.data.respOrg && nextProps.data.respOrg !== this.state.respOrgList) {
      this.setState({ respOrgList: nextProps.data.respOrg.sort() })
    }

    if (nextProps.data.status && nextProps.data.status !== this.state.statusList) {
      this.setState({ statusList: nextProps.data.status.sort() })
    }

    if (nextProps.data.numberList && nextProps.data.numberList !== this.state.numberList) {
      this.setState({ numberList: nextProps.data.numberList })
    }

    if (nextProps.data.name && nextProps.data.name !== this.state.name) {
      this.setState({ name: nextProps.data.name })
    }

    if (nextProps.data.totalCount && nextProps.data.totalCount !== this.state.totalCount) {
      this.setState({ totalCount: nextProps.data.totalCount })
    }

    if (nextProps.data.noRecords && nextProps.data.noRecords !== this.state.noRecords) {
      this.setState({ noRecords: nextProps.data.noRecords })
    }
  }

  componentWillReceiveProps(newProps) {
    this.setState({ numberList: [], totalCount: "", noRecords: false });
  }

  download = () => {
    this.downloadForm.action = process.env.REACT_APP_API_POINT + "/somos/numbers_list/filterview/download?name=" + this.state.name + "&status=" + this.state.status
      + "&respOrg=" + this.state.respOrg
    this.textInput.value = this.props.token;
    this.downloadForm.submit();
    this.textInput.value = "";
  };

  onClose = () => {
    this.setState({ status: "", respOrg: "" });
    this.props.toggle();
  }

  handleChange = async (ev) => {
    await this.setState({ [ev.target.name]: ev.target.value })
    let params = { "name": this.state.name, status: this.state.status, respOrg: this.state.respOrg }
    this.props.callApi2(RestApi.filterNumber, params).then(res => {
      if (res.ok && res.data) {
        let count = res.data.length / 6;
        let numberList = [];
        let sortedData = _.sortBy(res.data, 'number');
        for (let i = 0; i <= count; i++) {
          let start = i * 6;
          let data = sortedData.slice(start, start + 6);
          data = _.sortBy(data, 'number');
          numberList.push(data)
        }
        let noRecords = res.data.length == 0 ? true : false;
        this.setState({ numberList, totalCount: res.data.length, noRecords });
      }
    })
  }

  render() {
    let noRecords = "";
    if (this.state.noRecords) {
      noRecords = <p className="top-15 text-center">No Records Found</p>
    }

    return (
      <Modal className="modal-xl" isOpen={this.props.isOpen}>
        <ModalHeader toggle={this.onClose}>View Numbers{this.state.noRecords}</ModalHeader>
        <ModalBody>
         <FormGroup row>
            <Col lg={4} className="row">
              <Label className="col-5 text-right">Resp Org:</Label>
              <Input type="select" className="col-7 form-control-sm" name="respOrg" 
                onChange={this.handleChange} value={this.state.respOrg}>
                <option></option>
                {this.state.respOrgList && this.state.respOrgList.map(s => <option key={s} value={s}>{s}</option>)}
              </Input>
            </Col>
            <Col lg={4} className="row">
              <Label className="col-5 text-right">Status:</Label>
              <Input type="select" className="col-7 form-control-sm" name="status" 
                onChange={this.handleChange} value={this.state.status}>
                <option></option>
                {this.state.statusList && this.state.statusList.map(s => <option key={s} value={s}>{s}</option>)}
              </Input>
            </Col>
            <Col lg={2} className="row"></Col>
            <Col lg={2} className="row">
            <p> Total Records : 
              <span className="font-weight-bold"> { this.state.totalCount }</span>
            </p>
            </Col>
          </FormGroup>
          <FormGroup className="float-right">
            <Button size="sm" color="success" className="ml-2" onClick={this.download}>
            <i className="fa fa-download"></i> Download
            </Button>          
        </FormGroup>
          <FormGroup className="float-right">
            {/* <Button size="sm" color="success" className="ml-2" onClick={this.download}>
              <i className="fa fa-download"></i> Download
            </Button> */}
          </FormGroup>
          <FormGroup row>
            <table className="table-bordered fixed_header_modal">
              <tbody>
                {this.state.numberList && this.state.numberList.map((value, i) => {
                  return (<tr key={i}>
                    {value.map((element, j) => {
                      return (<td key={j} className="text-center">{element.number}</td>)
                    })}
                  </tr>)
                })
                }
                {noRecords}
              </tbody>
            </table>

          </FormGroup>

        </ModalBody>
        <form ref={(node) => { this.downloadForm = node }} action="" target="_blank" method="post">
          <input type="hidden" ref={(input) => { this.textInput = input }} name="access_token" value="" />
        </form>
      </Modal>
    );
  }
}

export default withAuthApiLoadingNotification(ViewMnqListModal)
