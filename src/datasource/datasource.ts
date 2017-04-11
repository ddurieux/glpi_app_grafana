export default class GLPIAppDatasource {
  user: string;
  pass: string;
  token: string;

  constructor(instanceSettings) {
    this.user = instanceSettings.user;
    this.pass = instanceSettings.pass;
    this.token = instanceSettings.token;
  }

  query(options) {
    return [];
  }

  testDatasource() {
    return false;
  }
}
