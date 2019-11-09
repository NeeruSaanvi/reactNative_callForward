import React, {Component} from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  FormGroup,
  Input,
  Label,
  Row,
  Fade,
  Collapse,
  FormText

} from 'reactstrap';
import ReactTable from 'react-table'
import '../../../scss/react-table.css'
import {customer_selection, mod, timeout, verb} from "../../../service/customer";
import api from "../../../service/api";
import {Loader} from 'react-overlay-loader';
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import 'react-overlay-loader/styles.css';
import withLoadingAndNotification from "../../../components/HOC/withLoadingAndNotification";
const MgiMessage = require('../../../MgiMessage/MgiMessage').MgiMessage;
class CustomerSelection extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.toggleLarge = this.toggleLarge.bind(this);


    this.state = {
      collapse: true,
      collapse_setting: true,
      fadeIn: true,
      fadeIn_setting: true,
      timeout: 300,
      timeout_setting: 300,
      num: null,
      loading: false,
      isNum: true,
      query: [],
    };
  }

  toggle() {
    this.setState({collapse: !this.state.collapse});
  }

  toggle_setting() {
    this.setState({collapse_setting: !this.state.collapse_setting});
  }

  toggleLarge() {
    this.setState({
      large: !this.state.large,
    });
  }

  handleChange(event) {
    const state = {};
    state[event.target.name] = event.target.value;
    this.setState(state);
  }

  customer_selection = () => {
    if (this.state.num === null ) {
      this.setState({isNum: false});
      return false;
    } else {
      this.setState({isNum: true});
    }
    let message = customer_selection(this.state.num);
    console.log(message);
    this.setState({loading: true});
    api.sendNew({
      'verb': verb,
      'mod': mod,
      'message': message,
      'timeout': timeout
    }).then(res => {
      this.setState({loading: false});
      let message = new MgiMessage(res.data.message);

    }).catch(err => {
      console.log(err);
    })

  };
  render() {
    const data = [{
      effective_date: '09/04/2008',
      time: '03:00 PM C',
      cr_status: 'Active',
      approval: 'Not Required',
      components: 'CAD',
    }];
    const columns = [
      {
        Header: 'Effective Date',
        accessor: 'effective_date'
      },
      {
        Header: 'Time',
        accessor: 'time',
      },
      {
        Header: 'CR Status',
        accessor: 'cr_status'
      },
      {
        Header: 'Approval',
        accessor: 'approval'
      },
      {
        Header: 'Components',
        accessor: 'components'
      },
    ];
    return (
      <div className="animated fadeIn">
        <Label className="ml-1"><strong style={{fontSize: 30}}>Customer Record Selection</strong></Label>
        {/*<FormGroup row>*/}
          {/*<Col xs="12">*/}
            {/*<Row className="bs-wizard" style={{borderBottom:0}}>*/}
              {/*<Col xs="6" className="bs-wizard-step complete">*/}
                {/*<div className="text-center bs-wizard-stepnum">Search</div>*/}
                {/*<div className="progress">*/}
                  {/*<div className="progress-bar"/>*/}
                {/*</div>*/}
                {/*<a href="#" className="bs-wizard-dot"/>*/}
              {/*</Col>*/}
              {/*<Col xs="6" className="bs-wizard-step complete">*/}
                {/*<div className="text-center bs-wizard-stepnum">Results</div>*/}
                {/*<div className="progress">*/}
                  {/*<div className="progress-bar"/>*/}
                {/*</div>*/}
                {/*<a href="#" className="bs-wizard-dot"/>*/}
              {/*</Col>*/}
            {/*</Row>*/}
          {/*</Col>*/}
        {/*</FormGroup>*/}
        <Row className="mt-3">
          <Col xs="12">
            <Fade timeout={this.state.timeout} in={this.state.fadeIn}>
              <Card>
                <CardHeader>
                  <strong style={{fontSize: 20}}>Retrieve</strong>
                  <div className="card-header-actions">
                    <a className="card-header-action btn btn-minimize" data-target="#collapseExample"
                       onClick={this.toggle.bind(this)}><i
                      className={this.state.collapse ? "icon-arrow-up" : "icon-arrow-down"}/></a>
                  </div>
                </CardHeader>
                <Collapse isOpen={this.state.collapse} id="collapseExample">
                  <CardBody>
                    <Label>Toll-Free Number *</Label>
                    <Input type="text" name="num" id="num" onChange={(ev)=>this.handleChange(ev)}/>
                    {!this.state.isNum ?
                      <FormText><p style={{color: 'red'}}>Please input Toll Free Number</p>
                      </FormText> : ""}
                    <Button size="md" color="primary" className="mt-3" onClick={this.customer_selection}>Retrieve</Button>
                  </CardBody>
                </Collapse>
              </Card>
            </Fade>
          </Col>
          <Col xs="12">
            <Fade timeout={this.state.timeout_setting} in={this.state.fadeIn_setting}>
              <Card>
                <CardHeader>
                  <strong style={{fontSize: 20}}>Result</strong>
                  <div className="card-header-actions">
                    <a className="card-header-action btn btn-minimize" data-target="#collapseExample"
                       onClick={this.toggle_setting.bind(this)}><i
                      className={this.state.collapse_setting ? "icon-arrow-up" : "icon-arrow-down"}/></a>
                  </div>
                </CardHeader>
                <Collapse isOpen={this.state.collapse_setting} id="collapseExample">
                  <CardBody>
                    <FormGroup row>
                      <Col xs="12" md="6">
                        <Button size="md" color="link"><i className="fa fa-gear" style={{fontSize: 30}}/></Button>
                      </Col>
                      <Col xs="12" md="6" className="text-right">
                        <Button size="md" color="link"><i className="fa fa-copy" style={{fontSize: 30}}/></Button>
                        <Button size="md" color="link"><i className="fa fa-share-square-o"
                                                          style={{fontSize: 30}}/></Button>
                        <Button size="md" color="link"><i className="fa fa-refresh" style={{fontSize: 30}}/></Button>

                        <Button size="md" color="link"><i className="fa fa-trash" style={{fontSize: 30}}/></Button>
                        <Button size="md" color="link"><i className="fa fa-print" style={{fontSize: 30}}/></Button>
                      </Col>
                    </FormGroup>
                    <ReactTable data={data} columns={columns}/>
                    <FormGroup className="mt-3">
                      <Button size="md" color="danger">Cancel</Button>
                    </FormGroup>

                  </CardBody>
                </Collapse>
              </Card>
            </Fade>
          </Col>
        </Row>
      </div>
    );
  }
}

export default withLoadingAndNotification(CustomerSelection);
