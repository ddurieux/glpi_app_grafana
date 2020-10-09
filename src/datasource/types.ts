import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface MyQuery extends DataQuery {
  queryUrl: string;
  alias: string;
  datefield: number;
  dynamicsplit: number;
  counter: boolean;
  nocounterval: number;
  table: boolean;
  columns: any[];

  // histogram
  // nocounterval
  // table
  // col_0
  // col_0_alias
  // col_1
  // col_1_alias
  // col_2
  // col_2_alias
  // col_3
  // col_3_alias
  // col_4
  // col_4_alias
  // col_5
  // col_5_alias
  // col_6
  // col_6_alias
  // col_7
  // col_7_alias
  // col_8
  // col_8_alias
  // col_9
  // col_9_alias
  // col_10
  // col_10_alias
  // col_11
  // col_11_alias
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
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {
  appToken?: string;
  userToken?: string;
}
