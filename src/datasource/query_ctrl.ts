///<reference path="/usr/local/share/grafana/public/app/headers/common.d.ts" />

import angular from 'angular';
import _ from 'lodash';
import GlpiAppDatasource from 'datasource';

export class GlpiAppDatasourceQueryCtrl {
    static templateUrl = 'datasource/partials/query.editor.html';


/*

 http://127.0.0.1/glpi090/front/ticket.php?is_deleted=0&criteria%5B0%5D%5Bfield%5D=12&criteria%5B0%5D%5Bsearchtype%5D=equals&criteria%5B0%5D%5Bvalue%5D=notold&criteria%5B1%5D%5Blink%5D=AND&criteria%5B1%5D%5Bfield%5D=12&criteria%5B1%5D%5Bsearchtype%5D=equals&criteria%5B1%5D%5Bvalue%5D=1&search=Rechercher&itemtype=Ticket&start=0&_glpi_csrf_token=34d68f75a06ea32db985e093c1e7e869


*/

    target: any;
    datasource: any;
    panelCtrl: any;
    panel: any;
    policySegment: any;
    datefield: any;
    table: any;
    tableColASegment: any;
    tableColBSegment: any;
    tableColCSegment: any;
    tableColDSegment: any;
    tableColESegment: any;
    tableColFSegment: any;

    constructor(public $scope, private $injector, private templateSrv, private $q, private uiSegmentSrv) {
        this.panel = this.panelCtrl.panel;
        if (this.target.datefield === "") {
            this.target.datefield = "0";
        }
        if (this.target.datefield == null) {
            this.target.datefield = "0";
        }
        this.policySegment = uiSegmentSrv.newSegment(this.target.datefield);

        // columns when it's a table
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
    }

    refresh() {
        this.panelCtrl.refresh();
    }

    getCollapsedText() {
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
    }

    getPolicySegments(datatype) {
        var initsession = this.getSession();
        return initsession.then(response => {
            if (response.status === 200) {
                this.target.query = decodeURI(this.target.query);
                var searchq = this.target.query.split(".php?");
                var url = searchq[0].split("/");
                var itemtype = url[url.length - 1];

                var urloptions: any = {
                    method: "GET",
                    url: this.datasource.url + "/listSearchOptions/" + itemtype,
                };
                urloptions.headers = urloptions.headers || {};
                urloptions.headers["App-Token"] = this.datasource.apptoken;
                urloptions.headers["Session-Token"] = response.data["session_token"];

                return this.datasource.backendSrv.datasourceRequest(urloptions).then(response => {
                    if (response.status >= 200 && response.status < 300) {
                        var date_fields = [];
                        for (var num in response.data) {
                            if (datatype == "date") {
                                if (response.data[num]["datatype"] == "datetime") {
                                    date_fields.push(this.uiSegmentSrv.newSegment({
                                        html: num,
                                        value: response.data[num]["name"],
                                        expandable: false
                                    }));
                                }
                            } else {
                                date_fields.push(this.uiSegmentSrv.newSegment({
                                    html: num,
                                    value: response.data[num]["name"],
                                    expandable: false
                                }));
                            }
                        }
                        return date_fields;
                    }
                });
            }
        });
    }

    policyChanged() {
        this.target.datefield = this.policySegment.html;
        this.panelCtrl.refresh();
    }

    tablecolChanged(col_index, colval) {
        this.target.cols[col_index] = colval.html;
        this.panelCtrl.refresh();
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