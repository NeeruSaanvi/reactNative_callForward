import produce from "immer";
import Cookies from "universal-cookie";
import {approval_type, copyTad, create_template, deleteTad, disconnect_template, state_value, temp, template_list, validLAD} from "../../../service/template";
import RestApi from "../../../service/RestApi";
import {timeout} from "../../../service/customer";
import {error_customer_query_message, error_template_query_message} from "../../../service/error_message";
import {cleanLocalStorage, delete_cell, fixed_date, handle_change, handle_lad, handle_value_cpr, insert_cell, push_cpr} from "../../../utils";
import {Type} from "../../../constants/Notifications";
const MgiMessage = require('../../../MgiMessage/MgiMessage').MgiMessage;
let origin_sfed = '';

function methodMixin(Component) {
  return class Method extends Component {
    constructor(props) {
      super(props);
      this.state = {
        activeTab: '1',
        template: "",
        isTem: false,
        sfed: '',
        ed: "",
        et: '',
        ro: '',
        approval: '',
        last: '',
        prev_user: '',
        by: '',
        action: 'N',
        ddt: '',
        agent: '',
        directory: '',
        dau: '',
        tem_id: '',
        dat: '',
        list_name: '',
        list_address: '',
        ncon: '',
        ctel: '',
        notes: '',
        description: '',
        network: '',
        state: '',
        npa: '',
        lata: '',
        tel: '',
        label: '',
        iec: '',
        iac: '',
        lns: '',
        line: '',
        message: '',
        isDate: false,
        retrieve: false,
        update: true,
        create: false,
        copy: true,
        transfer: true,
        delete: true,
        cpr: false,
        lad: false,
        rec: false,
        revert: true,
        disable: false,
        large: false,
        ed_origin: "",
        et_origin: '',
        toggle_delete: false,
        isLad: false,
        isCpr: false,
        timezone: '',
        ds: '',
        isTran: false,
        gridArea: Array(7).fill(Array(8).fill('')),
        gridDate: Array(7).fill(Array(8).fill('')),
        gridLATA: Array(7).fill(Array(8).fill('')),
        gridNXX: Array(7).fill(Array(8).fill('')),
        gridState: Array(7).fill(Array(8).fill('')),
        gridTel: Array(7).fill(Array(8).fill('')),
        gridTime: Array(7).fill(Array(8).fill('')),
        gridTD: Array(7).fill(Array(8).fill('')),
        gridSD: Array(7).fill(Array(8).fill('')),
        gridType: Array(8).fill(''),
        gridData: Array(5).fill(Array(8).fill('')),
        iec_array: [],
        iac_array: [],
        dates: [],
        val: '',
        copy_template: '',
        copy_cr: false,
        copy_lad: false,
        copy_cpr: false,
        is_cpr: false,
        is_lad: false,
        is_cr: false,
        copy_now: false,
        transfer_now: false,
        delete_now: false,
        copy_sfed: null,
        transfer_sfed: null,
        delete_sfed: null,
        disconnect_sfed: '',
        isCopyDate: false,
        isCopyPortion: false,
        isDeleteDate: false,
        isTransferDate: false,
        search: '',
      };

      this.initialState = produce(this.state, (r) => {});
    }
    lad_window = null;
    cpr_window = null;

    componentDidMount = () => {
      window.close();
      this.lad_window !== null && this.lad_window.close();
      this.cpr_window !== null && this.cpr_window.close();
      cleanLocalStorage("LAD");
      cleanLocalStorage("CPR");
      localStorage.setItem("template", "");
      this.setItem();
      const cookies = new Cookies();
      let template = cookies.get("template");
      let ed = cookies.get("ed");
      let et = cookies.get("et");
      if (template && ed && et) {
        this.setState({template, ed, et});
        cookies.remove("template");
        cookies.remove("ed");
        cookies.remove("et");
        this.getTemplateRecord(template, ed + " " + et);
      }
    };

    setItem = () => {
      window.addEventListener("storage", (ev) => {
        let state = {};
        let newValue = ev.newValue.includes(",,") ? '{}' : ev.newValue;
        state[ev.key] = JSON.parse(newValue);
        this.setState(state);
      });
    };
    //get template record with sefd.
    getTemplateRecord = async (template, sfed) => {
      let message = temp(this.props.somos.id, this.props.somos.selectRo, template, sfed);
      console.log(message);
      let res = await this.props.callApi2(RestApi.sendRequestNew, {'mod': 'CRV', 'message': message, 'timeout': timeout});
      if (res.ok && res.data && res.data.message) {
        console.log(res.data.message);
        const message = new MgiMessage(res.data.message);
        message.value("ERR")[0]
          ? this.setState({disable: false, action: "N", message: error_customer_query_message(message.value("ERR")[0])})
          : message.value("ERR1")[0] ? this.setState({message: error_customer_query_message(message.value("ERR1")[0])}) : this.setState({
            message: "TAD retrieved successfully!",
            disable: true,
            action: "C",
            update: false,
            create: true,
            copy: true
          });
        if (state_value(message.value("STAT")[0].toString()) === "ACTIVE") {
          this.setState({copy: false, update: false, create: true, transfer: true, delete: true})
        } else {
          this.setState({copy: false, update: true, create: true, transfer: false, delete: false})
        }

        let iec = "", iac = "", net = "";
        // Remove the first element in array
        if (message.value("IEC")[0]) {
          iec = message.value("IEC")[0].split(",");
          iec = iec.splice(1, iec.length - 1);
        }
        if (message.value("IAC")[0]) {
          iac = message.value("IAC")[0].split(",");
          iac = iac.splice(1, iac.length - 1);
        }
        if (message.value("ANET")[0]) {
          net = message.value("ANET")[0].split(",");
          net = net.splice(1, net.length - 1);
        }

        message.value("NODE")[0] ? this.setState({is_cpr: false}) : this.setState({is_cpr: true});
        message.value("CNT12")[0] ? this.setState({is_lad: false}) : this.setState({is_lad: true});
        let lts = [], acs = [], dts = [], sts = [], nxs = [], tis = [], sds = [], tds = [], tel = [];
        //Push the data in 2d array for LAD.
        let values = message.value(["TYPE", "DEF", "LBL"]);
        console.log(values);
        for (let i = 0; i < values.length; i++) {
          let value = values[i];
          if (value.TYPE === "LT") lts = push_cpr(lts, value);
          else if (value.TYPE === "SD") sds = push_cpr(sds, value);
          else if (value.TYPE === "AC") acs = push_cpr(acs, value);
          else if (value.TYPE === "DT") dts = push_cpr(dts, value);
          else if (value.TYPE === "ST") sts = push_cpr(sts, value);
          else if (value.TYPE === "NX") nxs = push_cpr(nxs, value);
          else if (value.TYPE === "TI") tis = push_cpr(tis, value);
          else if (value.TYPE === "TD") tds = push_cpr(tds, value);
          else if (value.TYPE === "TE") tel = push_cpr(tel, value);
        }
        if (lts && lts.length) {
          this.setState({gridLATA: lts, isLATA: true});
          localStorage.setItem("gridLATA", JSON.stringify(lts))
          localStorage.setItem("isLATA", "1");
        }
        if (sds && sds.length) {
          this.setState({gridSD: sds, isSD: true});
          localStorage.setItem("gridSD", JSON.stringify(sds))
          localStorage.setItem("isSD", "1");
        }
        if (acs && acs.length) {
          this.setState({gridArea: acs, isArea: true});
          localStorage.setItem("gridArea", JSON.stringify(acs))
          localStorage.setItem("isArea", "1");
        }
        if (dts && dts.length) {
          this.setState({gridDate: dts, isDate: true});
          localStorage.setItem("gridDate", JSON.stringify(dts))
          localStorage.setItem("isDate", "1");
        }
        if (sts && sts.length) {
          this.setState({gridState: sts, isState: true});
          localStorage.setItem("gridState", JSON.stringify(sts))
          localStorage.setItem("isState", "true");
        }
        if (nxs && nxs.length) {
          this.setState({gridNXX: nxs, isNXX: true});
          localStorage.setItem("gridNXX", JSON.stringify(nxs))
          localStorage.setItem("isNXX", "1");
        }
        if (tis && tis.length) {
          this.setState({gridTime: tis, isTime: true});
          localStorage.setItem("gridTime", JSON.stringify(tis))
          localStorage.setItem("isTime", "1");
        }
        if (tds && tds.length) {
          this.setState({gridTD: tds, isTD: true});
          localStorage.setItem("gridTD", JSON.stringify(tds))
          localStorage.setItem("isTD", "1");
        }
        if (tel && tel.length) {
          this.setState({gridTel: tel, isTel: true});
          localStorage.setItem("gridTel", JSON.stringify(tel))
          localStorage.setItem("isTel", "1");
        }
        let types = message.value("NODE")[0];
        let datas = message.value("V");
        let newArray = this.state.gridType.map(function (arr) {
          return arr.slice();
        });
        let newData = [];
        if (datas.length <= 8) newData = this.state.gridData.map(function (arr) {return arr.slice()});
        else newData = new Array(datas.length).fill(new Array(8).fill(''));

        if (types && datas) {
          types = types.split(",");
          for (let i = 1; i < types.length; i++) {newArray[i - 1] = types[i];}
          for (let i = 0; i < datas.length; i++) {
            let data = datas[i].split(",");
            let newDataI = new Array(8).fill('');
            for (let j = 0; j < data.length; j++) {newDataI[j] = data[j];}
            newData[i] = newDataI.slice(0);
          }
        }
        let dates = this.state.dates;
        if (dates === []) {
          dates.push(message.value("ED")[0] + " " + message.value("ET")[0] + " " + state_value(message.value("STAT")[0].toString()));
          this.setState({dates: dates});
        } else if (dates.length === 1) {
          let newDate = [];
          newDate.push(message.value("ED")[0] + " " + message.value("ET")[0] + " " + state_value(message.value("STAT")[0].toString()));
          this.setState({dates: newDate});
        }
        localStorage.setItem("gridType", JSON.stringify(newArray));
        localStorage.setItem("gridData", JSON.stringify(newData));
        localStorage.setItem("template", message.value("TMPLTNM")[0]);
        localStorage.setItem("iec", JSON.stringify(iec));
        localStorage.setItem("iac", JSON.stringify(iac));
        localStorage.setItem("disable", this.state.disable ? "1" : "0");
        this.setState({
          ncon: message.value("NCON")[0], ctel: message.value("CTEL")[0], ro: message.value("CRO")[0], approval: approval_type(message.value("APP")[0]),
          tem_id: message.value("TMPLTID")[0], template: message.value("TMPLTNM")[0], copy_template: message.value("TMPLTNM")[0], description: message.value("DESCRIP")[0],
          sfed: message.value("ED")[0] + " " + message.value("ET")[0] + " " + state_value(message.value("STAT")[0].toString()), notes: message.value("NOTE")[0],
          network: net.toString(), message: error_customer_query_message(message.value("ERR")[0]), line: message.value("LNS")[0], iec: iec.join(',\n'), iac: iac.join(',\n'),
          iec_array: iec, iac_array: iac, ed_origin: message.value("ED")[0], et_origin: message.value("ET")[0], timezone: message.value("Z")[0], ds: message.value("DS")[0],
          gridType: newArray, gridData: newData
        });
        origin_sfed = message.value("ED")[0] + " " + message.value("ET")[0];
      }
    };

    //Retrieve template
    retrieve_template = async (template, sfed) => {
      if (!this.props.somos.id || !this.props.somos.selectRo) {
        this.props.showNotification(Type.ERROR, "You can't retrieve template without ID and RO!");
        return false;
      }
      if (!template) {
        this.props.showNotification(Type.WARNING, "Please input template!");
        return false;
      }

      if (sfed === "") {
        let message = template_list(this.props.somos.id, this.props.somos.selectRo, template.substring(1, 3), template);
        console.log(message);
        let data = [], params = {};
        let res = await this.props.callApi2(RestApi.sendRequestNew, {'mod': 'TRL', 'message': message, 'timeout': timeout});
        if (res.ok && res.data && res.data.message) {
          console.log(res.data.message);
          let sf = [];
          //Convert response message to MGI message
          let message = new MgiMessage(res.data.message);
          let datas = message.value(["TMPLTNM", "ED", "ET"]);
          for (let i = 0; i < datas.length; i++) {
            if (template.trim() === datas[i].TMPLTNM.trim()) {
              params = {
                'template_name': datas[i].TMPLTNM.trim(),
                'date': datas[i].ED + " " + datas[i].ET
              };
              data.push(params);
            }
          }
          if (data.length === 1) {
            this.getTemplateRecord(template, data[0].date);
            this.setState({copy: false, update: true, create: false})
          } else if (data.length === 0) {
            this.setState({message: "Template does not exist. Please create template here", loading: false, action: "N", disable: false, update: true, create: false})
          } else {
            for (let i = 0; i < data.length; i++) {
              message = temp(this.props.somos.id, this.props.somos.selectRo, data[i].template_name, data[i].date);
              let res = await this.props.callApi2(RestApi.sendRequestNew, {'mod': 'CRV', 'message': message, 'timeout': timeout});
              if (res.ok && res.data && res.data.message) {
                let message = new MgiMessage(res.data.message);
                if(message.value("STAT").toString() === "ACTIVE") {
                  sf.push(message.value("ED")[0] + " " + message.value("ET")[0] + " " + state_value(message.value("STAT").toString()));
                }
                if (message.value("ED")[0] + " " + message.value("ET")[0] === data[data.length - 1].date) {
                  this.getTemplateRecord(template, message.value("ED")[0] + " " + message.value("ET")[0]);
                  this.setState({sfed: message.value("ED")[0] + " " + message.value("ET")[0] + " " + state_value(message.value("STAT").toString())})
                }
              }
            }
            this.setState({dates: sf});
          }
        }
      } else {
        this.getTemplateRecord(template, sfed);
      }
    };
    //Copy template
    update_tad = async (cpr, lad, cr) => {
      this.setState({large: false});
      let lads = validLAD(this.state.gridArea, this.state.gridDate, this.state.gridLATA, this.state.gridNXX, this.state.gridState, this.state.gridTel, this.state.gridTime, this.state.gridTD, this.state.gridSD);
      let types = this.state.gridType.filter(function (el) {
        return el !== ""
      });
      let message;
      if (this.state.action === "N") {
        if (this.state.template.length === 0) {
          this.setState({message: "Please input template!"});
          return false;
        }
        if (this.state.sfed.length === 0) {
          this.setState({message: "Please input effective date and time"});
          return false;
        }
        if (this.state.iec.length === 0) {
          this.setState({message: "Please input Interlata carrier!"});
          return false;
        }
        if (this.state.iac.length === 0) {
          this.setState({message: "Please input Intralata carrier"});
          return false;
        }
        if (this.state.ncon.length === 0) {
          this.setState({message: "Please input contact name"});
          return false;
        }
        message = create_template(this.props.somos.id, this.props.somos.selectRo, this.state.action, this.state.ro, this.state.template, this.state.sfed, this.state.iec, this.state.iac, this.state.notes, this.state.ncon, this.state.ctel, this.state.label, this.state.lata, this.state.network, this.state.state, this.state.line, lads, types, this.state.gridData, this.state.description);
      } else if (this.state.action === "C") {
        message = copyTad(this.props.somos.id, this.props.somos.selectRo, this.state.action, this.state.copy_template, this.state.sfed,
          this.state.sfed, this.state.iec, this.state.iac, this.state.notes, this.state.ncon, this.state.ctel, this.state.label,
          this.state.lata, this.state.network, this.state.state, this.state.line, lads, types, this.state.gridData, cr, cpr, lad, this.state.description);
        } else if (this.state.action === "D") {
        message = disconnect_template(this.props.somos.id, this.props.somos.selectRo, this.state.action, this.state.template, this.state.sfed, origin_sfed);
      } else if (this.state.action === "R") {
        message = create_template(this.props.somos.id, this.props.somos.selectRo, this.state.action, this.state.ro, this.state.template, this.state.sfed, this.state.iec, this.state.iac, this.state.notes, this.state.ncon, this.state.ctel, this.state.label, this.state.lata, this.state.network, this.state.state, this.state.line, lads, types, this.state.gridData, this.state.description);
      }
      this.setState({loading: true});
      console.log(message);
      let res = await this.props.callApi2(RestApi.sendRequestNew, {'mod': 'TRC', 'message': message, 'timeout': timeout});
      if (res.ok && res.data && res.data.message) {
        console.log(res.data.message);
        const message = new MgiMessage(res.data.message);
        let state = '';
        this.setState({ddt: message.value("ED")[0], ed_origin: message.value("ED")[0], et_origin: message.value("ET")[0]});
        message.value("STAT")[0] ? state = state_value(message.value("STAT")[0].toString()) : state = "PENDING";
        let dates = [], date = '';
        if (this.state.action === "N") {
          if (message.value("ERR")[0]) {
            date = message.value("ED")[0] + " " + message.value("ET")[0] + " FAILED";
            dates.push(date);
            this.setState({message: error_template_query_message(message.value("ERR")[0]), disable: false, dates: dates, sfed: date,})
          } else {
            date = message.value("ED")[0] + " " + message.value("ET")[0] + " " + state;
            dates.push(date);
            this.setState({message: "TAD create successfully!", disable: true, dates: dates, sfed: date,})
          }
        } else if (this.state.action === "C") {
          dates = this.state.dates;
          dates.pop();
          if (message.value("ERR")[0]) {
            date = message.value("ED")[0] + " " + message.value("ET")[0] + " FAILED";
            dates.push(date);
            this.setState({message: error_template_query_message(message.value("ERR")[0]), disable: false, dates: dates, sfed: date,})
          } else {
            date = message.value("ED")[0] + " " + message.value("ET")[0] + " " + state;
            dates.push(date);
            this.setState({message: "TAD update successfully!", disable: true, dates: dates, sfed: date, transfer: false, delete: false})
          }
        } else if (this.state.action === "D") {
          message.value("ERR")[0] ? this.setState({message: error_template_query_message(message.value("ERR")[0])}) : this.setState({message: "TAD disconnect successfully!"});
          if (!message.value("ERR")[0]) {
            this.setState({dates: [], sfed: '', ncon: '', ctel: '', notes: '', iec: '', iac: '', network: '', lns: '', ro: '', approval: '', tem_id: '', description: ''})
          }
        } else if (this.state.action === "R") {
        }
      }
    };

    create_tad = async (cpr, lad, cr) => {
      this.setState({large: false});
      let lads = validLAD(this.state.gridArea, this.state.gridDate, this.state.gridLATA, this.state.gridNXX, this.state.gridState, this.state.gridTel, this.state.gridTime, this.state.gridTD, this.state.gridSD);
      let types = this.state.gridType.filter(function (el) {
        return el !== ""
      });
      let message;
      if (this.state.action === "N") {
        if (this.state.template.length === 0) {
          this.setState({message: "Please input template!"});
          return false;
        }
        if (this.state.sfed.length === 0) {
          this.setState({message: "Please input effective date and time"});
          return false;
        }
        if (this.state.iec.length === 0) {
          this.setState({message: "Please input Interlata carrier!"});
          return false;
        }
        if (this.state.iac.length === 0) {
          this.setState({message: "Please input Intralata carrier"});
          return false;
        }
        if (this.state.ncon.length === 0) {
          this.setState({message: "Please input contact name"});
          return false;
        }
        message = create_template(this.props.somos.id, this.props.somos.selectRo, this.state.action, this.state.ro, this.state.template, this.state.sfed, this.state.iec, this.state.iac, this.state.notes, this.state.ncon, this.state.ctel, this.state.label, this.state.lata, this.state.network, this.state.state, this.state.line, lads, types, this.state.gridData, this.state.description);
      } 
      this.setState({loading: true});
      let res = await this.props.callApi2(RestApi.sendRequestNew, {'mod': 'TRC', 'message': message, 'timeout': timeout});
      if (res.ok && res.data && res.data.message) {
        console.log(res.data.message);
        const message = new MgiMessage(res.data.message);
        let state = '';
        this.setState({ddt: message.value("ED")[0], ed_origin: message.value("ED")[0], et_origin: message.value("ET")[0]});
        message.value("STAT")[0] ? state = state_value(message.value("STAT")[0].toString()) : state = "PENDING";
        let dates = [], date = '';
        if (this.state.action === "N") {
          if (message.value("ERR")[0]) {
            date = message.value("ED")[0] + " " + message.value("ET")[0] + " FAILED";
            dates.push(date);
            this.setState({message: error_template_query_message(message.value("ERR")[0]), disable: false, dates: dates, sfed: date,})
          } else {
            date = message.value("ED")[0] + " " + message.value("ET")[0] + " " + state;
            dates.push(date);
            this.setState({message: "TAD create successfully!", disable: true, dates: dates, sfed: date,})
          }
        } 
      }
    };

    copy_tad = () => {
      if (!this.state.copy_sfed && !this.state.copy_now) {
        this.setState({isCopyDate: true});
        return false;
      }
      if (!this.state.copy_cr && !this.state.copy_lad && !this.state.copy_cpr) {
        this.setState({isCopyPortion: true});
        return false;
      }
      let date = fixed_date(this.state.copy_sfed, this.state.copy_now);
      let dates = this.state.dates;
      dates.push(date);
      localStorage.setItem("disable", "0");
      this.setState({dates: dates, sfed: date, large: false, action: "C", disable: false, update: false, create: true, copy: true, message: "TAD copy successfully!"});
      if (this.state.copy_template !== "" && this.state.copy_template !== this.state.template) {
        this.setState({template: this.state.copy_template});
      }

      !this.state.copy_cr && this.setState({lns: '', network: ''});
      !this.state.copy_lad && cleanLocalStorage("LAD");
      !this.state.copy_cpr && cleanLocalStorage("CPR");
    };

    deleteTad = async () => {
      if (!this.state.delete_sfed && !this.state.delete_now) {
        this.setState({isDeleteDate: true});
        return false;
      }
      let date = fixed_date(this.state.delete_sfed, this.state.delete_now);
      this.setState({toggle_delete: false});
      let lads = validLAD(this.state.gridArea, this.state.gridDate, this.state.gridLATA, this.state.gridNXX, this.state.gridState, this.state.gridTel, this.state.gridTime, this.state.gridTD, this.state.gridSD);
      let types = this.state.gridType.filter(function (el) {
        return el !== ""
      });
      let message = deleteTad(this.props.somos.id, this.props.somos.selectRo, this.state.action, this.state.template, date, "", this.state.description, this.state.iec, this.state.iac, this.state.notes, this.state.ncon, this.state.ctel, this.state.label, this.state.lata, this.state.network, this.state.state, this.state.line, lads, types, this.state.gridData);
      let res = await this.props.callApi2(RestApi.sendRequestNew, {'mod': 'TRC', 'message': message, 'timeout': timeout});
      if (res.ok && res.data && res.data.message) {
        console.log(res.data.message);
        const message = new MgiMessage(res.data.message);
        if (!message.value("ERR")[0]) {
          this.setState({message: "TAD delete successfully!", dates: [], sfed: '', disable: false,});
        } else {
          this.setState({message: error_template_query_message(message.value("ERR")[0]), disable: true,})
        }
      }
    };

    transferTad = async () => {
      if (!this.state.transfer_sfed && !this.state.transfer_now) {
        this.setState({isTransferDate: true});
        return false;
      }
      let date = fixed_date(this.state.transfer_sfed, this.state.transfer_now);
      this.setState({isTran: false});
      let lads = validLAD(this.state.gridArea, this.state.gridDate, this.state.gridLATA, this.state.gridNXX, this.state.gridState, this.state.gridTel, this.state.gridTime, this.state.gridTD, this.state.gridSD);
      let types = this.state.gridType.filter(function (el) {
        return el !== ""
      });
      let message = deleteTad(this.props.somos.id, this.props.somos.selectRo, this.state.action, this.state.copy_template, date, this.state.sfed, this.state.description, this.state.iec, this.state.iac, this.state.notes, this.state.ncon, this.state.ctel, this.state.label, this.state.lata, this.state.network, this.state.state, this.state.line, lads, types, this.state.gridData);
      this.setState({loading: true, action: "T"});
      let res = await this.props.callApi2(RestApi.sendRequestNew, {'mod': 'TRC', 'message': message, 'timeout': timeout});
      if (res.ok && res.data && res.data.message) {
        console.log(res.data.message);
        const message = new MgiMessage(res.data.message);
        let dates = this.state.dates;
        dates.push(message.value("ED")[0] + " " + message.value("ET")[0] + " PENDING");
        if (message.value("ERR")[0] === undefined) {
          this.setState({message: "TAD transfer successfully!", disable: true, dates: dates, sfed: message.value("ED")[0] + " " + message.value("ET")[0] + " PENDING"});
        } else {
          this.setState({message: error_template_query_message(message.value("ERR")[0]), disable: true})
        }
      }
    };

    clear = () => {
      cleanLocalStorage("LAD");
      cleanLocalStorage("CPR");
      localStorage.setItem("template", "");
      this.setState(this.initialState);
      this.setState({data: []})
    };
    copyDate = (date) => {
      this.setState({copy_sfed: date, isCopyDate: false, isCopyPortion: false});
    };
    transferDate = (date) => {
      this.setState({transfer_sfed: date, isTransferDate: false});
    };
    deleteDate = (date) => {
      this.setState({delete_sfed: date, isDeleteDate: false});
    };
    handle = (event) => {
      let state = {};
      state[event.target.name] = event.target.value;
      this.setState(state);
      if (event.target.name === "action" && event.target.value === "D") {
        this.setState({dates: [], update: false, create: false});
      }
    };
    toggle = (tab) => {
      this.state.activeTab !== tab && this.setState({activeTab: tab});
    };
    toggleLarge = () => {
      this.setState({large: !this.state.large, action: 'C'});
    };
    toggleDelete = () => {
      this.setState({toggle_delete: !this.state.toggle_delete, action: 'X'})
    };
    goLad = () => {
      if (this.lad_window !== null) this.lad_window.close();
      this.lad_window = window.open("/LAD", '', 'width=' +window.innerWidth * 0.5+ ',height=650,Top=10,Left=' + (window.innerWidth * 0.5 + 100) + ',Right=0');
      // this.setState({isLad: !this.state.isLad, isCpr: false})
    };
    goCpr = () => {
      if (this.cpr_window !== null) this.cpr_window.close();
      this.cpr_window = window.open("/CPR", '', 'width=' +window.innerWidth * 0.5+ ',height=650,Top=10,Left=0');
      // this.setState({isCpr: !this.state.isCpr, isLad: false})
    };
    toggleTran = () => {
      this.setState({isTran: !this.state.isTran, action: 'T'})
    };
    handleCheck = (event) => {
      let state = {};
      state[event.target.name] = event.target.checked;
      this.setState(state);
      this.setState({isCopyDate: false, isCopyPortion: false, isTransferDate: false, isDeleteDate: false})
    };
  };
}

export default methodMixin;
