'use strict';
/**
 * Dto Convertion module
 * Rule:
 * - Convert primitive datatype
 * - Convert Object
 * - Convert an array of dataType
 * - Apply filtering for Restful methods
 */
const _ = require('lodash');
const kv = require('./MemStore');

const TYPE_ANY = 'any';
const METHOD_PUT = 'update';
const METHOD_PATCH = 'patch';
const METHOD_FIND = 'find';
const METHOD_GET = 'get';
const METHOD_CREATE = 'create';
const METHOD_REMOVE = 'remove';
const TYPE_UPDATE_VALIDATOR = ['update', METHOD_PUT, METHOD_PATCH];

function canMatchType(sourceField, type) {
    return (
        (type === TYPE_ANY) ||
        (type === METHOD_FIND && sourceField.canFind !== false) ||
        (type === METHOD_GET && sourceField.canGet !== false) ||
        (type === METHOD_CREATE && sourceField.canCreate !== false) ||
        (type === METHOD_PUT && sourceField.canPut !== false) ||
        (type === METHOD_PATCH && sourceField.canPatch !== false) ||
        (type === METHOD_REMOVE && sourceField.canRemove !== false)
    );
}

/**
* Auto convert input value to correct datatype
* @private
* @param {any} datatype
* @param {any} input
* @return {Boolean} description
*/
function convertByDataType(datatype, input, fieldDef) {
    if (datatype === String) {
        const testMinMax = function testMinMax(inpValue) {
            const minLength = fieldDef.minLength || inpValue.length;
            const maxLength = fieldDef.maxLength || inpValue.length;
            if (inpValue.length < minLength || inpValue.length > maxLength) {
                return {
                    valid: false
                };
            }
            return inpValue;
        };

        return (input !== undefined && input !== null) ? testMinMax(String(input)) : undefined;
    }

    if (datatype === Date) {
        const convertDateValue = function convertDateValue(inpValue) {
            // check whether convertable to int
            const testInteger = parseInt(inpValue, 10);
            /* eslint eqeqeq:1 */
            return (_.isInteger(testInteger) && testInteger == inpValue) ? new Date(parseInt(testInteger, 10)) : new Date(inpValue);
        };

        return convertDateValue(input);
    }

    if (datatype === Number) {
        const testMinMax = function testMinMax(inpValue) {
            const min = fieldDef.min || inpValue;
            const max = fieldDef.max || inpValue;

            if (inpValue < min || inpValue > max) {
                return {
                    valid: false
                };
            }
            return inpValue;
        };

        const convertInt = function convertInt(inpValue) {
            const testInteger = parseInt(inpValue, 10);
            return (_.isInteger(testInteger) && testInteger == inpValue) ? testInteger : undefined;
        };

        const convertFloat = function convertFloat(inpValue) {
            const test = parseFloat(inpValue);
            return ((!isNaN(test) && test == inpValue) ? test : undefined);
        };

        // return testMinMax((Object.prototype.hasOwnProperty.call(fieldDef, 'integer') && fieldDef.integer) ? convertInt(input) : convertFloat(input));
        return testMinMax(fieldDef.integer ? convertInt(input) : convertFloat(input));
    }

    if (datatype === Boolean) {
        if (input === true || input === 'true' || input === 1 || input === '1') {
            return true;
        }
        if (input === false || input === 'false' || input === '0' || input === 0) {
            return false;
        }
    }

    if (datatype === Object) {
        return (input === null || input === undefined) ? undefined : input;
    }

    if (_.isArray(datatype)) {
        if (_.isArray(input)) {
            const ret = [];
            _.forEach(input, (v) => {
                ret.push(convertByDataType(datatype[0], v, fieldDef));
            });
            return ret;
        }
        return undefined;
    }

    // ignore all other cases
    return undefined;
}

function isDtoBased(dataType) {
    return _.isFunction(dataType) && _.isFunction(dataType.isDto) && dataType.isDto();
}

function convertPrimitiveDataType(options) {
    // normal cases
    /**
     * Result:
     * - { valid : false } when could not convert input value because of wrong datatype validating
     * - Other: the converted result
     */
    const result = convertByDataType(options.fieldDef.type, options.value, options.fieldDef);
    if (result && result.valid === false) {
        options.errors.push(`${options.fieldName} has invalid data`);
    }
    else if (result === undefined &&
        (
            options.fieldDef.required
            || (options.fieldDef.requiredUpdate && TYPE_UPDATE_VALIDATOR.indexOf(options.restMethod) >= 0)
            || (options.fieldDef.requiredPut && options.restMethod === METHOD_PUT)
            || (options.fieldDef.requiredPatch && options.restMethod === METHOD_PATCH)
            || (options.fieldDef.requiredCreate && options.restMethod === METHOD_CREATE)
        )
    ) {
        options.errors.push(`${options.fieldName} is required`);
    }
    else {
        let finalValue = result;
        if (finalValue === undefined) {
            finalValue = _.isFunction(options.fieldDef.default) ? options.fieldDef.default.call() : options.fieldDef.default;
        }
        Object.assign(options.targetObj, {
            [options.fieldName]: finalValue
        });
    }
}

/**
 * Detect schema of the input object by the list of type definition
 *
 * @param {Array<Object>} fieldDefTypes
 * @param {Object} inpObj
 * @param {boolean} [withSubType=false]
 * @return  Null or object
 */
function detectSchemaInList(fieldDefTypes, inpObj) {
    if (fieldDefTypes.length === 1 && isDtoBased(fieldDefTypes[0])) {
        return fieldDefTypes[0]; // if only one item, then no choice
    }

    const type = (inpObj && inpObj.type) ? inpObj.type : '';
    const subtype = (type !== '' && Object.prototype.hasOwnProperty.call(inpObj, type)) ? inpObj[type] : '';
    const schema = kv.resolveDto(type, subtype);
    let detected = null;

    _.each(fieldDefTypes, (fieldType) => {
        if (fieldType === schema) {
            detected = fieldType;
            return false;
        }
        return true;
    });

    return detected;
}

/**
 * Dto Convertion Helper
 *
 * @class DtoConvertion
 */
class DtoConvertion {
    /**
     * Auto cleanup unused fields in Dto
     *
     * @param {Object} obj
     * @return {Object}
     *
     * @memberof DtoConvertion
     */
    schemaCleanup(obj) {
        const ret = obj;
        _.forOwn(ret, (value, key) => {
            if (_.isObject(value) && !_.isFunction(value) && Object.prototype.hasOwnProperty.call(value, 'type') && value.constructor && value.constructor.name === 'Object') {
                delete ret[key];
            }
        });
        return ret;
    }
    /**
     * Convert a typed class datatype to dto
     *
     * @param {Object} options
     * @param {Class} options.dataType
     * @param {Object} options.inputValue
     * @param {String[]} options.errors
     * @param {String} [options.fieldName]
     * @param {Object} [options.targetObj] Target object to assign final value to
     * @param {string} [options.type] Action type
     * @returns
     *
     * @memberof DtoConvertion
     */
    convertDtoClassDatatype(options) {
        const subField = this.convertBySchemaDefinition(options.dataType, options.inputValue, options.errors, options.restMethod || TYPE_ANY);
        //
        this.schemaCleanup(subField);
        if (options.targetObj) {
            Object.assign(options.targetObj, {
                [options.fieldName]: subField
            });
            return null;
        }

        return subField;
    }

    /**
     * Auto convert input object based on Dto Model Schema
     *
     * @param {Class} targetObj
     * @param {Object} inputObj
     * @param {String[]} errors
     * @param {String} type
     *
     * @memberof DtoConvertion
     */
    convertBySchemaDefinition(SchemaModel, inputObj, errors, method = TYPE_ANY) {
        const targetObj = {};
        const schemaInstance = new SchemaModel();
        const restMethod = method.toLowerCase();

        _.forOwn(schemaInstance, (fieldDef, fieldName) => {
            if (Object.prototype.hasOwnProperty.call(fieldDef, 'type')) {
                if (canMatchType(fieldDef, method)) {
                    // case 1: field value
                    if (Object.prototype.hasOwnProperty.call(fieldDef, 'value')) {
                        Object.assign(targetObj, {
                            [fieldName]: _.cloneDeep(fieldDef.value)
                        });
                    }
                    else if (fieldName in inputObj || fieldDef.default || fieldDef.value) {
                        // case 1: field value
                        if (Object.prototype.hasOwnProperty.call(fieldDef, 'value')) {
                            Object.assign(targetObj, {
                                [fieldName]: _.cloneDeep(fieldDef.value)
                            });
                        }
                        else if (isDtoBased(fieldDef.type)) {
                            // check for subtype based class
                            return this.convertDtoClassDatatype({
                                dataType: fieldDef.type,
                                inputValue: inputObj[fieldName],
                                errors,
                                fieldName,
                                targetObj,
                                restMethod
                            });
                        }
                        // Difference type of Datatype. All type should be Dto. Dont support for mixed type
                        else if (_.isArray(fieldDef.type) && _.isArrayLike(inputObj[fieldName]) && isDtoBased(fieldDef.type[0])) {
                            // && isDtoBased(fieldDef.type[0])
                            // detect correct data type
                            const subArrayFields = _.map(inputObj[fieldName], (v) => {
                                const fieldType = detectSchemaInList(fieldDef.type, v);
                                if (!fieldType) {
                                    throw new Error(`Could not detect model type of ${fieldName}`);
                                }
                                return this.convertDtoClassDatatype({
                                    dataType: fieldType,
                                    inputValue: v,
                                    errors,
                                    restMethod
                                });
                            });
                            Object.assign(targetObj, {
                                [fieldName]: subArrayFields
                            });
                        }
                        else {
                            convertPrimitiveDataType({
                                fieldDef,
                                fieldName,
                                value: inputObj[fieldName],
                                errors,
                                targetObj,
                                restMethod
                            });
                        }
                    }
                    else if (
                        fieldDef.required
                        || (fieldDef.requiredUpdate && TYPE_UPDATE_VALIDATOR.indexOf(restMethod) >= 0)
                        || (fieldDef.requiredPut && restMethod === METHOD_PUT)
                        || (fieldDef.requiredPatch && restMethod === METHOD_PATCH)
                        || (fieldDef.requiredCreate && restMethod === METHOD_CREATE)
                    ) {
                        errors.push(`${fieldName} is required`);
                    }
                }
            }

            return null;
        });
        return _.extend(schemaInstance, targetObj);
    }
}

DtoConvertion.TYPE_ANY = TYPE_ANY;
DtoConvertion.METHOD_PUT = METHOD_PUT;
DtoConvertion.METHOD_PATCH = METHOD_PATCH;
DtoConvertion.METHOD_FIND = METHOD_FIND;
DtoConvertion.METHOD_GET = METHOD_GET;
DtoConvertion.METHOD_CREATE = METHOD_CREATE;
DtoConvertion.METHOD_REMOVE = METHOD_REMOVE;

const dtoConverion = new DtoConvertion();
kv.register('dtoConvertion', dtoConverion);
module.exports = exports = dtoConverion;