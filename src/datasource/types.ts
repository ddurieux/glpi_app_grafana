import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface MyQuery extends DataQuery {
  queryUrl: string;
  alias: string;
  datefield: any; // must be number but old version of plugin has bee an object
  dynamicsplit: any; // must be number but old version of plugin has bee an object
  counter: boolean;
  nocounterval: any; // must be number but old version of plugin has bee an object
  table: boolean;
  columns: any[];

  // Old values
  query?: string;
  col_0?: any;
  col_1?: any;
  col_2?: any;
  col_3?: any;
  col_4?: any;
  col_5?: any;
  col_6?: any;
  col_7?: any;
  col_8?: any;
  col_9?: any;
  col_10?: any;
  col_11?: any;
  col_0_alias?: any;
  col_1_alias?: any;
  col_2_alias?: any;
  col_3_alias?: any;
  col_4_alias?: any;
  col_5_alias?: any;
  col_6_alias?: any;
  col_7_alias?: any;
  col_8_alias?: any;
  col_9_alias?: any;
  col_10_alias?: any;
  col_11_alias?: any;

  // histogram
  // nocounterval
  // table
  // metrics
}

export const defaultQuery: Partial<MyQuery> = {
  queryUrl:
    'http://127.0.0.1/glpi090/front/ticket.php?is_deleted=0&as_map=0&criteria%5B0%5D%5Blink%5D=AND&criteria%5B0%5D%5Bfield%5D=12&criteria%5B0%5D%5Bsearchtype%5D=equals&criteria%5B0%5D%5Bvalue%5D=notold&search=Rechercher&itemtype=Ticket&start=0',
  alias: '',
  datefield: -1,
  dynamicsplit: 0,
  counter: true,
  nocounterval: 0,
  table: false,
  columns: [
    {
      field: 0,
      alias: '',
    },
  ],
};

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  url?: string;
  timeZone?: string;

  // Old values
  timezone?: string;
  apptoken?: string;
  token?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {
  appToken?: string;
  userToken?: string;
}
