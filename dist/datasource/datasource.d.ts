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
    promiseATarget(queryTargets: any, options: any, response: any, myclass: any): (targetargs: any) => any;
    promiseGetNumberElementsOfTarget(field_num: any, q: any, myclass: any, current_target_num: any): (bksrv: any, urloptions: any, timeperiods: any, alltargetresult: any) => any;
    promiseGetEachRangePageOfTarget(q: any): (args: any) => any;
    promiseMergeTargetResult(timeperiods: any, field_num: any, q: any, current_target_num: any): (data: any) => any[];
    testDatasource(): any;
    getSession(): any;
    getSearchOptions(itemtype: any): void;
}
