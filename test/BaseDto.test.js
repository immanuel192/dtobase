'use strict';

const BaseDto = require('../src/BaseDto');
const assert = require('assert');
const _ = require('lodash');
const kv = require('../src/MemStore');

class FakeDto extends BaseDto {
}

class FakeSchemaSubTypeLevel2Dto extends BaseDto {
    constructor() {
        super(false);
        _.extend(this, {
            l2F1: {
                type: String,
                required: true
            },
            type: {
                type: String,
                value: 'fakesubtype2'
            }
        });
    }
}

class FakeSchemaSubTypeDto extends BaseDto {
    constructor() {
        super(false);
        _.extend(this, {
            field1: {
                type: String,
                required: true
            },
            type: {
                type: String,
                value: 'fakesubtype1'
            },
            field2: {
                type: Number
            },
            field3: {
                type: FakeSchemaSubTypeLevel2Dto
            },
            field4: {
                type: String,
                requiredUpdate: true,
                requiredPut: true,
                requiredPatch: true
            },
            field5: {
                type: String,
                requiredCreate: true
            }
        });
    }
}

class FakeSchemaWithRestAttributes extends BaseDto {
    constructor() {
        super(false);
        this.schema({
            // Find
            canFindFieldFalse: {
                type: String,
                canFind: false
            },
            canFindFieldTrue: {
                type: String
            },
            // Get
            canGetFieldFalse: {
                type: String,
                canGet: false
            },
            canGetFieldTrue: {
                type: String
            },
            // Create
            canCreateFieldFalse: {
                type: String,
                canCreate: false
            },
            canCreateFieldTrue: {
                type: String
            },
            // Put
            canPutFieldFalse: {
                type: String,
                canPut: false
            },
            canPutFieldTrue: {
                type: String
            },
            // patch
            canPatchFieldFalse: {
                type: String,
                canPatch: false
            },
            canPatchFieldTrue: {
                type: String
            },
            // remove
            canRemoveFieldFalse: {
                type: String,
                canRemove: false
            },
            canRemoveFieldTrue: {
                type: String
            }
        });
    }
}
class FakeSchemaDto extends BaseDto {
    constructor() {
        super(false);
        _.extend(this, {
            _id: {
                type: String,
                required: true
            },
            dateField: {
                type: Date
            },
            booleanField: {
                type: Boolean
            },
            numberField: {
                type: Number
            },
            integerField: {
                type: Number,
                integer: true
            },
            arrString: {
                type: [String]
            },
            objectField: {
                type: Object
            },
            subTypeObjectField: {
                type: FakeSchemaSubTypeDto
            },
            subTypeObjectListField: {
                type: [FakeSchemaSubTypeDto]
            },
            fieldDefaultValue: {
                type: Number,
                default: 10
            },
            fieldDefaultValueAsFunction: {
                type: Number,
                default: () => {
                    return 10;
                }
            },
            fieldWithPersistentValue: {
                type: Number,
                value: 15
            },
            minField: {
                type: Number,
                min: 10
            },
            maxField: {
                type: Number,
                max: 100
            },
            minLengthField: {
                type: String,
                minLength: 10
            },
            maxLengthField: {
                type: String,
                maxLength: 3
            },
            multipleTypedArray: {
                type: [FakeSchemaSubTypeDto, FakeSchemaSubTypeLevel2Dto]
            },
            symbolField: {
                type: Symbol,
                integer: true
            }
        });
    }
}

describe('BaseDto', () => {
    before(() => {
        kv.registerDto('fakesubtype1', '', FakeSchemaSubTypeDto);
        kv.registerDto('fakesubtype2', '', FakeSchemaSubTypeLevel2Dto);
    });

    it('should have static method fromEntity', () => {
        assert.notStrictEqual(BaseDto.fromEntity, undefined);
    });

    it('should have static method fromViewModel', () => {
        assert.notStrictEqual(BaseDto.fromViewModel, undefined);
    });

    describe('constructor', () => {
        it('should register field _id when constructing without special instruction', () => {
            const obj = new FakeDto();
            assert.equal('_id' in obj, true);
        });

        it('should not register field _id when constructing with _super to false', () => {
            const obj = new FakeSchemaSubTypeLevel2Dto();
            assert.equal(!('_id' in obj), true);
        });
    });

    context('schema', () => {
        it('should throw exception when calling schema with input not an object', () => {
            const obj = new FakeSchemaSubTypeLevel2Dto();
            try {
                obj.schema('');
                throw new Error('calling schema with empty string succcessfully');
            }
            catch (err) {
                assert.equal(err.message, 'Schema should be an object');
            }
        });
    });

    describe('With Rest Methods', () => {
        function testCastViewModelByMethod(fieldName, actualValue, method, action) {
            const inputObject = _.extend({
                [fieldName]: actualValue
            });
            return FakeSchemaWithRestAttributes
                .fromViewModel(inputObject, method)
                .then((result) => {
                    return action(result[fieldName]);
                });
        }

        describe('canFind', () => {
            const testMethod = 'find';

            it('should return the field data when canFind is set to true', () => {
                const fieldName = 'canFindFieldTrue';
                const expectValue = '123';
                const actualValue = '123';

                return testCastViewModelByMethod(fieldName, actualValue, testMethod, (newValue) => {
                    assert.equal(newValue, expectValue);
                });
            });

            it('should not return field data when canFind is set to false', () => {
                const fieldName = 'canFindFieldFalse';
                const actualValue = '123';

                return testCastViewModelByMethod(fieldName, actualValue, testMethod, (newValue) => {
                    assert.strictEqual(newValue, undefined);
                });
            });
        });

        describe('canGet', () => {
            const testMethod = 'get';

            it('should return the field data when canGet is set to true', () => {
                const fieldName = 'canGetFieldTrue';
                const expectValue = '123';
                const actualValue = '123';

                return testCastViewModelByMethod(fieldName, actualValue, testMethod, (newValue) => {
                    assert.equal(newValue, expectValue);
                });
            });

            it('should not return field data when canGet is set to false', () => {
                const fieldName = 'canGetFieldFalse';
                const actualValue = '123';

                return testCastViewModelByMethod(fieldName, actualValue, testMethod, (newValue) => {
                    assert.strictEqual(newValue, undefined);
                });
            });
        });

        describe('canCreate', () => {
            const testMethod = 'create';

            it('should return the field data when canCreate is set to true', () => {
                const fieldName = 'canCreateFieldTrue';
                const expectValue = '123';
                const actualValue = '123';

                return testCastViewModelByMethod(fieldName, actualValue, testMethod, (newValue) => {
                    assert.equal(newValue, expectValue);
                });
            });

            it('should not return field data when canCreate is set to false', () => {
                const fieldName = 'canCreateFieldFalse';
                const actualValue = '123';

                return testCastViewModelByMethod(fieldName, actualValue, testMethod, (newValue) => {
                    assert.strictEqual(newValue, undefined);
                });
            });
        });

        describe('canPut', () => {
            const testMethod = 'update';

            it('should return the field data when canPut is set to true', () => {
                const fieldName = 'canPutFieldTrue';
                const expectValue = '123';
                const actualValue = '123';

                return testCastViewModelByMethod(fieldName, actualValue, testMethod, (newValue) => {
                    assert.equal(newValue, expectValue);
                });
            });

            it('should not return field data when canPut is set to false', () => {
                const fieldName = 'canPutFieldFalse';
                const actualValue = '123';

                return testCastViewModelByMethod(fieldName, actualValue, testMethod, (newValue) => {
                    assert.strictEqual(newValue, undefined);
                });
            });
        });

        describe('canPatch', () => {
            const testMethod = 'patch';

            it('should return the field data when canPatch is set to true', () => {
                const fieldName = 'canPatchFieldTrue';
                const expectValue = '123';
                const actualValue = '123';

                return testCastViewModelByMethod(fieldName, actualValue, testMethod, (newValue) => {
                    assert.equal(newValue, expectValue);
                });
            });

            it('should not return field data when canPatch is set to false', () => {
                const fieldName = 'canPatchFieldFalse';
                const actualValue = '123';

                return testCastViewModelByMethod(fieldName, actualValue, testMethod, (newValue) => {
                    assert.strictEqual(newValue, undefined);
                });
            });
        });

        describe('canRemove', () => {
            const testMethod = 'remove';

            it('should return the field data when canRemove is set to true', () => {
                const fieldName = 'canRemoveFieldTrue';
                const expectValue = '123';
                const actualValue = '123';

                return testCastViewModelByMethod(fieldName, actualValue, testMethod, (newValue) => {
                    assert.equal(newValue, expectValue);
                });
            });

            it('should not return field data when canRemove is set to false', () => {
                const fieldName = 'canRemoveFieldFalse';
                const actualValue = '123';

                return testCastViewModelByMethod(fieldName, actualValue, testMethod, (newValue) => {
                    assert.strictEqual(newValue, undefined);
                });
            });
        });
    });

    describe('#fromViewModel', () => {
        const payload = {
            _id: '123'
        };

        function testValid(fieldName, actualValue, action, testPayload) {
            let inputObject = testPayload || {};
            if (actualValue) {
                inputObject = _.extend(inputObject, {
                    [fieldName]: actualValue
                });
            }
            return FakeSchemaDto
                .fromViewModel(inputObject)
                .then((result) => {
                    return action(result[fieldName], result);
                });
        }

        it('should return empty object if input is not object like', () => {
            const inputString = 'this is a test';
            return FakeSchemaDto
                .fromViewModel(inputString)
                .then((result) => {
                    assert.deepEqual(result, {});
                });
        });

        it('should ignore field without type definition', () => {
            const inputObj = { abc: 123, _id: '123' };
            return FakeSchemaDto
                .fromViewModel(inputObj)
                .then((result) => {
                    assert.equal(Object.prototype.hasOwnProperty.call(result, 'abc'), false);
                });
        });

        describe('field with default value', () => {
            it('should return default value as Primitive of the field if no input value', () => {
                const expectValue = 10;
                let actualValue;
                const fieldName = 'fieldDefaultValue';
                return testValid(fieldName, actualValue, (newValue) => {
                    assert.strictEqual(newValue, expectValue, `field ${fieldName} should be converted to ${expectValue}`);
                }, payload);
            });

            it('should return default value as function of the field if no input value', () => {
                const expectValue = 10;
                let actualValue;
                const fieldName = 'fieldDefaultValueAsFunction';
                return testValid(fieldName, actualValue, (newValue) => {
                    assert.strictEqual(newValue, expectValue, `field ${fieldName} should be converted to ${expectValue}`);
                }, payload);
            });

            it('should return input value instead of default value if has input value', () => {
                const expectValue = 15;
                const actualValue = '15';
                const fieldName = 'fieldDefaultValue';
                return testValid(fieldName, actualValue, (newValue) => {
                    assert.strictEqual(newValue, expectValue, `field ${fieldName} should be converted to ${expectValue}`);
                }, payload);
            });
        });

        describe('field persistent value', () => {
            it('should always return default persistent value', () => {
                const expectValue = 15;
                const actualValue = 'fdsfsdfsad';
                const fieldName = 'fieldWithPersistentValue';
                return testValid(fieldName, actualValue, (newValue) => {
                    assert.strictEqual(newValue, expectValue, `field ${fieldName} should be converted to ${expectValue}`);
                }, payload);
            });

            it('should always return default persistent value in case if field missing', () => {
                const expectValue = 15;
                const actualValue = 'fdsfsdfsad';
                const fieldName = 'fieldWithPersistentValue';
                return testValid(`${fieldName}123`, actualValue, (newValue, res) => {
                    assert.strictEqual(res[fieldName], expectValue, `field ${fieldName} should be converted to ${expectValue}`);
                }, payload);
            });
        });

        describe('datatype String', () => {
            it('should process field _id as String value', () => {
                const expectValue = '1';
                const actualValue = 1;
                const fieldName = '_id';
                return testValid(fieldName, actualValue, (newValue) => {
                    assert.strictEqual(newValue, expectValue, `field ${fieldName} should be converted to ${expectValue}`);
                });
            });

            it('should throw invalid message for minLengthField with invalid data case', () => {
                const inputObject = {
                    _id: 123,
                    minLengthField: 'a'
                };
                return FakeSchemaDto
                    .fromViewModel(inputObject)
                    .then(() => {
                        throw new Error('Cast dto schema sucessfully with invalid data');
                    })
                    .catch((err) => {
                        assert.equal(err.length, 1);
                        assert.equal(err[0], 'minLengthField has invalid data');
                    });
            });

            it('should not throw message for minLengthField when length > minlength', () => {
                const inputObject = {
                    _id: 123,
                    minLengthField: 'ffdfadsfsdfsfsadfasf'
                };
                return FakeSchemaDto
                    .fromViewModel(inputObject)
                    .then((res) => {
                        assert.equal(res.maxLengthField, inputObject.maxLengthField);
                    });
            });

            it('should not throw message for maxLengthField when length = minlength', () => {
                const inputObject = {
                    _id: 123,
                    minLengthField: '1234567890'
                };
                return FakeSchemaDto
                    .fromViewModel(inputObject)
                    .then((res) => {
                        assert.equal(res.maxLengthField, inputObject.maxLengthField);
                    });
            });

            it('should throw invalid message for maxLengthField with invalid data case', () => {
                const inputObject = {
                    _id: 123,
                    maxLengthField: 'fdssffasfasfa'
                };
                return FakeSchemaDto
                    .fromViewModel(inputObject)
                    .then(() => {
                        throw new Error('Cast dto schema sucessfully with invalid data');
                    })
                    .catch((err) => {
                        assert.equal(err.length, 1);
                        assert.equal(err[0], 'maxLengthField has invalid data');
                    });
            });

            it('should not throw message for maxLengthField when lenth < maxlength', () => {
                const inputObject = {
                    _id: 123,
                    maxLengthField: 'f'
                };
                return FakeSchemaDto
                    .fromViewModel(inputObject)
                    .then((res) => {
                        assert.equal(res.maxLengthField, inputObject.maxLengthField);
                    });
            });

            it('should not throw message for maxLengthField when lenth = maxlength', () => {
                const inputObject = {
                    _id: 123,
                    maxLengthField: 'fss'
                };
                return FakeSchemaDto
                    .fromViewModel(inputObject)
                    .then((res) => {
                        assert.equal(res.maxLengthField, inputObject.maxLengthField);
                    });
            });
        });

        describe('datatype Date', () => {
            it('should return correct date when input is string', () => {
                const actualValue = '1489309333478';
                const expectValue = new Date(1489309333478);
                const fieldName = 'dateField';
                return testValid(fieldName, actualValue, (newValue) => {
                    assert.strictEqual(newValue - expectValue, 0, `field ${fieldName} should be converted to ${expectValue}`);
                }, payload);
            });

            it('should return correct date when input is iso date', () => {
                const actualValue = '2014-08-13T10:00:39.399Z';
                const expectValue = new Date(actualValue);
                const fieldName = 'dateField';

                testValid(fieldName, actualValue, (newValue) => {
                    assert.strictEqual(newValue - expectValue, 0, `field ${fieldName} should be converted to ${expectValue}`);
                }, payload);
            });
        });

        describe('datatype Number', () => {
            it('should return correct for datatype number when input is string', () => {
                const actualValue = '2000';
                const expectValue = 2000;
                const fieldName = 'numberField';
                return testValid(fieldName, actualValue, (newValue) => {
                    assert.strictEqual(newValue, expectValue, `field ${fieldName} should be converted to ${expectValue}`);
                }, payload);
            });

            it('should return undefined for datatype number when input is wrong number-in-string-format', () => {
                const actualValue = '2014-';
                let expectValue;
                const fieldName = 'numberField';
                return testValid(fieldName, actualValue, (newValue) => {
                    assert.strictEqual(newValue, expectValue, `field ${fieldName} should be converted to ${expectValue}`);
                }, payload);
            });

            it('should throw invalid message for min field with invalid data case', () => {
                const inputObject = {
                    _id: 123,
                    minField: 1
                };
                return FakeSchemaDto
                    .fromViewModel(inputObject)
                    .then(() => {
                        throw new Error('Cast dto schema sucessfully with invalid data');
                    })
                    .catch((err) => {
                        assert.equal(err.length, 1);
                        assert.equal(err[0], 'minField has invalid data');
                    });
            });

            it('should throw invalid message for max field with invalid data case', () => {
                const inputObject = {
                    _id: 123,
                    maxField: 200
                };
                return FakeSchemaDto
                    .fromViewModel(inputObject)
                    .then(() => {
                        throw new Error('Cast dto schema sucessfully with invalid data');
                    })
                    .catch((err) => {
                        assert.equal(err.length, 1);
                        assert.equal(err[0], 'maxField has invalid data');
                    });
            });

            it('should return correct for datatype integer number when input is string', () => {
                const actualValue = '2000';
                const expectValue = 2000;
                const fieldName = 'integerField';
                return testValid(fieldName, actualValue, (newValue) => {
                    assert.strictEqual(newValue, expectValue, `field ${fieldName} should be converted to ${expectValue}`);
                }, payload);
            });

            it('should return undefined if input value if not integer for integer number field', () => {
                const actualValue = '2000.03';
                const expectValue = 2000;
                const fieldName = 'integerField';
                return testValid(fieldName, actualValue, (newValue) => {
                    assert.strictEqual(newValue, undefined, `field ${fieldName} should be converted to ${expectValue}`);
                }, payload);
            });
        });

        describe('datatype Boolean', () => {
            it('should return true for Boolean when input is "true"', () => {
                const actualValue = 'true';
                const expectValue = true;
                const fieldName = 'booleanField';
                return testValid(fieldName, actualValue, (newValue) => {
                    assert.strictEqual(newValue, expectValue, `field ${fieldName} should be converted to ${expectValue}`);
                }, payload);
            });

            it('should return true for Boolean when input is "1"', () => {
                const actualValue = '1';
                const expectValue = true;
                const fieldName = 'booleanField';
                return testValid(fieldName, actualValue, (newValue) => {
                    assert.strictEqual(newValue, expectValue, `field ${fieldName} should be converted to ${expectValue}`);
                }, payload);
            });

            it('should return true for Boolean when input is number 1', () => {
                const actualValue = 1;
                const expectValue = true;
                const fieldName = 'booleanField';
                return testValid(fieldName, actualValue, (newValue) => {
                    assert.strictEqual(newValue, expectValue, `field ${fieldName} should be converted to ${expectValue}`);
                }, payload);
            });

            it('should return false for Boolean when input is "false"', () => {
                const actualValue = 'false';
                const expectValue = false;
                const fieldName = 'booleanField';
                return testValid(fieldName, actualValue, (newValue) => {
                    assert.strictEqual(newValue, expectValue, `field ${fieldName} should be converted to ${expectValue}`);
                }, payload);
            });

            it('should return false for Boolean when input is "0"', () => {
                const actualValue = '0';
                const expectValue = false;
                const fieldName = 'booleanField';
                return testValid(fieldName, actualValue, (newValue) => {
                    assert.strictEqual(newValue, expectValue, `field ${fieldName} should be converted to ${expectValue}`);
                }, payload);
            });

            it('should return false for Boolean when input is number 0', () => {
                const actualValue = 0;
                const expectValue = false;
                const fieldName = 'booleanField';
                return testValid(fieldName, actualValue, (newValue) => {
                    assert.strictEqual(newValue, expectValue, `field ${fieldName} should be converted to ${expectValue}`);
                }, payload);
            });
        });

        describe('datatype Array of primite datatype', () => {
            it('should return array of string', () => {
                const actualValue = ['abc'];
                const expectValue = ['abc'];
                const fieldName = 'arrString';
                return testValid(fieldName, actualValue, (newValue) => {
                    assert.strictEqual(_.isEqual(newValue, expectValue), true, `field ${fieldName} should be converted to ${expectValue}`);
                }, payload);
            });
        });

        describe('datatype freestyle Object', () => {
            it('should return undefined for null or undefined value of freestyle object', () => {
                const actualValue = null;
                let expectValue;
                const fieldName = 'objectField';
                return testValid(fieldName, actualValue, (newValue) => {
                    assert.strictEqual(_.isEqual(newValue, expectValue), true, `field ${fieldName} should be converted to ${expectValue}`);
                }, payload);
            });

            it('should return input object for freestyle object type', () => {
                const actualValue = { abc: 123 };
                const expectValue = { abc: 123 };
                const fieldName = 'objectField';
                return testValid(fieldName, actualValue, (newValue) => {
                    assert.strictEqual(_.isEqual(newValue, expectValue), true, `field ${fieldName} should be converted to ${expectValue}`);
                }, payload);
            });
        });

        describe('datatype typed Object', () => {
            it('should return correct typed datatype object', () => {
                const actualValue = {
                    field1: 'abc',
                    field2: 123
                };
                const expectValue = FakeSchemaSubTypeDto.fromEntity(actualValue);
                expectValue.type = 'fakesubtype1';
                const fieldName = 'subTypeObjectField';
                return testValid(fieldName, actualValue, (newValue) => {
                    assert.equal(newValue instanceof FakeSchemaSubTypeDto, true, 'Should be instance of FakeSchemaSubTypeDto');
                    assert.strictEqual(_.isEqual(newValue, expectValue), true, `field ${fieldName} should be converted to ${expectValue}`);
                }, payload);
            });

            it('should throw error field datatype is missing', () => {
                const actualValue = {};
                const fieldName = 'subTypeObjectField';
                return testValid(fieldName, actualValue, () => {
                    throw new Error('sucessfully convert dto when has missing field @ level 1');
                }, payload)
                    .catch((err) => {
                        assert.equal(err.length, 1);
                        assert.equal(err[0], 'field1 is required');
                    });
            });

            it('should return correct typed datatype object in the second level', () => {
                const actualValue = {
                    field1: 'abc',
                    field2: 123,
                    type: 'fakesubtype1',
                    field3: {
                        l2F1: 2321,
                        type: 'fakesubtype2'
                    }
                };
                const expectValue = FakeSchemaSubTypeDto.fromEntity(actualValue);
                expectValue.type = 'fakesubtype1';
                expectValue.field3 = new FakeSchemaSubTypeLevel2Dto();
                expectValue.field3.l2F1 = '2321';
                expectValue.field3.type = 'fakesubtype2';

                const fieldName = 'subTypeObjectField';
                return testValid(fieldName, actualValue, (newValue) => {
                    assert.equal(newValue instanceof FakeSchemaSubTypeDto, true, 'Should be instance of FakeSchemaSubTypeDto');
                    assert.strictEqual(_.isEqual(newValue, expectValue), true, `field ${fieldName} should be converted to ${expectValue}`);
                }, payload);
            });
        });

        describe('datatype array of typed Object', () => {
            it('should return correct typed array of datatype object', () => {
                const actualValue = [
                    {
                        field1: 'abc',
                        field2: 123,
                        type: 'fakesubtype1'
                    },
                    {
                        field1: 'abc',
                        field2: 123,
                        type: 'fakesubtype1',
                        field3: {
                            l2F1: 123,
                            type: 'fakesubtype2'
                        }
                    }
                ];
                const expectValue = FakeSchemaSubTypeDto.fromEntity(actualValue);
                expectValue[1].field3 = new FakeSchemaSubTypeLevel2Dto();
                expectValue[1].field3.l2F1 = '123';
                expectValue[1].field3.type = 'fakesubtype2';

                const fieldName = 'subTypeObjectListField';
                return testValid(fieldName, actualValue, (newValue) => {
                    assert.strictEqual(_.isEqual(newValue, expectValue), true, `field ${fieldName} should be converted to ${expectValue}`);
                    assert.equal(newValue.length, expectValue.length, 'should has same length');
                    assert.equal(newValue[0] instanceof FakeSchemaSubTypeDto, true, 'Should be instance of FakeSchemaSubTypeDto');
                }, payload);
            });
        });

        describe('datatype array of multiple typed Object', () => {
            it('should return correct with multiple typed object ', () => {
                const inputObject = {
                    _id: '123',
                    multipleTypedArray: [
                        {
                            l2F1: '123',
                            type: 'fakesubtype2'
                        },
                        {
                            field1: '456',
                            type: 'fakesubtype1'
                        }
                    ]
                };
                return FakeSchemaDto
                    .fromViewModel(inputObject)
                    .then((result) => {
                        assert.equal(result.multipleTypedArray[0] instanceof FakeSchemaSubTypeLevel2Dto, true);
                        assert.equal(result.multipleTypedArray[1] instanceof FakeSchemaSubTypeDto, true);
                    });
            });

            it('should return undefined if input is not array', () => {
                const inputObject = {
                    _id: '123',
                    multipleTypedArray: 123
                };
                return FakeSchemaDto
                    .fromViewModel(inputObject)
                    .then((result) => {
                        assert.strictEqual(result.multipleTypedArray, undefined);
                    });
            });
        });

        describe('validate with action type', () => {
            function testRequiredUpdateField(method) {
                const inputObject = {
                    field1: '123'
                };
                return FakeSchemaSubTypeDto
                    .fromViewModel(inputObject, method)
                    .then(() => {
                        throw new Error('Cast dto schema sucessfully when missing action update field');
                    });
            }

            it('should throw exception missing field with attribute requiredUpdate and action=update', () => {
                return testRequiredUpdateField('update')
                    .catch((err) => {
                        assert.equal(err.length, 1);
                        assert.equal(err[0], 'field4 is required');
                    });
            });

            it('should throw exception missing field with attribute requiredUpdate and action=patch', () => {
                return testRequiredUpdateField('patch')
                    .catch((err) => {
                        assert.equal(err.length, 1);
                        assert.equal(err[0], 'field4 is required');
                    });
            });
        });

        describe('Symbol type', () => {
            it('should return undefined for Symbol field coz we dont support Symbol', () => {
                const actualValue = '2000';
                const expectValue = undefined;
                const fieldName = 'symbolField';
                return testValid(fieldName, actualValue, (newValue) => {
                    assert.strictEqual(newValue, expectValue, `field ${fieldName} should be converted to ${expectValue}`);
                }, payload);
            });
        });
    });

    describe('#fromEntity', () => {
        let sourceObj;
        let sourceArrayObj;
        let expectObj;

        before(() => {
            sourceObj = {
                a: 1,
                b: 2,
                _id: 1,
                _test: 2
            };

            expectObj = {
                a: 1,
                _id: 1
            };

            sourceArrayObj = [
                {
                    a: 1, b: 2
                },
                {
                    a: 3, b: 4
                }
            ];
        });

        it('should return instance of target Dto for inputed is an object', () => {
            const result = FakeDto.fromEntity(sourceObj);
            assert.equal(result instanceof FakeDto, true);
        });

        it('should return correct Dto object', () => {
            /**
             * Correct Dto object is:
             * - Only allow _id
             * - No fields started by _
             * - All ignore fields should be removed
             */
            const result = FakeDto.fromEntity(sourceObj, ['b']);
            assert.deepEqual(result, expectObj);
        });

        it('should return array of instance of target Dto for inputed is an array of object', () => {
            const result = FakeDto.fromEntity(sourceArrayObj);
            const isArrayOfObject = !_.some(result, (v) => {
                return !(v instanceof FakeDto);
            });
            assert.equal(result.length, sourceArrayObj.length);
            assert.equal(isArrayOfObject, true);
        });

        it('should return null for null input', () => {
            assert.equal(null, FakeDto.fromEntity(null));
        });

        it('should throw exception if input is not array or object', () => {
            try {
                FakeDto.fromEntity(123);
            }
            catch (err) {
                assert.equal(err.message, 'Model should be object or array');
            }
        });

        it('should return undefined for undefined input', () => {
            assert.equal(undefined, FakeDto.fromEntity(undefined));
        });

        it('should ignore field named _id', () => {
            const result = FakeDto.fromEntity(sourceObj);
            assert.notStrictEqual(result._id, undefined);
        });

        it('should remove all fields started by _', () => {
            const result = FakeDto.fromEntity(sourceObj);
            assert.strictEqual(result._test, undefined);
        });

        it('should remove all fields started if ignores', () => {
            const result = FakeDto.fromEntity(sourceObj, ['a']);
            assert.strictEqual(result.a, undefined);
        });

        it('should return a cloned version of input object', () => {
            const result = FakeDto.fromEntity(sourceObj);
            sourceObj.a = 100;
            assert.notStrictEqual(result.a, sourceObj.a);
        });
    });
});