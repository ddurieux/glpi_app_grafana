System.register(["lodash", "../vendor/public/builds/moment-timezone-with-data.js"], function (exports_1, context_1) {
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
                        if (target.hasOwnProperty("hide")) {
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
                            for (var _a = 0, _b = Object.keys(targetPool); _a < _b.length; _a++) {
                                var funt = _b[_a];
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
                        var intervalS = Math.round(options.scopedVars.__interval_ms["value"] / 1000);
                        var intervalStart = Math.round(options.range.from.valueOf() / 1000) + 3600 + 3600;
                        var intervalEnd = Math.round(options.range.to.valueOf() / 1000) + 3600 + 3600;
                        var dateISO = new Date(intervalStart * 1e3).toISOString();
                        var urlStartDate = dateISO.slice(0, -14) + " " + dateISO.slice(-13, -5);
                        var fieldNum = q.datefield["number"];
                        var dateISOend = new Date(intervalEnd * 1e3).toISOString();
                        var urlEndDate = dateISOend.slice(0, -14) + " " + dateISOend.slice(-13, -5);
                        if (fieldNum !== "-1") {
                            var iend = 0;
                            for (var i = 0; i < 50; i++) {
                                iend = i;
                                if (searchq[1].indexOf("criteria[" + i + "]") < 0) {
                                    searchq[1] += "&criteria[" + i + "][link]=AND&" +
                                        "criteria[" + i + "][field]=" + fieldNum + "&" +
                                        "criteria[" + i + "][searchtype]=morethan&" +
                                        "_select_criteria[" + i + "][value]=0&" +
                                        "_criteria[" + i + "][value]=" + intervalStart + "&" +
                                        "criteria[" + i + "][value]=" + urlStartDate;
                                    break;
                                }
                            }
                            iend += 1;
                            searchq[1] += "&criteria[" + iend + "][link]=AND&" +
                                "criteria[" + iend + "][field]=" + fieldNum + "&" +
                                "criteria[" + iend + "][searchtype]=lessthan&" +
                                "_select_criteria[" + iend + "][value]=0&" +
                                "_criteria[" + iend + "][value]=" + intervalEnd + "&" +
                                "criteria[" + iend + "][value]=" + urlEndDate;
                        }
                        searchq[1] += "&forcedisplay[0]=0";
                        if (q.table) {
                            searchq[1] += "&giveItems=true";
                            for (var colNum = 0; colNum <= 11; colNum++) {
                                if (eval("q.col_" + colNum)["number"] !== "0") {
                                    searchq[1] += "&forcedisplay[" + eval("q.col_" + colNum)["number"] + "]=" + eval("q.col_" + colNum)["number"];
                                }
                            }
                        }
                        if (q.dynamicsplit.number !== "0") {
                            searchq[1] += "&forcedisplay[" + q.dynamicsplit.number + "]=" + q.dynamicsplit.number;
                            searchq[1] += "&giveItems=true";
                        }
                        intervalS = Math.round(options.scopedVars.__interval_ms["value"] / 1000);
                        intervalStart = Math.round(options.range.from.valueOf() / 1000);
                        intervalEnd = Math.round(options.range.to.valueOf() / 1000);
                        var myrange = lodash_1.default.range(intervalEnd, intervalStart, -intervalS);
                        var timeperiods = {};
                        for (var _i = 0, _a = Object.keys(myrange); _i < _a.length; _i++) {
                            var num = _a[_i];
                            timeperiods[(myrange[num] * 1000)] = (myrange[num] - intervalS) * 1000;
                        }
                        var urloptions = {
                            method: "GET",
                            url: myclass.url + "/search/" + itemtype + "?" + searchq[1],
                        };
                        urloptions.headers = urloptions.headers || {};
                        urloptions.headers["App-Token"] = myclass.apptoken;
                        urloptions.headers["Session-Token"] = response.data["session_token"];
                        var to = myclass.promiseGetNumberElementsOfTarget(fieldNum, q, myclass, currentTargetNum);
                        return to(bksrv, urloptions, timeperiods, alltargetresult);
                    };
                };
                GlpiAppDatasource.prototype.promiseGetNumberElementsOfTarget = function (fieldNum, q, myclass, currentTargetNum) {
                    return function (bksrv, urloptions, timeperiods, alltargetresult) {
                        return bksrv.datasourceRequest(urloptions).then(function (response) {
                            if (response.status >= 200 && response.status < 300) {
                                var numberPages = Math.ceil(response.data["totalcount"] / 400);
                                if (numberPages === 0) {
                                    numberPages = 1;
                                }
                                var pool = [];
                                for (var j = 0; j < numberPages; j++) {
                                    pool.push(myclass.promiseGetEachRangePageOfTarget(q));
                                }
                                if (pool.length === 0) {
                                    var datapointempty = [];
                                    for (var _i = 0, _a = Object.keys(timeperiods); _i < _a.length; _i++) {
                                        var tp = _a[_i];
                                        datapointempty.push([0, tp]);
                                    }
                                    return {
                                        data: [
                                            {
                                                datapoints: datapointempty,
                                                target: "tickets",
                                            },
                                        ],
                                    };
                                }
                                var k = 0;
                                var prom = void 0;
                                for (var _b = 0, _c = Object.keys(pool); _b < _c.length; _b++) {
                                    var fun = _c[_b];
                                    if (k === 0) {
                                        prom = pool[k]([bksrv, urloptions, timeperiods, [], 0, alltargetresult]);
                                    }
                                    else {
                                        prom = prom.then(pool[k]);
                                    }
                                    k += 1;
                                }
                                var resultfunc = myclass.promiseMergeTargetResult(timeperiods, fieldNum, q, currentTargetNum, myclass);
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
                                else if (q.dynamicsplit.number !== "0" && response.data["data"] !== undefined) {
                                    for (var _i = 0, _a = Object.keys(response.data["data"]); _i < _a.length; _i++) {
                                        var rownum = _a[_i];
                                        var cleanedHTML = response.data["data_html"][rownum][q.dynamicsplit.number];
                                        cleanedHTML = cleanedHTML.replace(/<div(.|\n|\r)+<\/div>/, "");
                                        cleanedHTML = cleanedHTML.replace(/<script(.|\n|\r)+<\/script>/, "");
                                        cleanedHTML = cleanedHTML.replace(/<img(.|\n|\r|\t)+>/, "");
                                        cleanedHTML = cleanedHTML.replace(/id=['"]tooltiplink(\d)+['"]/, "");
                                        cleanedHTML = cleanedHTML.replace(/id=['"]tooltip(\d)+['"]/, "");
                                        cleanedHTML = cleanedHTML.replace(/^&nbsp;/, "");
                                        response.data["data"][rownum][q.dynamicsplit.number] = cleanedHTML;
                                    }
                                    args[3].push(response.data["data"]);
                                }
                                else if (response.data["data"] !== undefined) {
                                    args[3].push(response.data["data"]);
                                }
                                return [bksrv, args[1], args[2], args[3], args[4], args[5]];
                            }
                        });
                    };
                };
                GlpiAppDatasource.prototype.promiseMergeTargetResult = function (timeperiods, fieldNum, q, currentTargetNum, myclass) {
                    return function (data) {
                        var debug = q.console;
                        if (debug) {
                            console.debug("q:", q);
                        }
                        if (debug) {
                            console.debug("data:", data);
                        }
                        if (q.table) {
                            if (debug) {
                                console.debug("Parsing a table result...");
                            }
                            var columns = [];
                            var maxnum = 0;
                            for (var colNum = 0; colNum <= 11; colNum++) {
                                if (eval("q.col_" + colNum)["number"] !== "0") {
                                    maxnum = lodash_1.default.cloneDeep(colNum);
                                    if (eval("q.col_" + colNum + "_alias") == null || eval("q.col_" + colNum + "_alias") === "") {
                                        columns.push({ text: eval("q.col_" + colNum)["label"], type: "string" });
                                    }
                                    else {
                                        columns.push({ text: eval("q.col_" + colNum + "_alias"), type: "string" });
                                    }
                                }
                            }
                            if (debug) {
                                console.debug("columns: ", columns);
                            }
                            var glpiurl = myclass.url;
                            var splitGlpiurl = glpiurl.split("/");
                            var rows = [];
                            for (var _i = 0, _a = Object.keys(data[3]); _i < _a.length; _i++) {
                                var idx = _a[_i];
                                for (var _b = 0, _c = Object.keys(data[3][idx]); _b < _c.length; _b++) {
                                    var kkey = _c[_b];
                                    var myrow = [];
                                    if (debug) {
                                        console.debug("-> ", data[3][idx][kkey]);
                                    }
                                    for (var colNum2 = 0; colNum2 <= maxnum; colNum2++) {
                                        var value = data[3][idx][kkey][eval("q.col_" + colNum2)["number"]];
                                        if (debug) {
                                            console.debug("-> value: ", value);
                                        }
                                        if (typeof value === "string") {
                                            var cleanedHTML = value.replace(/<div(.|\n|\r)+<\/div>/, "");
                                            cleanedHTML = cleanedHTML.replace(/<script(.|\n|\r)+<\/script>/, "");
                                            cleanedHTML = cleanedHTML.replace(/<img.+class='pointer'>/, "");
                                            if (cleanedHTML.indexOf(' href="/') !== -1) {
                                                cleanedHTML = cleanedHTML.replace('href="/', 'href="' + splitGlpiurl[0] + "//" + splitGlpiurl[2] + "/");
                                            }
                                            value = cleanedHTML;
                                        }
                                        myrow.push(value);
                                    }
                                    rows.push(myrow);
                                }
                            }
                            if (debug) {
                                console.debug("rows: ", rows);
                            }
                            data[5].push({
                                columns: columns,
                                rows: rows,
                                type: "table",
                            });
                        }
                        else {
                            if (debug) {
                                console.debug("Parsing a datapoints result...");
                            }
                            if (q.dynamicsplit.number !== "0") {
                                if (debug) {
                                    console.debug(" - split, field: ", q.dynamicsplit.number);
                                }
                                var periods = {};
                                for (var _d = 0, _e = Object.keys(data[3]); _d < _e.length; _d++) {
                                    var idx2 = _e[_d];
                                    for (var _f = 0, _g = Object.keys(data[3][idx2]); _f < _g.length; _f++) {
                                        var kkey2 = _g[_f];
                                        periods[data[3][idx2][kkey2][q.dynamicsplit.number]] = {};
                                    }
                                }
                                for (var _h = 0, _j = Object.keys(periods); _h < _j.length; _h++) {
                                    var period = _j[_h];
                                    for (var _k = 0, _l = Object.keys(timeperiods); _k < _l.length; _k++) {
                                        var tp = _l[_k];
                                        periods[period][tp] = 0;
                                    }
                                }
                                for (var _m = 0, _o = Object.keys(data[3]); _m < _o.length; _m++) {
                                    var idx2 = _o[_m];
                                    for (var _p = 0, _q = Object.keys(data[3][idx2]); _p < _q.length; _p++) {
                                        var kkey2 = _q[_p];
                                        var datestring = data[3][idx2][kkey2][fieldNum];
                                        var date = new Date(moment.tz(datestring, myclass.timezone));
                                        var itemDate = Math.round(date.getTime());
                                        for (var _r = 0, _s = Object.keys(timeperiods); _r < _s.length; _r++) {
                                            var tpd = _s[_r];
                                            if (itemDate < Number(tpd) && itemDate >= timeperiods[tpd]) {
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
                                for (var _t = 0, _u = Object.keys(periods); _t < _u.length; _t++) {
                                    var period = _u[_t];
                                    var datapoints = [];
                                    for (var _v = 0, _w = Object.keys(periods[period]); _v < _w.length; _v++) {
                                        var tpp = _w[_v];
                                        datapoints.unshift([periods[period][tpp], Number(tpp)]);
                                    }
                                    if (debug) {
                                        console.debug(" - period: ", period);
                                    }
                                    if (debug) {
                                        console.debug(" - datapoints: ", datapoints);
                                    }
                                    data[5].push({
                                        datapoints: datapoints,
                                        target: period,
                                    });
                                }
                            }
                            else {
                                if (debug) {
                                    console.debug(" - not split, selected date field: ", fieldNum);
                                }
                                var periods = {};
                                for (var _x = 0, _y = Object.keys(timeperiods); _x < _y.length; _x++) {
                                    var tp = _y[_x];
                                    periods[tp] = 0;
                                }
                                var datapoints = [];
                                if (fieldNum === "-1") {
                                    var lastTpp = "";
                                    for (var _z = 0, _0 = Object.keys(periods); _z < _0.length; _z++) {
                                        var tpp = _0[_z];
                                        datapoints.unshift([periods[tpp], Number(tpp)]);
                                        lastTpp = tpp;
                                    }
                                    if (debug) {
                                        console.debug(" - setting the query count as the last TS value: ", data[3].length);
                                    }
                                    datapoints[Object.keys(periods).length] = [data[3][0].length, Number(lastTpp)];
                                }
                                else {
                                    for (var _1 = 0, _2 = Object.keys(data[3]); _1 < _2.length; _1++) {
                                        var idx2 = _2[_1];
                                        for (var _3 = 0, _4 = Object.keys(data[3][idx2]); _3 < _4.length; _3++) {
                                            var kkey2 = _4[_3];
                                            var datestring = data[3][idx2][kkey2][fieldNum];
                                            var date = new Date(moment.tz(datestring, myclass.timezone));
                                            var itemDate = Math.round(date.getTime());
                                            for (var _5 = 0, _6 = Object.keys(timeperiods); _5 < _6.length; _5++) {
                                                var tpd = _6[_5];
                                                if (itemDate < Number(tpd) && itemDate >= timeperiods[tpd]) {
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
                                    if (q.dayhours) {
                                        for (var _7 = 0, _8 = Object.keys(periods); _7 < _8.length; _7++) {
                                            var tpp = _8[_7];
                                            var d = new Date(Number(tpp));
                                            var n = d.getHours();
                                            for (var num = 1; num <= periods[tpp]; num++) {
                                                datapoints.unshift([n, 1]);
                                            }
                                        }
                                    }
                                    else {
                                        for (var _9 = 0, _10 = Object.keys(periods); _9 < _10.length; _9++) {
                                            var tpp = _10[_9];
                                            datapoints.unshift([periods[tpp], Number(tpp)]);
                                        }
                                    }
                                }
                                if (debug) {
                                    console.debug(" - target: ", q.alias);
                                }
                                if (debug) {
                                    console.debug(" - datapoints: ", datapoints);
                                }
                                data[5].push({
                                    datapoints: datapoints,
                                    target: q.alias,
                                });
                            }
                        }
                        currentTargetNum += 1;
                        return [currentTargetNum, data[0], data[5]];
                    };
                };
                GlpiAppDatasource.prototype.testDatasource = function () {
                    var options = {
                        data: null,
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
                    }, function (err) {
                        if (err.status !== 0 || err.status >= 300) {
                            if (err.data && err.data.error) {
                                throw {
                                    message: "GLPI API Error Response: " + err.data.error,
                                };
                            }
                            else if (err.data) {
                                throw {
                                    message: "GLPI API Error Response: " + err.data[1],
                                };
                            }
                            else if (err.status === undefined) {
                                throw {
                                    message: "Cross-Origin Request Blocked: add right headers in your apache/nginx " +
                                        "like 'App-Token' and 'Session-Token'",
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