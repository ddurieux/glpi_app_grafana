System.register(["lodash", "../vendor/public/builds/moment-timezone-with-data"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var lodash_1, moment, GlpiAppDatasource;
    return {
        setters: [
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (moment_1) {
                moment = moment_1;
            }
        ],
        execute: function () {
            GlpiAppDatasource = (function () {
                function GlpiAppDatasource(instanceSettings, $q, backendSrv, templateSrv) {
                    this.url = instanceSettings.url;
                    this.apptoken = instanceSettings.jsonData.apptoken;
                    this.usertoken = instanceSettings.jsonData.token;
                    this.timezone = instanceSettings.jsonData.timezone;
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
                            var targetPool = [];
                            for (var _i = 0, queryTargets_1 = queryTargets; _i < queryTargets_1.length; _i++) {
                                var q = queryTargets_1[_i];
                                targetPool.push(_this.promiseATarget(queryTargets, options, response, _this));
                            }
                            var l = 0;
                            for (var funt in targetPool) {
                                if (l === 0) {
                                    var promt = targetPool[l]([l, _this.backendSrv, []]);
                                }
                                else {
                                    promt = promt.then(targetPool[l]);
                                }
                                l += 1;
                            }
                            var resultalltarget = function (data) {
                                var ret = {
                                    data: data[2],
                                };
                                return ret;
                            };
                            return promt.then(resultalltarget);
                        }
                    });
                };
                GlpiAppDatasource.prototype.promiseATarget = function (queryTargets, options, response, myclass) {
                    return function (targetargs) {
                        var currentTargetNum = targetargs[0];
                        var bksrv = targetargs[1];
                        var alltargetresult = targetargs[2];
                        var q = queryTargets[currentTargetNum];
                        q.query = decodeURI(q.query);
                        var searchq = q.query.split(".php?");
                        var url = searchq[0].split("/");
                        var itemtype = url[url.length - 1];
                        var interval_s = Math.round(options.scopedVars.__interval_ms["value"] / 1000);
                        var interval_start = Math.round(options.range.from.valueOf() / 1000) + 3600 + 3600;
                        var interval_end = Math.round(options.range.to.valueOf() / 1000) + 3600 + 3600;
                        var dateISO = new Date(interval_start * 1e3).toISOString();
                        var url_start_date = dateISO.slice(0, -14) + " " + dateISO.slice(-13, -5);
                        var field_num = q.datefield["number"];
                        var dateISOend = new Date(interval_end * 1e3).toISOString();
                        var url_end_date = dateISOend.slice(0, -14) + " " + dateISOend.slice(-13, -5);
                        if (field_num != "-1") {
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
                            i += 1;
                            searchq[1] += "&criteria[" + i + "][link]=AND&" +
                                "criteria[" + i + "][field]=" + field_num + "&" +
                                "criteria[" + i + "][searchtype]=lessthan&" +
                                "_select_criteria[" + i + "][value]=0&" +
                                "_criteria[" + i + "][value]=" + interval_end + "&" +
                                "criteria[" + i + "][value]=" + url_end_date;
                        }
                        searchq[1] += "&forcedisplay[0]=0";
                        if (q.table) {
                            searchq[1] += "&giveItems=true";
                            for (var colNum = 0; colNum <= 5; colNum++) {
                                if (eval("q.col_" + colNum)["number"] != "0") {
                                    searchq[1] += "&forcedisplay[" + eval("q.col_" + colNum)["number"] + "]=" + eval("q.col_" + colNum)["number"];
                                }
                            }
                        }
                        if (q.dynamicsplit.number != "0") {
                            searchq[1] += "&forcedisplay[" + q.dynamicsplit.number + "]=" + q.dynamicsplit.number;
                            searchq[1] += "&giveItems=true";
                        }
                        var interval_s = Math.round(options.scopedVars.__interval_ms["value"] / 1000);
                        var interval_start = Math.round(options.range.from.valueOf() / 1000);
                        var interval_end = Math.round(options.range.to.valueOf() / 1000);
                        var range = lodash_1.default.range(interval_end, interval_start, -interval_s);
                        var timeperiods = {};
                        for (var num in range) {
                            timeperiods[(range[num] * 1000)] = (range[num] - interval_s) * 1000;
                        }
                        var urloptions = {
                            method: "GET",
                            url: myclass.url + "/search/" + itemtype + "?" + searchq[1],
                        };
                        urloptions.headers = urloptions.headers || {};
                        urloptions.headers["App-Token"] = myclass.apptoken;
                        urloptions.headers["Session-Token"] = response.data["session_token"];
                        var to = myclass.promiseGetNumberElementsOfTarget(field_num, q, myclass, currentTargetNum);
                        return to(bksrv, urloptions, timeperiods, alltargetresult);
                    };
                };
                GlpiAppDatasource.prototype.promiseGetNumberElementsOfTarget = function (field_num, q, myclass, current_target_num) {
                    return function (bksrv, urloptions, timeperiods, alltargetresult) {
                        return bksrv.datasourceRequest(urloptions).then(function (response) {
                            if (response.status >= 200 && response.status < 300) {
                                var number_pages = Math.ceil(response.data["totalcount"] / 400);
                                if (number_pages == 0) {
                                    number_pages = 1;
                                }
                                var pool = [];
                                for (var j = 0; j < number_pages; j++) {
                                    pool.push(myclass.promiseGetEachRangePageOfTarget(q));
                                }
                                if (pool.length === 0) {
                                    var datapointempty = [];
                                    for (var tp in timeperiods) {
                                        datapointempty.push([0, tp]);
                                    }
                                    return {
                                        data: [
                                            {
                                                target: "tickets",
                                                datapoints: datapointempty,
                                            },
                                        ],
                                    };
                                }
                                var k = 0;
                                for (var fun in pool) {
                                    if (k === 0) {
                                        var prom = pool[k]([bksrv, urloptions, timeperiods, [], 0, alltargetresult]);
                                    }
                                    else {
                                        prom = prom.then(pool[k]);
                                    }
                                    k += 1;
                                }
                                var resultfunc = myclass.promiseMergeTargetResult(timeperiods, field_num, q, current_target_num, myclass);
                                return prom.then(resultfunc);
                            }
                        });
                    };
                };
                GlpiAppDatasource.prototype.promiseGetEachRangePageOfTarget = function (q) {
                    return function (args) {
                        var bksrv = args[0];
                        var url2options = lodash_1.default.cloneDeep(args[1]);
                        url2options["url"] += "&range=" + args[4] + "-" + (args[4] + 399);
                        args[4] += 400;
                        return bksrv.datasourceRequest(url2options).then(function (response) {
                            if (response.status >= 200 && response.status < 300) {
                                if (q.table) {
                                    args[3].push(response.data["data_html"]);
                                }
                                else if (q.dynamicsplit.number != "0") {
                                    for (var rownum in response.data["data"]) {
                                        var cleanedHTML = response.data["data_html"][rownum][q.dynamicsplit.number];
                                        cleanedHTML = cleanedHTML.replace(/<div(.|\n|\r)+<\/div>/, "");
                                        cleanedHTML = cleanedHTML.replace(/<script(.|\n|\r)+<\/script>/, "");
                                        cleanedHTML = cleanedHTML.replace(/<img(.|\n|\r|\t)+>/, "");
                                        cleanedHTML = cleanedHTML.replace(/^&nbsp;/, "");
                                        response.data["data"][rownum][q.dynamicsplit.number] = cleanedHTML;
                                    }
                                    args[3].push(response.data["data"]);
                                }
                                else {
                                    args[3].push(response.data["data"]);
                                }
                                return [bksrv, args[1], args[2], args[3], args[4], args[5]];
                            }
                        });
                    };
                };
                GlpiAppDatasource.prototype.promiseMergeTargetResult = function (timeperiods, field_num, q, current_target_num, myclass) {
                    return function (data) {
                        if (q.table) {
                            var columns = [];
                            var maxnum = 0;
                            for (var colNum = 0; colNum <= 5; colNum++) {
                                if (eval("q.col_" + colNum)["number"] != "0") {
                                    maxnum = lodash_1.default.cloneDeep(colNum);
                                    if (eval("q.col_" + colNum + "_alias") == null || eval("q.col_" + colNum + "_alias") == "") {
                                        columns.push({ text: eval("q.col_" + colNum)["label"], type: "string" });
                                    }
                                    else {
                                        columns.push({ text: eval("q.col_" + colNum + "_alias"), type: "string" });
                                    }
                                }
                            }
                            var glpiurl = myclass.url;
                            var split_glpiurl = glpiurl.split("/");
                            var rows = [];
                            for (var idx in data[3]) {
                                for (var kkey in data[3][idx]) {
                                    var myrow = [];
                                    for (var colNum2 = 0; colNum2 <= maxnum; colNum2++) {
                                        var cleanedHTML = data[3][idx][kkey][eval("q.col_" + colNum2)["number"]].replace(/<div(.|\n|\r)+<\/div>/, "");
                                        cleanedHTML = cleanedHTML.replace(/<script(.|\n|\r)+<\/script>/, "");
                                        cleanedHTML = cleanedHTML.replace(/<img.+class='pointer'>/, "");
                                        if (cleanedHTML.indexOf(' href="/') !== -1) {
                                            cleanedHTML = cleanedHTML.replace('href="/', 'href="' + split_glpiurl[0] + "//" + split_glpiurl[2] + "/");
                                        }
                                        myrow.push(cleanedHTML);
                                    }
                                    rows.push(myrow);
                                }
                            }
                            data[5].push({
                                columns: columns,
                                rows: rows,
                                type: "table",
                            });
                        }
                        else {
                            if (q.dynamicsplit.number != "0") {
                                var periods = {};
                                for (var idx2 in data[3]) {
                                    for (var kkey2 in data[3][idx2]) {
                                        periods[data[3][idx2][kkey2][q.dynamicsplit.number]] = {};
                                    }
                                }
                                for (var period in periods) {
                                    for (var tp in timeperiods) {
                                        periods[period][tp] = 0;
                                    }
                                }
                                for (var idx2 in data[3]) {
                                    for (var kkey2 in data[3][idx2]) {
                                        var datestring = data[3][idx2][kkey2][field_num];
                                        var date = new Date(moment.tz(datestring, myclass.timezone));
                                        var item_date = Math.round(date.getTime());
                                        for (var tpd in timeperiods) {
                                            if (item_date < Number(tpd) && item_date >= timeperiods[tpd]) {
                                                if (q.counter) {
                                                    periods[data[3][idx2][kkey2][q.dynamicsplit.number]][tpd] += 1;
                                                }
                                                else {
                                                    periods[data[3][idx2][kkey2][q.dynamicsplit.number]][tpd] += data[3][idx2][kkey2][q.nocounterval.number];
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }
                                for (var period in periods) {
                                    var datapoints = [];
                                    for (var tpp in periods[period]) {
                                        datapoints.unshift([periods[period][tpp], Number(tpp)]);
                                    }
                                    data[5].push({
                                        target: period,
                                        datapoints: datapoints,
                                    });
                                }
                            }
                            else {
                                var periods = {};
                                for (var tp in timeperiods) {
                                    periods[tp] = 0;
                                }
                                var tototo = 0;
                                for (var idx2 in data[3]) {
                                    for (var kkey2 in data[3][idx2]) {
                                        var datestring = data[3][idx2][kkey2][field_num];
                                        var date = new Date(moment.tz(datestring, myclass.timezone));
                                        var item_date = Math.round(date.getTime());
                                        tototo = item_date;
                                        for (var tpd in timeperiods) {
                                            if (item_date < Number(tpd) && item_date >= timeperiods[tpd]) {
                                                if (q.counter) {
                                                    periods[tpd] += 1;
                                                }
                                                else {
                                                    periods[tpd] += data[3][idx2][kkey2][q.nocounterval.number];
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }
                                var datapoints = [];
                                if (q.dayhours) {
                                    for (var tpp in periods) {
                                        var d = new Date(Number(tpp));
                                        var n = d.getHours();
                                        for (var num = 1; num <= periods[tpp]; num++) {
                                            datapoints.unshift([n, 1]);
                                        }
                                    }
                                }
                                else {
                                    console.log('on pass ici');
                                    for (var tpp in periods) {
                                        datapoints.unshift([periods[tpp], Number(tpp)]);
                                    }
                                }
                                data[5].push({
                                    target: q.alias,
                                    datapoints: datapoints
                                });
                            }
                        }
                        current_target_num += 1;
                        return [current_target_num, data[0], data[5]];
                    };
                };
                GlpiAppDatasource.prototype.testDatasource = function () {
                    var options = {
                        method: "GET",
                        url: this.url + "/initSession",
                        data: null,
                    };
                    options.headers = options.headers || {};
                    options.headers.Authorization = "user_token " + this.usertoken;
                    options.headers["App-Token"] = this.apptoken;
                    return this.backendSrv.datasourceRequest(options).then(function (response) {
                        if (response.status === 200) {
                            return { status: "success", message: "Data source is working", title: "Success" };
                        }
                    }, function (err) {
                        if (err.status !== 0 || err.status >= 300) {
                            if (err.data && err.data.error) {
                                throw {
                                    message: "GLPI API Error Response: " + err.data.error
                                };
                            }
                            else if (err.data) {
                                throw {
                                    message: "GLPI API Error Response: " + err.data[1]
                                };
                            }
                            else if (err.status == undefined) {
                                throw {
                                    message: "Cross-Origin Request Blocked: add right headers in your apache/nginx like 'App-Token' and 'Session-Token'"
                                };
                            }
                            else {
                                throw { message: "GLPI API Error: " + err.message, data: err.data, config: err.config };
                            }
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