import React from 'react';
import {Button, Card, CardBody, CardHeader, Col, FormGroup, FormText, Input, Label,
  Modal, ModalBody, ModalFooter, ModalHeader, Nav, NavItem, NavLink, Row, TabContent, TabPane
} from "reactstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import classnames from "classnames";

function renderMixin(Component) {
  return class Render extends Component {
    render() {
      return (
        <div className="animated fadeIn mt-1">
          <Label className="ml-1"><strong style={{fontSize: 25}}>Template Admin Data</strong></Label>
          <Row>
            <Col xs="12">
              <Card>
                <div className="mt-3 mb-1 ml-4 mr-4" style={{backgroundColor: '#dfe1e3'}}>
                  <Row className="mt-2 ml-4 mr-4 pb-1">
                    <Col xs="12" md="6" className="row">
                      <Label className="col-5 font-weight-bold">Template Name *:</Label>
                      <Input className="col-4 form-control-sm" type="text" name="template" id="template" onChange={(ev) => this.handle(ev)} value={this.state.template}/>
                    </Col>
                    <Col xs="12" md="6" className="row">
                      <Label className="col-5 font-weight-bold">Eff.Date/Time/Status:</Label>
                      {!this.state.dates.length ?
                        <Input className="col-5 form-control-sm" type="text" name="sfed" id="sfed" onChange={(ev) => this.handle(ev)} value={this.state.sfed}/> :
                        <select className="col-5 form-control-sm" name="sfed" id="sfed" onChange={(ev) => this.handle(ev)} value={this.state.sfed}>
                          <>{this.state.dates.map(value => {return <option key={value}>{value}</option>})}</>
                        </select>
                      }
                    </Col>
                  </Row>
                </div>
                <div className="mb-1 ml-4 mr-4" style={{backgroundColor: '#dfe1e3'}}>
                  <Row className="mb-1 ml-4 mr-4 mt-2 pb-1">
                    <Col xs="12" md="3" className="row">
                      <Label className="col-6 font-weight-bold text-right">Resp Org:</Label>
                      <Input className="col-6 form-control-sm" type="text" name="ro" id="ro" onChange={(ev) => this.handle(ev)} value={this.state.ro} disabled={this.state.disable}/>
                    </Col>
                    <Col xs="12" md="3" className="row">
                      <Label className="col-6 text-right">Approval:</Label>
                      <Input className="col-6 form-control-sm" type="text" name="approval" id="approval" onChange={(ev) => this.handle(ev)} value={this.state.approval} disabled={this.state.disable}/>
                    </Col>
                    <Col xs="12" md="3" className="row">
                      <Label className="col-6 text-right">Last:</Label>
                      <Input className="col-6 form-control-sm" type="text" name="last" id="last" onChange={(ev) => this.handle(ev)} value={this.state.last} disabled={this.state.disable}/>
                    </Col>
                    <Col xs="12" md="3" className="row">
                      <Label className="col-6 text-right">Prev User:</Label>
                      <Input className="col-6 form-control-sm" type="text" name="prev_user" id="prev_user" onChange={(ev) => this.handle(ev)} value={this.state.prev_user} disabled={this.state.disable}/>
                    </Col>
                  </Row>
                </div>
                <div className="mb-1 ml-4 mr-4 mt-1 mb-1" style={{backgroundColor: '#dfe1e3'}}>
                  <div style={{backgroundColor: '#9a9ea3'}}>
                    <Label className="ml-3 mt-1 mb-1 font-weight-bold">Template Info</Label>
                  </div>
                  <Col xs="12" md="8" className="row mr-4 ml-4 mt-2">
                    <Label className="col-3 font-weight-bold">Template ID:</Label>
                    <Input className="col-3 form-control-sm" type="text" name="tem_id" id="tem_id" value={this.state.tem_id} onChange={(ev) => this.handle(ev)} disabled={this.state.disable}/>
                  </Col>
                  <Col xs="12" md="8" className="row mr-4 ml-4 mt-1 mb-2">
                    <Label className="col-3 font-weight-bold">Template Description:</Label>
                    <Input className="col-9 form-control-sm" type="text" name="description" id="description" value={this.state.description} onChange={(ev) => this.handle(ev)} disabled={this.state.disable}/>
                  </Col>
                </div>
                <Row>
                  <Col md="6" xs="12">
                    <div className="ml-4" style={{backgroundColor: '#dfe1e3'}}>
                      <div style={{backgroundColor: '#9a9ea3'}}>
                        <Label className="ml-3 mt-1 mb-1 font-weight-bold">Action</Label>
                      </div>
                      <Row className="mt-3 mb-1 ml-4 pb-2">
                        <Col xs="2"><Label>Action:</Label></Col>
                        <Col xs="2"><Input type="select" className="form-control-sm " id="action" name="action" value={this.state.action} onChange={(ev)=> this.handle(ev)}>
                          <option value="N">N</option>
                          <option value="C">C</option>
                          <option value="X">X</option>
                          <option value="T">T</option>
                          <option value="D">D</option>
                          <option value="R">R</option></Input>
                        </Col>
                      </Row>
                    </div>
                    <div className="mb-1 ml-4" style={{backgroundColor: '#dfe1e3'}}>
                      <div style={{backgroundColor: '#9a9ea3'}}>
                        <Label className="ml-3 mb-1 font-weight-bold">Destination</Label>
                      </div>
                      <Row className="mt-3 mb-3 ml-4 pb-2">
                        <Col xs="2"><Label>#Line:</Label></Col>
                        <Col xs="2"><Input type="text" className="form-control-sm" id="line" name="line" value={this.state.line} onChange={(ev) => this.handle(ev)} disabled={this.state.disable}/></Col>
                      </Row>
                    </div>
                  </Col>
                  <Col md="6" xs="12">
                    <div className="mb-1 mr-4" style={{backgroundColor: '#dfe1e3'}}>
                      <div style={{backgroundColor: '#9a9ea3'}}>
                        <Label className="ml-3 mt-1 mb-1 font-weight-bold">Contact Information</Label>
                      </div>
                      <Row className="mt-1 mr-4">
                        <Label className="col-4 text-right">Contact Person:</Label>
                        <Input className="col-8 text-left form-control-sm" type="text" name="ncon" id="ncon" onChange={(ev) => this.handle(ev)} value={this.state.ncon} disabled={this.state.disable}/>
                      </Row>
                      <Row className="mt-1 mr-4">
                        <Label className="col-4 text-right">Contact Number:</Label>
                        <Input className="col-8 text-left form-control-sm" type="text" name="ctel" id="ctel" onChange={(ev) => this.handle(ev)} value={this.state.ctel} disabled={this.state.disable}/>
                      </Row>
                      <Row className="mt-1 mb-1 mr-4 pb-2">
                        <Label className="col-4 text-right">Notes:</Label>
                        <Input className="col-8 text-left form-control-sm" type="textarea" name="notes" id="notes" onChange={(ev) => this.handle(ev)} value={this.state.notes} disabled={this.state.disable}/>
                      </Row>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6" xs="12">
                    <div className="mb-1 ml-4" style={{backgroundColor: '#dfe1e3'}}>
                      <div style={{backgroundColor: '#9a9ea3'}}>
                        <Label className="ml-3 mt-1 mb-1 font-weight-bold">Area of Service</Label>
                      </div>
                      <div className="ml-2 mr-2 mt-1 mb-1 pb-2">
                        <Nav tabs className="custom">
                          {this.renderNavbar("1", "Networks", false)}
                          {this.renderNavbar("2", "States", false)}
                          {this.renderNavbar("3", "NPAs", false)}
                          {this.renderNavbar("4", "LATAs", false)}
                          {this.renderNavbar("5", "Labels", false)}
                        </Nav>
                        <TabContent activeTab={this.state.activeTab}>
                          <TabPane tabId="1">
                            <Input type="text" name="network" id="network" onChange={(ev) => this.handle(ev)} placeholder="Networks" value={this.state.network} disabled={this.state.disable}/>
                          </TabPane>
                          <TabPane tabId="2">
                            <Input type="text" name="state" id="state" onChange={(ev) => this.handle(ev)} placeholder="States" value={this.state.state} disabled={this.state.disable}/>
                          </TabPane>
                          <TabPane tabId="3">
                            <Input type="text" name="npa" id="npa" onChange={(ev) => this.handle(ev)} placeholder="NPAs" value={this.state.npa} disabled={this.state.disable}/>
                          </TabPane>
                          <TabPane tabId="4">
                            <Input type="text" name="lata" id="lata" onChange={(ev) => this.handle(ev)} placeholder="LATAs" value={this.state.lata} disabled={this.state.disable}/>
                          </TabPane>
                          <TabPane tabId="5">
                            <Input type="text" name="label" id="label" onChange={(ev) => this.handle(ev)} placeholder="Labels" value={this.state.label} disabled={this.state.disable}/>
                          </TabPane>
                        </TabContent>
                      </div>
                    </div>
                  </Col>
                  <Col md="6" xs="12">
                    <div className="mr-4" style={{backgroundColor: '#dfe1e3'}}>
                      <div style={{backgroundColor: '#9a9ea3'}}>
                        <Label className="ml-3 mt-1 mb-1 font-weight-bold">Carriers</Label>
                      </div>
                      <div className="row mt-4 mb-4 pb-4">
                        <Col lg="6">
                          <FormGroup row>
                            <Label className="col-6 text-right font-weight-bold">IntraLATA:</Label>
                            <textarea className="col-6 text-left form-control" name="iac" id="iac" rows={3} onChange={(ev) => this.handle(ev)} value={this.state.iac} disabled={this.state.disable}/>
                          </FormGroup>
                        </Col>
                        <Col lg="6">
                          <FormGroup row>
                            <Label className="col-6 font-weight-bold">InterLATA:</Label>
                            <textarea className="col-6 text-left form-control rht-20" name="iec" id="iec" rows={3} onChange={(ev) => this.handle(ev)} value={this.state.iec} disabled={this.state.disable}/>
                          </FormGroup>
                        </Col>
                      </div>
                    </div>
                  </Col>
                </Row>
                <div className="ml-4 mr-4" style={{backgroundColor: '#dfe1e3'}}>
                  <div className="row mt-2 mb-2">
                    <Label className="col-2 text-right">Message:</Label>
                    <Input className="col-8" type="textarea" name="message" id="message" onChange={(ev) => this.handle(ev)} value={this.state.message} disabled={this.state.disable}/>
                  </div>
                </div>
                <div className="ml-4 mr-4 mb-2 mt-2">
                  <Row>
                    <Col xs="12" md="7">
                    <Button size="md" color="primary" className="mr-2" disabled={this.state.retrieve} onClick={() => this.retrieve_template(this.state.template, this.state.sfed)}>Retrieve</Button>
                      <Button size="md" color="primary" className="mr-2" disabled={this.state.update} onClick={()=>this.update_tad(this.state.copy_cpr, this.state.copy_lad, this.state.copy_cr)}>Update</Button>
                      <Button size="md" color="primary" className="mr-2" disabled={this.state.create} onClick={()=>this.create_tad(this.state.copy_cpr, this.state.copy_lad, this.state.copy_cr)}>Create</Button>
                      <Button size="md" color="primary" className="mr-2" onClick={this.toggleLarge}>Copy</Button>
                      <Button size="md" color="primary" className="mr-2" disabled={this.state.transfer} onClick={this.toggleTran}>Transfer</Button>
                      <Button size="md" color="primary" disabled={this.state.delete} onClick={this.toggleDelete}>Delete</Button>
                    </Col>
                    <Col xs="12" md="5" className="text-right">
                      <Button size="md" color="danger" className="mr-2" disabled={this.state.cpr} onClick={this.goCpr}>CPR</Button>
                      <Button size="md" color="danger" className="mr-2" disabled={this.state.lad} onClick={this.goLad}>LAD</Button>
                      {/*<Button size="md" color="danger" className="mr-2" disabled={this.state.rec}>TEC</Button>*/}
                      <Button size="md" color="danger" className="mr-2" onClick={this.clear}>Clear</Button>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Col>
          </Row>
          {this.renderCopyModal()}
          {this.renderDeleteModal()}
          {this.renderTransferModal()}
        </div>
      );
    }

    renderCopyModal = () => (
      <Modal isOpen={this.state.large} toggle={this.toggleLarge} className={'modal-lg ' + this.props.className}>
        <ModalHeader toggle={this.toggleLarge}>Copy Template Record</ModalHeader>
        <ModalBody>
          <FormGroup row>
            <Col xs="6">
              <Card>
                <CardHeader>Source Record</CardHeader>
                <CardBody>
                  <Label htmlFor="template">Template:</Label>
                  <Input type="text" name="template" id="template" value={this.state.template} disabled/>
                  <Label htmlFor="sfed">Effective Date/Time</Label>
                  <Input type="text" name="sfed" id="sfed" value={this.state.ed_origin + " " + this.state.et_origin} disabled/>
                </CardBody>
              </Card>
            </Col>
            <Col xs="6">
              <Card>
                <CardHeader>Target Record</CardHeader>
                <CardBody>
                  <Label htmlFor="copy_template">Template: </Label>
                  <Input type="text" name="copy_template" id="copy_template" onChange={(ev) => this.handle(ev)} value={this.state.copy_template}/>
                  <Label htmlFor="et_copy">Effective Date/Time</Label>
                  <Row>
                    <Col xs="7">
                      <DatePicker dateFormat="MM/DD/YY hh:mmA/C" selected={this.state.copy_sfed} showTimeSelect timeIntervals={15} onChange={this.copyDate} className="form-control"
                                  timeCaption="time"/>
                    </Col>
                    <div className="form-check align-content-center">
                      <Input type="checkbox" className="form-check-input" id="copy_now" name="copy_now" onChange={this.handleCheck} checked={this.state.copy_now}/>
                      <label className="form-check-label" htmlFor="copy_cr"> NOW</label>
                    </div>
                  </Row>
                  {this.state.isCopyDate && this.renderFeedback("Please input effective Date / Time!")}
                </CardBody>
              </Card>
            </Col>
          </FormGroup>
          <div className="row">
            <Col xs="3"/>
            <Col xs="6">
              <Card>
                <CardHeader>Copy Portions from Source Record</CardHeader>
                <CardBody className="ml-lg-5">
                  <div className="form-check align-content-center">
                    <Input type="checkbox" className="form-check-input" id="copy_cr" name="copy_cr" onChange={(ev)=> this.handleCheck(ev)}/>
                    <label className="form-check-label" htmlFor="copy_cr"> CR Basic Data</label>
                  </div>
                  <div className="form-check">
                    <Input type="checkbox" className="form-check-input" id="copy_lad" name="copy_lad" onChange={(ev)=> this.handleCheck(ev)} disabled={this.state.is_lad}/>
                    <label className="form-check-label" htmlFor="copy_lad"> LAD</label>
                  </div>
                  <div className="form-check">
                    <Input type="checkbox" className="form-check-input" id="copy_cpr" name="copy_cpr" onChange={(ev)=> this.handleCheck(ev)} disabled={this.state.is_cpr}/>
                    <label className="form-check-label" htmlFor="copy_cpr"> CPR</label>
                  </div>
                  {this.state.isCopyPortion && this.renderFeedback("Please select portions!")}
                </CardBody>
              </Card>
            </Col>
            <Col xs="3"/>

          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="submit" size="md" color="primary" className="mr-2" onClick={this.copy_tad}> Copy</Button>
          <Button type="reset" size="md" color="danger" onClick={this.toggleLarge}> Cancel</Button>
        </ModalFooter>
      </Modal>
    );

    renderTransferModal = () => (
      <Modal isOpen={this.state.isTran} toggle={this.toggleTran} className={'modal-lg ' + this.props.className}>
        <ModalHeader toggle={this.toggleTran}>Transfer Template Record</ModalHeader>
        <ModalBody>
          <FormGroup row>
            <Col xs="6">
              <Card>
                <CardHeader>Source Record</CardHeader>
                <CardBody>
                  <Label htmlFor="num">Template:</Label>
                  <Input type="text" value={this.state.template} disabled/>
                  <Label htmlFor="et_origin">Effective Date/Time</Label>
                  <Input type="text" value={this.state.ed_origin + " " + this.state.et_origin} disabled/>
                </CardBody>
              </Card>
            </Col>
            <Col xs="6">
              <Card>
                <CardHeader>Target Record</CardHeader>
                <CardBody>
                  <Label htmlFor="copy_template">Template: </Label>
                  <Input type="text" name="copy_template" id="copy_template" onChange={(ev) => this.handle(ev)} value={this.state.template}/>
                  <Label htmlFor="et_copy">Effective Date/Time</Label>
                  <Row>
                    <Col xs="7">
                      <DatePicker dateFormat="MM/DD/YY hh:mmA/C" selected={this.state.transfer_sfed} showTimeSelect timeIntervals={15} onChange={this.transferDate} className="form-control"
                                  timeCaption="time"/>
                    </Col>
                    <div className="form-check align-content-center">
                      <Input type="checkbox" className="form-check-input" id="transfer_now" name="transfer_now" onChange={this.handleCheck} checked={this.state.transfer_now}/>
                      <label className="form-check-label" htmlFor="copy_cr"> NOW</label>
                    </div>
                  </Row>
                  {this.state.isTransferDate && this.renderFeedback("Please input effective Date / Time!")}
                </CardBody>
              </Card>
            </Col>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button type="submit" size="md" color="primary" className="mr-2" onClick={this.transferTad}> Transfer</Button>
          <Button type="reset" size="md" color="danger" onClick={this.toggleTran}> Cancel</Button>
        </ModalFooter>
      </Modal>
    );

    renderDeleteModal = () => (
      <Modal isOpen={this.state.toggle_delete} toggle={this.toggleDelete} className={'modal-lg ' + this.props.className}>
        <ModalHeader toggle={this.toggleDelete}>Delete TAD</ModalHeader>
        <ModalBody>
          <FormGroup row>
            <Col xs="6">
              <Card>
                <CardHeader>Source Record</CardHeader>
                <CardBody>
                  <Label htmlFor="num">Template:</Label>
                  <Input type="text" value={this.state.template} disabled/>
                  <Label>Effective Date/Time</Label>
                  <Input type="text" value={this.state.ed_origin + " " + this.state.et_origin} disabled/>
                </CardBody>
              </Card>
            </Col>
            <Col xs="6">
              <Card>
                <CardHeader>Target Record</CardHeader>
                <CardBody>
                  <Label htmlFor="copy_template">Template: </Label>
                  <Input type="text" name="copy_template" id="copy_template" onChange={(ev) => this.handle(ev)} value={this.state.template}/>
                  <Label htmlFor="et_copy">Effective Date/Time</Label>
                  <Row>
                    <Col xs="7">
                      <DatePicker dateFormat="MM/DD/YY hh:mmA/C" selected={this.state.delete_sfed}
                                  showTimeSelect timeIntervals={15} onChange={this.deleteDate}
                                  className="form-control" timeCaption="time"/>
                    </Col>
                    <div className="form-check align-content-center">
                      <Input type="checkbox" className="form-check-input" id="delete_now" name="delete_now" onChange={this.handleCheck} checked={this.state.delete_now}/>
                      <label className="form-check-label" htmlFor="copy_cr"> NOW</label>
                    </div>
                  </Row>
                  {this.state.isDeleteDate && this.renderFeedback("Please input effective Date / Time!")}
                </CardBody>
              </Card>
            </Col>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button size="md" color="primary" className="mr-2" onClick={this.deleteTad}> Delete</Button>
          <Button size="md" color="danger" onClick={this.toggleDelete}> Cancel</Button>
        </ModalFooter>
      </Modal>
    );

    renderFeedback = (text) => (
      <FormText><span style={{color: 'red'}}>{text}</span></FormText>
    );

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
            <th className="text-center">Definition</th>
            <th className="text-center">Definition</th>
            <th className="text-center">Definition</th>
          </tr>
          </thead>
          <tbody>
          {data.map((value, i) => {return (<tr>
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
  };
}

export default renderMixin;
