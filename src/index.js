'use strict';

import kv from './MemStore';
import DtoConvertion from './DtoConvertion';
import BaseDto from './BaseDto';

kv.register('dtoConvertion', DtoConvertion);

export default { kv, BaseDto };