'use strict';

const kvCol = {};
/**
 * Key / value mem store
 * This class is singleton
 *
 * @class MemStore
 */
class MemStore {
    /**
     * Register object with a name
     *
     * @param {string} name
     * @param {any} obj
     */
    register(name, obj) {
        kvCol[name] = obj;
    }

    /**
     * Resolve a registered name
     *
     * @param {string} name
     * @return {mixed}
     */
    resolve(name) {
        return Object.prototype.hasOwnProperty.call(kvCol, name) ? kvCol[name] : undefined;
    }

    /**
     * Register Dto by field type
     *
     * @param {String} type
     * @param {String} subtype
     * @param {Object} obj
     *
     * @memberof MemStore
     */
    registerDto(...args) {
        if (args.length === 3) {
            return this.register(`dto-${args[0]}-${args[1]}`, args[2]);
        }
        if (args.length === 2) {
            return this.register(`dto-${args[0]}-`, args[1]);
        }
        if (args.length === 1 && args[0].dtoType) {
            const myClass = args[0];
            return this.register(`dto-${myClass.dtoType}-${myClass.dtoSubType || ''}`, myClass);
        }
        throw new Error('Can not recognize Dto format');
    }

    resolveDto(type, subtype = '') {
        return this.resolve(`dto-${type}-${subtype}`);
    }
}

module.exports = exports = new MemStore();