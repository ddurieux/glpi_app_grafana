System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var GlpiAppDatasourceQueryCtrl;
    return {
        setters: [],
        execute: function () {
            GlpiAppDatasourceQueryCtrl = (function () {
                function GlpiAppDatasourceQueryCtrl($scope, $injector) {
                    this.$scope = $scope;
                    this.$injector = $injector;
                    this.panel = this.panelCtrl.panel;
                    this.select_tr_fields = [
                        { 'id': 'date_creation', 'value': 'Creation date (generic)' },
                        { 'id': 'date_mod', 'value': 'Modification date (generic)' }
                    ];
                }
                GlpiAppDatasourceQueryCtrl.prototype.refresh = function () {
                    this.panelCtrl.refresh();
                };
                GlpiAppDatasourceQueryCtrl.prototype.getCollapsedText = function () {
                    var text = '';
                    if (this.target.query) {
                        text += 'Query: ' + this.target.query + ', ';
                    }
                    if (this.target.alias) {
                        text += 'Alias: ' + this.target.alias;
                    }
                    if (text == '') {
                        text = "Make a search into GLPI interface and copy / paste the URL into 'query' field";
                    }
                    return text;
                };
                return GlpiAppDatasourceQueryCtrl;
            }());
            GlpiAppDatasourceQueryCtrl.templateUrl = 'datasource/partials/query.editor.html';
            exports_1("GlpiAppDatasourceQueryCtrl", GlpiAppDatasourceQueryCtrl);
        }
    };
});
//# sourceMappingURL=query_ctrl.js.map