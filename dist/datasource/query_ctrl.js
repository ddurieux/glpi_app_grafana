System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var GlpiAppDatasourceQueryCtrl;
    return {
        setters: [],
        execute: function () {
            GlpiAppDatasourceQueryCtrl = (function () {
                function GlpiAppDatasourceQueryCtrl($scope, $injector, templateSrv, $q, uiSegmentSrv) {
                    this.$scope = $scope;
                    this.$injector = $injector;
                    this.templateSrv = templateSrv;
                    this.$q = $q;
                    this.uiSegmentSrv = uiSegmentSrv;
                    this.panel = this.panelCtrl.panel;
                    this.target.histogram = false;
                    if (this.panel.type === "mtanda-histogram-panel") {
                        this.target.histogram = true;
                        this.target.dayhours = true;
                    }
                    if (this.target.query == null) {
                        this.target.query = "http://127.0.0.1/glpi/front/ticket.php?is_deleted=0&criteria%5B0%5D%5Bfield%5D=2&" +
                            "criteria%5B0%5D%5Bsearchtype%5D=contains&criteria%5B0%5D%5Bvalue%5D=&search=Rechercher&itemtype=" +
                            "Ticket&start=0";
                    }
                    if (this.target.table == null) {
                        this.target.table = false;
                    }
                    if (this.target.console == null) {
                        this.target.console = false;
                    }
                    var emptyValCol = {
                        group: "Default",
                        label: "------",
                        number: "0",
                    };
                    if (this.target.col_0 == null) {
                        this.target.col_0 = emptyValCol;
                    }
                    if (this.target.col_1 == null) {
                        this.target.col_1 = emptyValCol;
                    }
                    if (this.target.col_2 == null) {
                        this.target.col_2 = emptyValCol;
                    }
                    if (this.target.col_3 == null) {
                        this.target.col_3 = emptyValCol;
                    }
                    if (this.target.col_4 == null) {
                        this.target.col_4 = emptyValCol;
                    }
                    if (this.target.col_5 == null) {
                        this.target.col_5 = emptyValCol;
                    }
                    if (this.target.col_6 == null) {
                        this.target.col_6 = emptyValCol;
                    }
                    if (this.target.col_7 == null) {
                        this.target.col_7 = emptyValCol;
                    }
                    if (this.target.col_8 == null) {
                        this.target.col_8 = emptyValCol;
                    }
                    if (this.target.col_9 == null) {
                        this.target.col_9 = emptyValCol;
                    }
                    if (this.target.col_10 == null) {
                        this.target.col_10 = emptyValCol;
                    }
                    if (this.target.col_11 == null) {
                        this.target.col_11 = emptyValCol;
                    }
                    if (this.target.dynamicsplit == null) {
                        this.target.dynamicsplit = emptyValCol;
                    }
                    this.list = [];
                    this.getListOptionsFields("all", this.target.console).then(function (data) { $scope.ctrl.list = data; });
                    if (this.target.datefield == null) {
                        this.target.datefield = emptyValCol;
                    }
                    this.listdate = [];
                    this.getListOptionsFields("date", this.target.console)
                        .then(function (data) {
                        $scope.ctrl.listdate = data;
                        if ($scope.ctrl.target.datefield.number === "0") {
                            $scope.ctrl.target.datefield = data.data[2];
                        }
                    });
                    if (this.target.counter == null) {
                        this.target.counter = true;
                    }
                    if (this.target.dayhours == null) {
                        this.target.dayhours = false;
                    }
                    this.listnumber = [];
                    this.getListOptionsFields("number", this.target.console).then(function (data) { $scope.ctrl.listnumber = data; });
                    this.scope = $scope;
                }
                GlpiAppDatasourceQueryCtrl.prototype.newQueryRefresh = function () {
                    var $scope = this.scope;
                    this.getListOptionsFields("all", this.target.console).then(function (data) { $scope.ctrl.list = data; });
                    this.getListOptionsFields("date", this.target.console).then(function (data) { $scope.ctrl.listdate = data; });
                    this.getListOptionsFields("number", this.target.console).then(function (data) { $scope.ctrl.listnumber = data; });
                    this.refresh();
                };
                GlpiAppDatasourceQueryCtrl.prototype.refresh = function () {
                    this.panelCtrl.refresh();
                };
                GlpiAppDatasourceQueryCtrl.prototype.getCollapsedText = function () {
                    var text = "";
                    if (this.target.query) {
                        var squery = this.target.query.split(".php?");
                        var squery2 = squery[0].split("/");
                        text += "Query on " + squery2[(squery2.length - 1)] + ", ";
                    }
                    if (this.target.alias) {
                        text += "with alias " + this.target.alias + ", ";
                    }
                    if (this.target.datefield.number !== "0") {
                        text += "with timerange based on " + this.target.datefield.label;
                    }
                    if (text === "") {
                        text = "Make a search into GLPI interface and copy / paste the URL into 'query' field";
                    }
                    return text;
                };
                GlpiAppDatasourceQueryCtrl.prototype.getListOptionsFields = function (datatype, console) {
                    var _this = this;
                    var initsession = this.getSession();
                    var debug = console;
                    return initsession.then(function (response) {
                        if (response.status === 200) {
                            _this.target.query = decodeURI(_this.target.query);
                            var searchq = _this.target.query.split(".php?");
                            var url = searchq[0].split("/");
                            var itemtype = url[url.length - 1];
                            var urloptions = {
                                method: "GET",
                                transformResponse: [function (data) {
                                        var regex = /"((?!name|table|field|datatype|nosearch|nodisplay|available_searchtypes|uid)[\d|\w]+)"[:]/g;
                                        var m;
                                        var mySelectFields = [];
                                        mySelectFields.push({
                                            group: "Default",
                                            label: "------",
                                            number: "0",
                                        });
                                        if (datatype === "date") {
                                            mySelectFields.push({
                                                group: "Special / be careful",
                                                label: "Do not use date search (get all data)",
                                                number: "-1",
                                            });
                                        }
                                        var groupname = "";
                                        var parsed = JSON.parse(data);
                                        if (debug) {
                                            console.debug(parsed);
                                        }
                                        while ((m = regex.exec(data)) !== null) {
                                            if (m.index === regex.lastIndex) {
                                                regex.lastIndex++;
                                            }
                                            if (typeof parsed[m[1]] === "string") {
                                                groupname = parsed[m[1]];
                                            }
                                            else {
                                                if (!("table" in parsed[m[1]])) {
                                                    groupname = parsed[m[1]].name;
                                                }
                                                else {
                                                    if (debug) {
                                                        console.debug("field:", parsed[m[1]]);
                                                    }
                                                    if (datatype === "date") {
                                                        if (parsed[m[1]]["datatype"] === "datetime"
                                                            || parsed[m[1]]["datatype"] === "date") {
                                                            mySelectFields.push({
                                                                group: groupname,
                                                                label: parsed[m[1]]["name"],
                                                                number: m[1],
                                                            });
                                                        }
                                                    }
                                                    else if (datatype === "number") {
                                                        if (parsed[m[1]]["datatype"] === "timestamp"
                                                            || parsed[m[1]]["datatype"] === "count"
                                                            || parsed[m[1]]["datatype"] === "number"
                                                            || parsed[m[1]]["datatype"] === "integer") {
                                                            mySelectFields.push({
                                                                group: groupname,
                                                                label: parsed[m[1]]["name"],
                                                                number: m[1],
                                                            });
                                                        }
                                                    }
                                                    else {
                                                        mySelectFields.push({
                                                            group: groupname,
                                                            label: parsed[m[1]]["name"],
                                                            number: m[1],
                                                        });
                                                    }
                                                }
                                            }
                                        }
                                        if (debug) {
                                            console.debug("Fields; ", datatype, mySelectFields);
                                        }
                                        return mySelectFields;
                                    }],
                                url: _this.datasource.url + "/listSearchOptions/" + itemtype,
                            };
                            urloptions.headers = urloptions.headers || {};
                            urloptions.headers["App-Token"] = _this.datasource.apptoken;
                            urloptions.headers["Session-Token"] = response.data.session_token;
                            return _this.datasource.backendSrv.datasourceRequest(urloptions);
                        }
                    });
                };
                GlpiAppDatasourceQueryCtrl.prototype.getSession = function () {
                    var options = {
                        method: "GET",
                        url: this.datasource.url + "/initSession",
                    };
                    options.headers = options.headers || {};
                    options.headers.Authorization = "user_token " + this.datasource.usertoken;
                    options.headers["App-Token"] = this.datasource.apptoken;
                    return this.datasource.backendSrv.datasourceRequest(options);
                };
                return GlpiAppDatasourceQueryCtrl;
            }());
            GlpiAppDatasourceQueryCtrl.templateUrl = "datasource/partials/query.editor.html";
            exports_1("GlpiAppDatasourceQueryCtrl", GlpiAppDatasourceQueryCtrl);
        }
    };
});
//# sourceMappingURL=query_ctrl.js.map