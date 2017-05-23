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
                    this.table = [
                        {
                            name: "Yes",
                            value: "yes",
                        },
                        {
                            name: "No",
                            value: "no",
                        },
                    ];
                    if (this.target.table == null) {
                        this.target.table = "no";
                    }
                    var emptyValCol = {
                        number: "0",
                        label: "------",
                        group: "Default",
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
                    this.list = [];
                    this.getListOptionsFields('all').then(function (data) { $scope.ctrl.list = data; });
                    if (this.target.datefield == null) {
                        this.target.datefield = emptyValCol;
                    }
                    this.listdate = [];
                    this.getListOptionsFields('date').then(function (data) { $scope.ctrl.listdate = data; });
                    if (this.target.counter == null) {
                        this.target.counter = "yes";
                    }
                    this.listnumber = [];
                    this.getListOptionsFields('number').then(function (data) { $scope.ctrl.listnumber = data; });
                }
                GlpiAppDatasourceQueryCtrl.prototype.refresh = function () {
                    this.panelCtrl.refresh();
                };
                GlpiAppDatasourceQueryCtrl.prototype.getCollapsedText = function () {
                    var text = "";
                    if (this.target.query) {
                        text += "Query: " + this.target.query + ", ";
                    }
                    if (this.target.alias) {
                        text += "Alias: " + this.target.alias;
                    }
                    if (text == "") {
                        text = "Make a search into GLPI interface and copy / paste the URL into 'query' field";
                    }
                    return text;
                };
                GlpiAppDatasourceQueryCtrl.prototype.getListOptionsFields = function (datatype) {
                    var _this = this;
                    var initsession = this.getSession();
                    return initsession.then(function (response) {
                        if (response.status === 200) {
                            _this.target.query = decodeURI(_this.target.query);
                            var searchq = _this.target.query.split(".php?");
                            var url = searchq[0].split("/");
                            var itemtype = url[url.length - 1];
                            var urloptions = {
                                method: "GET",
                                url: _this.datasource.url + "/listSearchOptions/" + itemtype,
                                transformResponse: [function (data) {
                                        var regex = /"((?!name|table|field|datatype|available_searchtypes|uid)[\d|\w]+)"[:]/g;
                                        var m;
                                        var mySelectFields = [];
                                        mySelectFields.push({
                                            number: "0",
                                            label: "------",
                                            group: "Default",
                                        });
                                        if (datatype == "date") {
                                            mySelectFields.push({
                                                number: "-1",
                                                label: "Not use date, so get all data",
                                                group: "Special / be careful",
                                            });
                                        }
                                        var groupname = '';
                                        var parsed = JSON.parse(data);
                                        while ((m = regex.exec(data)) !== null) {
                                            if (m.index === regex.lastIndex) {
                                                regex.lastIndex++;
                                            }
                                            if (typeof parsed[m[1]] === 'string') {
                                                groupname = parsed[m[1]];
                                            }
                                            else {
                                                if (datatype == "date") {
                                                    if (parsed[m[1]]["datatype"] == "datetime") {
                                                        mySelectFields.push({
                                                            number: m[1],
                                                            label: parsed[m[1]]["name"],
                                                            group: groupname,
                                                        });
                                                    }
                                                }
                                                else if (datatype == "number") {
                                                    if (parsed[m[1]]["datatype"] == "timestamp"
                                                        || parsed[m[1]]["datatype"] == "count"
                                                        || parsed[m[1]]["datatype"] == "number"
                                                        || parsed[m[1]]["datatype"] == "integer") {
                                                        mySelectFields.push({
                                                            number: m[1],
                                                            label: parsed[m[1]]["name"],
                                                            group: groupname,
                                                        });
                                                    }
                                                }
                                                else {
                                                    mySelectFields.push({
                                                        number: m[1],
                                                        label: parsed[m[1]]["name"],
                                                        group: groupname,
                                                    });
                                                }
                                            }
                                        }
                                        return mySelectFields;
                                    }],
                            };
                            urloptions.headers = urloptions.headers || {};
                            urloptions.headers["App-Token"] = _this.datasource.apptoken;
                            urloptions.headers["Session-Token"] = response.data["session_token"];
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