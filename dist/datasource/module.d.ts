import { GlpiAppDatasource } from "./datasource";
import { GlpiAppDatasourceQueryCtrl } from "./query_ctrl";
export declare class GlpiAppDatasourceConfigCtrl {
    timezone_list: any;
    static templateUrl: string;
    current: any;
    constructor($scope: any);
}
declare class GlpiQueryOptionsCtrl {
    static templateUrl: string;
}
export { GlpiAppDatasource as Datasource, GlpiAppDatasourceConfigCtrl as ConfigCtrl, GlpiAppDatasourceQueryCtrl as QueryCtrl, GlpiQueryOptionsCtrl as QueryOptionsCtrl };
