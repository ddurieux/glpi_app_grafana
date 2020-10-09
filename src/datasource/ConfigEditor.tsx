import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions, MySecureJsonData } from './types';

const { SecretFormField, FormField } = LegacyForms;

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> {}

interface State {}

export class ConfigEditor extends PureComponent<Props, State> {
  onUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      url: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  onTimeZoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      timeZone: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  // Secure field (only sent to the backend)
  onAppTokenChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonData: {
        ...options.secureJsonData,
        appToken: event.target.value,
      },
    });
  };

  onResetAppToken = () => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        appToken: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        appToken: '',
      },
    });
  };

  onUserTokenChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonData: {
        ...options.secureJsonData,
        userToken: event.target.value,
      },
    });
  };

  onResetUserToken = () => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        userToken: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        userToken: '',
      },
    });
  };

  render() {
    this.migrateConfig();

    let { options } = this.props;
    const { jsonData, secureJsonFields } = options;
    const secureJsonData = (options.secureJsonData || {}) as MySecureJsonData;

    return (
      <div className="gf-form-group">
        <div className="gf-form">
          <FormField
            label="URL de GLPI"
            labelWidth={10}
            inputWidth={24}
            onChange={this.onUrlChange}
            value={jsonData.url || ''}
            placeholder="http://localhost/glpi/apirest.php"
          />
        </div>

        <div className="gf-form-inline">
          <div className="gf-form">
            <SecretFormField
              isConfigured={(secureJsonFields && secureJsonFields.appToken) as boolean}
              value={secureJsonData.appToken || ''}
              label="app_token"
              placeholder="GLPI app_token"
              labelWidth={10}
              inputWidth={24}
              onReset={this.onResetAppToken}
              onChange={this.onAppTokenChange}
            />
          </div>
        </div>

        <div className="gf-form-inline">
          <div className="gf-form">
            <SecretFormField
              isConfigured={(secureJsonFields && secureJsonFields.userToken) as boolean}
              value={secureJsonData.userToken || ''}
              label="user_token"
              placeholder="GLPI user_token"
              labelWidth={10}
              inputWidth={24}
              onReset={this.onResetUserToken}
              onChange={this.onUserTokenChange}
            />
          </div>
        </div>

        <div className="gf-form">
          <FormField
            label="Timezone (see in php.ini)"
            labelWidth={10}
            inputWidth={24}
            onChange={this.onTimeZoneChange}
            value={jsonData.timeZone || ''}
            placeholder=""
          />
        </div>
      </div>
    );
  }

  private migrateConfig() {
    console.log(this.props.options);
    if (this.props.options.jsonData.url === undefined && this.props.options.url !== undefined) {
      this.props.options.access = 'proxy';
      this.props.options.jsonData.url = this.props.options.url;
      this.props.options.jsonData.timeZone = this.props.options.jsonData.timezone;

      const { onOptionsChange, options } = this.props;
      onOptionsChange({
        ...options,
        secureJsonData: {
          ...options.secureJsonData,
          appToken: this.props.options.jsonData.apptoken,
          userToken: this.props.options.jsonData.token,
        },
      });
      delete this.props.options.url;
      delete this.props.options.jsonData.timezone;
      delete this.props.options.jsonData.apptoken;
      delete this.props.options.jsonData.token;
    }
    console.log('migrate', this.props.options.jsonData);
  }
}
