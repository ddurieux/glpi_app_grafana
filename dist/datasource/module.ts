import {GlpiAppDatasource} from "./datasource";
import {GlpiAppDatasourceQueryCtrl} from "./query_ctrl";
import * as moment from "../vendor/public/builds/moment-timezone-with-data";

export class GlpiAppDatasourceConfigCtrl {
  public timezone_list = moment.tz.names();
  static templateUrl = "datasource/partials/config.html";
  current: any;

  constructor($scope) {
    this.current.jsonData.timezone = this.current.jsonData.timezone || "UTC";
  }

}

class GlpiQueryOptionsCtrl {
  static templateUrl = "datasource/partials/query.options.html";
}

export {
  GlpiAppDatasource as Datasource,
  GlpiAppDatasourceConfigCtrl as ConfigCtrl,
  GlpiAppDatasourceQueryCtrl as QueryCtrl,
  GlpiQueryOptionsCtrl as QueryOptionsCtrl,
};
