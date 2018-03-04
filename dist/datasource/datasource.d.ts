export declare class GlpiAppDatasource {
    private usertoken;
    private apptoken;
    private timezone;
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
    promiseGetNumberElementsOfTarget(fieldNum: any, q: any, myclass: any, currentTargetNum: any): (bksrv: any, urloptions: any, timeperiods: any, alltargetresult: any) => any;
    promiseGetEachRangePageOfTarget(q: any): (args: any) => any;
    promiseMergeTargetResult(timeperiods: any, fieldNum: any, q: any, currentTargetNum: any, myclass: any): (data: any) => any[];
    testDatasource(): any;
    getSession(): any;
    getSearchOptions(itemtype: any): void;
}
