System.register(["../vendor/public/builds/moment-timezone-with-data", "./datasource", "./query_ctrl"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var moment, datasource_1, query_ctrl_1, GlpiAppDatasourceConfigCtrl;
    return {
        setters: [
            function (moment_1) {
                moment = moment_1;
            },
            function (datasource_1_1) {
                datasource_1 = datasource_1_1;
            },
            function (query_ctrl_1_1) {
                query_ctrl_1 = query_ctrl_1_1;
            }
        ],
        execute: function () {
            exports_1("Datasource", datasource_1.GlpiAppDatasource);
            exports_1("QueryCtrl", query_ctrl_1.GlpiAppDatasourceQueryCtrl);
            GlpiAppDatasourceConfigCtrl = (function () {
                function GlpiAppDatasourceConfigCtrl($scope) {
                    this.timezoneLst = moment.tz.names();
                    this.current.jsonData.timezone = this.current.jsonData.timezone || "UTC";
                }
                return GlpiAppDatasourceConfigCtrl;
            }());
            GlpiAppDatasourceConfigCtrl.templateUrl = "datasource/partials/config.html";
            exports_1("GlpiAppDatasourceConfigCtrl", GlpiAppDatasourceConfigCtrl);
            exports_1("ConfigCtrl", GlpiAppDatasourceConfigCtrl);
        }
    };
});
//# sourceMappingURL=module.js.map