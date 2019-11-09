import React, { Component } from 'react';
import {
  Button, Card, CardBody, CardHeader, Col, FormGroup, FormText,
  Input, Label, Row, CardFooter, ModalHeader, ModalBody, ModalFooter, Modal,
  Badge
} from 'reactstrap';
import { Progress } from 'reactstrap';
import { fix_num, multi_query, timeout, } from "../../../service/numberSearch";
import { connect } from 'react-redux'
import ReactTable from 'react-table';
import { CSVLink } from "react-csv";
import 'react-table/react-table.css'
import "react-toastify/dist/ReactToastify.css";
import 'react-overlay-loader/styles.css';
import { error_mnq_message } from "../../../service/error_message";
import withLoadingAndNotification from "../../../components/HOC/withLoadingAndNotification";
import RestApi from "../../../service/RestApi";
import { Type } from "../../../constants/Notifications";
import _ from 'lodash';
import produce from 'immer';
import ViewMnqListModal from './viewMnqListModal';
const MgiMessage = require('../../../MgiMessage/MgiMessage').MgiMessage;


class MNQ extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nums: "", desc: '', mail: '', message: '', checked: false, loading: false, datas: [], display: false, selectNums: [], copyNums: '',
      large: false, date: '', so: '', ncon: '', ctel: '', iec: '', iac: '', network: '', line: '', count: 0,
      file: "", isFile: false, disableDialedNumber: false, fileDatas: [],
      progress: 10, isProgressBar: false, roList: [], name: "", nameErr: false, numErr: false,
      activityLog: [], csvData: [], jobTitle: "", jobTitleErr: false, interval: "", numberList: [], numberListId: "",
      modal: {
        isOpen: false,
        numberList: [], page: 0, sort: [], filter: [],
        pageSize: 0, total_page: 0, id: null,
        respOrg: [], status: [],
      },
    };
    this.csvRef = React.createRef();
  }

  componentDidMount() {
    this.props.callApi2(RestApi.activityLog, {}).then(res => {
      if (res.ok && res.data) {
        this.setState({ activityLog: res.data, isSuccess: true })
        this.startActivityListInterval();
      } else {
        this.clearActivityListInterval();
      }
    })

    this.props.callApi2(RestApi.numberList, {}).then(res => {
      if (res.ok && res.data) {
        this.setState({ numberList: res.data })
      }
    })
  }

  toggleModal = () => {
    const modal = produce(this.state.modal, m => {
      m.isOpen = !m.isOpen;
    });
    this.setState({ modal });
  };

  view = (id, name) => {
    this.props.callApi2(RestApi.viewMnq, { "name": name }).then(res => {
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
    this.props.callApi2(RestApi.deleteMnq, { "name": name }).then(res => {
      if (res.ok && res.data) {
        let activityLog = [...this.state.activityLog];
        activityLog.splice(index, 1)
        this.setState({ activityLog })
      }
    })
  }

  startActivityListInterval = () => {
    this.interval = setInterval(() => {
      this.refreshList();
    }, 5000)
  }

  clearActivityListInterval = () => {
    clearInterval(this.interval);
  }

  componentWillUnmount() {
    this.clearActivityListInterval();
  }

  refreshList = () => {
    this.props.callApiHideLoading(RestApi.activityLog, {}).then(res => {
      if (res.ok && res.data) {
        this.setState({ activityLog: res.data })
      }
    })
  }

  handleChange = (ev) => { let state = {}; state[ev.target.name] = ev.target.value; this.setState(state); };

  handleChangeNumberList = (ev) => {
    this.setState({numberListId: ev.target.value})
    if(ev.target.value) {
      let data = {id: ev.target.value}
      this.props.callApi2(RestApi.mnqNumberListById, data).then(res => {
        if (res.ok && res.data) {
          let data = res.data;
          let numbers = res.data.length > 0 ? data.join("\n") : "";
          this.setState({numberListId: data.id, nums: numbers})
        }
      })
    } else {
      this.setState({nums: ""})
    }
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
    // if (this.state.jobTitle === "") { this.setState({ jobTitleErr: true }); window.scrollTo(0, 0);; return false; }
    let message = multi_query(this.props.somos.id, this.props.somos.selectRo, fix_num(this.state.nums));

    this.setState({ loading: true, progress: this.state.progress });

    this.props.callApi2(RestApi.mnqRequest,
      {
        'mod': 'MNQ', 'message': message, jobTitle: this.state.name,
        name: this.state.name, 'timeout': timeout
      }).then(res => {
        if (res.ok && res.data) {
          this.refreshList();
          this.setState({
            nums: "", name: "", jobTitle: "",
            desc: "", mail: "", message: ""
          })
        }
      });
    this.state.roList = this.state.datas.map(item => item.CRO).filter(
      (value, index, self) => self.indexOf(value) === index)
  };

  clear = () => {
    this.setState({
      message: '', ro: '', nums: '',
      desc: '', mail: '', display: false,
      selectNums: [], copyNums: ''
    })
  };

  activityReportColumns = [
    {
      Header: "Name",
      accessor: 'name',
      Cell: props => <div className="text-center">{props.value}</div>
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
    {
      Header: "Status",
      accessor: 'progress',
      Cell: props => <div className="text-center">
        <h4>
          {props.value ? <span className="ml-2 top-2">
            <i className="fa fa-spinner fa-spin"></i>
          </span> : <i className="fa fa-check"></i>}
        </h4>
      </div>
    },
    {
      Header: "Action",
      accessor: 'name',
      Cell: props => <div className="text-center">
        <Button size="sm" onClick={() => this.view(props.original.id, props.original.name)} color="primary" className="ml-2">
          <i className="fa fa-eye"></i>
        </Button>
        <Button size="sm" color="success" className="ml-2" onClick={() => {
          this.downloadForm.action = process.env.REACT_APP_API_POINT + "/somos/activityReport/listByName/" + props.original.name + "/" + props.original.createdAt;
          this.textInput.value = this.props.data.token;
          this.downloadForm.submit();
          this.textInput.value = "";
        }}><i className="fa fa-download"></i></Button>
        <Button size="sm" color="danger" className="ml-2"
          onClick={() => this.delete(props.original.name, props.index)}>
          <i className="fa fa-close"></i>
        </Button>
      </div>
    }
  ]

  handleCheckAll = (ev) => {
    let count = 0;
    for (const [i, data] of this.state.datas.entries()) {
      this.state.datas[i].checked = false;
      if (ev.target.checked) {
        count++
        this.state.datas[i].checked = true;
      }
      if (document.getElementsByName(data.NUM)[0]) {
        document.getElementsByName(data.NUM)[0].checked = ev.target.checked;
      }
    }
    this.setState({ count });
  }

  handleCheck = (ev) => {
    document.getElementById("checkAll").checked = false;
    document.getElementsByName([ev.target.name])[0].checked = ev.target.checked;
    let index = this.state.datas.findIndex(x => x.NUM.trim() === ev.target.name.trim());
    this.state.datas[index].checked = ev.target.checked;
    let checkedDatas = this.state.datas.filter(data => data.checked === false);
    if (checkedDatas.length == 0) {
      document.getElementById("checkAll").checked = true;
    }
    let count = ev.target.checked ? this.state.count + 1 : this.state.count - 1;
    this.setState({ count });
  }

  columns = [
    {
      Header: () => <input type="checkbox" id="checkAll" onChange={(ev) => this.handleCheckAll(ev)} />,
      accessor: 'checked',
      sortable: false,
      Cell: props => {
        return <div className="text-center"><input type="checkbox" onChange={this.handleCheck} name={props.original.NUM} /></div>
      }
    },
    {
      Header: 'Number',
      accessor: 'NUM',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'Resp Org',
      accessor: 'CRO',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>,
      filterMethod: (filter, row) => {
        if (filter.value === "all") {
          return true;
        }

        for (let ro of this.state.roList) {
          if (filter.value === ro) {
            return row[filter.id] == ro;
          }
        }
      },
      Filter: ({ filter, onChange }) =>
        <select
          onChange={event => {
            onChange(event.target.value);
          }}
          style={{ width: "100%" }}
          value={filter ? filter.value : "all"}
        >
          <option value="">Show All</option>
          {this.state.roList.map(ro =>
            (ro != "") && <option key={ro} value={ro}>{ro}</option>
          )}
        </select>
    },
    {
      Header: 'Status',
      accessor: 'STAT',
      filterable: true,
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'Last Active',
      accessor: 'LACT',
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'Reserved Until',
      accessor: 'RU',
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'Disconnect Until',
      accessor: 'DU',
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'Effective Date',
      accessor: 'SE',
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'Contact Person',
      accessor: 'NCON',
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'Contact Number',
      accessor: 'CTEL',
      Cell: props => <div className="text-center">{props.value}</div>
    },
    {
      Header: 'Notes',
      accessor: 'NOTES',
      Cell: props => <div className="text-center">{props.value}</div>
    },
  ];

  createCad = () => { this.setState({ large: true }); };
  toggleLarge = () => { this.setState({ large: !this.state.large }); };

  multiCad = async () => {
    if (!this.state.copyNums) {
      this.props.showNotification(Type.WARNING, "Please select numbers!");
      return false;
    }
    let nums = this.state.copyNums.split("\n");
    // this.state.datas.map(num => num.STAT.trim() === "RESERVE" && nums.push(num.NUM.trim()))

    this.setState({ large: false });
    let res = await this.props.callApi2(RestApi.sendBulkRequest, {
      id: this.props.somos.id,
      ro: this.props.somos.selectRo,
      nums: nums,
      ed: this.state.date,
      iec: this.state.iec,
      iac: this.state.iac,
      so: this.state.so,
      ncon: this.state.ncon.toUpperCase(),
      ctel: this.state.ctel,
      anet: this.state.network,
      lns: this.state.line
    });
    if (res.ok) {
      this.props.showNotification(Type.SUCCESS, res.data)
    }
  };

  copyNumberToClipBoard = () => {
    const currentRecords = this.selectTable.getResolvedState().sortedData;
    let copyNums = [];
    currentRecords.filter(data => {
      if (document.getElementById("checkAll").checked) {
        copyNums.push(data.NUM.trim() + "\t" + data.CRO.trim() + "\t" + data.STAT.trim())
      } else {
        let index = this.state.datas.findIndex(x => x.NUM.trim() === data.NUM.trim());
        if (this.state.datas[index].checked) {
          copyNums.push(data.NUM.trim() + "\t" + data.CRO.trim() + "\t" + data.STAT.trim())
        }
      }

    });
    let copyNumbers = copyNums || [];
    copyNumbers = copyNumbers.join("\r\n");
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = copyNumbers;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    this.props.showNotification(Type.SUCCESS, "Copy Succeeded!")
  }

  progressBar = () => {
    this.setState({ progress: 50 })
  }

  onFilterChange = () => {
    this.isCheckAll();
    let sortedData = this.selectTable.getResolvedState().sortedData;
    let count = 0;
    if (document.getElementById("checkAll").checked) {
      count = sortedData.length;
    } else {
      sortedData.filter(data => {
        let index = this.state.datas.findIndex(x => x.NUM.trim() === data.NUM.trim());
        if (this.state.datas[index].checked) {
          count++
        }
      });
    }
    this.setState({ count })
  }

  isCheckAll = () => {
    for (const [i, data] of this.state.datas.entries()) {
      if (document.getElementsByName(data.NUM)[0] && data.checked == true) {
        document.getElementsByName(data.NUM)[0].checked = true;
      } else {
        if (document.getElementsByName(data.NUM)[0]) {
          document.getElementsByName(data.NUM)[0].checked = false;
        }
      }
    }
  }

  render() {
    return (
      <div className="animated fadeIn">
        <div className="page-header">
          <Row className="mt-4">
            <Col xs="12">
              <h1 className="pb-3 border-bottom">
                Multi Dial Number Query
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
                        name="nums" id="nums" rows="17" onChange={(ev) => this.handleChange(ev)} className="form-control" />
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
                Number List
              </CardHeader> 
              <CardBody>
                <FormGroup row>
                  <Col sm={8}>
                    <Input type="select" name="numberListId" onChange={(ev) => this.handleChangeNumberList(ev)}>
                      <option key="0" value="">Select Number List</option>
                      { (this.state.numberList || []).map(number => {
                        return(
                         <option key={number.id} value={number.id}>{ number.name }</option>
                        )
                      }) }
                      
                    </Input>
                  </Col>
                </FormGroup>
              </CardBody>
            </Card>
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

                {/* <FormGroup row>
                  <Label for="jobTitle" sm={3}>Job Title :</Label>
                  <Col sm={9}>
                    <Input invalid={this.state.jobTitleErr} type="text" id="jobTitle" name="jobTitle"
                      onChange={(ev) => this.handleChange(ev)} value={this.state.jobTitle} className="col-8" />
                    {this.state.jobTitleErr ? <FormText>Job Title field is required</FormText> : ""}
                  </Col>
                </FormGroup> */}
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                Request Information
              </CardHeader>
              <CardBody>
                <FormGroup row>
                  <Label for="desc" sm={5}>Request Description:</Label>
                  <Col sm={7}>
                    <Input type="text" id="desc" name="desc" onChange={(ev) => this.handleChange(ev)}
                      value={this.state.desc} className="col-11" />
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
        {this.state.isProgressBar &&
          <Card>
            <CardBody>
              <Progress animated className="mt-2" value={this.state.progress}>{this.state.progress}%</Progress>
            </CardBody>
          </Card>
        }
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
              <Col xs="2" className="text-right"><Label for="message">Message:</Label></Col>
              <Col xs="10"><Input type="textarea" id="message" name="message" onChange={this.handleChange} value={this.state.message} /></Col>
            </Row>
          </CardBody>
          <CardFooter>
            <Row>
              <Col xs="6" className="text-left">
                <Button size="md" color="primary" onClick={this.submit} className="text-left">Submit</Button>
                <Button disabled={this.state.count == 0} onClick={this.copyNumberToClipBoard} size="md" color="primary" className="ml-3">Copy Numbers</Button>
                <Button size="md" color="primary" onClick={this.createCad} className="ml-3" disabled={!this.state.copyNums}>Create CAD</Button>
              </Col>
              <Col xs="6" className="text-right"><Button size="md" color="danger" onClick={this.clear} className="text-right">Clear</Button></Col>
            </Row>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            Activity Log
          </CardHeader>
          <CardBody>
            <div>
              <ReactTable
                data={this.state.activityLog} columns={this.activityReportColumns} defaultPageSize={10} minRows="1" className="-striped -highlight col-12"
                ref={(r) => this.selectActivityLogTable = r}
              />
            </div>
          </CardBody>
        </Card>


        <Modal isOpen={this.state.large} toggle={this.toggleLarge}
          className={'modal-lg ' + this.props.className}>
          <ModalHeader toggle={this.toggleLarge}>Create Multi CAD</ModalHeader>
          <ModalBody>
            <Row className="ml-1 mr-1">
              <Col lg="6">
                <FormGroup row>
                  <Label className="col-6 text-right">Eff Date/Time:</Label>
                  <Input type="text" className="col-6" bsSize="sm" name="date" onChange={this.handleChange} />
                </FormGroup>
              </Col>
              <Col lg="6">
                <FormGroup row>
                  <Label className="col-6 text-right">Service Order:</Label>
                  <Input type="text" className="col-6" bsSize="sm" name="so" onChange={this.handleChange} />
                </FormGroup>
              </Col>
              <Col lg="6">
                <FormGroup row>
                  <Label className="col-6 text-right">Contact Person:</Label>
                  <Input type="text" className="col-6" bsSize="sm" name="ncon" onChange={this.handleChange} />
                </FormGroup>
              </Col>
              <Col lg="6">
                <FormGroup row>
                  <Label className="col-6 text-right">Contact Number:</Label>
                  <Input type="text" className="col-6" bsSize="sm" name="ctel" onChange={this.handleChange} />
                </FormGroup>
              </Col>
              <Col lg="6">
                <FormGroup row>
                  <Label className="col-6 text-right">IntraLATA:</Label>
                  <Input type="text" className="col-6" bsSize="sm" name="iac" onChange={this.handleChange} />
                </FormGroup>
              </Col>
              <Col lg="6">
                <FormGroup row>
                  <Label className="col-6 text-right">InterLATA:</Label>
                  <Input type="text" className="col-6" bsSize="sm" name="iec" onChange={this.handleChange} />
                </FormGroup>
              </Col>
              <Col lg="6">
                <FormGroup row>
                  <Label className="col-6 text-right">Network:</Label>
                  <Input type="text" className="col-6" bsSize="sm" name="network" onChange={this.handleChange} />
                </FormGroup>
              </Col>
              <Col lg="6">
                <FormGroup row>
                  <Label className="col-6 text-right">Lines:</Label>
                  <Input type="text" className="col-6" bsSize="sm" name="line" onChange={this.handleChange} />
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button size="md" color="primary" onClick={this.multiCad}>Create Multi CAD</Button>
            <Button type="reset" size="md" color="danger" onClick={this.toggleLarge}> Cancel</Button>
          </ModalFooter>
        </Modal>
        <form ref={(node) => { this.downloadForm = node }} action="" target="_blank" method="post">
          <input type="hidden" ref={(input) => { this.textInput = input }} name="access_token" value="" />
        </form>

        <ViewMnqListModal
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

export default connect((state) => ({ somos: state.auth.profile.somos, data: state.auth }))(withLoadingAndNotification(MNQ));
