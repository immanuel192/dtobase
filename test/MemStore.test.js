'use strict';

const assert = require('assert');

describe('#MemStore - DI', () => {
    let kv = null;
    before(() => {
        kv = require('../src/MemStore');
    });

    it('Should be registered as singleton object', () => {
        const kv2 = require('../src/MemStore');
        assert.deepEqual(kv2, kv);
    });

    it('Should store object sucessfully', () => {
        const expectedValue = 123;
        const expectedKey = 'myTest';
        try {
            kv.register(expectedKey, expectedValue);
            assert.deepEqual(kv.resolve(expectedKey), expectedValue);
        }
        catch (ex) {
            assert.ifError(ex);
        }
    });

    it('should return undefined when we resolve object which is not registered', () => {
        let t = kv.resolve('test1123432423');
        assert.deepEqual(t, undefined);
    });

    it('should replace the registered', () => {
        let expectObject = { a: 1 };
        let expectObject2 = { a: 1 };
        kv.register('myObj123', expectObject);
        kv.register('myObj123', expectObject2);
        assert.notEqual(kv.resolve('myObj123'), expectObject);
    });
});