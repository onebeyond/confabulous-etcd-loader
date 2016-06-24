var assert = require('chai').assert
var loader = require('..')
var EventEmitter = require('events').EventEmitter
var Etcd = require('node-etcd')

describe('Etcd Loader', function() {

    var confabulous
    var etcd

    before(function(done) {
        etcd = new Etcd(['http://localhost:2379'])
        done()
    })

    beforeEach(function(done) {
        confabulous = new EventEmitter()
        etcd.del("tests", { recursive: true }, function(err) {
            if (err && err.errorCode === 100) return done()
            done(err)
        })
    })

    afterEach(function(done) {
        confabulous.emit('reloading')
        confabulous.removeAllListeners()
        done()
    })

    after(function(done) {
        etcd.del("tests", { recursive: true }, function(err) {
            if (err && err.errorCode === 100) return done()
            done(err)
        })
    })

    it('should require hosts when mandatory', function(done) {
        loader({ hosts: null })(confabulous, function(err, config) {
            assert(err)
            assert.equal(err.message, 'hosts is required')
            done()
        })
    })

    it('should require key when mandatory', function(done) {
        loader()(confabulous, function(err, config) {
            assert(err)
            assert.equal(err.message, 'key is required')
            done()
        })
    })

    it('should load configuration', function(done) {
        etcd.set('tests/config', 'loaded', function(err) {
            assert.ifError(err)

            loader({ key: 'tests/config' })(confabulous, function(err, config) {
                assert.ifError(err)
                assert.equal(config, 'loaded')
                done()
            })
        })
    })

    it('should report errors', function(done) {
        loader({ hosts: ['httpx://localhost:2379'], key: 'tests/config' })(confabulous, function(err, config) {
            assert(err)
            assert(/All servers returned error/.test(err.message), err.message)
            done()
        })
    })

    it('should report missing config when mandatory', function(done) {
        loader({ key: 'tests/missing' })(confabulous, function(err, config) {
            assert(err)
            assert.equal(err.errorCode, 100)
            done()
        })
    })

    it('should ignore missing config when not mandatory', function(done) {
        loader({ key: 'tests/missing', mandatory: false })(confabulous, function(err, config) {
            assert.equal(err, true)
            done()
        })
    })

    it('should emit change event when config is updated', function(done) {

        etcd.set('tests/config', 'loaded', function(err) {
            assert.ifError(err)

            loader({ key: 'tests/config', watch: true })(confabulous, function(err, config) {
                assert.ifError(err)
                assert.equal(config, 'loaded')
                etcd.set('tests/config', 'reloaded', assert.ifError)
            }).on('change', done)
        })
    })

    it('should emit change event when a previously existing key is deleted', function(done) {

        etcd.set('tests/config', 'loaded', function(err) {
            assert.ifError(err)

            loader({ key: 'tests/config', watch: true })(confabulous, function(err, config) {
                assert.ifError(err)
                assert.equal(config, 'loaded')
                etcd.del('tests/config', assert.ifError)
            }).on('change', done)
        })
    })

    it('should emit change event when a previously missing key is created', function(done) {

        loader({ key: 'tests/missing', mandatory: false, watch: true })(confabulous, function(err, config) {
            assert.equal(err, true)
            etcd.set('tests/missing', 'reloaded', assert.ifError)
        }).on('change', done)
    })

    it('should post-process', function(done) {

        etcd.set('tests/config', 'loaded', function(err) {
            assert.ifError(err)

            loader({ key: 'tests/config' }, [
                function(config, cb) {
                    cb(null, config.toUpperCase())
                }
            ])(confabulous, function(err, config) {
                assert.ifError(err)
                assert.equal(config, 'LOADED')
                done()
            })
        })
    })
})