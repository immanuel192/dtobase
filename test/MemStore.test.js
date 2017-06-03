'use strict';
const MemStore1 = require('../src/MemStore');
const MemStore2 = require('../src/MemStore');
const assert = require('assert');

class DtoClass {
    static get dtoType() {
        return 'myDtoType';
    }

    static get dtoSubType() {
        return 'myDtoSubType';
    }
}

class DtoClassWithoutSubType {
    static get dtoType() {
        return 'myDtoType';
    }
}

class BadDtoClass {
}

describe('#MemStore - DI', () => {
    let kv = null;
    before(() => {
        kv = MemStore1;
    });

    it('Should be registered as singleton object', () => {
        const kv2 = MemStore2;
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
        const t = kv.resolve('test1123432423');
        assert.deepEqual(t, undefined);
    });

    it('should replace the registered', () => {
        const expectObject = { a: 1 };
        const expectObject2 = { a: 1 };
        kv.register('myObj123', expectObject);
        kv.register('myObj123', expectObject2);
        assert.notEqual(kv.resolve('myObj123'), expectObject);
    });

    describe('Dto', () => {
        const type = 'myType';
        const subtype = 'mySubType';
        const actualInp = 123;

        it('should register dto with correct key', () => {
            const expectKey = `dto-${type}-${subtype}`;
            kv.registerDto(type, subtype, actualInp);
            assert.strictEqual(kv.resolve(expectKey), actualInp);
        });

        it('should register dto with correct key', () => {
            kv.registerDto(type, subtype, actualInp);
            assert.strictEqual(kv.resolveDto(type, subtype), actualInp);
        });

        describe('registerDto overloading registration', () => {
            it('should register with 2 parameters and set subtype as empty by default', () => {
                const expectKey = `dto-${type}-`;
                kv.registerDto(type, actualInp);
                assert.strictEqual(kv.resolve(expectKey), actualInp);
            });

            it('should register dto class by reading dtoType and dtoSubType statically from class', () => {
                const expectKey = 'dto-myDtoType-myDtoSubType';
                kv.registerDto(DtoClass);
                assert.strictEqual(kv.resolve(expectKey), DtoClass);
            });

            it('should ignore dtoSubType when registering dtoClass', () => {
                const expectKey = 'dto-myDtoType-';
                kv.registerDto(DtoClassWithoutSubType);
                assert.strictEqual(kv.resolve(expectKey), DtoClassWithoutSubType);
            });

            it('should throw exception if can not recognize dto', () => {
                try {
                    kv.registerDto(BadDtoClass);
                    throw new Error('kv.registerDto can register bad dto format');
                }
                catch (err) {
                    const expectMessage = 'Can not recognize Dto format';
                    assert.equal(err.message, expectMessage);
                }
            });
        });
    });
});