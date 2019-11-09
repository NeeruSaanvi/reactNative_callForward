import React, {Component} from 'react';
import {Button, Card, CardBody, CardFooter, CardHeader, Col, FormGroup, FormText, Input,
  Label, Row, Fade, Collapse, Modal, ModalBody, ModalFooter, ModalHeader,} from 'reactstrap';
import {connect} from 'react-redux'

import {
  verb,
  mod,
  search_number,
  timeout,
  search_ten_numbers,
  search_reserve_numbers,
  search_reserve_ten_numbers,
  query_number, reserve_numbers, fix_num
} from '../../../service/numberSearch'
import {error_message} from "../../../service/error_message";
import withLoadingAndNotification from "../../../components/HOC/withLoadingAndNotification";
import RestApi from "../../../service/RestApi";
import {Type} from "../../../constants/Notifications";
const MgiMessage = require('../../../MgiMessage/MgiMessage').MgiMessage;
let message = "";
class NumberSearch extends Component {

  constructor(props) {
    super(props);

    this.state = {
      collapse: true, collapse_note: true, collapse_setting: true, fadeIn: true, fadeIn_note: true, fadeIn_setting: true,
      timeout: 300, timeout_note: 300, timeout_setting: 300, large: false, quantity: 1, cont: false, num: "", npa: "npa",
      nxx: "", line: "", ncon: "KEELE,RICKY", ctel: "8887673300", notes: "", isNxx: true, isLine: true, isNum: true,
      isQt: true, isQuery: false, valid: false, loading: false, display: false, data: [], type: "", query: [], display_query: "",
      reserve: [], datas: [], advanceSearchFields: [this.advanceSearchFields()], disableAddMore : false
    };
  }

  toggle = () => {this.setState({collapse: !this.state.collapse});};
  togglenote = () => {this.setState({collapse_note: !this.state.collapse_note});};
  toggle_setting = () => {this.setState({collapse_setting: !this.state.collapse_setting});};
  toggleLarge = () => {this.setState({large: !this.state.large});};

  advanceSearchFields = () => {
    return {"npa": "", "nxx" : "", "line": "", "quantity":  "",
      "validQty": true, "validNxx": true, "validLine": true}
  }

  addMoreSearchFields = () => {
    this.setState({disableAddMore: false})
    let searchFieldObj = this.advanceSearchFields
    for(let field of this.state.advanceSearchFields) {
      if(field.quantity == "" || field.npa == "") {
        this.setState({disableAddMore: true})
        return false;
      }
    }
    this.setState({advanceSearchFields: [...this.state.advanceSearchFields, this.advanceSearchFields()]});
  }

  removeSearchFields = (index) => {
    this.state.advanceSearchFields.splice(index, 1);
    this.setState({advanceSearchFields: this.state.advanceSearchFields});
  }

  handleSearchFieldsChange = (event, index) => {
    let name = event.target.name;
    this.state.advanceSearchFields[index][name] = event.target.value;
    this.state.advanceSearchFields[index].validNxx = true;
    this.state.advanceSearchFields[index].validLine = true;
    this.state.advanceSearchFields[index].validQty = true;
    let numbers = /^[0-9]+$/;
    if(name == "nxx" && event.target.value !="") {
      if(!event.target.value.match(numbers))
        this.state.advanceSearchFields[index].validNxx = false;
    }
    if(name == "line" && event.target.value !="") {
      if(!event.target.value.match(numbers))
        this.state.advanceSearchFields[index].validLine = false;
    }

    if(name == "quantity" && event.target.value !="") {
      if(!event.target.value.match(numbers))
        this.state.advanceSearchFields[index].validQty = false;
    }

    this.setState({
      advanceSearchFields: this.state.advanceSearchFields
    });
  }

  getSearchQuery = (fields, quantity) => {
    message = search_ten_numbers(this.props.somos.id, this.props.somos.selectRo, fix_num(this.state.num));
    if(this.state.num === "") {
      message = search_number(this.props.somos.id, this.props.somos.selectRo, quantity,
        fields.npa, fields.nxx, fields.line, this.state.cont, fix_num(this.state.num));
    }
    return message;
  }

  getReserveSearchQuery = (fields, quantity) => {
    message = search_reserve_ten_numbers(this.props.somos.id, this.props.somos.selectRo, fix_num(this.state.num),
    this.state.ncon, this.state.ctel, this.state.notes)
    if (this.state.num === "") {
      message = search_reserve_numbers(this.props.somos.id, this.props.somos.selectRo, quantity,
        fields.npa, fields.nxx, fields.line, fix_num(this.state.num), this.state.cont,
        this.state.ncon, this.state.ctel, this.state.notes);
    }
    return message;
  }

  numberSearch = async (type) => {
    this.setState({display: false});

    let dataList = [];
    let isError = false;

    for(let fields of this.state.advanceSearchFields) {
      isError = false;
      if(!fields.validLine || !fields.validNxx || !fields.validNxx) {
        return false;
      }

      let isEmptyQty, isEmptyNpa = false;
      if(this.state.advanceSearchFields.length == 1) {
        if(fields.quantity == "") {
          fields.quantity = this.state.quantity;
          isEmptyQty = true;
        }
        if(fields.npa == "") {
          fields.npa = this.state.npa;
          isEmptyNpa = true;
        }
      }

      let totalQtyValue = Math.ceil(parseInt(fields.quantity) / 10);
      let remainderQtyValue = parseInt(fields.quantity)  % 10;

      for(let i = 0; i < totalQtyValue; i++) {
        let quantity = ((i+1) == totalQtyValue && remainderQtyValue != 0) ? remainderQtyValue : 10;
        if(fields.quantity <= 10 && fields.quantity > 0) {
          quantity = fields.quantity;
        }
        let message = "";

        if (type === "search") {
          message = this.getSearchQuery(fields, quantity);
        }

        if(type === "reserve") {
          message = this.getReserveSearchQuery(fields, quantity);
        }

        if(this.state.advanceSearchFields.length == 1) {
          fields.quantity = isEmptyQty ? "" : fields.quantity;
          fields.npa = isEmptyNpa ? "npa" : fields.npa;
        }

        let response = await this.props.callApi2(RestApi.sendRequestNew, {'mod': mod, 'message': message, 'timeout': timeout});

        if (response.ok && response.data.message){
          let data = new MgiMessage(response.data.message);

          dataList = dataList.concat(data.value(["NUM","VERR"]));

          if(data.value("ERR")[0]) {
            this.props.showNotification(Type.ERROR, error_message(data.value("ERR")[0]));
            isError = true;
          }
        }
      }
    }

    this.setState({type: type})
    if (this.state.type === "search" && !isError) {
      this.props.showNotification(Type.SUCCESS, "Search Number Succeed!")
    } else if (this.state.type === "reserve" && !isError) {
      this.props.showNotification(Type.SUCCESS, "Search and Reserve Number Succeed!")
    }
    this.setState({data: dataList, display: true});
  };

  reset = () => {
    window.location.reload();
  };

  handleChange = async (event) => {
    this.setState({data: []});
    await this.setState({[event.target.name] : event.target.value});

    let num = this.state.num;
    num = (num !== null) && fix_num(num)

    if (num !== null && num !== "") {
      this.setState({
        valid: true, quantity: "1",
        display: false, advanceSearchFields: [this.advanceSearchFields()],
        disableAddMore: false
      });
    }

    (num === "") && this.setState({valid: false});

  };

  queryNumber = async (num) => {
    message = query_number(this.props.somos.id, this.props.somos.selectRo, num);
    console.log(message);
    let response = await this.props.callApi2(RestApi.sendRequestNew, {'mod': mod, 'message': message, 'timeout': timeout});
    if (response.ok && response.data.message){
      let data = new MgiMessage(response.data.message);
      console.log(response.data.message);
      this.setState({
        loading: false,
        query: data.value(["STAT","RU","SE","LACT","CRO","NCON","CTEL"]),
        display_query: num
      });
    }
  };

  checkNumber = (ev) => {
    let name = ev.target.name.trim();
    if(ev.target.checked) {
      this.state.reserve.push(name);
    } else {
      let index = this.state.reserve.indexOf(name);
      if (index > -1)
        this.state.reserve.splice(index, 1);
    }
    let el =  document.getElementsByName("checkAll")[0];
    el.checked = false;
    if(this.state.data.length == this.state.reserve.length) {
      el.checked = true;
    }
  };

  checkAllReserveNumbers = (ev) => {
    this.state.reserve = [];
    (this.state.data || []).forEach((item, index) => {
      let el = document.getElementsByName([item.NUM])[0];
      if(ev.target.checked) {
        el.checked = true;
        this.state.reserve.push(item.NUM.trim());
      } else {
        el.checked = false;
      }
    })
    console.log(this.state.reserve);
  };

  numberReserve = async () => {
    this.setState({data: []});
    let message = reserve_numbers(this.props.somos.id, this.props.somos.selectRo, this.state.reserve, this.state.ncon, this.state.ctel);
    console.log(message);
    let response = await this.props.callApi2(RestApi.sendRequestNew, {'mod': mod, 'message': message, 'timeout': timeout});
    if (response.ok && response.data.message) {
      let message = new MgiMessage(response.data.message);
      this.setState({
        data: message.value(["NUM","VERR"]),
        type: 'reserve',
        reserve: []
      });
    }
  };

  render() {
    return (
      <div className="animated fadeIn" style={{padding: 16, width: '100%'}}>
        <Label className="ml-1"><strong style={{fontSize: 30}}>Reserve Toll-Free Numbers</strong></Label>
        <Row className="mt-3">
          <Col xs="12">
            <Fade timeout={this.state.timeout} in={this.state.fadeIn}>
              <Card>
                <CardHeader>
                  <strong>Search</strong>
                  <div className="card-header-actions">
                    <a className="card-header-action btn btn-minimize" data-target="#collapseExample"
                       onClick={this.toggle.bind(this)}><i
                      className={this.state.collapse ? "icon-arrow-up" : "icon-arrow-down"}/></a>
                  </div>
                </CardHeader>
                <Collapse isOpen={this.state.collapse} id="collapseExample">
                  <CardBody>
                    <FormGroup row>
                      <Col xs="12" md="4">
                        <Row>
                          <Col md="4">
                            <Label htmlFor="quantity">Quantity* : </Label>
                          </Col>
                          <Col xs="12" md="8">
                            <Input className="btm-4" type="text" id="quantity" name="quantity" autoComplete="text"
                                   value={this.state.quantity}
                                   onChange={(value) => this.handleChange(value)} disabled={this.state.valid}/>

                          </Col>
                        </Row>
                      </Col>
                      <Col xs="12" md="4">
                        <Row className="ml-5">
                          <Input type="checkbox" id="cont" name="cont" onChange={(evt) => {
                            this.setState({cont: evt.target.checked})
                          }}/>
                          <Label htmlFor="cont" className="top-2">Consecutive</Label>
                        </Row>
                      </Col>
                      <Col xs="12" md="4">
                        <Button className="btm-4" size="lg" color="link" onClick={this.toggleLarge}>
                          <i className="fa fa-phone-square" style={{fontSize: 25}}/>
                          <span className="contact-information">Contact Information*</span>
                        </Button>
                        <Modal isOpen={this.state.large} toggle={this.toggleLarge}
                               className={'modal-lg ' + this.props.className}>
                          <ModalHeader toggle={this.toggleLarge}>Contact Information</ModalHeader>
                          <ModalBody>
                            <FormGroup row>
                              <Col xs="6">
                                <Label htmlFor="ncon">Contact Name * </Label>
                                <Input type="text" name="ncon" id="ncon"
                                       onChange={(value) => this.handleChange(value)} value={this.state.ncon}/>
                              </Col>
                              <Col xs="6">
                                <Label htmlFor="ctel">Contact Number * </Label>
                                <Input type="text" name="ctel" id="ctel"
                                       onChange={(value) => this.handleChange(value)} value={this.state.ctel}/>
                              </Col>
                            </FormGroup>
                            <Row>
                              <Col xs="12">
                                <Input type="textarea" name="notes" id="notes" rows="5"
                                       placeholder="Number or Mask Entry"
                                       onChange={(value) => this.handleChange(value)}/>
                              </Col>
                            </Row>
                            <Label htmlFor="default_setting" className="ml-sm-4 mt-2">
                              <Input type="checkbox" name="default_setting" id="default_setting"/>
                              Change default contact information
                            </Label>
                          </ModalBody>
                          <ModalFooter>
                            <Button type="submit" size="md" color="primary" className="mr-2"
                                    onClick={this.toggleLarge}> Save</Button>
                            <Button type="reset" size="md" color="danger" onClick={this.toggleLarge}> Cancel</Button>
                          </ModalFooter>
                        </Modal>
                      </Col>
                    </FormGroup>
                    <Row className="mb-3">
                      <Col xs="12">
                        <Input type="textarea" name="num" id="num" rows="5"
                               placeholder="Number or Mask Entry" onChange={(value) => this.handleChange(value)}/>
                        {!this.state.isNum ? <FormText><strong style={{color: 'red'}}>Number or Mask Entry: Allows 10 alphanumerics, '*', '&' and dashes.</strong></FormText> : ""}
                      </Col>
                    </Row>
                    <Fade timeout={this.state.timeout_note} in={this.state.fadeIn_note}>
                      <Card className="mt-3">
                        <CardHeader>
                          <strong>Advanced Search</strong>
                          <div className="card-header-actions">
                            <a className="card-header-action btn btn-minimize" data-target="#collapseExample"
                               onClick={this.togglenote.bind(this)}><i
                              className={this.state.collapse_note ? "icon-arrow-up" : "icon-arrow-down"}/></a>
                          </div>
                        </CardHeader>
                        <Collapse isOpen={this.state.collapse_note} id="collapseExample">
                          <CardBody>
                            {(this.state.advanceSearchFields || []).map((fields, i) => {
                              return(
                                <FormGroup row key={i}>
                                  <Col xs="12" md="3">
                                    <Input type="select" name="npa" onChange={(e) => this.handleSearchFieldsChange(e, i)}
                                          disabled={this.state.valid}
                                          value={fields.npa === null ? "" : fields.npa}>
                                      <option value="npa">Toll-Free NPA</option>
                                      <option value="800">800</option>
                                      <option value="833">833</option>
                                      <option value="844">844</option>
                                      <option value="855">855</option>
                                      <option value="866">866</option>
                                      <option value="877">877</option>
                                      <option value="888">888</option>
                                    </Input>
                                  </Col>
                                  <Col xs="12" md="2">
                                    <Input type="text" name="quantity" autoComplete="text" placeholder="Quantity"
                                          onChange={(e) => this.handleSearchFieldsChange(e, i)} disabled={this.state.valid}
                                          value={fields.quantity === null ? "" : fields.quantity}/>
                                    { !fields.validQty ?
                                      <FormText><p style={{color: 'red'}}>Invalid quantity</p>
                                      </FormText> : ""}
                                  </Col>
                                  <Col xs="12" md="3">
                                    <Input type="text" maxLength="3" name="nxx" autoComplete="text" placeholder="Starting NXX"
                                          onChange={(e) => this.handleSearchFieldsChange(e, i)} disabled={this.state.valid}
                                          value={fields.nxx === null ? "" : fields.nxx}/>
                                    { !fields.validNxx ?
                                      <FormText><p style={{color: 'red'}}>Starting NXX: Must be three numerics.</p>
                                      </FormText> : ""}
                                  </Col>
                                  <Col xs="12" md="3">
                                    <Input type="text" maxLength="4" name="line" autoComplete="text" placeholder="Starting line"
                                          onChange={(e) => this.handleSearchFieldsChange(e, i)} disabled={this.state.valid}
                                          value={fields.line === null ? "" : fields.line}/>
                                    {!fields.validLine ?
                                      <FormText><p style={{color: 'red'}}>Starting LINE: Must be four numerics.</p>
                                      </FormText> : ""}
                                  </Col>
                                  <Col xs="12" md="1">
                                  <Button disabled={i == 0} style={{top: 3, position: "relative"}} onClick={ () => this.removeSearchFields(i) }
                                    color="danger" size="sm">X</Button>

                                  </Col>
                                </FormGroup>
                              )
                            })}
                            <Row>
                              <Col xs="12" className="text-right">
                                <Button disabled={this.state.num !=""}
                                type="submit" size="md" color="primary" className="mr-2"
                                  onClick={ this.addMoreSearchFields }>Add More</Button>
                                    {this.state.disableAddMore ?
                                      <FormText>
                                        <p style={{color: 'red'}}>
                                          Please fill quantity and npa
                                        </p>
                                      </FormText>
                                    : ""}
                              </Col>
                            </Row>
                          </CardBody>
                        </Collapse>
                      </Card>
                    </Fade>
                  </CardBody>
                  <CardFooter>
                    <Row>
                      <Col xs="6">
                        <Button type="submit" size="md" color="primary" className="mr-2"
                                onClick={() => this.numberSearch("search")}>Search</Button>
                        <Button type="reset" size="md" color="primary"
                                onClick={() => this.numberSearch("reserve")}>Search &
                          Reserve</Button>
                      </Col>
                      <Col xs="6" className="text-right">
                        <Button type="reset" size="md" color="danger" onClick={this.reset}>Reset</Button>
                      </Col>
                    </Row>
                  </CardFooter>
                </Collapse>
              </Card>
            </Fade>
          </Col>
          <Col xs="12">
            <Fade timeout={this.state.timeout_setting} in={this.state.fadeIn_setting}>
              <Card>
                <CardHeader>
                  <strong>Result</strong>
                  <div className="card-header-actions">
                    <a className="card-header-action btn btn-minimize" data-target="#collapseExample"
                       onClick={this.toggle_setting.bind(this)}><i
                      className={this.state.collapse_setting ? "icon-arrow-up" : "icon-arrow-down"}/></a>
                  </div>
                </CardHeader>
                <Collapse isOpen={this.state.collapse_setting} id="collapseExample">
                  <CardBody>
                    {this.state.display ?
                      <div>
                        <div className="row">
                          <span className="col-1">
                            <input type="checkbox" name="checkAll" onClick={(ev) => this.checkAllReserveNumbers(ev)}/>
                          </span>
                          <span className="col-4 border-right"><strong>Toll-Free Number</strong></span>
                          <span className="col-3 border-right"><strong>Status</strong></span>
                          <span className="col-4"><strong>Message</strong></span>
                        </div>
                        <div className="mt-3">
                          {this.state.data.map((value, key) => {
                            let html = [];
                            if (value.NUM) {
                              html.push(
                                <div key={key}>
                                  <div className="row mt-1" key={key}>
                                  <span className="col-1"><input type="checkbox" name={value.NUM}
                                                                 onClick={(ev) => this.checkNumber(ev)}/></span>
                                    <span className="col-4 border-right">{value.NUM.substring(0, 3) + "-" + value.NUM.substring(3, 6) + "-" + value.NUM.substring(6, 10)}</span>
                                    <span className="col-3 border-right">
                                  <div className="row">
                                    <div className="col-6">
                                      <i className="fa fa-check-circle-o" style={{fontSize: 25, color: "green"}}/>
                                    </div>
                                    <div className="col-6">{this.state.type === "search" ? "SPARE" : "RESERVE"}</div>
                                  </div>
                                  </span>
                                    <span className="col-4">
                                    <div className="row">
                                      <div className="col-9">
                                      </div>
                                      <div className="col-3 text-right">
                                        <Button color="link" onClick={() => this.queryNumber(value.NUM)}><i
                                          className={this.state.display_query !== value.NUM ? "fa fa-plus" : "fa fa-minus"}
                                          style={{fontSize: 20}}/></Button>
                                      </div>
                                    </div>
                                  </span>
                                  </div>
                                  {this.state.display_query === value.NUM && this.state.query.map((value) => {
                                    return <div><div className="row mt-2">
                                      <Col md="1"/>
                                      <Col md="5">
                                        <div>
                                          <Label>Resp Org</Label>
                                          <input type="text" className="form-control" disabled value={value.CRO}/>
                                        </div>
                                        <div className="mt-3">
                                          <Label>Effective Date</Label>
                                          <input type="text" className="form-control" disabled value={value.SE}/>
                                        </div>
                                        <div className="mt-3">
                                          <Label>Last Active</Label>
                                          <input type="text" className="form-control" disabled value={value.LACT}/>
                                        </div>
                                      </Col>
                                      <Col md="5">
                                        <div>
                                          <Label>Status</Label>
                                          <input type="text" className="form-control" disabled value={value.STAT}/>
                                        </div>
                                        <div className="mt-3">
                                          <Label>Reserved Until</Label>
                                          <input type="text" className="form-control" disabled value={value.RU}/>
                                        </div>
                                      </Col>
                                      <Col md="1"/>
                                    </div>
                                      <div className="row mt-2">
                                        <Col md="1"/>
                                        <Col md="5">
                                          <Label>Contact Name</Label>
                                          <input type="text" className="form-control" disabled value={value.NCON}/>
                                        </Col>
                                        <Col md="5">
                                          <Label>Contact Number</Label>
                                          <input type="text" className="form-control" disabled value={value.CTEL}/>
                                        </Col>
                                        <Col md="1"/>
                                      </div>
                                    </div>
                                  })}
                                </div>);
                            } else if (value.VERR) {
                              if (isNaN(parseInt(value.VERR.charAt(0)))) return;
                              html.push(
                                <div>
                                  <div className="row mt-1">
                                  <span className="col-1"><input type="checkbox" name={value.VERR}
                                                                 onClick={(ev) => this.checkNumber(ev)}/></span>
                                    <span className="col-4 border-right">{value.VERR.substring(0, 3) + "-" + value.VERR.substring(3, 6) + "-" + value.VERR.substring(6, 10)}</span>
                                    <span className="col-3 border-right">
                                  <div className="row">
                                    <div className="col-6">
                                      <i className="fa fa-times-circle-o" style={{fontSize: 25, color: "red"}}/>
                                    </div>
                                    <div className="col-6">INUSE</div>
                                  </div>
                                  </span>
                                    <span className="col-4">
                                    <div className="row">
                                      <div className="col-9">
                                      </div>
                                      <div className="col-3 text-right">
                                        <Button color="link" onClick={() => this.queryNumber(value.VERR)}><i
                                          className={this.state.display_query !== value.VERR ? "fa fa-plus" : "fa fa-minus"}
                                          style={{fontSize: 20}}/></Button>
                                      </div>
                                    </div>
                                  </span>
                                  </div>
                                  {this.state.display_query === value.VERR && this.state.query.map((value) => {
                                    return <div><div className="row mt-2">
                                      <Col md="1"/>
                                      <Col md="5">
                                        <div>
                                          <Label>Resp Org</Label>
                                          <input type="text" className="form-control" disabled value={value.CRO}/>
                                        </div>
                                        <div className="mt-3">
                                          <Label>Effective Date</Label>
                                          <input type="text" className="form-control" disabled value={value.SE}/>
                                        </div>
                                        <div className="mt-3">
                                          <Label>Last Active</Label>
                                          <input type="text" className="form-control" disabled value={value.LACT}/>
                                        </div>
                                      </Col>
                                      <Col md="5">
                                        <div>
                                          <Label>Status</Label>
                                          <input type="text" className="form-control" disabled value={value.STAT}/>
                                        </div>
                                        <div className="mt-3">
                                          <Label>Reserved Until</Label>
                                          <input type="text" className="form-control" disabled value={value.RU}/>
                                        </div>
                                      </Col>
                                      <Col md="1"/>
                                    </div>
                                      <div className="row mt-2">
                                        <Col md="1"/>
                                        <Col md="5">
                                          <Label>Contact Name</Label>
                                          <input type="text" className="form-control" disabled value={value.NCON}/>
                                        </Col>
                                        <Col md="5">
                                          <Label>Contact Number</Label>
                                          <input type="text" className="form-control" disabled value={value.CTEL}/>
                                        </Col>
                                        <Col md="1"/>
                                      </div>
                                    </div>
                                  })}
                                </div>);
                            }
                            return html;
                          })}
                        </div>

                        <Button
                          size="md"
                          color="primary"
                          onClick={() => this.numberReserve()}
                          className="mt-3"
                          disabled={this.state.type === "reserve"}>Reserve </Button>
                      </div> :
                      ""
                    }
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

export default connect((state) => ({somos: state.auth.profile.somos}))(withLoadingAndNotification(NumberSearch));
