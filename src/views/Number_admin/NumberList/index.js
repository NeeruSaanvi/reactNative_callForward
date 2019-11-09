import React, { Component } from 'react';
import {
  Button, Card, CardBody, CardHeader, Col, FormGroup, FormText,
  Input, Label, Row, CardFooter, ModalHeader, ModalBody, ModalFooter, Modal, Badge
} from 'reactstrap';
import { Progress } from 'reactstrap';
import { fix_num, multi_query, timeout, } from "../../../service/numberSearch";
import { connect } from 'react-redux'
import ReactTable from 'react-table';
import 'react-table/react-table.css'
import "react-toastify/dist/ReactToastify.css";
import 'react-overlay-loader/styles.css';
import { error_mnq_message } from "../../../service/error_message";
import withLoadingAndNotification from "../../../components/HOC/withLoadingAndNotification";
import RestApi from "../../../service/RestApi";
import { Type } from "../../../constants/Notifications";
import _ from 'lodash';
import produce from "immer";
import ViewNumberListModal from './viewNumberListModal';


const MgiMessage = require('../../../MgiMessage/MgiMessage').MgiMessage;
class NumberList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nums: "", description: '', mail: '', messageText: '', checked: false, loading: false, datas: [], display: false, selectNums: [], copyNums: '',
      large: false, date: '', so: '', ncon: '', ctel: '', iec: '', iac: '', network: '', line: '', count: 0,
      file: "", isFile: false, disableDialedNumber: false, fileDatas: [],
      progress: 10, isProgressBar: false, roList: [], name: "", nameErr: false, numErr: false,
      activityLog: [], csvData: [], interval: "", isEdit: false, editId: 0, editName: "",
      modal: {
        isOpen: false,
        numberList: [], page: 0, sort: [], filter: [],
        pageSize: 0, total_page: 0, id: null,
        respOrg: [], status: [],
      },
    };
    this.csvRef = React.createRef();
    this.nameRef = [];
  }

  componentDidMount() {
    this.props.callApi2(RestApi.numberList, {}).then(res => {
      if (res.ok && res.data) {
        this.setState({ activityLog: res.data, isSuccess: true })
        this.interval = setInterval(() => {
          this.refreshList();
        }, 5000)
      } else {
        clearInterval(this.interval);
      }
    })
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  toggleModal = () => {
    const modal = produce(this.state.modal, m => {
      m.isOpen = !m.isOpen;
    });
    this.setState({ modal });
  };

  handleUpdate = (type, value) => {
    this.setState({
      modal: produce(this.state.modal, m => {
        m[type] = value
      })
    })
  };

  view = (id, name) => {
    this.props.callApi2(RestApi.numberListViewById, { "id": id }).then(res => {
      if (res.ok && res.data) {
        let status = res.data.map(st => st.status)
          .filter((value, index, self) => {
            if (value == "") return;
            return self.indexOf(value) === index
          })

        let respOrg = res.data.map(rs => rs.respOrg)
          .filter((value, index, self) => {
            if (value == "") return;
            return self.indexOf(value) === index
          })

        let count = res.data.length / 6;
        let dataList = [];
        let sortedData = _.sortBy(res.data, 'number');
        for (let i = 0; i <= count; i++) {
          let start = i * 6;
          let data = sortedData.slice(start, start + 6)
          dataList.push(data)
        }

        this.setState({
          modal: produce(this.state.modal, m => {
            m.isOpen = true;
            m.numberList = dataList;
            m.respOrg = respOrg;
            m.status = status;
            m.name = name;
            m.totalCount = res.data.length;
            m.noRecords = res.data.length == 0 ? true : false;
          })
        });
      }
    })
  };

  delete = (name, index) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    this.props.callApi2(RestApi.numberListDelete, { "name": name }).then(res => {
      if (res.ok && res.data) {
        let activityLog = [...this.state.activityLog];
        activityLog.splice(index, 1)
        this.setState({ activityLog })
      }
    })
  }

  refreshList = () => {
    this.props.callApiHideLoading(RestApi.numberList, {}).then(res => {
      if (res.ok && res.data) {
        this.setState({ activityLog: res.data })
      }
    })
  }

  editName = (index) => {
    let newState = Object.assign({}, this.state);
    newState.activityLog[index].isEdit = true;
    newState.activityLog[index].preName = this.state.activityLog[index].name;
    this.setState(newState)
  }

  saveName = (index) => {
    let name = this.state.activityLog[index].name;
    let preName = this.state.activityLog[index].preName;
    let newState = Object.assign({}, this.state);
    if (name === "") {
      newState.activityLog[index].nameErr = true;
      this.setState(newState)
      return false;
    }
    this.props.callApi2(RestApi.numberListUpdateName, { "name": preName, "newName": name }).then(res => {
      if (res.ok && res.data) {
        newState.activityLog[index].name = name;
      } else {
        newState.activityLog[index].name = preName;
      }
      newState.activityLog[index].isEdit = false;
      newState.activityLog[index].nameErr = false;
      this.setState(newState)
    })
  }

  handleChange = (ev) => {
    let state = {};
    state[ev.target.name] = ev.target.value;
    this.setState(state);
  };

  handleEditChange = (e) => {
    let newState = Object.assign({}, this.state);
    let index = e.target.getAttribute('index')
    newState.activityLog[index].name = e.target.value;
    this.setState(newState);
  }

  handleFile = async (ev) => {
    let data = new FormData();
    data.append("file", ev.target.files[0]);
    this.props.callApi2(RestApi.uploadFileMnq, data).then(res => {
      if (res.ok && res.data) {
        let data = res.data;
        let numArr = res.data.length > 0 ? data.join("\n") : "";
        this.setState({
          "disableDialedNumber": false, "file": "",
          "isFile": false, "nums": numArr, "datas": [], "display": false, copyNums: ""
        })
        document.getElementById("selectFile").value = "";
        this.props.showNotification(Type.SUCCESS, "File is uploaded with " + data.length + " Numbers. Please Submit")
      }
    })
  }

  download = (name) => {
    let csvData = []
    this.csvData = [csvData];
    let btn = this.csvRef.current;
    btn.link.click();
  }

  submit = async () => {
    this.setState({ display: false, count: 0, nameErr: false, jobTitleErr: false, numErr: false });
    this.state.datas = [];
    if (this.state.nums === "") { this.setState({ numErr: true }); window.scrollTo(0, 0);; return false; }
    if (this.state.name === "") { this.setState({ nameErr: true }); window.scrollTo(0, 0);; return false; }
    let message = multi_query(this.props.somos.id, this.props.somos.selectRo, fix_num(this.state.nums));

    this.setState({ loading: true, progress: this.state.progress });

    let numberListApi = RestApi.numberListSave;
    let { description, mail, messageText } = this.state
    let params = { 'mod': 'MNQ', 'message': message,name: this.state.name, 
    'description': description || null, 'mail': mail || null, 
    'messageText': messageText || null, 'timeout': timeout};

    if(this.state.isEdit) {
      params.oldName = this.state.editName;
      params.editId = this.state.editId;
      numberListApi =  RestApi.numberListUpdate;
    }
    
    this.props.callApi2(numberListApi, params).then(res => {
        if (res.ok && res.data) {
          this.refreshList();
          this.setState({ "nums": "", name: "", description: "", mail: "", messageText: "" })
        }
      });
    this.state.roList = this.state.datas.map(item => item.CRO).filter(
      (value, index, self) => self.indexOf(value) === index)
  };

  clear = () => {
    this.setState({
      messageText: '', ro: '', nums: '',
      description: '', mail: '', display: false,
      selectNums: [], copyNums: ''
    })
  };

  numberListColums = [
    {
      Header: "Name",
      accessor: 'name',
      Cell: props => <div className="text-center">
        {!this.state.activityLog[props.index].isEdit &&
          <div> {this.state.activityLog[props.index].name}
            <a onClick={() => this.editName(props.index)}> <i className="fa fa-edit"></i></a>
          </div>
        }
        {this.state.activityLog[props.index].isEdit &&
          <div>
            <Row>
              <Col sm="10">
                <Input placeholder="Name" onChange="" bsSize="sm" onChange={this.handleEditChange}
                  value={this.state.activityLog[props.index].name} index={props.index} />
                {this.state.activityLog[props.index].nameErr && <p className="text-danger">Name required</p>}
              </Col>
              <Col sm="2">
                <a className="cell-check" onClick={() => this.saveName(props.index)}>
                  <i className="fa fa-check"></i>
                </a>
              </Col>
            </Row>
          </div>
        }</div>,
    },
    {
      Header: "Created By",
      accessor: 'userName',
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: "Date",
      accessor: 'date',
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: "Total Records",
      accessor: 'count',
      Cell: props => <div className="text-center">
        <h4>
          <Badge color="success" pill>
            <span className="btm-1 fnt-14">
              {props.value}
            </span>
          </Badge>
        </h4>
      </div>
    },
    // {
    //   Header: "Status",
    //   accessor: 'progress',
    //   width: 70,
    //   Cell: props => <div className="text-center">
    //     <h4>
    //       {props.value ? <span className="ml-2 top-2">
    //         <i className="fa fa-spinner fa-spin"></i>
    //       </span> : <i className="fa fa-check"></i>}
    //     </h4>
    //   </div>
    // },
    {
      Header: "Action",
      accessor: 'name',
      Cell: props => <div className="text-center">
        <Button size="sm" onClick={() => this.getNumberListById(props.original.id, props.original.name)} color="primary" className="ml-2">
          <i className="fa fa-edit"></i>
        </Button>

        <Button size="sm" onClick={() => this.view(props.original.id, props.original.name)} color="primary" className="ml-2">
          <i className="fa fa-eye"></i>
        </Button>
        {/* <Button size="sm" color="success" className="ml-2" onClick={() => {
          this.downloadForm.action = process.env.REACT_APP_API_POINT + "/somos/activityReport/listByName/" + props.original.name + "/" + props.original.createdAt;
          this.textInput.value = this.props.data.token;
          this.downloadForm.submit();
          this.textInput.value = "";
        }}><i className="fa fa-download"></i></Button> */}
        <Button size="sm" color="danger" className="ml-2"
          onClick={() => this.delete(props.original.name, props.index)}>
          <i className="fa fa-close"></i>
        </Button>
      </div>
    }
  ]

  toggleLarge = () => { this.setState({ large: !this.state.large }); };
  
  /**
   * Get Number List By Id
   */
  getNumberListById = (id, name) => {
    this.props.callApi2(RestApi.numberListById,{id}).then(res => {
        if (res.ok && res.data) {
          let { name, numberList, description, mail, messageText } = res.data;
          let numArr = numberList.join("\n");
          this.setState({name, description, mail, messageText, 
            nums: numArr, isEdit: true, editId: id, editName: name});
          window.scrollTo(0, 0);
        }
    });
  }

  render() {
    return (
      <div className="animated fadeIn">
        <div className="page-header">
          <Row className="mt-4">
            <Col xs="12">
              <h1 className="pb-3 border-bottom">
                Number List
              </h1>
            </Col>
          </Row>
        </div>
        <Row className="mt-3">
          <Col xs="6">
            <Card>
              <CardHeader>
                Multi Dial Numbers
              </CardHeader>
              <CardBody>
                <Row>
                  <Col xs="4" className="text-right">
                    <Label>CSV or XL file :</Label>
                  </Col>
                  <Col xs="7">
                    <Input type="file" id="selectFile" name="selectFile" onChange={this.handleFile} accept=".xls,.xlsx,.csv" />
                  </Col>
                </Row>
                <Row className="mt-3 mb-3">
                  <Col xs="12 text-center">( or )</Col>
                </Row>
                <Row>
                  <Col xs="4" className="text-right"><Label for="nums">Dial Numbers :</Label></Col>
                  <Col xs="8">
                    <FormGroup>
                      <Input invalid={this.state.numErr} type="textarea" disabled={this.state.disableDialedNumber} value={this.state.nums}
                        name="nums" id="nums" rows="15" onChange={(ev) => this.handleChange(ev)} className="form-control" />
                      {this.state.numErr ? <FormText>Number field is required</FormText> : ""}
                    </FormGroup>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
          <Col xs="6">
            <Card>
              <CardHeader>
                Report Information
              </CardHeader>
              <CardBody>
                <FormGroup row>
                  <Label for="name" sm={3}>Job Title :</Label>
                  <Col sm={9}>
                    <Input invalid={this.state.nameErr} type="text" id="name" name="name"
                      onChange={(ev) => this.handleChange(ev)} value={this.state.name} className="col-8" />
                    {this.state.nameErr ? <FormText>Name field is required</FormText> : ""}
                  </Col>
                </FormGroup>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                Request Information
              </CardHeader>
              <CardBody>
                <FormGroup row>
                  <Label for="description" sm={5}>Request Description:</Label>
                  <Col sm={7}>
                    <Input type="text" id="description" name="description" onChange={(ev) => this.handleChange(ev)}
                      value={this.state.description} className="col-11" />
                  </Col>
                </FormGroup>

                <FormGroup row>
                  <Label for="mail" sm={5}>E-mail Address:</Label>
                  <Col sm={7}>
                    <Input type="text" id="mail" name="mail" onChange={(ev) => this.handleChange(ev)}
                      value={this.state.mail} className="col-11" />
                  </Col>
                </FormGroup>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Card>
          <CardBody>
            {this.state.display && <Row className="float-right mr-3 mb-2"><Label className="font-weight-bold">Selected Count: {this.state.count}</Label></Row>}
            <div>
              {this.state.display && <ReactTable
                data={this.state.datas} columns={this.columns} defaultPageSize={10} minRows="1" className="-striped -highlight col-12"
                ref={(r) => this.selectTable = r}
                onFilteredChange={this.onFilterChange}
                onPageChange={(page) => {
                  this.isCheckAll();
                }}
                onPageSizeChange={(pageSize) => {
                  this.isCheckAll();
                }}
              />}
            </div>
            <Row className="mt-2">
              <Col xs="2" className="text-right"><Label for="messageText">Message:</Label></Col>
              <Col xs="10"><Input type="textarea" id="messageText" name="messageText" onChange={this.handleChange} value={this.state.messageText} /></Col>
            </Row>
          </CardBody>
          <CardFooter>
            <Row>
              <Col xs="12" className="text-left">
                  <Button size="md" color="primary" onClick={this.submit} className="text-left">
                    {this.state.isEdit ? "Update" : "Submit" }
                  </Button>

                <Button size="md" color="danger" onClick={this.clear} className="ml-2">Clear</Button>
              </Col>
            </Row>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            Number List
          </CardHeader>
          <CardBody>
            <div>
              <ReactTable
                data={this.state.activityLog} columns={this.numberListColums} defaultPageSize={10} minRows="1" className="-striped -highlight col-12"
                ref={(r) => this.selectActivityLogTable = r}
              />
            </div>
          </CardBody>
        </Card>


        <form ref={(node) => { this.downloadForm = node }} action="" target="_blank" method="post">
          <input type="hidden" ref={(input) => { this.textInput = input }} name="access_token" value="" />
        </form>

        <ViewNumberListModal
          isOpen={this.state.modal.isOpen}
          toggle={this.toggleModal}
          id={this.state.modal.id}
          handler={this.handleUpdate}
          data={this.state.modal}
          token={this.props.data.token}
        />
      </div>
    );
  }
}

export default connect((state) => ({ somos: state.auth.profile.somos, data: state.auth }))(withLoadingAndNotification(NumberList));