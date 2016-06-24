[![Build Status](https://travis-ci.org/guidesmiths/confabulous-etcd-loader.png)](https://travis-ci.org/guidesmiths/confabulous-etcd-loader)
# Confabulous Etcd Loader
Confabulous-Etcd-Loader is an Etcd Loader for [Confabulous](https://github.com/guidesmiths/confabulous) - a hierarchical, asynchronous config loader and post processor.

## TL;DR
```
const confabulous = require('confabulous')
const Confabulous = confabulous.Confabulous
const etcd = confabulous.loaders
const processors = confabulous.processors

new Confabulous()
    .add((config) => etcd({ hosts: ['etcd.example.com:2379'], key: 'config' }, [
        processors.json()
    ]))
    .on('loaded', (config) => console.log('Loaded', JSON.stringify(config, null, 2)))
    .on('reloaded', (config) => console.log('Reloaded', JSON.stringify(config, null, 2)))
    .on('error', (err) => console.error('Error', err))
    .on('reload_error', (err) => console.error('Reload Error', err))
    .end()
```

### Usage
Requests config from an etcd server (expects JSON by default).
```
new Confabulous().add((config) => {
    return loaders.http({ hosts: ['http://localhost:2379'] })
})
```
|  Option  |  Type  |  Default  |  Notes  |
|----------|--------|-----------|---------|
| hosts     | array    |        | Array of etcd hosts |
| key       | string   |        | Key from which to load config |
| mandatory | boolean  | true   | Causes an error/reload_error to be emitted if the configuration does not exist |
| watch     | boolean  | true   | Uses node-etcd's [watcher](https://github.com/stianeikeland/node-etcd#watcherkey-index-options) to monitor the key for changes |
| etcd      | object   |        | options that will be passed to [the underlying etcd client](https://github.com/stianeikeland/node-etcd#constructor-options).


