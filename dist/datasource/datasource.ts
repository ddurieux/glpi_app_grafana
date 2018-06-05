import _ from "lodash";
import * as moment from "../vendor/public/builds/moment-timezone-with-data.js";

export class GlpiAppDatasource {
  private usertoken: any;
  private apptoken: any;
  private timezone: any;
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
    this.timezone = instanceSettings.jsonData.timezone;
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
    const scopedVars = options.scopedVars;
    const targets = _.cloneDeep(options.targets);
    const queryTargets = [];

    const allQueries = _.map(targets, (target) => {
      if (target.hasOwnProperty("hide")) {
        return "";
      }

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

    const initsession = this.getSession();
    return initsession.then((response) => {
      if (response.status === 200) {

        const targetPool = [];
        for (const q of queryTargets) {
          targetPool.push(this.promiseATarget(queryTargets, options, response, this));
        }
        let l = 0;
        for (const funt of Object.keys(targetPool)) {
          if (l === 0) {
            var promt = targetPool[l]([l, this.backendSrv, []]);
          } else {
            promt = promt.then(targetPool[l]);
          }
          l += 1;
        }
        const resultalltarget = (data) => {
          const ret = {
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
    return (targetargs) => {
      const currentTargetNum = targetargs[0];
      const bksrv = targetargs[1];
      const alltargetresult = targetargs[2];
      const q = queryTargets[currentTargetNum];

      q.query = decodeURI(q.query);
      const searchq = q.query.split(".php?");
      const url = searchq[0].split("/");
      const itemtype = url[url.length - 1];
      let intervalS = Math.round(options.scopedVars.__interval_ms["value"] / 1000);
      let intervalStart = Math.round(options.range.from.valueOf() / 1000) + 3600 + 3600;
      let intervalEnd = Math.round(options.range.to.valueOf() / 1000) + 3600 + 3600;

      // add timerange
      const dateISO = new Date(intervalStart * 1e3).toISOString();
      const urlStartDate = dateISO.slice(0, -14) + " " + dateISO.slice(-13, -5);
      // field num for creation_date
      const fieldNum = q.datefield["number"];

      const dateISOend = new Date(intervalEnd * 1e3).toISOString();
      const urlEndDate = dateISOend.slice(0, -14) + " " + dateISOend.slice(-13, -5);

      if (fieldNum !== "-1") {
        let iend = 0;
        for (let i = 0; i < 50; i++) {
          iend = i;
          if (searchq[1].indexOf("criteria[" + i + "]") < 0) {
            searchq[1] += "&criteria[" + i + "][link]=AND&" +
                "criteria[" + i + "][field]=" + fieldNum + "&" +
                "criteria[" + i + "][searchtype]=morethan&" +
                "_select_criteria[" + i + "][value]=0&" +
                "_criteria[" + i + "][value]=" + intervalStart + "&" +
                "criteria[" + i + "][value]=" + urlStartDate;
            break;
          }
        }
        // And the end date
        iend += 1;
        searchq[1] += "&criteria[" + iend + "][link]=AND&" +
            "criteria[" + iend + "][field]=" + fieldNum + "&" +
            "criteria[" + iend + "][searchtype]=lessthan&" +
            "_select_criteria[" + iend + "][value]=0&" +
            "_criteria[" + iend + "][value]=" + intervalEnd + "&" +
            "criteria[" + iend + "][value]=" + urlEndDate;
      }
      searchq[1] += "&forcedisplay[0]=0";
      if (q.table) {
        searchq[1] += "&giveItems=true";

        for (let colNum = 0; colNum <= 11 ; colNum++) {
          if (eval("q.col_" + colNum)["number"] !== "0") {
            searchq[1] += "&forcedisplay[" + eval("q.col_" + colNum)["number"] + "]=" + eval("q.col_" + colNum)["number"];
          }
        }
      }
      if (q.dynamicsplit.number !== "0") {
        searchq[1] += "&forcedisplay[" + q.dynamicsplit.number + "]=" + q.dynamicsplit.number;
        searchq[1] += "&giveItems=true";
      }

      // Get all count per range / timerange
      intervalS = Math.round(options.scopedVars.__interval_ms["value"] / 1000);
      intervalStart = Math.round(options.range.from.valueOf() / 1000);
      intervalEnd = Math.round(options.range.to.valueOf() / 1000);
      const myrange = _.range(intervalEnd, intervalStart, -intervalS);
      const timeperiods = {};
      for (const num of Object.keys(myrange)) {
        timeperiods[(myrange[num] * 1000)] = (myrange[num] - intervalS) * 1000; // ie timeperiod[start] = end
      }
      // URL options for GLPI API
      const urloptions: any = {
        method: "GET",
        url: myclass.url + "/search/" + itemtype + "?" + searchq[1],
      };
      urloptions.headers = urloptions.headers || {};
      urloptions.headers["App-Token"] = myclass.apptoken;
      urloptions.headers["Session-Token"] = response.data["session_token"];

      const to = myclass.promiseGetNumberElementsOfTarget(fieldNum, q, myclass, currentTargetNum);
      return to(bksrv, urloptions, timeperiods, alltargetresult);
    };
  }

  /** This will get the number of elements in GLPI to get */
  promiseGetNumberElementsOfTarget(fieldNum, q, myclass, currentTargetNum) {
    return (bksrv, urloptions, timeperiods, alltargetresult) => {
      return bksrv.datasourceRequest(urloptions).then((response) => {
        if (response.status >= 200 && response.status < 300) {
          // get totalcount
          let numberPages = Math.ceil(response.data["totalcount"] / 400);
          if (numberPages === 0) {
            numberPages = 1;
          }

          // Create promises to request on API
          const pool = [];
          for (let j = 0; j < numberPages; j++) {
            pool.push(myclass.promiseGetEachRangePageOfTarget(q));
          }
          // protect when no elements
          if (pool.length === 0) {
            const datapointempty = [];
            for (const tp of Object.keys(timeperiods)) {
              datapointempty.push([0, tp]);
            }
            return {
              data: [
                {
                  datapoints: datapointempty,
                  target: "tickets",
                },
              ],
            };
          }

          let k = 0;
          let prom;
          for (const fun of Object.keys(pool)) {
            if (k === 0) {
              prom = pool[k]([bksrv, urloptions, timeperiods, [], 0, alltargetresult]);
            } else {
              prom = prom.then(pool[k]);
            }
            k += 1;
          }
          const resultfunc = myclass.promiseMergeTargetResult(timeperiods, fieldNum, q, currentTargetNum, myclass);
          return prom.then(resultfunc);
        }
      });
    };
  }

  /** This will get each ranges/pages in GLPI. Goal is to get all elements of GLPI here */
  promiseGetEachRangePageOfTarget(q) {
    return (args) => {
      const bksrv = args[0];
      const url2options = _.cloneDeep(args[1]);

      url2options["url"] += "&range=" + args[4] + "-" + (args[4] + 399);
      args[4] += 400;
      return bksrv.datasourceRequest(url2options).then((response) => {
        if (response.status >= 200 && response.status < 300) {
          if (q.table) {
            args[3].push(response.data["data_html"]);
          } else if (q.dynamicsplit.number !== "0" && response.data["data"] !== undefined) {
            // Parse all data and replace the data by data_html for the id of dynamicsplit
            for (const rownum of Object.keys(response.data["data"])) {
              let cleanedHTML = response.data["data_html"][rownum][q.dynamicsplit.number];
              cleanedHTML = cleanedHTML.replace(/<div(.|\n|\r)+<\/div>/, "");
              cleanedHTML = cleanedHTML.replace(/<script(.|\n|\r)+<\/script>/, "");
              cleanedHTML = cleanedHTML.replace(/<img(.|\n|\r|\t)+>/, "");
              cleanedHTML = cleanedHTML.replace(/id=['"]tooltiplink(\d)+['"]/, "");
              cleanedHTML = cleanedHTML.replace(/id=['"]tooltip(\d)+['"]/, "");
              cleanedHTML = cleanedHTML.replace(/^&nbsp;/, "");
              response.data["data"][rownum][q.dynamicsplit.number] = cleanedHTML;
            }
            args[3].push(response.data["data"]);
          } else if (response.data["data"] !== undefined) {
            args[3].push(response.data["data"]);
          }
          return [bksrv, args[1], args[2], args[3], args[4], args[5]];
        }
      });
    };
  }

  /** This will merge all results/elements (all ranges/pages) into same array */
  promiseMergeTargetResult(timeperiods, fieldNum, q, currentTargetNum, myclass) {
    return (data) => {
      const debug = q.console;
      if (debug) {
        console.debug("q:", q);
      }
      if (debug) {
        console.debug("data:", data);
      }

      if (q.table) {
        ///// TABLE part
        if (debug) {
          console.debug("Parsing a table result...");
        }
        const columns = [];
        let maxnum = 0;
        for (let colNum = 0; colNum <= 11 ; colNum++) {
          if (eval("q.col_" + colNum)["number"] !== "0") {
            maxnum = _.cloneDeep(colNum);
            if (eval("q.col_" + colNum + "_alias") == null ||  eval("q.col_" + colNum + "_alias") === "") {
              columns.push({text: eval("q.col_" + colNum)["label"], type: "string"});
            } else {
              columns.push({text: eval("q.col_" + colNum + "_alias"), type: "string"});
            }
          }
        }
        if (debug) {
          console.debug("columns: ", columns);
        }
        // Prepare for recreate the GLPI url in links
        const glpiurl = myclass.url;
        const splitGlpiurl = glpiurl.split("/");

        const rows = [];
        for (const idx of Object.keys(data[3])) {
          for (const kkey of Object.keys(data[3][idx])) {
            const myrow = [];
            if (debug) {
              console.debug("-> ", data[3][idx][kkey]);
            }

            for (let colNum2 = 0; colNum2 <= maxnum; colNum2++) {
              let value = data[3][idx][kkey][eval("q.col_" + colNum2)["number"]];
              if (debug) {
                console.debug("-> value: ", value);
              }
              if (typeof value === "string") {
                let cleanedHTML = value.replace(/<div(.|\n|\r)+<\/div>/, "");
                cleanedHTML = cleanedHTML.replace(/<script(.|\n|\r)+<\/script>/, "");
                cleanedHTML = cleanedHTML.replace(/<img.+class='pointer'>/, "");
                if (cleanedHTML.indexOf(' href="/') !== -1) {
                  cleanedHTML = cleanedHTML.replace('href="/', 'href="' + splitGlpiurl[0] + "//" + splitGlpiurl[2] + "/");
                }
                value = cleanedHTML;
              }
              myrow.push(value);
            }
            rows.push(myrow);
          }
        }
        if (debug) {
          console.debug("rows: ", rows);
        }
        data[5].push({
          columns,
          rows,
          type: "table",
        });
      } else {
        if (debug) {
          console.debug("Parsing a datapoints result...");
        }
        ///// it's datapoints
        if (q.dynamicsplit.number !== "0") {
          if (debug) {
            console.debug(" - split, field: ", q.dynamicsplit.number);
          }
          const periods = {};
          for (const idx2 of Object.keys(data[3])) {
            for (const kkey2 of Object.keys(data[3][idx2])) {
              periods[data[3][idx2][kkey2][q.dynamicsplit.number]] = {};
            }
          }
          for (const period of Object.keys(periods)) {
            for (const tp of Object.keys(timeperiods)) {
              periods[period][tp] = 0;
            }
          }
          for (const idx2 of Object.keys(data[3])) {
            for (const kkey2 of Object.keys(data[3][idx2])) {
              const datestring = data[3][idx2][kkey2][fieldNum];
              // convert date in ISO 8601 format
              const date = new Date(moment.tz(datestring, myclass.timezone));
              const itemDate = Math.round(date.getTime());
              for (const tpd of Object.keys(timeperiods)) {
                if (itemDate < Number(tpd) && itemDate >= timeperiods[tpd]) {
                  if (q.counter) {
                    periods[data[3][idx2][kkey2][q.dynamicsplit.number]][tpd] += 1;
                  } else {
                    periods[data[3][idx2][kkey2][q.dynamicsplit.number]][tpd] += data[3][idx2][kkey2][q.nocounterval.number];
                  }
                  break;
                }
              }
            }
          }
          for (const period of Object.keys(periods)) {
            // We create the datapoints
            const datapoints = [];
            for (const tpp of Object.keys(periods[period])) {
              datapoints.unshift([periods[period][tpp], Number(tpp)]);
            }
            if (debug) {
              console.debug(" - period: ", period);
            }
            if (debug) {
              console.debug(" - datapoints: ", datapoints);
            }
            data[5].push({
              datapoints,
              target: period,
            });
          }
        } else {
          if (debug) {
            console.debug(" - not split, selected date field: ", fieldNum);
          }
          // Define all timeperiods
          const periods = {};
          for (const tp of Object.keys(timeperiods)) {
            periods[tp] = 0;
          }
          const datapoints = [];
          if (fieldNum === "-1") {
            // No date field selected in the options
            let lastTpp = "";
            for (const tpp of Object.keys(periods)) {
              datapoints.unshift([periods[tpp], Number(tpp)]);
              lastTpp = tpp;
            }
            // Set the last TS value as the query count
            if (debug) {
              console.debug(" - setting the query count as the last TS value: ", data[3].length);
            }
            datapoints[Object.keys(periods).length] = [data[3][0].length, Number(lastTpp)];
          } else {
              for (const idx2 of Object.keys(data[3])) {
                  for (const kkey2 of Object.keys(data[3][idx2])) {
                      const datestring = data[3][idx2][kkey2][fieldNum];
                      // convert date in ISO 8601 format
                      const date = new Date(moment.tz(datestring, myclass.timezone));
                      const itemDate = Math.round(date.getTime());
                      for (const tpd of Object.keys(timeperiods)) {
                          if (itemDate < Number(tpd) && itemDate >= timeperiods[tpd]) {
                              if (q.counter) {
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
              if (q.dayhours) {
                  // We get data with all hours of days
                  for (const tpp of Object.keys(periods)) {
                      const d = new Date(Number(tpp));
                      const n = d.getHours();
                      for (let num = 1; num <= periods[tpp]; num++) {
                          datapoints.unshift([n, 1]);
                      }
                  }
              } else {
                  for (const tpp of Object.keys(periods)) {
                      datapoints.unshift([periods[tpp], Number(tpp)]);
                  }
              }
          }
          if (debug) {
            console.debug(" - target: ", q.alias);
          }
          if (debug) {
            console.debug(" - datapoints: ", datapoints);
          }
          data[5].push({
            datapoints,
            target: q.alias,
          });
        }
      }
      currentTargetNum += 1;
      return [currentTargetNum, data[0], data[5]];
    };
  }

  testDatasource() {
    const options: any = {
      data: null,
      method: "GET",
      url: this.url + "/initSession",
    };
    options.headers = options.headers || {};
    options.headers.Authorization = "user_token " + this.usertoken;
    options.headers["App-Token"] = this.apptoken;
    return this.backendSrv.datasourceRequest(options).then((response) => {
      if (response.status === 200) {
        return { status: "success", message: "Data source is working", title: "Success" };
      }
    }, (err) => {
      if (err.status !== 0 || err.status >= 300) {
        if (err.data && err.data.error) {
          throw {
            message: "GLPI API Error Response: " + err.data.error,
          };
        } else if (err.data) {
          throw {
            message: "GLPI API Error Response: " + err.data[1],
          };
        } else if (err.status === undefined) {
          throw {
            message: "Cross-Origin Request Blocked: add right headers in your apache/nginx " +
            "like 'App-Token' and 'Session-Token'",
          };
        } else {
          throw { message: "GLPI API Error: " + err.message, data: err.data, config: err.config };
        }
      }
    });
  }

  getSession() {
    const options: any = {
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
      const urloptions: any = {
        method: "GET",
        url: this.url + "/listSearchOptions/" + itemtype,
      };
      urloptions.headers = urloptions.headers || {};
      urloptions.headers["App-Token"] = this.apptoken;
      urloptions.headers["Session-Token"] = this.session;
      const answer = this.backendSrv.datasourceRequest(urloptions).then((response) => {
        if (response.status === 200) {
          return response.data;
        }
      });
      this.searchOptions[itemtype] = answer;
    }
  }
}
