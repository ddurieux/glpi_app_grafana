import defaults from 'lodash/defaults';
import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms, InlineFormLabel, Button } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './DataSource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';

const { FormField, Select, Switch } = LegacyForms;

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  searchOptions: any[];
  searchOptionsDatetime: any[];
  searchOptionsNumber: any[];
  itemtype?: string;

  constructor(props: Props, context: React.Context<any>) {
    super(props, context);
    this.searchOptions = [];
    this.searchOptionsDatetime = [];
    this.searchOptionsNumber = [];
    this.itemtype = '';

    this.getListSearchOptions(true);
  }

  onQueryUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, queryUrl: event.target.value });
    this.getListSearchOptions(false, event.target.value);
    // executes the query
    onRunQuery();
  };

  onAliasChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, alias: event.target.value });
    // executes the query
    onRunQuery();
  };

  onDatefieldValue = (event: any) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, datefield: event.value });
    // executes the query
    onRunQuery();
  };

  onDynamicsplitValue = (event: any) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, dynamicsplit: event.value });
    // executes the query
    onRunQuery();
  };

  onCounterChange = (event: any) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, counter: event.target.checked });
    // executes the query
    onRunQuery();
  };

  onNocountervalValue = (event: any) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, nocounterval: event.value });
    // executes the query
    onRunQuery();
  };

  onTableChange = (event: any) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, table: event.target.checked });
    // executes the query
    onRunQuery();
  };

  addColumn = () => {
    const { query, onRunQuery } = this.props;
    query.columns.push({
      field: 0,
      alias: '',
    });
    onRunQuery();
  };

  removeColumn = (idx: number) => {
    const { query, onRunQuery } = this.props;
    query.columns.splice(idx, 1);
    onRunQuery();
  };

  onColumnValue = (event: any, idx: number) => {
    const { query, onRunQuery } = this.props;
    query.columns[idx].field = event.value;
    onRunQuery();
  };

  onColumnAliasValue = (event: ChangeEvent<HTMLInputElement>, idx: number) => {
    const { query, onRunQuery } = this.props;
    query.columns[idx].alias = event.target.value;
    onRunQuery();
  };

  async getListSearchOptions(runQuery: boolean, newUrl: string|null = null) {
    // Get the itemtype from queryUrl
    const query = defaults(this.props.query, defaultQuery);

    const queryUrl = decodeURI(query.queryUrl);
    let searchq: any[] = [];

    if (newUrl !== null) {
      searchq = newUrl.split('.php?');
    } else {
      searchq = queryUrl.split('.php?');
    }
    const url = searchq[0].split('/');
    const itemtype = url[url.length - 1];

    if (itemtype !== '' && itemtype !== this.itemtype) {
      this.itemtype = itemtype;
      const res = await this.props.datasource.getListSearchOptions(itemtype);
      this.searchOptionsDatetime.push({
        label: 'Do not use date search (get all data)',
        value: -1,
      });
      this.searchOptions.push({
        label: 'Do not use split (get all data)',
        value: -1,
      });
      for (let key of Object.keys(res.data)) {
        if (res.data[key].table === undefined) {
          continue;
        }
        if (res.data[key].datatype === 'date' || res.data[key].datatype === 'datetime') {
          this.searchOptionsDatetime.push({
            label: res.data[key].name,
            value: parseInt(key, 10),
            description: 'uid: ' + res.data[key].uid,
          });
        }
        // datatype number
        if (
          res.data[key].datatype === 'timestamp' ||
          res.data[key].datatype === 'count' ||
          res.data[key].datatype === 'number' ||
          res.data[key].datatype === 'integer'
        ) {
          this.searchOptionsNumber.push({
            label: res.data[key].name,
            value: parseInt(key, 10),
            description: 'uid: ' + res.data[key].uid,
          });
        }

        this.searchOptions.push({
          label: res.data[key].name,
          value: parseInt(key, 10),
          description: 'uid: ' + res.data[key].uid,
        });
      }
      if (runQuery) {
        const { onRunQuery } = this.props;
        onRunQuery();
      }
    }
  }

  render() {
    this.migrateConfig();

    const query = defaults(this.props.query, defaultQuery);
    const { queryUrl, alias, datefield, dynamicsplit, counter, nocounterval, table, columns } = query;

    const datefieldSelected = this.searchOptionsDatetime.find(i => i.value === datefield);
    const dynamicsplitSelected = this.searchOptions.find(i => i.value === dynamicsplit);
    const nocountervalSelected = this.searchOptionsNumber.find(i => i.value === nocounterval);

    return (
      <div>
        <div>
          <FormField
            labelWidth={9}
            inputWidth={300}
            value={queryUrl || ''}
            onChange={this.onQueryUrlChange}
            label="Search query Url"
            tooltip="Do the search you want into GLPI, then copy the url and to finish, paste it here."
            type="text"
          />
        </div>
        <div className="gf-form-inline">
          <FormField labelWidth={4} value={alias} onChange={this.onAliasChange} label="Alias" type="text" />

          <InlineFormLabel width={9} tooltip={''}>
            {'Timerange based on'}
          </InlineFormLabel>
          <Select
            isMulti={false}
            isClearable={false}
            backspaceRemovesValue={false}
            onChange={this.onDatefieldValue}
            options={this.searchOptionsDatetime}
            // isSearchable={isSearchable}
            maxMenuHeight={500}
            placeholder={'Choose date field'}
            noOptionsMessage={() => 'No options found'}
            value={datefieldSelected}
          />

          <InlineFormLabel width={24} tooltip={''}>
            {'Dynamic split this query by a query per each values of the field'}
          </InlineFormLabel>
          <Select
            isMulti={false}
            isClearable={false}
            backspaceRemovesValue={false}
            onChange={this.onDynamicsplitValue}
            options={this.searchOptions}
            // isSearchable={isSearchable}
            maxMenuHeight={500}
            placeholder={'Choose the field'}
            noOptionsMessage={() => 'No options found'}
            value={dynamicsplitSelected}
          />
        </div>
        <div className="gf-form-inline">
          <Switch
            label={'Count elements'}
            checked={counter}
            onChange={this.onCounterChange}
            // tooltip={''}
          />
          {!counter && (
            <InlineFormLabel width={9} tooltip={''}>
              {'Field value to use'}
            </InlineFormLabel>
          )}
          {!counter && (
            <Select
              isMulti={false}
              isClearable={false}
              backspaceRemovesValue={false}
              onChange={this.onNocountervalValue}
              options={this.searchOptionsNumber}
              // isSearchable={isSearchable}
              maxMenuHeight={500}
              placeholder={'Choose field'}
              noOptionsMessage={() => 'No options found'}
              value={nocountervalSelected}
            />
          )}
        </div>
        <div className="gf-form-inline">
          <Switch
            label={'Is it a table panel?'}
            checked={table}
            onChange={this.onTableChange}
            // tooltip={''}
          />
        </div>
        {table &&
          columns.map((el, idx) => (
            <div className="gf-form-inline" key={idx}>
              <InlineFormLabel width={9} tooltip={''}>
                {'Field'}
              </InlineFormLabel>
              <Select
                width={16}
                isMulti={false}
                isClearable={false}
                backspaceRemovesValue={false}
                onChange={e => this.onColumnValue(e, idx)}
                options={this.searchOptions}
                // isSearchable={isSearchable}
                maxMenuHeight={500}
                placeholder={'Choose the field'}
                noOptionsMessage={() => 'No options found'}
                value={this.searchOptions.find(i => i.value === el.field)}
              />
              <FormField
                labelWidth={4}
                value={el.alias}
                label="Alias"
                onChange={e => this.onColumnAliasValue(e, idx)}
                type="text"
              />
              <Button
                onClick={e => this.removeColumn(idx)}
              >
                Remove
              </Button>
            </div>
          ))}
        {table && (
          <Button
            // className="btn btn-success"
            onClick={this.addColumn}
            type="submit"
            disabled={false}
          >
            Add a column
          </Button>
        )}
      </div>
    );
  }

  private migrateConfig() {
    if (this.props.query.query !== undefined) {
      this.props.query.queryUrl = this.props.query.query;
      this.props.query.datefield = parseInt(this.props.query.datefield.number, 10);
      this.props.query.dynamicsplit = parseInt(this.props.query.dynamicsplit.number, 10);
      if (this.props.query.nocounterval !== undefined && this.props.query.nocounterval.number !== undefined) {
        this.props.query.nocounterval = parseInt(this.props.query.nocounterval.number, 10);
      }
      delete this.props.query.query;
      this.props.query.columns = [];

      // No loop because error on access property
      // col_0
      if (
        this.props.query.col_0.number !== undefined &&
        this.props.query.col_0.number !== undefined &&
        parseInt(this.props.query.col_0.number, 10) !== 0
      ) {
        let alias = '';
        if (!this.props.query.col_0_alias !== undefined) {
          alias = this.props.query.col_0_alias;
        }
        this.props.query.columns.push({
          field: parseInt(this.props.query.col_0.number, 10),
          alias,
        });
      }
      delete this.props.query.col_0;
      delete this.props.query.col_0_alias;

      // col_1
      if (
        this.props.query.col_1.number !== undefined &&
        this.props.query.col_1.number !== undefined &&
        parseInt(this.props.query.col_1.number, 10) !== 0
      ) {
        let alias = '';
        if (!this.props.query.col_1_alias !== undefined) {
          alias = this.props.query.col_1_alias;
        }
        this.props.query.columns.push({
          field: parseInt(this.props.query.col_1.number, 10),
          alias,
        });
      }
      delete this.props.query.col_1;
      delete this.props.query.col_1_alias;

      // col_2
      if (
        this.props.query.col_2.number !== undefined &&
        this.props.query.col_2.number !== undefined &&
        parseInt(this.props.query.col_2.number, 10) !== 0
      ) {
        let alias = '';
        if (!this.props.query.col_2_alias !== undefined) {
          alias = this.props.query.col_2_alias;
        }
        this.props.query.columns.push({
          field: parseInt(this.props.query.col_2.number, 10),
          alias,
        });
      }
      delete this.props.query.col_2;
      delete this.props.query.col_2_alias;

      // col_3
      if (
        this.props.query.col_3.number !== undefined &&
        this.props.query.col_3.number !== undefined &&
        parseInt(this.props.query.col_3.number, 10) !== 0
      ) {
        let alias = '';
        if (!this.props.query.col_3_alias !== undefined) {
          alias = this.props.query.col_3_alias;
        }
        this.props.query.columns.push({
          field: parseInt(this.props.query.col_3.number, 10),
          alias,
        });
      }
      delete this.props.query.col_3;
      delete this.props.query.col_3_alias;

      // col_4
      if (
        this.props.query.col_4.number !== undefined &&
        this.props.query.col_4.number !== undefined &&
        parseInt(this.props.query.col_4.number, 10) !== 0
      ) {
        let alias = '';
        if (!this.props.query.col_4_alias !== undefined) {
          alias = this.props.query.col_4_alias;
        }
        this.props.query.columns.push({
          field: parseInt(this.props.query.col_4.number, 10),
          alias,
        });
      }
      delete this.props.query.col_4;
      delete this.props.query.col_4_alias;

      // col_5
      if (
        this.props.query.col_5.number !== undefined &&
        this.props.query.col_5.number !== undefined &&
        parseInt(this.props.query.col_5.number, 10) !== 0
      ) {
        let alias = '';
        if (!this.props.query.col_5_alias !== undefined) {
          alias = this.props.query.col_5_alias;
        }
        this.props.query.columns.push({
          field: parseInt(this.props.query.col_5.number, 10),
          alias,
        });
      }
      delete this.props.query.col_5;
      delete this.props.query.col_5_alias;

      // col_6
      if (
        this.props.query.col_6.number !== undefined &&
        this.props.query.col_6.number !== undefined &&
        parseInt(this.props.query.col_6.number, 10) !== 0
      ) {
        let alias = '';
        if (!this.props.query.col_6_alias !== undefined) {
          alias = this.props.query.col_6_alias;
        }
        this.props.query.columns.push({
          field: parseInt(this.props.query.col_6.number, 10),
          alias,
        });
      }
      delete this.props.query.col_6;
      delete this.props.query.col_6_alias;

      // col_7
      if (
        this.props.query.col_7.number !== undefined &&
        this.props.query.col_7.number !== undefined &&
        parseInt(this.props.query.col_7.number, 10) !== 0
      ) {
        let alias = '';
        if (!this.props.query.col_7_alias !== undefined) {
          alias = this.props.query.col_7_alias;
        }
        this.props.query.columns.push({
          field: parseInt(this.props.query.col_7.number, 10),
          alias,
        });
      }
      delete this.props.query.col_7;
      delete this.props.query.col_7_alias;

      // col_8
      if (
        this.props.query.col_8.number !== undefined &&
        this.props.query.col_8.number !== undefined &&
        parseInt(this.props.query.col_8.number, 10) !== 0
      ) {
        let alias = '';
        if (!this.props.query.col_8_alias !== undefined) {
          alias = this.props.query.col_8_alias;
        }
        this.props.query.columns.push({
          field: parseInt(this.props.query.col_8.number, 10),
          alias,
        });
      }
      delete this.props.query.col_8;
      delete this.props.query.col_8_alias;

      // col_9
      if (
        this.props.query.col_9.number !== undefined &&
        this.props.query.col_9.number !== undefined &&
        parseInt(this.props.query.col_9.number, 10) !== 0
      ) {
        let alias = '';
        if (!this.props.query.col_9_alias !== undefined) {
          alias = this.props.query.col_9_alias;
        }
        this.props.query.columns.push({
          field: parseInt(this.props.query.col_9.number, 10),
          alias,
        });
      }
      delete this.props.query.col_9;
      delete this.props.query.col_9_alias;

      // col_10
      if (
        this.props.query.col_10.number !== undefined &&
        this.props.query.col_10.number !== undefined &&
        parseInt(this.props.query.col_10.number, 10) !== 0
      ) {
        let alias = '';
        if (!this.props.query.col_10_alias !== undefined) {
          alias = this.props.query.col_10_alias;
        }
        this.props.query.columns.push({
          field: parseInt(this.props.query.col_10.number, 10),
          alias,
        });
      }
      delete this.props.query.col_10;
      delete this.props.query.col_10_alias;

      // col_11
      if (
        this.props.query.col_11.number !== undefined &&
        this.props.query.col_11.number !== undefined &&
        parseInt(this.props.query.col_11.number, 10) !== 0
      ) {
        let alias = '';
        if (!this.props.query.col_11_alias !== undefined) {
          alias = this.props.query.col_11_alias;
        }
        this.props.query.columns.push({
          field: parseInt(this.props.query.col_11.number, 10),
          alias,
        });
      }
      delete this.props.query.col_11;
      delete this.props.query.col_11_alias;
    }
  }
}
