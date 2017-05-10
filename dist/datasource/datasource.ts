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

        for (var q of queryTargets) {
          q.query = decodeURI(q.query);
          var searchq = q.query.split(".php?");
          var url = searchq[0].split("/");
          var itemtype = url[url.length - 1];
          var interval_s = Math.round(options.scopedVars.__interval_ms["value"] / 1000);
          var interval_start = Math.round(options.range.from.valueOf() / 1000);
          var interval_end = Math.round(options.range.to.valueOf() / 1000);
          //itemtype = "ticket";

          // add timerange
          var dateISO = new Date(interval_start * 1e3).toISOString();
          var url_start_date = dateISO.slice(0, -14) + " " + dateISO.slice(-13, -5);
          // field num for creation_date
          var field_num = 15;
          if (itemtype == 'computer') {
            field_num = 121;
          }
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

          // Get all count per range / timerange
          var interval_s = Math.round(options.scopedVars.__interval_ms["value"] / 1000);
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
            url: this.url + "/search/" + itemtype + "?" + searchq[1],
          };
          urloptions.headers = urloptions.headers || {};
          urloptions.headers["App-Token"] = this.apptoken;
          urloptions.headers["Session-Token"] = response.data["session_token"];

          var bksrv = this.backendSrv;
          var to = function(bksrv, urloptions, timeperiods) {
            return bksrv.datasourceRequest(urloptions).then(response => {
              if (response.status >= 200 && response.status < 300) {
                // get totalcount
                var number_pages = Math.ceil(response.data["totalcount"] / 200);

                // Create promises to request on API
                var pool = [];
                for (var j = 0; j < number_pages; j++) {
                  pool.push(function(args) {
                    bksrv = args[0];
                    var url2options = _.cloneDeep(args[1]);
                    url2options["url"] += "&range=" + args[4] + "-" + (args[4] + 199);
                    args[4] += 200;
                    return bksrv.datasourceRequest(url2options).then(response => {
                      if (response.status >= 200 && response.status < 300) {
                        args[3].push(response.data["data"]);

                        return [bksrv, args[1], args[2], args[3], args[4]];
                      }
                    });
                  });
                }
                // protect when no elements
                if (pool.length == 0) {
                  var datapointempty = [];
                  for (var tp in timeperiods) {
                    datapointempty.push([0, tp]);
                  }
                  return {data: [
                    {
                      target: "tickets",
                      datapoints: datapointempty,
                    },
                  ]};
                }

                var k = 0;
                for (var fun in pool) {
                  if (k == 0) {
                    var prom = pool[k]([bksrv, urloptions, timeperiods, [], 0]);
                  } else {
                    prom = prom.then(pool[k]);
                  }
                  k += 1;
                }
                var resultfunc = function(data) {
                  // Define all timeperiods
                  var periods = {};
                  for (var tp in timeperiods) {
                    periods[tp] = 0;
                  }
                  for (var idx in data[3]) {
                    for (var kkey in data[3][idx]) {
                      var date = new Date(data[3][idx][kkey][field_num]);
                      var item_date = Math.round(date.getTime() / 1000);
                      for (var tp in timeperiods) {
                        if (item_date >= Number(tp) && item_date < timeperiods[tp]) {
                          periods[tp] += 1;
                          break;
                        }
                      }
                    }
                  }

                  // We create the datapoints
                  var datapoints = [];
                  for (var tp in periods) {
                    datapoints.unshift([periods[tp], Number(tp) * 1000]);
                  }

                  var ret = {data: [
                    {
                      target: "tickets",
                      datapoints: datapoints,
                    },
                  ]};
                  return ret;
                };
                return prom.then(resultfunc);
              }
            });
          };
          return to(bksrv, urloptions, timeperiods);
        }
      }
    });

/*
    var unix = Math.round(+new Date()/1000);
    return {"data": [
      {"target": 'test.cpu1', "datapoints": [[53,(unix-420)],[5,(unix-360)],[12,(unix-300)],[23,(unix-240)],[33,(unix-180)],[22,(unix-120)],[41,(unix-60)],[20,unix]]}
    ]};
*/

/*    return {"data": [
      {
        "columns": [
          {
            "text": "Time",
            "type": "time",
            "sort": true,
            "desc": true,
          },
          {
            "text": "mean",
          },
          {
            "text": "sum",
          }
        ],
        "rows": [
          [
            1457425380000,
            null,
            null
          ],
          [
            1457425370000,
            1002.76215352,
            1002.76215352
          ],
        ],
        "type": "table"
      }
      ]};
      */
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
//        .then(response => {
//      if (response.status === 200) {
//        return response.data;
//      }
//    });
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
