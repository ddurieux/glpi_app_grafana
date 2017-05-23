/// <reference path="../../../../../../../usr/local/share/grafana/public/app/headers/common.d.ts" />
export declare class GlpiAppDatasourceQueryCtrl {
    $scope: any;
    private $injector;
    private templateSrv;
    private $q;
    private uiSegmentSrv;
    static templateUrl: string;
    target: any;
    datasource: any;
    panelCtrl: any;
    panel: any;
    datefield: any;
    table: any;
    list: any;
    listdate: any;
    constructor($scope: any, $injector: any, templateSrv: any, $q: any, uiSegmentSrv: any);
    refresh(): void;
    getCollapsedText(): string;
    getListOptionsFields(datatype: any): any;
    getSession(): any;
}
