'use strict';

const _ = require('lodash');
const kv = require('./MemStore');

const DtoConvertion = kv.resolve('dtoConvertion');
/**
 * Base Data Transfer Object class
 *
 * @abstract
 * @class BaseDto
 */
class BaseDto {
    /**
     * Creates an instance
     * @param {boolean} [defaultField=true] Init default fields for cloudant object or use empty object
     */
    constructor(defaultField = true) {
        if (defaultField === true) {
            this.schema({
                _id: {
                    type: String
                }
            });
        }
    }

    /**
    * Build up schema
    * @param {Object} extension
    */
    schema(extension) {
        if (_.isObjectLike(extension)) {
            return _.mergeWith(this, extension);
        }

        throw new Error('Schema should be an object');
    }

    /**
     * Return true to indenitfy this is Dto Schema Model
     * Donot remove this function
     *
     * @static
     * @return {Boolean}
     *
     * @memberof BaseDto
     */
    static isDto() {
        return true;
    }

    /**
     * Normallize all fields of view model to match datatype
     *
     * @param {Object} input Input object to validate and normalize all fields data
     * @return {Promise<Object>} Instance of Dto which has been cleaned all schema definitions
     */
    static fromViewModel(input, type) {
        return new Promise((resolve, reject) => {
            let ret = new (this.prototype.constructor)();
            if (!_.isObjectLike(input)) {
                return resolve(DtoConvertion.schemaCleanup(ret));
            }

            const errors = [];
            ret = DtoConvertion.convertBySchemaDefinition(this.prototype.constructor, input, errors, type);
            if (errors.length > 0) {
                return reject(errors);
            }

            return resolve(DtoConvertion.schemaCleanup(ret));
        });
    }

    /**
     * Convert from entity model to Dto
     *
     * @static
     * @param {Object | Array<Object>} model
     * @param {Array<string>} ignoreFields ignore fields. can be empty or null
     *
     * @memberof BaseDto
     */
    static fromEntity(model, ignoreFields) {
        ignoreFields = ignoreFields || [];
        const targetDto = () => new (this.prototype.constructor)();

        /**
         * Internal convertion
         */
        function _convert(obj) {
            const ret = {};
            /**
             * TODO: later can consider to test & improve performance
             */
            _.forOwn(obj, (v, k) => {
                const isStartBy_ = (k.substring(0, 1) === '_');
                if ((k === '_id') ||
                    (!isStartBy_ && ignoreFields && (_.indexOf(ignoreFields, k) === -1))) {
                    ret[k] = v;
                }
            });

            return ret;
        }

        if (model === undefined || model === null) {
            return model;
        }

        if (_.isArray(model)) {
            return _.map(model, (v) => {
                return DtoConvertion.schemaCleanup(_.extend(targetDto(), _convert(v)));
            });
        }
        else if (_.isObjectLike(model)) {
            return DtoConvertion.schemaCleanup(_.extend(targetDto(), _convert(model)));
        }

        throw new Error('Model should be object or array');
    }
}

module.exports = exports = BaseDto;