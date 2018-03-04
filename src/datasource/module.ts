import * as moment from "../vendor/public/builds/moment-timezone-with-data";
import {GlpiAppDatasource} from "./datasource";
import {GlpiAppDatasourceQueryCtrl} from "./query_ctrl";

export class GlpiAppDatasourceConfigCtrl {
  public timezoneLst = moment.tz.names();
  static templateUrl = "datasource/partials/config.html";
  current: any;

  constructor($scope) {
    this.current.jsonData.timezone = this.current.jsonData.timezone || "UTC";
  }

}

export {
  GlpiAppDatasource as Datasource,
  GlpiAppDatasourceConfigCtrl as ConfigCtrl,
  GlpiAppDatasourceQueryCtrl as QueryCtrl,
};
