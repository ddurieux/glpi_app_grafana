System.register(["./datasource", "./query_ctrl", "../vendor/public/builds/moment-timezone-with-data"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var datasource_1, query_ctrl_1, moment, GlpiAppDatasourceConfigCtrl, GlpiQueryOptionsCtrl;
    return {
        setters: [
            function (datasource_1_1) {
                datasource_1 = datasource_1_1;
            },
            function (query_ctrl_1_1) {
                query_ctrl_1 = query_ctrl_1_1;
            },
            function (moment_1) {
                moment = moment_1;
            }
        ],
        execute: function () {
            exports_1("Datasource", datasource_1.GlpiAppDatasource);
            exports_1("QueryCtrl", query_ctrl_1.GlpiAppDatasourceQueryCtrl);
            GlpiAppDatasourceConfigCtrl = (function () {
                function GlpiAppDatasourceConfigCtrl($scope) {
                    this.timezone_list = moment.tz.names();
                    this.current.jsonData.timezone = this.current.jsonData.timezone || 'UTC';
                }
                return GlpiAppDatasourceConfigCtrl;
            }());
            GlpiAppDatasourceConfigCtrl.templateUrl = "datasource/partials/config.html";
            exports_1("GlpiAppDatasourceConfigCtrl", GlpiAppDatasourceConfigCtrl);
            exports_1("ConfigCtrl", GlpiAppDatasourceConfigCtrl);
            GlpiQueryOptionsCtrl = (function () {
                function GlpiQueryOptionsCtrl() {
                }
                return GlpiQueryOptionsCtrl;
            }());
            GlpiQueryOptionsCtrl.templateUrl = "datasource/partials/query.options.html";
            exports_1("QueryOptionsCtrl", GlpiQueryOptionsCtrl);
        }
    };
});
//# sourceMappingURL=module.js.map