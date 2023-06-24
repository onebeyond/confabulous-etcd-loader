# ⚠️ This repository is not longer maintained ⚠️

This project is not longer maintained and has been archived. More details in [One Beyond Governance Tiers](https://onebeyond-maintainers.netlify.app/governance/tiers)

[![Build Status](https://travis-ci.org/guidesmiths/confabulous-etcd-loader.png)](https://travis-ci.org/guidesmiths/confabulous-etcd-loader)
# Confabulous Etcd Loader
Confabulous-Etcd-Loader is an Etcd Loader for [Confabulous](https://github.com/guidesmiths/confabulous) - a hierarchical, asynchronous config loader and post processor.

## TL;DR
```
const confabulous = require('confabulous')
const etcd = require('confabulous-etcd-loader')
const Confabulous = confabulous.Confabulous
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

### Options
|  Option  |  Type  |  Default  |  Notes  |
|----------|--------|-----------|---------|
| hosts     | array    |        | Array of etcd hosts |
| key       | string   |        | Key from which to load config |
| mandatory | boolean  | true   | Causes an error/reload_error to be emitted if the configuration does not exist |
| watch     | boolean  | true   | Uses node-etcd's [watcher](https://github.com/stianeikeland/node-etcd#watcherkey-index-options) to monitor the key for changes |
| etcd      | object   |        | options that will be passed to [the underlying etcd client](https://github.com/stianeikeland/node-etcd#constructor-options).


