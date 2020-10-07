import defaults from 'lodash/defaults';
import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms, InlineFormLabel, Button } from '@grafana/ui';
import { QueryEditorProps, PanelProps } from '@grafana/data';
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

    this.getListSearchOptions();
  }

  onQueryUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, queryUrl: event.target.value });
    this.getListSearchOptions();
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

  onCounterChange = (event: ChangeEvent<HTMLInputElement>) => {
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

  onTableChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    console.log(event.target);
    onChange({ ...query, table: event.target.checked });
    // executes the query
    onRunQuery();
  };

  addColumn = () => {
    const { query, onRunQuery } = this.props;
    query.columns.push({
      field: 0,
      alias: ''
    });
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

  async getListSearchOptions() {
    // Get the itemtype from queryUrl
    const query = defaults(this.props.query, defaultQuery);

    const queryUrl = decodeURI(query.queryUrl);
    const searchq = queryUrl.split('.php?');
    const url = searchq[0].split('/');
    const itemtype = url[url.length - 1];

    if (itemtype !== '' && itemtype !== this.itemtype) {
      this.itemtype = itemtype;
      const res = await this.props.datasource.getListSearchOptions(itemtype);
      console.log('searchoptions', res);
      // this.searchOptions = [];
      // this.searchOptionsDatetime = [];
      this.searchOptionsDatetime.push({
        label: 'Do not use date search (get all data)',
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
        // console.log(res.data[key]);

        this.searchOptions.push({
          label: res.data[key].name,
          value: parseInt(key, 10),
          description: 'uid: ' + res.data[key].uid,
        });
      }
    }
  }

  render() {
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
            tooltip="Do the search you want into GLPI, then copy the url and to finish, paste it here"
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
            Readonly={false}
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
            Readonly={false}
            onChange={this.onTableChange}
            // tooltip={''}
          />
        </div>
        {
          table && columns.map((el, idx) => 

          <div className="gf-form-inline">
            <InlineFormLabel width={9} tooltip={''}>
              {'Field'}
            </InlineFormLabel>
            <Select
              isMulti={false}
              isClearable={false}
              backspaceRemovesValue={false}
              onChange={(e) => this.onColumnValue(e, idx)}
              options={this.searchOptions}
              // isSearchable={isSearchable}
              maxMenuHeight={500}
              placeholder={'Choose the field'}
              noOptionsMessage={() => 'No options found'}
              value={this.searchOptionsNumber.find(i => i.value === el.field)}
            />
            <FormField labelWidth={4} value={el.alias} label="Alias" onChange={(e) => this.onColumnAliasValue(e, idx)} type="text" />
          </div>
          )
        }
        {table && ( <Button
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
    /*
      alias
      timerange based on
      Dynamic split this query by a query per each values of the field
      count elements
      Field value to use (display only of count unchecked)

      table...
    */
    //  <div class="gf-form-inline" ng-hide="ctrl.target.resultFormat === 'table'">
  }
}
