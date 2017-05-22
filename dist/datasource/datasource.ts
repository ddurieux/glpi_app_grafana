///<reference path="/usr/local/share/grafana/public/app/headers/common.d.ts" />

import _ from "lodash";

export class GlpiAppDatasource {
  private usertoken: any;
  private apptoken: any;
  private name: string;
  private type: string;

  private supportAnnotations: boolean;
  private supportMetrics: boolean;
  private q: any;
  private backendSrv: any;
  private templateSrv: any;
  private url: string;
  private session: string;
  private searchOptions: any;

  constructor(instanceSettings, $q, backendSrv, templateSrv) {

    this.url = instanceSettings.url;
    this.apptoken = instanceSettings.jsonData.apptoken;
    this.usertoken = instanceSettings.jsonData.token;
    this.name = instanceSettings.name;

    this.supportAnnotations = true;
    this.supportMetrics = true;

    this.q = $q;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
    this.session = "";
    this.searchOptions = {};
  }

  /** This will do the queries on GLPI and return datapoints results for panels */
  query(options) {
    var scopedVars = options.scopedVars;
    var targets = _.cloneDeep(options.targets);
    var queryTargets = [];

    var allQueries = _.map(targets, target => {
      if (target.hide) { return ""; }

      queryTargets.push(target);

      // backward compatability
      scopedVars.interval = scopedVars.__interval;

      return queryTargets;

    }).reduce((acc, current) => {
      if (current !== "") {
        acc += ";" + current;
      }
      return acc;
    });

    var initsession = this.getSession();
    return initsession.then(response => {
      if (response.status === 200) {

        var target_pool = [];
        for (var q of queryTargets) {
          target_pool.push(this.promiseATarget(queryTargets, options, response, this));
        }
        var l = 0;
        for (var funt in target_pool) {
          if (l === 0) {
            var promt = target_pool[l]([l, this.backendSrv, []]);
          } else {
            promt = promt.then(target_pool[l]);
          }
          l += 1;
        }
        var resultalltarget = function (data) {
          var ret = {
            data: data[2]
          };
          return ret;
        };
        return promt.then(resultalltarget);
      }
    });
  }

  /** This will do the queries on GLPI of one of the different targets */
  promiseATarget(queryTargets, options, response, myclass) {
    return function(targetargs) {
      var current_target_num = targetargs[0];
      var bksrv = targetargs[1];
      var alltargetresult = targetargs[2];
      var q = queryTargets[current_target_num];

      q.query = decodeURI(q.query);
      var searchq = q.query.split(".php?");
      var url = searchq[0].split("/");
      var itemtype = url[url.length - 1];
      var interval_s = Math.round(options.scopedVars.__interval_ms["value"] / 1000);
      var interval_start = Math.round(options.range.from.valueOf() / 1000);
      var interval_end = Math.round(options.range.to.valueOf() / 1000);

      // add timerange
      var dateISO = new Date(interval_start * 1e3).toISOString();
      var url_start_date = dateISO.slice(0, -14) + " " + dateISO.slice(-13, -5);
      // field num for creation_date
      var field_num = q.datefield;

      for (var i = 0; i < 50; i++) {
        if (searchq[1].indexOf("criteria[" + i + "]") < 0) {
          searchq[1] += "&criteria[" + i + "][link]=AND&" +
              "criteria[" + i + "][field]=" + field_num + "&" +
              "criteria[" + i + "][searchtype]=morethan&" +
              "_select_criteria[" + i + "][value]=0&" +
              "_criteria[" + i + "][value]=" + interval_start + "&" +
              "criteria[" + i + "][value]=" + url_start_date;
          break;
        }
      }
      if (q.table == 'yes') {
        searchq[1] += "&giveItems=true";
      }

      // Get all count per range / timerange
      var interval_s = Math.round(options.scopedVars.__interval_ms["value"] / 1000) * 10;
      var interval_start = Math.round(options.range.from.valueOf() / 1000);
      var interval_end = Math.round(options.range.to.valueOf() / 1000);
      var range = _.range(interval_start, interval_end, interval_s);
      var timeperiods = {};
      for (var num in range) {
        timeperiods[range[num]] = range[num] + interval_s; // ie timeperiod[start] = end
      }

      // URL options for GLPI API
      var urloptions: any = {
        method: "GET",
        url: myclass.url + "/search/" + itemtype + "?" + searchq[1],
      };
      urloptions.headers = urloptions.headers || {};
      urloptions.headers["App-Token"] = myclass.apptoken;
      urloptions.headers["Session-Token"] = response.data["session_token"];

      var to = myclass.promiseGetNumberElementsOfTarget(field_num, q, myclass, current_target_num);
      return to(bksrv, urloptions, timeperiods, alltargetresult);
    };
  }

  /** This will get the number of elements in GLPI to get */
  promiseGetNumberElementsOfTarget(field_num, q, myclass, current_target_num) {
    return function (bksrv, urloptions, timeperiods, alltargetresult) {
      return bksrv.datasourceRequest(urloptions).then(response => {
        if (response.status >= 200 && response.status < 300) {
          // get totalcount
          var number_pages = Math.ceil(response.data["totalcount"] / 400);

          // Create promises to request on API
          var pool = [];
          for (var j = 0; j < number_pages; j++) {
            pool.push(myclass.promiseGetEachRangePageOfTarget(q));
          }
          // protect when no elements
          if (pool.length === 0) {
            var datapointempty = [];
            for (var tp in timeperiods) {
              datapointempty.push([0, tp]);
            }
            return {
              data: [
                {
                  target: "tickets",
                  datapoints: datapointempty,
                },
              ]
            };
          }

          var k = 0;
          for (var fun in pool) {
            if (k === 0) {
              var prom = pool[k]([bksrv, urloptions, timeperiods, [], 0, alltargetresult]);
            } else {
              prom = prom.then(pool[k]);
            }
            k += 1;
          }
          var resultfunc = myclass.promiseMergeTargetResult(timeperiods, field_num, q, current_target_num);
          return prom.then(resultfunc);
        }
      });
    };
  }

  /** This will get each ranges/pages in GLPI. Goal is to get all elements of GLPI here */
  promiseGetEachRangePageOfTarget(q) {
    return function (args) {
      var bksrv = args[0];
      var url2options = _.cloneDeep(args[1]);

      url2options["url"] += "&range=" + args[4] + "-" + (args[4] + 399);
      args[4] += 400;
      return bksrv.datasourceRequest(url2options).then(response => {
        if (response.status >= 200 && response.status < 300) {
          if (q.table == 'yes') {
            args[3].push(response.data["data_html"]);
          } else {
            args[3].push(response.data["data"]);
          }
          return [bksrv, args[1], args[2], args[3], args[4], args[5]];
        }
      });
    };
  }

  /** This will merge all results/elements (all ranges/pages) into same array */
  promiseMergeTargetResult(timeperiods, field_num, q, current_target_num) {
    return function(data) {
      if (q.table == 'yes') {
        var columns = [];
        columns.push({text: q.col_0_alias, type: "string"});
        columns.push({text: q.col_1_alias, type: "string"});
        var rows = [];
        for (var idx in data[3]) {
          for (var kkey in data[3][idx]) {
            rows.push([data[3][idx][kkey][q.cols[0]], data[3][idx][kkey][q.cols[1]]]);
          }
        }
        data[5].push({
          columns: columns,
          rows: rows,
          type: "table",
        });
      } else {
        // it's datapoints

        // Define all timeperiods
        var periods = {};
        for (var tp in timeperiods) {
          periods[tp] = 0;
        }
        for (var idx in data[3]) {
          for (var kkey in data[3][idx]) {
            var date = new Date(data[3][idx][kkey][field_num]);
            var item_date = Math.round(date.getTime() / 1000);
            for (var tpd in timeperiods) {
              if (item_date >= Number(tpd) && item_date < timeperiods[tpd]) {
                periods[tpd] += 1;
                break;
              }
            }
          }
        }

        // We create the datapoints
        var datapoints = [];
        for (var tpp in periods) {
          datapoints.unshift([periods[tpp], Number(tpp) * 1000]);
        }

        data[5].push({
          target: q.alias,
          datapoints: datapoints,
        });
      }
      current_target_num += 1;
      return [current_target_num, data[0], data[5]];
    };
  }

  testDatasource() {
    var options: any = {
      method: "GET",
      url: this.url + "/initSession",
    };
    options.headers = options.headers || {};
    options.headers.Authorization = "user_token " + this.usertoken;
    options.headers["App-Token"] = this.apptoken;
    return this.backendSrv.datasourceRequest(options).then(response => {
      if (response.status === 200) {
        return { status: "success", message: "Data source is working", title: "Success" };
      }
    });
  }

  getSession() {
    var options: any = {
      method: "GET",
      url: this.url + "/initSession",
    };
    options.headers = options.headers || {};
    options.headers.Authorization = "user_token " + this.usertoken;
    options.headers["App-Token"] = this.apptoken;

    return this.backendSrv.datasourceRequest(options);
  }

  getSearchOptions(itemtype) {
    if (!(itemtype in this.searchOptions)) {
      var urloptions: any = {
        method: "GET",
        url: this.url + "/listSearchOptions/" + itemtype,
      };
      urloptions.headers = urloptions.headers || {};
      urloptions.headers["App-Token"] = this.apptoken;
      urloptions.headers["Session-Token"] = this.session;
      var answer = this.backendSrv.datasourceRequest(urloptions).then(response => {
        if (response.status === 200) {
          return response.data;
        }
      });
      this.searchOptions[itemtype] = answer;
    }
  }
}
