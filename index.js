var debug = require('debug')('confabulous:loaders:etcd')
var EventEmitter = require('events').EventEmitter
var Etcd = require('node-etcd');
var async = require('async')
var merge = require('lodash.merge')

module.exports = function(_options, postProcessors) {

    var options = merge({}, { hosts: ['http://localhost:2379'], mandatory: true, watch: false, etcd: {} }, _options)
    var emitter = new EventEmitter()
    var etcd

    return function(confabulous, cb) {
        debug('running')
        setImmediate(function() {
            async.waterfall([validate, init, watch, load], function(err, result) {
                if (err) return cb(err)
                async.seq.apply(async, postProcessors)(result, cb)
            })
        })
        return emitter

        function validate(cb) {
            debug('validate: %s', JSON.stringify(options))
            if (options.mandatory && !options.hosts) return cb(new Error('hosts is required'))
            if (options.mandatory && !options.key) return cb(new Error('key is required'))
            cb(!options.hosts || !options.key)
        }

        function init(cb) {
            debug('init: %s', JSON.stringify(merge({}, { hosts: options.hosts }, options.etcd)))
            etcd = new Etcd(options.hosts, options.etcd)
            cb()
        }

        function watch(cb) {
            debug('watch: %s', options.key)
            if (!options.watch) return cb()
            var watcher = etcd.watcher(options.key)
            watcher.on('change', function() {
                emitter.emit('change')
            }).on('error', function(err) {
                emitter.emit('error', err)
            })
            confabulous.on('reloading', function() {
                watcher.stop()
            })
            return cb()
        }

        function load(cb) {
            debug('load: %s', options.hosts)
            etcd.get(options.key, function(err, res) {
                if (err && err.errorCode === 100 && options.mandatory) return cb(err)
                if (err && err.errorCode === 100) return cb(true)
                if (err) return cb(err)
                cb(err, res.node.value)
            })
        }
    }
}