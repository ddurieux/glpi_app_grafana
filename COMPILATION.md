Due to a bug, after compiled the plugin, update file module.js and modify the begining:

```
define((function
```

by

```
define([],(function
```

Not find why I have this problem for the moment.
See this bug report: https://github.com/grafana/grafana/issues/21785#issuecomment-581792397

