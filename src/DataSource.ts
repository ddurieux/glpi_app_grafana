import defaults from 'lodash/defaults';
var striptags = require('striptags');
var sanitizeHtml = require('sanitize-html');

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  url?: string;
  sessionToken?: string;

  constructor(public instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);

    this.url = instanceSettings.url;
    this.sessionToken = '';
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const { range } = options;

    const requestFrom = Math.round(options.range.from.valueOf() / 1000);
    const requestTo = Math.round(options.range.to.valueOf() / 1000);

    const promises = options.targets.map(query =>
      this.doRequest(query, requestFrom, requestTo).then(response => {
        let name = '';
        if (query.alias !== '') {
          name = query.alias;
        }

        let dataIntervals: any[] = [];
        let splitTypes: any[] = [];
        let from = 0;
        let to = 0;
        let frames: any = {};

        if (query.table) {
          // case it's table
          console.log(query.columns);
          let fields = [];
          for (let column of query.columns) {
            fields.push({
              name: column.alias,
              type: FieldType.string
            });
          }

          frames['table'] = new MutableDataFrame({
            name: 'table',
            // refId: query.refId,
            fields,
          });
          if (response.data.data_html !== undefined) {
            response.data.data_html.forEach((point: any) => {
              let myFrame: any[] = [];
              for (let column of query.columns) {
                myFrame.push(striptags(sanitizeHtml(point[column.field])));
              }
              frames['table'].appendRow(myFrame);
            });
          }
        } else {
          // case it's NOT table
          if (response.data.data_html !== undefined) {
            response.data.data_html.forEach((point: any) => {
              // TODO
              // manage date if defined
              // manage dynamicsplit if defined
              let pointTime = 0;
              let splitType = '';

              if (query.datefield !== -1) {
                pointTime = new Date(point[query.datefield]).getTime() - options.intervalMs;
                from = range.from.valueOf();
                to = range.to.valueOf();
              } else {
                from = 9000000000;
                to = 9000000000;
              }
              splitType = '[empty]';
              if (query.dynamicsplit > 0) {
                // Clean HTML
                splitType = striptags(sanitizeHtml(point[query.dynamicsplit]));
                splitType = splitType.replace('&nbsp;', '');
                if (splitType === '') {
                  splitType = '[empty]';
                }
              }
              if (!splitTypes.includes(splitType)) {
                dataIntervals = this.definedataIntervals(dataIntervals, from, to, options.intervalMs, splitType);
                splitTypes.push(splitType);
              }
              for (let dataInterval of dataIntervals) {
                // update values
                if (dataInterval.splitType === splitType && pointTime < dataInterval.time) {
                  if (!query.counter && query.nocounterval !== 0) {
                    dataInterval.value += point[query.nocounterval];
                  } else {
                    // it's counter
                    dataInterval.value += 1;
                  }
                  break;
                }
              }
            });
          }
          for (let dataInterval of dataIntervals) {
            if (frames[dataInterval.splitType] === undefined) {
              frames[dataInterval.splitType] = new MutableDataFrame({
                name: dataInterval.splitType,
                // refId: query.refId,
                fields: [
                  { name: 'time', type: FieldType.time },
                  { name: dataInterval.splitType, type: FieldType.number },
                ],
              });
            }
            frames[dataInterval.splitType].appendRow([dataInterval.time + options.intervalMs / 2, dataInterval.value]);
          }
        }
        return frames;
      })
    );
    return Promise.all(promises).then(data => {
      let newData = [];
      for (let dataLvl1 of data) {
        for (let prop in dataLvl1) {
          newData.push(dataLvl1[prop]);
        }
      }
      return { data: newData };
    });
  }

  async getListSearchOptions(itemType: string) {
    await this.checkSessionToken();
    const options: any = {
      url: this.url + '/query/listSearchOptions/' + itemType,
      method: 'GET',
      headers: { 'Session-Token': this.sessionToken },
    };

    return await getBackendSrv()
      .datasourceRequest(options)
      .catch((err: any) => {
        if (err.data && err.data.error) {
          throw {
            message: 'GLPI error: ' + err.data.error.reason,
            error: err.data.error,
          };
        }
        return err;
      });
  }

  async testDatasource() {
    // Implement a health check for your data source.
    let result = await this.getSession();
    if (result.data.session_token !== undefined) {
      return {
        status: 'success',
        message: 'Success',
      };
    } else {
      return {
        status: 'error',
        message: result.data,
      };
    }
  }

  async checkSessionToken() {
    if (this.sessionToken === '') {
      const response = await this.getSession();
      this.sessionToken = response.data.session_token;
    }
  }

  async getSession() {
    const options: any = {
      url: this.url + '/initSession',
      method: 'GET',
    };

    getBackendSrv().datasourceRequest(options);

    return await getBackendSrv()
      .datasourceRequest(options)
      .catch((err: any) => {
        if (err.data && err.data.error) {
          throw {
            message: 'GLPI error: ' + err.data.error.reason,
            error: err.data.error,
          };
        }
        return err;
      });
  }

  async doRequest(query: MyQuery, from: number, to: number) {
    await this.checkSessionToken();

    // Prepare data to send
    const queryUrl = decodeURI(query.queryUrl);
    const searchq = queryUrl.split('.php?');
    const url = searchq[0].split('/');
    const itemtype = url[url.length - 1];

    const dateISOFrom = new Date(from * 1e3).toISOString();
    const urlStartDate = dateISOFrom.slice(0, -14) + ' ' + dateISOFrom.slice(-13, -5);
    const dateISOTo = new Date(to * 1e3).toISOString();
    const urlEndDate = dateISOTo.slice(0, -14) + ' ' + dateISOTo.slice(-13, -5);

    let params: any = {};

    const splitArgs = searchq[1].split('&');
    let criteriaIndex = 0;
    let otherParams: any = {};
    for (let arg of splitArgs) {
      const match = arg.match(/^criteria\[(\d+)\]/);

      if (match === null) {
        const paramSplit = arg.split('=');
        otherParams[paramSplit[0]] = paramSplit[1];
      } else {
        if (parseInt(match[1], 10) > criteriaIndex) {
          criteriaIndex = parseInt(match[1], 10);
        }
        const paramSplit = arg.split('=');
        params[paramSplit[0]] = paramSplit[1];
      }
    }

    if (query.datefield > -1) {
      criteriaIndex += 1;
      params['criteria[' + criteriaIndex + '][link]'] = 'AND';
      params['criteria[' + criteriaIndex + '][field]'] = query.datefield;
      params['criteria[' + criteriaIndex + '][searchtype]'] = 'morethan';
      params['criteria[' + criteriaIndex + '][value]'] = urlStartDate;

      criteriaIndex += 1;
      params['criteria[' + criteriaIndex + '][link]'] = 'AND';
      params['criteria[' + criteriaIndex + '][field]'] = query.datefield;
      params['criteria[' + criteriaIndex + '][searchtype]'] = 'lessthan';
      params['criteria[' + criteriaIndex + '][value]'] = urlEndDate;
    }
    let forcedisplayIndex = 0;
    otherParams['forcedisplay[' + forcedisplayIndex + ']'] = 0;

    if (query.dynamicsplit > 0) {
      forcedisplayIndex += 1;
      otherParams['forcedisplay[' + forcedisplayIndex + ']'] = query.dynamicsplit;
    }
    if (!query.counter && query.nocounterval !== 0) {
      forcedisplayIndex += 1;
      otherParams['forcedisplay[' + forcedisplayIndex + ']'] = query.nocounterval;
    }
    if (query.table) {
      for (const column of query.columns) {
        forcedisplayIndex += 1;
        otherParams['forcedisplay[' + forcedisplayIndex + ']'] = column.field;
      }
    }

    otherParams['range'] = '0-2000000';
    otherParams['giveItems'] = 'true';

    params = Object.assign(params, otherParams);

    const options: any = {
      method: 'GET',
      url: this.url + '/query/search/' + itemtype,
      headers: { 'Session-Token': this.sessionToken },
      params,
    };

    const result = await getBackendSrv().datasourceRequest(options);

    return result;
  }

  private definedataIntervals(dataIntervals: any[], from: number, to: number, interval: number, splitType: string) {
    let currentTime = from;
    while (currentTime <= to) {
      dataIntervals.push({
        time: currentTime,
        value: 0,
        splitType: splitType,
      });
      currentTime += interval;
    }
    return dataIntervals;
  }
}
