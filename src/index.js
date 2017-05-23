'use strict';
const kv = require('./MemStore');
const dtoConvertion = require('./DtoConvertion');
const BaseDto = require('./BaseDto');

module.exports = exports = {
    kv,
    BaseDto,
    methods: {
        TYPE_ANY: dtoConvertion.TYPE_ANY,
        METHOD_PUT: dtoConvertion.METHOD_PUT,
        METHOD_PATCH: dtoConvertion.METHOD_PATCH,
        METHOD_FIND: dtoConvertion.METHOD_FIND,
        METHOD_GET: dtoConvertion.METHOD_GET,
        METHOD_CREATE: dtoConvertion.METHOD_CREATE,
        METHOD_REMOVE: dtoConvertion.METHOD_REMOVE
    }
};