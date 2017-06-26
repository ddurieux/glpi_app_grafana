///<reference path="/usr/local/share/grafana/public/app/headers/common.d.ts" />

import angular from "angular";
import GlpiAppDatasource from "datasource";
import _ from "lodash";

export class GlpiAppDatasourceQueryCtrl {
    static templateUrl = "datasource/partials/query.editor.html";
    target: any;
    datasource: any;
    panelCtrl: any;
    panel: any;
    datefield: any;
    table: any;
    list: any;
    listdate: any;
    listnumber: any;
    scope: any;

    constructor(public $scope, private $injector, private templateSrv, private $q, private uiSegmentSrv) {

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

        if (this.target.dynamicsplit == null) {
            this.target.dynamicsplit = emptyValCol;
        }

        this.list = [];
        this.getListOptionsFields("all").then(data => { $scope.ctrl.list = data; });

        if (this.target.datefield == null) {
            this.target.datefield = emptyValCol;
        }

        this.listdate = [];
        this.getListOptionsFields("date").then(data => { $scope.ctrl.listdate = data; });

        if (this.target.counter == null) {
            this.target.counter = "yes";
        }

        this.listnumber = [];
        this.getListOptionsFields("number").then(data => { $scope.ctrl.listnumber = data; });

        this.scope = $scope;
    }

    newQueryRefresh() {
        // refresh all list when change query
        var $scope = this.scope;
        this.getListOptionsFields("all").then(data => { $scope.ctrl.list = data; });
        this.getListOptionsFields("date").then(data => { $scope.ctrl.listdate = data; });
        this.getListOptionsFields("number").then(data => { $scope.ctrl.listnumber = data; });
        this.refresh();
    }

    refresh() {
        this.panelCtrl.refresh();
    }

    getCollapsedText() {
        var text = "";

        if (this.target.query) {
            var squery = this.target.query.split(".php?");
            var squery2 = squery[0].split("/");
            // text += "Query on : " + this.target.query + ", ";
            text += "Query on " + squery2[(squery2.length - 1)] + ", ";
        }

        if (this.target.alias) {
            text += "with alias " + this.target.alias + ", ";
        }

        if (this.target.datefield.number != "0") {
            text += "with timerange based on " + this.target.datefield.label;
        }

        if (text == "") {
            text = "Make a search into GLPI interface and copy / paste the URL into 'query' field";
        }
        return text;
    }

    getListOptionsFields(datatype) {
        var initsession = this.getSession();
        return initsession.then(response => {
            if (response.status === 200) {
                this.target.query = decodeURI(this.target.query);
                var searchq = this.target.query.split(".php?");
                var url = searchq[0].split("/");
                var itemtype = url[url.length - 1];

                var urloptions: any = {
                    method: "GET",
                    transformResponse: [function(data) {
                        const regex = /"((?!name|table|field|datatype|available_searchtypes|uid)[\d|\w]+)"[:]/g;
                        let m;
                        var mySelectFields = [];
                        mySelectFields.push({
                            group: "Default",
                            label: "------",
                            number: "0",
                        });
                        if (datatype == "date") {
                            mySelectFields.push({
                                group: "Special / be careful",
                                label: "Not use date, so get all data",
                                number: "-1",
                            });
                        }
                        var groupname = "";
                        var parsed = JSON.parse(data);
                        while ((m = regex.exec(data)) !== null) {
                            // This is necessary to avoid infinite loops with zero-width matches
                            if (m.index === regex.lastIndex) {
                                regex.lastIndex++;
                            }
                            if (typeof parsed[m[1]] === "string") {
                                // it's the group name
                                groupname = parsed[m[1]];
                            } else {
                                // it's the field
                                if (datatype == "date") {
                                    if (parsed[m[1]]["datatype"] == "datetime") {
                                        mySelectFields.push({
                                            group: groupname,
                                            label: parsed[m[1]]["name"],
                                            number: m[1],
                                        });
                                    }
                                } else if (datatype == "number") {
                                    if (parsed[m[1]]["datatype"] == "timestamp"
                                        || parsed[m[1]]["datatype"] == "count"
                                        || parsed[m[1]]["datatype"] == "number"
                                        || parsed[m[1]]["datatype"] == "integer") {
                                        mySelectFields.push({
                                            group: groupname,
                                            label: parsed[m[1]]["name"],
                                            number: m[1],
                                        });
                                    }
                                } else {
                                    mySelectFields.push({
                                        group: groupname,
                                        label: parsed[m[1]]["name"],
                                        number: m[1],
                                    });
                                }
                            }
                        }
                        return mySelectFields;
                    }],
                    url: this.datasource.url + "/listSearchOptions/" + itemtype,
                };
                urloptions.headers = urloptions.headers || {};
                urloptions.headers["App-Token"] = this.datasource.apptoken;
                urloptions.headers["Session-Token"] = response.data["session_token"];
                return this.datasource.backendSrv.datasourceRequest(urloptions);
            }
        });
    }

    /** Need to have this in common file */

    getSession() {
        var options: any = {
            method: "GET",
            url: this.datasource.url + "/initSession",
        };
        options.headers = options.headers || {};
        options.headers.Authorization = "user_token " + this.datasource.usertoken;
        options.headers["App-Token"] = this.datasource.apptoken;

        return this.datasource.backendSrv.datasourceRequest(options);
    }
}
