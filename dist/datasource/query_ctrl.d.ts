/// <reference path="../../../../../../../usr/local/share/grafana/public/app/headers/common.d.ts" />
export declare class GlpiAppDatasourceQueryCtrl {
    $scope: any;
    private $injector;
    static templateUrl: string;
    target: any;
    datasource: any;
    panelCtrl: any;
    panel: any;
    select_tr_fields: any;
    constructor($scope: any, $injector: any);
    refresh(): void;
    getCollapsedText(): string;
}
