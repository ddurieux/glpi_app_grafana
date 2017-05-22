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
                    if (this.target.datefield === "") {
                        this.target.datefield = "0";
                    }
                    if (this.target.datefield == null) {
                        this.target.datefield = "0";
                    }
                    this.policySegment = uiSegmentSrv.newSegment(this.target.datefield);
                    this.tableColASegment = uiSegmentSrv.newSegment(0);
                    this.tableColBSegment = uiSegmentSrv.newSegment(0);
                    this.tableColCSegment = uiSegmentSrv.newSegment(0);
                    this.tableColDSegment = uiSegmentSrv.newSegment(0);
                    this.tableColESegment = uiSegmentSrv.newSegment(0);
                    this.tableColFSegment = uiSegmentSrv.newSegment(0);
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
                    if (this.target.cols == null) {
                        this.target.cols = {};
                    }
                    this.list = [];
                    this.getListOptionsFields('all').then(function (data) { $scope.ctrl.list = data; });
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
                                            group: "",
                                        });
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
                                                mySelectFields.push({
                                                    number: m[1],
                                                    label: parsed[m[1]]["name"],
                                                    group: groupname,
                                                });
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
                GlpiAppDatasourceQueryCtrl.prototype.getPolicySegments = function (datatype) {
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
                            };
                            urloptions.headers = urloptions.headers || {};
                            urloptions.headers["App-Token"] = _this.datasource.apptoken;
                            urloptions.headers["Session-Token"] = response.data["session_token"];
                            return _this.datasource.backendSrv.datasourceRequest(urloptions).then(function (responselso) {
                                if (responselso.status >= 200 && responselso.status < 300) {
                                    var dateFields = [];
                                    for (var num in responselso.data) {
                                        if (datatype == "date") {
                                            if (responselso.data[num]["datatype"] == "datetime") {
                                                dateFields.push(_this.uiSegmentSrv.newSegment({
                                                    html: num,
                                                    value: responselso.data[num]["name"],
                                                    expandable: false,
                                                }));
                                            }
                                        }
                                        else {
                                            dateFields.push(_this.uiSegmentSrv.newSegment({
                                                html: num,
                                                value: responselso.data[num]["name"],
                                                expandable: false,
                                            }));
                                        }
                                    }
                                    return dateFields;
                                }
                            });
                        }
                    });
                };
                GlpiAppDatasourceQueryCtrl.prototype.policyChanged = function () {
                    this.target.datefield = this.policySegment.html;
                    this.panelCtrl.refresh();
                };
                GlpiAppDatasourceQueryCtrl.prototype.tablecolChanged = function (colindex, colval) {
                    this.target.cols[colindex] = colval.html;
                    this.panelCtrl.refresh();
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