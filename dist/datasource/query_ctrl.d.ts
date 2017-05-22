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
    policySegment: any;
    datefield: any;
    table: any;
    tableColASegment: any;
    tableColBSegment: any;
    tableColCSegment: any;
    tableColDSegment: any;
    tableColESegment: any;
    tableColFSegment: any;
    constructor($scope: any, $injector: any, templateSrv: any, $q: any, uiSegmentSrv: any);
    refresh(): void;
    getCollapsedText(): string;
    getPolicySegments(datatype: any): any;
    policyChanged(): void;
    tablecolChanged(col_index: any, colval: any): void;
    getSession(): any;
}
