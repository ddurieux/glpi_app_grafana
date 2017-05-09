/// <reference path="../../../../../../../usr/local/share/grafana/public/app/headers/common.d.ts" />
export declare class GlpiAppDatasource {
    private usertoken;
    private apptoken;
    private name;
    private type;
    private supportAnnotations;
    private supportMetrics;
    private q;
    private backendSrv;
    private templateSrv;
    private url;
    private session;
    private searchOptions;
    constructor(instanceSettings: any, $q: any, backendSrv: any, templateSrv: any);
    query(options: any): any;
    testDatasource(): any;
    getSession(): any;
    getSearchOptions(itemtype: any): void;
}
