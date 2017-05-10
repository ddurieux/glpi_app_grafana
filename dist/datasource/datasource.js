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
                                console.log(options.scopedVars);
                                var interval_s = Math.round(options.scopedVars.__interval_ms["value"] / 1000);
                                var interval_start = Math.round(options.range.from.valueOf() / 1000);
                                var interval_end = Math.round(options.range.to.valueOf() / 1000);
                                var dateISO = new Date(interval_start * 1e3).toISOString();
                                var url_start_date = dateISO.slice(0, -14) + " " + dateISO.slice(-13, -5);
                                var field_num = 15;
                                if (itemtype == 'computer') {
                                    field_num = 19;
                                }
                                for (var i = 0; i < 50; i++) {
                                    if (searchq[1].indexOf("criteria[" + i + "]") < 0) {
                                        searchq[1] += "&criteria[" + i + "][link]=AND&" +
                                            "criteria[" + i + "][field]=" + field_num + "&" +
                                            "criteria[" + i + "][searchtype]=morethan&" +
                                            "_select_criteria[" + i + "][value]=0&" +
                                            "_criteria[" + i + "][value]=" + interval_start + "&" +
                                            "criteria[" + i + "][value]=" + url_start_date;
                                        break;
                                    }
                                }
                                var interval_s = Math.round(options.scopedVars.__interval_ms["value"] / 1000) * 10;
                                var interval_start = Math.round(options.range.from.valueOf() / 1000);
                                var interval_end = Math.round(options.range.to.valueOf() / 1000);
                                var range = lodash_1.default.range(interval_start, interval_end, interval_s);
                                var timeperiods = {};
                                for (var num in range) {
                                    timeperiods[range[num]] = range[num] + interval_s;
                                }
                                var urloptions = {
                                    method: "GET",
                                    url: _this.url + "/search/" + itemtype + "?" + searchq[1],
                                };
                                urloptions.headers = urloptions.headers || {};
                                urloptions.headers["App-Token"] = _this.apptoken;
                                urloptions.headers["Session-Token"] = response.data["session_token"];
                                var bksrv = _this.backendSrv;
                                var to = function (bksrv, urloptions, timeperiods) {
                                    return bksrv.datasourceRequest(urloptions).then(function (response) {
                                        if (response.status >= 200 && response.status < 300) {
                                            var number_pages = Math.ceil(response.data["totalcount"] / 400);
                                            var pool = [];
                                            for (var j = 0; j < number_pages; j++) {
                                                pool.push(function (args) {
                                                    bksrv = args[0];
                                                    var url2options = lodash_1.default.cloneDeep(args[1]);
                                                    url2options["url"] += "&range=" + args[4] + "-" + (args[4] + 399);
                                                    args[4] += 400;
                                                    return bksrv.datasourceRequest(url2options).then(function (response) {
                                                        if (response.status >= 200 && response.status < 300) {
                                                            args[3].push(response.data["data"]);
                                                            return [bksrv, args[1], args[2], args[3], args[4]];
                                                        }
                                                    });
                                                });
                                            }
                                            if (pool.length == 0) {
                                                var datapointempty = [];
                                                for (var tp in timeperiods) {
                                                    datapointempty.push([0, tp]);
                                                }
                                                return { data: [
                                                        {
                                                            target: "tickets",
                                                            datapoints: datapointempty,
                                                        },
                                                    ] };
                                            }
                                            var k = 0;
                                            for (var fun in pool) {
                                                if (k == 0) {
                                                    var prom = pool[k]([bksrv, urloptions, timeperiods, [], 0]);
                                                }
                                                else {
                                                    prom = prom.then(pool[k]);
                                                }
                                                k += 1;
                                            }
                                            var resultfunc = function (data) {
                                                var periods = {};
                                                for (var tp in timeperiods) {
                                                    periods[tp] = 0;
                                                }
                                                for (var idx in data[3]) {
                                                    for (var kkey in data[3][idx]) {
                                                        var date = new Date(data[3][idx][kkey][field_num]);
                                                        var item_date = Math.round(date.getTime() / 1000);
                                                        for (var tp in timeperiods) {
                                                            if (item_date >= Number(tp) && item_date < timeperiods[tp]) {
                                                                periods[tp] += 1;
                                                                break;
                                                            }
                                                        }
                                                    }
                                                }
                                                var datapoints = [];
                                                for (var tp in periods) {
                                                    datapoints.unshift([periods[tp], Number(tp) * 1000]);
                                                }
                                                var ret = { data: [
                                                        {
                                                            target: q.alias,
                                                            datapoints: datapoints,
                                                        },
                                                    ] };
                                                return ret;
                                            };
                                            return prom.then(resultfunc);
                                        }
                                    });
                                };
                                return to(bksrv, urloptions, timeperiods);
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