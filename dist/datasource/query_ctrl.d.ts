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
    listnumber: any;
    scope: any;
    constructor($scope: any, $injector: any, templateSrv: any, $q: any, uiSegmentSrv: any);
    newQueryRefresh(): void;
    refresh(): void;
    getCollapsedText(): string;
    getListOptionsFields(datatype: any, console: any): any;
    getSession(): any;
}
