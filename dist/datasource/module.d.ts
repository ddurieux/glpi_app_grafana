import { GlpiAppDatasource } from "./datasource";
import { GlpiAppDatasourceQueryCtrl } from "./query_ctrl";
export declare class GlpiAppDatasourceConfigCtrl {
    timezoneLst: any;
    static templateUrl: string;
    current: any;
    constructor($scope: any);
}
export { GlpiAppDatasource as Datasource, GlpiAppDatasourceConfigCtrl as ConfigCtrl, GlpiAppDatasourceQueryCtrl as QueryCtrl };
