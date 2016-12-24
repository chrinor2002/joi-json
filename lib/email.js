'use strict';

const StringSchema = require( './string' );

class EmailSchema extends StringSchema {

    constructor( parseSchema ) {

        super( parseSchema, 'email' );
    }

    _createSchema( engine ) {

        let schema = super._createSchema( engine );

        return schema.email();
    }
}

module.exports = EmailSchema;
