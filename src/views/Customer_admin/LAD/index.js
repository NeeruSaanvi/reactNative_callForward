import React, {Component} from 'react';
import {Button, Card, CardBody, Col, Input, Label, Row, Nav, NavItem, NavLink, TabContent, TabPane
} from 'reactstrap';
import "react-toastify/dist/ReactToastify.css";
import 'react-overlay-loader/styles.css';
import "react-datepicker/dist/react-datepicker.css";
import classnames from "classnames";
import "react-datepicker/dist/react-datepicker.css";
import withLoadingAndNotification from "../../../components/HOC/withLoadingAndNotification";
import {delete_cell, handle_lad, insert_cell} from "../../../utils";

class LAD extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: '1', sfed: '', ro: '', approval: '', last: '', prev_user: '', message: '', isDate: false, isArea: false,
      template: localStorage.getItem("template"),
      isLATA: localStorage.getItem("isLATA") === "1" || false,
      isNXX: localStorage.getItem("isNXX") === "1" ||false,
      isState: localStorage.getItem("isState") === "1"||false,
      isTel: localStorage.getItem("isTel") === "1"||false,
      isSD: localStorage.getItem("isSD") === "1"||false,
      isTD: localStorage.getItem("isTD") === "1"||false,
      isTime: localStorage.getItem("isTime") === "1"||false,
      disable: localStorage.getItem("disable") === "1"||false,
      ac: [], dt: [], lata: [], nxx: [], state: [], tel: [], time: [], td: [], sd: [],
      gridArea: JSON.parse(localStorage.getItem("gridArea")) || Array(7).fill(Array(8).fill('')),
      gridDate: JSON.parse(localStorage.getItem("gridDate"))||Array(7).fill(Array(8).fill('')),
      gridLATA: JSON.parse(localStorage.getItem("gridLATA"))||Array(7).fill(Array(8).fill('')),
      gridNXX: JSON.parse(localStorage.getItem("gridNXX"))||Array(7).fill(Array(8).fill('')),
      gridState: JSON.parse(localStorage.getItem("gridState"))||Array(7).fill(Array(8).fill('')),
      gridTel: JSON.parse(localStorage.getItem("gridTel"))||Array(7).fill(Array(8).fill('')),
      gridTime: JSON.parse(localStorage.getItem("gridTime"))||Array(7).fill(Array(8).fill('')),
      gridTD: JSON.parse(localStorage.getItem("gridTD"))||Array(7).fill(Array(8).fill('')),
      gridSD: JSON.parse(localStorage.getItem("gridSD"))||Array(7).fill(Array(8).fill('')),
    };
  }
  componentDidMount = () => {
    this.setItem();
  };

  setItem = () => {
    window.addEventListener("storage", (ev) => {
      if (ev.key === "template") {
        this.setState({template: ev.newValue});
      } else {
        let state = {};
        state[ev.key] = JSON.parse(ev.newValue);
        this.setState(state);
      }
    });
  };

  //Manage area carrier for LAD
  handleAreaChange = (ev) => {
    this.setState({gridArea: handle_lad(ev, this.state.gridArea)});
    localStorage.setItem("gridArea", JSON.stringify(handle_lad(ev, this.state.gridArea)));
  };
  //Manage date carrier for LAD
  handleDateChange = (ev) => {
    this.setState({gridDate: handle_lad(ev, this.state.gridDate)});
    localStorage.setItem("gridDate", JSON.stringify(handle_lad(ev, this.state.gridDate)));
  };
  //Manage lata carrier for LAD
  handleLATAChange = (ev) => {
    this.setState({gridLATA: handle_lad(ev, this.state.gridLATA)});
    localStorage.setItem("gridLATA", JSON.stringify(handle_lad(ev, this.state.gridLATA)));
  };
  //Manage nxx carrier for LAD
  handleNXXChange = (ev) => {
    this.setState({gridNXX: handle_lad(ev, this.state.gridNXX)});
    localStorage.setItem("gridNXX", JSON.stringify(handle_lad(ev, this.state.gridNXX)));
  };
  //Manage state carrier for LAD
  handleStateChange = (ev) => {
    this.setState({gridState: handle_lad(ev, this.state.gridState)});
    localStorage.setItem("gridState", JSON.stringify(handle_lad(ev, this.state.gridState)));
  };
  //Manage tel carrier for LAD
  handleTelChange = (ev) => {
    this.setState({gridTel: handle_lad(ev, this.state.gridTel)});
    localStorage.setItem("gridTel", JSON.stringify(handle_lad(ev, this.state.gridTel)));
  };
  //Manage time carrier for LAD
  handleTimeChange = (ev) => {
    this.setState({gridTime: handle_lad(ev, this.state.gridTime)});
    localStorage.setItem("gridTime", JSON.stringify(handle_lad(ev, this.state.gridTime)));
  };
  //Manage ten digits carrier for LAD
  handleTdChange = (ev) => {
    this.setState({gridTD: handle_lad(ev, this.state.gridTD)});
    localStorage.setItem("gridTD", JSON.stringify(handle_lad(ev, this.state.gridTD)));
  };
  //Manage six digits carrier for LAD
  handleSdChange = (ev) => {
    this.setState({gridSD: handle_lad(ev, this.state.gridSD)});
    localStorage.setItem("gridSD", JSON.stringify(handle_lad(ev, this.state.gridSD)));
  };

  handle = (event) => {
    let state = {};
    state[event.target.name] = event.target.value;
    this.setState(state);
  };

  toggle = (tab) => {
    this.state.activeTab !== tab && this.setState({activeTab: tab});
  };

  insertCell = (type) => {
    if (type === "AC") {
      this.setState({gridArea: insert_cell(this.state.gridArea)});
      localStorage.setItem("gridArea", insert_cell(this.state.gridArea));
    } else if (type === "DT") {
      this.setState({gridDate: insert_cell(this.state.gridDate)});
      localStorage.setItem("gridDate", insert_cell(this.state.gridDate));
    } else if (type === "LT") {
      this.setState({gridLATA: insert_cell(this.state.gridLATA)});
      localStorage.setItem("gridLATA", insert_cell(this.state.gridLATA));
    } else if (type === "TD") {
      this.setState({gridTD: insert_cell(this.state.gridTD)});
      localStorage.setItem("gridTD", insert_cell(this.state.gridTD));
    } else if (type === "SD") {
      this.setState({gridSD: insert_cell(this.state.gridSD)});
      localStorage.setItem("gridSD", insert_cell(this.state.gridSD));
    } else if (type === "NX") {
      this.setState({gridNXX: insert_cell(this.state.gridNXX)});
      localStorage.setItem("gridNXX", insert_cell(this.state.gridNXX));
    } else if (type === "TI") {
      this.setState({gridTime: insert_cell(this.state.gridTime)});
      localStorage.setItem("gridTime", insert_cell(this.state.gridTime));
    } else if (type === "TE") {
      this.setState({gridTel: insert_cell(this.state.gridTel)});
      localStorage.setItem("gridTel", insert_cell(this.state.gridTel));
    } else if (type === "ST") {
      this.setState({gridState: insert_cell(this.state.gridState)})
      localStorage.setItem("gridState", insert_cell(this.state.gridState));
    }
  };
  deleteCell = (type) => {
    if (type === "AC") {
      this.setState({gridArea: delete_cell(this.state.gridArea)});
      localStorage.setItem("gridArea", delete_cell(this.state.gridArea));
    } else if (type === "DT") {
      this.setState({gridDate: delete_cell(this.state.gridDate)});
      localStorage.setItem("gridDate", delete_cell(this.state.gridDate));
    } else if (type === "LT") {
      this.setState({gridLATA: delete_cell(this.state.gridLATA)});
      localStorage.setItem("gridLATA", delete_cell(this.state.gridLATA));
    } else if (type === "TD") {
      this.setState({gridTD: delete_cell(this.state.gridTD)});
      localStorage.setItem("gridTD", delete_cell(this.state.gridTD));
    } else if (type === "SD") {
      this.setState({gridSD: delete_cell(this.state.gridSD)});
      localStorage.setItem("gridSD", delete_cell(this.state.gridSD));
    } else if (type === "NX") {
      this.setState({gridNXX: delete_cell(this.state.gridNXX)});
      localStorage.setItem("gridNXX", delete_cell(this.state.gridNXX));
    } else if (type === "TI") {
      this.setState({gridTime: delete_cell(this.state.gridTime)});
      localStorage.setItem("gridTime", delete_cell(this.state.gridTime));
    } else if (type === "TE") {
      this.setState({gridTel: delete_cell(this.state.gridTel)});
      localStorage.setItem("gridTel", delete_cell(this.state.gridTel));
    } else if (type === "ST") {
      this.setState({gridState: delete_cell(this.state.gridState)});
      localStorage.setItem("gridState", delete_cell(this.state.gridState));
    }
  };

  render() {
    return (
      <div className="animated fadeIn mt-3 ml-2 mr-2 ">
        <Label className="ml-1"><strong style={{fontSize: 25}}>Label Definition</strong></Label>
          <Card>
            <CardBody>
              <Row>
                <Col xs="12">
                  <div className="mt-2 mb-1 ml-1 mr-1" style={{backgroundColor: '#dfe1e3'}}>
                    <Row className="mt-2 ml-4 mr-4 pt-2 pb-1">
                      <Col xs="12" md="6" className="row">
                        <Label className="col-6 font-weight-bold">Dial#/Template *:</Label>
                        <Input className="col-6 form-control-sm" type="text" name="template" id="template" onChange={(ev) => this.handle(ev)} value={this.state.template}/>
                      </Col>
                    </Row>
                  </div>
                  <Card className="mb-1 ml-1 mr-1 mt-1 mb-1" >
                    <div>
                      <div className="ml-2 mr-2 mt-1 mb-1">
                        <Nav tabs className="custom">
                          {this.renderNavbar("1", "Area Code", this.state.isArea)}
                          {this.renderNavbar("2", "Date", this.state.isDate)}
                          {this.renderNavbar("3", "LATA", this.state.isLATA)}
                          {this.renderNavbar("4", "NXX", this.state.isNXX)}
                          {this.renderNavbar("5", "State", this.state.isState)}
                          {this.renderNavbar("6", "Tel#", this.state.isTel)}
                          {this.renderNavbar("7", "Time", this.state.isTime)}
                          {this.renderNavbar("8", "10-digit#", this.state.isTD)}
                          {this.renderNavbar("9", "6-digit#", this.state.isSD)}
                        </Nav>
                        <TabContent activeTab={this.state.activeTab}>
                          {this.renderTabPane("1", this.state.gridArea, "AC", this.handleAreaChange)}
                          {this.renderTabPane("2", this.state.gridDate, "DT", this.handleDateChange)}
                          {this.renderTabPane("3", this.state.gridLATA, "LT", this.handleLATAChange)}
                          {this.renderTabPane("4", this.state.gridNXX, "NX", this.handleNXXChange)}
                          {this.renderTabPane("5", this.state.gridState, "ST", this.handleStateChange)}
                          {this.renderTabPane("6", this.state.gridTel, "TE", this.handleTelChange)}
                          {this.renderTabPane("7", this.state.gridTime, "TI", this.handleTimeChange)}
                          {this.renderTabPane("8", this.state.gridTD, "TD", this.handleTdChange)}
                          {this.renderTabPane("9", this.state.gridSD, "SD", this.handleSdChange)}
                        </TabContent>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </CardBody>
          </Card>
      </div>
    );
  }

  renderNavbar = (id, name, state) => (
    <NavItem>
      <NavLink className={classnames({active: this.state.activeTab === id})} onClick={() => {this.toggle(id);}}>
        {!state ? name : name + " *"}
      </NavLink>
    </NavItem>);

  renderTabPane = (id, data, index, func) => {
    return <TabPane tabId={id}>
      <table className="table-bordered fixed_header">
        <thead>
        <tr>
          <th className="text-center">Label</th>
          <th className="text-center">Definition</th>
          <th className="text-center">Definition</th>
          <th className="text-center">Definition</th>
          <th className="text-center">Definition</th>
          <th className="text-center">Definition</th>
          <th className="text-center">Definition</th>
          <th className="text-center">Definition</th>
        </tr>
        </thead>
        <tbody style={{fontSize: 11 }}>
        {data && data.map((value, i) => {return (<tr>
          {value.map((element, j) => {
            return (<td><Input type="text" className="form-control-sm" name={index + "_" + i + "_" + j} value={element} onChange={func} disabled={this.state.disable}/></td>)})}
        </tr>)})
        }
        </tbody>
      </table>
      <div className="mt-2">
        <Button size="sm" color="primary" onClick={() => this.insertCell(index)} disabled={this.state.disable}>Insert Cell</Button><span className="ml-3"/>
        <Button size="sm" color="primary" onClick={() => this.deleteCell(index)} disabled={this.state.disable}>Delete Cell</Button>
      </div>
    </TabPane>
  }
}

export default withLoadingAndNotification(LAD);
