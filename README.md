# Data Transfer Object Convertion

## DtoConvertion

Sample dto
```javascript
'use strict';

class MyDto extends BaseDto {
    constructor() {
        super(false);
        this.schema({
            person_id: {
                // field datatype 
                type: String, // String, Date, Number, Date, Boolean, BaseCloudantDtoClass, [Datatype]
                // Mandatory field
                required: true,
                // Only required on update
                requiredUpdate: true,
                // default value of this field if not exist
                default: 'value' ,
                // force to use this value always
                value: 'value',
                integer: true , // Only available with datatype Number
                min: 0, // min value, only available for Number
                max: 0, // max value, only available for Number
                minLength: 0, // min length, only available for String
                maxLength: 0, // max length, only available for String
            },
            name: {
                type: String,
                required: true
            },
            arrayPureType: {
                type: [MyType]
            },
            arrayMultipleTypes: {
                /**
                * The multiple typed array should have the following conditions:
                * - should have at least `type` and `subtype` definition
                * - first element should be Typed Definition
                * - should be registered with MemStore
                */
                type: [Type1, Type2, Type3]
            }
        })
    }
}

## MemStore