import { DataQuery, DataSourceJsonData } from '@grafana/data';

export enum QueryType {
  Probes = 'probes',
  Checks = 'checks',
}

export interface GLPIQuery extends DataQuery {
  queryType: QueryType;
}

export const defaultQuery: GLPIQuery = {
  queryType: QueryType.Probes,
} as GLPIQuery;

/**
 * These are options configured for each DataSource instance
 */
export interface GLPIOptions extends DataSourceJsonData {
  appToken: string;
  userToken: string;
  timezone: string;
}
