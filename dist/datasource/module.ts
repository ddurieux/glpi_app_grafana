import {GlpiAppDatasource} from "./datasource";
import {GlpiAppDatasourceQueryCtrl} from "./query_ctrl";

export class GlpiAppDatasourceConfigCtrl {
  static templateUrl = "datasource/partials/config.html";
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
