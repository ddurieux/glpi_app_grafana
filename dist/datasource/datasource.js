System.register(["lodash"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var lodash_1, GlpiAppDatasource;
    return {
        setters: [
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            }
        ],
        execute: function () {
            GlpiAppDatasource = (function () {
                function GlpiAppDatasource(instanceSettings, $q, backendSrv, templateSrv) {
                    this.url = instanceSettings.url;
                    this.apptoken = instanceSettings.jsonData.apptoken;
                    this.usertoken = instanceSettings.jsonData.token;
                    this.name = instanceSettings.name;
                    this.supportAnnotations = true;
                    this.supportMetrics = true;
                    this.q = $q;
                    this.backendSrv = backendSrv;
                    this.templateSrv = templateSrv;
                    this.session = "";
                    this.searchOptions = {};
                }
                GlpiAppDatasource.prototype.query = function (options) {
                    var _this = this;
                    var scopedVars = options.scopedVars;
                    var targets = lodash_1.default.cloneDeep(options.targets);
                    var queryTargets = [];
                    var allQueries = lodash_1.default.map(targets, function (target) {
                        if (target.hide) {
                            return "";
                        }
                        queryTargets.push(target);
                        scopedVars.interval = scopedVars.__interval;
                        return queryTargets;
                    }).reduce(function (acc, current) {
                        if (current !== "") {
                            acc += ";" + current;
                        }
                        return acc;
                    });
                    var initsession = this.getSession();
                    return initsession.then(function (response) {
                        if (response.status === 200) {
                            for (var _i = 0, queryTargets_1 = queryTargets; _i < queryTargets_1.length; _i++) {
                                var q = queryTargets_1[_i];
                                q.query = decodeURI(q.query);
                                var searchq = q.query.split(".php?");
                                var url = searchq[0].split("/");
                                var itemtype = url[url.length - 1];
                                itemtype = "Ticket";
                                for (var i = 0; i < 50; i++) {
                                    if (searchq[1].indexOf("criteria[" + i + "]") < 0) {
                                        searchq[1] += "&criteria[" + i + "][link]=AND&" +
                                            "criteria[" + i + "][field]=15&" +
                                            "criteria[" + i + "][searchtype]=morethan&" +
                                            "_select_criteria[" + i + "][value]=0&" +
                                            "_criteria[" + i + "][value]=[[start_date]]&" +
                                            "criteria[" + i + "][value]=[[start_date]]&" +
                                            "criteria[" + (i + 1) + "][link]=AND&" +
                                            "criteria[" + (i + 1) + "][field]=15&" +
                                            "criteria[" + (i + 1) + "][searchtype]=lessthan&" +
                                            "_select_criteria[" + (i + 1) + "][value]=0&" +
                                            "_criteria[" + (i + 1) + "][value]=[[end_date]]&" +
                                            "criteria[" + (i + 1) + "][value]=[[end_date]]";
                                        break;
                                    }
                                }
                                var urloptions = {
                                    method: "GET",
                                    url: _this.url + "/search/" + itemtype + "?" + searchq[1],
                                };
                                urloptions.headers = urloptions.headers || {};
                                urloptions.headers["App-Token"] = _this.apptoken;
                                urloptions.headers["Session-Token"] = response.data["session_token"];
                                var interval_s = Math.round(options.scopedVars.__interval_ms["value"] / 1000) * 10;
                                var interval_start = Math.round(options.range.from.valueOf() / 1000);
                                var interval_end = Math.round(options.range.to.valueOf() / 1000);
                                var range = lodash_1.default.range(interval_start, interval_end, interval_s);
                                var timeperiods = [];
                                for (var num in range) {
                                    timeperiods.push({
                                        start: (range[num]),
                                        end: (range[num] + interval_s),
                                    });
                                }
                                var bksrv = _this.backendSrv;
                                var pool = [];
                                for (var tperiod in timeperiods) {
                                    pool.push(function (args) {
                                        bksrv = args[0];
                                        var url2options = lodash_1.default.cloneDeep(args[1]);
                                        var timeperiod = args[2].splice(-1, 1);
                                        var dateISO = new Date(timeperiod[0]["start"] * 1e3).toISOString();
                                        var url_start_date = dateISO.slice(0, -14) + " " + dateISO.slice(-13, -5);
                                        dateISO = new Date(timeperiod[0]["end"] * 1e3).toISOString();
                                        var url_end_date = dateISO.slice(0, -14) + " " + dateISO.slice(-13, -5);
                                        url2options["url"] = url2options["url"].replace("[[start_date]]", url_start_date);
                                        url2options["url"] = url2options["url"].replace("[[start_date]]", url_start_date);
                                        url2options["url"] = url2options["url"].replace("[[end_date]]", url_end_date);
                                        url2options["url"] = url2options["url"].replace("[[end_date]]", url_end_date);
                                        return bksrv.datasourceRequest(url2options).then(function (response) {
                                            if (response.status === 200) {
                                                args[3].push([response.data["totalcount"], (timeperiod[0]["end"] * 1000)]);
                                                return [bksrv, args[1], args[2], args[3]];
                                            }
                                        });
                                    });
                                }
                                var k = 0;
                                for (var fun in pool) {
                                    if (k == 0) {
                                        var prom = pool[k]([bksrv, urloptions, timeperiods, []]);
                                    }
                                    else {
                                        prom = prom.then(pool[k]);
                                    }
                                    k += 1;
                                }
                                var resultfunc = function (data) {
                                    var ret = { data: [
                                            {
                                                target: "tickets",
                                                datapoints: data[3],
                                            }
                                        ] };
                                    return ret;
                                };
                                return prom.then(resultfunc);
                            }
                        }
                    });
                };
                GlpiAppDatasource.prototype.testDatasource = function () {
                    var options = {
                        method: "GET",
                        url: this.url + "/initSession",
                    };
                    options.headers = options.headers || {};
                    options.headers.Authorization = "user_token " + this.usertoken;
                    options.headers["App-Token"] = this.apptoken;
                    return this.backendSrv.datasourceRequest(options).then(function (response) {
                        if (response.status === 200) {
                            return { status: "success", message: "Data source is working", title: "Success" };
                        }
                    });
                };
                GlpiAppDatasource.prototype.getSession = function () {
                    var options = {
                        method: "GET",
                        url: this.url + "/initSession",
                    };
                    options.headers = options.headers || {};
                    options.headers.Authorization = "user_token " + this.usertoken;
                    options.headers["App-Token"] = this.apptoken;
                    return this.backendSrv.datasourceRequest(options);
                };
                GlpiAppDatasource.prototype.getSearchOptions = function (itemtype) {
                    if (!(itemtype in this.searchOptions)) {
                        var urloptions = {
                            method: "GET",
                            url: this.url + "/listSearchOptions/" + itemtype,
                        };
                        urloptions.headers = urloptions.headers || {};
                        urloptions.headers["App-Token"] = this.apptoken;
                        urloptions.headers["Session-Token"] = this.session;
                        var answer = this.backendSrv.datasourceRequest(urloptions).then(function (response) {
                            if (response.status === 200) {
                                return response.data;
                            }
                        });
                        this.searchOptions[itemtype] = answer;
                    }
                };
                return GlpiAppDatasource;
            }());
            exports_1("GlpiAppDatasource", GlpiAppDatasource);
        }
    };
});
//# sourceMappingURL=datasource.js.map