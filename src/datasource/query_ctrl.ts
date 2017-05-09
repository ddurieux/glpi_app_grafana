///<reference path="/usr/local/share/grafana/public/app/headers/common.d.ts" />

import angular from 'angular';
import _ from 'lodash';

export class GlpiAppDatasourceQueryCtrl {
    static templateUrl = 'datasource/partials/query.editor.html';


/*

 http://127.0.0.1/glpi090/front/ticket.php?is_deleted=0&criteria%5B0%5D%5Bfield%5D=12&criteria%5B0%5D%5Bsearchtype%5D=equals&criteria%5B0%5D%5Bvalue%5D=notold&criteria%5B1%5D%5Blink%5D=AND&criteria%5B1%5D%5Bfield%5D=12&criteria%5B1%5D%5Bsearchtype%5D=equals&criteria%5B1%5D%5Bvalue%5D=1&search=Rechercher&itemtype=Ticket&start=0&_glpi_csrf_token=34d68f75a06ea32db985e093c1e7e869


*/

    target: any;
    datasource: any;
    panelCtrl: any;
    panel: any;
    select_tr_fields: any;

    constructor(public $scope, private $injector) {
        this.panel = this.panelCtrl.panel;
        this.select_tr_fields = [
            {'id': 'date_creation', 'value': 'Creation date (generic)'},
            {'id': 'date_mod', 'value': 'Modification date (generic)'}
            ]
    }

    refresh() {
        this.panelCtrl.refresh();
    }

    getCollapsedText() {

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

    }

}