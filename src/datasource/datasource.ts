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

        var targetPool = [];
        for (var q of queryTargets) {
          targetPool.push(this.promiseATarget(queryTargets, options, response, this));
        }
        var l = 0;
        for (var funt in targetPool) {
          if (l === 0) {
            var promt = targetPool[l]([l, this.backendSrv, []]);
          } else {
            promt = promt.then(targetPool[l]);
          }
          l += 1;
        }
        var resultalltarget = function(data) {
          var ret = {
            data: data[2],
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
      var currentTargetNum = targetargs[0];
      var bksrv = targetargs[1];
      var alltargetresult = targetargs[2];
      var q = queryTargets[currentTargetNum];

      q.query = decodeURI(q.query);
      var searchq = q.query.split(".php?");
      var url = searchq[0].split("/");
      var itemtype = url[url.length - 1];
      var interval_s = Math.round(options.scopedVars.__interval_ms["value"] / 1000);
      var interval_start = Math.round(options.range.from.valueOf() / 1000) + 3600 + 3600;
      var interval_end = Math.round(options.range.to.valueOf() / 1000) + 3600 + 3600;

      // add timerange
      var dateISO = new Date(interval_start * 1e3).toISOString();
      var url_start_date = dateISO.slice(0, -14) + " " + dateISO.slice(-13, -5);
      // field num for creation_date
      var field_num = q.datefield["number"];

      var dateISOend = new Date(interval_end * 1e3).toISOString();
      var url_end_date = dateISOend.slice(0, -14) + " " + dateISOend.slice(-13, -5);

      if (field_num != "-1") {
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
        // And the end date
        i += 1;
        searchq[1] += "&criteria[" + i + "][link]=AND&" +
            "criteria[" + i + "][field]=" + field_num + "&" +
            "criteria[" + i + "][searchtype]=lessthan&" +
            "_select_criteria[" + i + "][value]=0&" +
            "_criteria[" + i + "][value]=" + interval_end + "&" +
            "criteria[" + i + "][value]=" + url_end_date;
      }
      searchq[1] += "&forcedisplay[0]=0";
      if (q.table == "yes") {
        searchq[1] += "&giveItems=true";

        for (var colNum = 0; colNum <= 5 ; colNum++) {
          if (eval("q.col_" + colNum)["number"] != "0") {
            searchq[1] += "&forcedisplay[" + eval("q.col_" + colNum)["number"] + "]=" + eval("q.col_" + colNum)["number"];
          }
        }
      }
      if (q.dynamicsplit.number != "0") {
        searchq[1] += "&forcedisplay[" + q.dynamicsplit.number + "]=" + q.dynamicsplit.number;
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
        url: myclass.url + "/search/" + itemtype + "?" + searchq[1],
      };
      urloptions.headers = urloptions.headers || {};
      urloptions.headers["App-Token"] = myclass.apptoken;
      urloptions.headers["Session-Token"] = response.data["session_token"];

      var to = myclass.promiseGetNumberElementsOfTarget(field_num, q, myclass, currentTargetNum);
      return to(bksrv, urloptions, timeperiods, alltargetresult);
    };
  }

  /** This will get the number of elements in GLPI to get */
  promiseGetNumberElementsOfTarget(field_num, q, myclass, current_target_num) {
    return function(bksrv, urloptions, timeperiods, alltargetresult) {
      return bksrv.datasourceRequest(urloptions).then(response => {
        if (response.status >= 200 && response.status < 300) {
          // get totalcount
          var number_pages = Math.ceil(response.data["totalcount"] / 400);
          if (number_pages == 0) {
            number_pages = 1;
          }

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
              ],
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
    return function(args) {
      var bksrv = args[0];
      var url2options = _.cloneDeep(args[1]);

      url2options["url"] += "&range=" + args[4] + "-" + (args[4] + 399);
      args[4] += 400;
      return bksrv.datasourceRequest(url2options).then(response => {
        if (response.status >= 200 && response.status < 300) {
          if (q.table == "yes") {
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
      if (q.table == "yes") {
        var columns = [];
        var maxnum = 0;
        for (var colNum = 0; colNum <= 5 ; colNum++) {
          if (eval("q.col_" + colNum)["number"] != "0") {
            maxnum = _.cloneDeep(colNum);
            if (eval("q.col_" + colNum + "_alias") == null ||  eval("q.col_" + colNum + "_alias") == "") {
              columns.push({text: eval("q.col_" + colNum)["label"], type: "string"});
            } else {
              columns.push({text: eval("q.col_" + colNum + "_alias"), type: "string"});
            }
          }
        }
        var rows = [];
        for (var idx in data[3]) {
          for (var kkey in data[3][idx]) {
            var myrow = [];
            for (var colNum2 = 0; colNum2 <= maxnum; colNum2++) {
              var cleanedHTML = data[3][idx][kkey][eval("q.col_" + colNum2)["number"]].replace(/<div(.|\n|\r)+<\/div>/, "");
              cleanedHTML = cleanedHTML.replace(/<script(.|\n|\r)+<\/script>/, "");
              cleanedHTML = cleanedHTML.replace(/<img.+class='pointer'>/, "");
              myrow.push(cleanedHTML);
            }
            rows.push(myrow);
          }
        }
        data[5].push({
          columns: columns,
          rows: rows,
          type: "table",
        });
      } else {
        // it's datapoints
        if (q.dynamicsplit.number != "0") {
          var periods = {};
          for (var idx2 in data[3]) {
            for (var kkey2 in data[3][idx2]) {
              periods[data[3][idx2][kkey2][q.dynamicsplit.number]] = {};
            }
          }
          for (var period in periods) {
            for (var tp in timeperiods) {
              periods[period][tp] = 0;
            }
          }
          for (var idx2 in data[3]) {
            for (var kkey2 in data[3][idx2]) {
              var date = new Date(data[3][idx2][kkey2][field_num]);
              var item_date = Math.round(date.getTime() / 1000);
              for (var tpd in timeperiods) {
                if (item_date >= Number(tpd) && item_date < timeperiods[tpd]) {
                  if (q.counter == "yes") {
                    periods[data[3][idx2][kkey2][q.dynamicsplit.number]][tpd] += 1;
                  } else {
                    periods[data[3][idx2][kkey2][q.dynamicsplit.number]][tpd] += data[3][idx2][kkey2][q.nocounterval.number];
                  }
                  break;
                }
              }
            }
          }
          for (var period in periods) {
            // We create the datapoints
            var datapoints = [];
            for (var tpp in periods[period]) {
              datapoints.unshift([periods[period][tpp], Number(tpp) * 1000]);
            }

            data[5].push({
              target: period,
              datapoints: datapoints,
            });
          }
        } else {
          // Define all timeperiods
          var periods = {};
          for (var tp in timeperiods) {
            periods[tp] = 0;
          }
          for (var idx2 in data[3]) {
            for (var kkey2 in data[3][idx2]) {
              var date = new Date(data[3][idx2][kkey2][field_num]);
              var item_date = Math.round(date.getTime() / 1000);
              for (var tpd in timeperiods) {
                if (item_date >= Number(tpd) && item_date < timeperiods[tpd]) {
                  if (q.counter == "yes") {
                    periods[tpd] += 1;
                  } else {
                    periods[tpd] += data[3][idx2][kkey2][q.nocounterval.number];
                  }
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
