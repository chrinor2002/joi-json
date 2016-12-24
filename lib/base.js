'use strict';

const utils = require( './utils' );

class BaseSchema {

    constructor( parseSchema, engineFuncName ) {

        this.parseSchema = parseSchema;
        this.engineFuncName = engineFuncName;
    }

    parse( config, engine ) {

        // Note: Joi will clone objects on changes and thus we need to update the schema reference
        let state = { schema: this._createSchema( engine ), engine };

        for( let key in config ) {

            var updated = this.updateWhen( engine, state, key, config[ key ] );

            if ( !updated ) {

                this.updateSchema( state, key, config[ key ] );
            }
        }

        return state.schema;
    }

    updateWhen( engine, state, key, value ) {

        if(key === 'when') {

            if( !utils.isArray( value ) ) {

                // convert to array
                value = [ value ];
            }

            for( let index in value ) {

                let whenCondition = value[index];

                for( let ref in whenCondition ) {

                    let whenConfig = this._getWhenOptions( whenCondition[ ref ], engine );

                    state.schema = state.schema.when(ref, whenConfig);
                }
            }

            return true;
        }
    }

    updateSchema( state, key, value ) {

        if( utils.isFunction( state.schema[key] ) ) {

            if( value === null ) {

                state.schema = state.schema[ key ]();
            }
            else {

                state.schema = state.schema[ key ]( value );
            }

            return true;
        }
    }

    _createSchema( engine ) {

        return engine[ this.engineFuncName ]();
    }

    _getWhenOptions( condition, engine ) {

        let whenConfig = {};

        let isConfig = condition.is;

        if ( isConfig !== undefined ) {

            let typeOf = typeof isConfig;

            if (['string', 'boolean'].indexOf(typeOf) !== -1) {

                whenConfig.is = isConfig;
            }
            else {

                // TODO: this needs to lookup the type of the target
                whenConfig.is = this._parseWithDefaultType( isConfig, this.engineFuncName, engine );
            }
        }

        let thenConfig = condition.then;
        if ( thenConfig !== undefined ) {

            whenConfig.then = this._parseWithDefaultType( thenConfig, this.engineFuncName, engine );
        }

        let otherwiseConfig = condition.otherwise;
        if ( otherwiseConfig !== undefined ) {

            whenConfig.otherwise = this._parseWithDefaultType( otherwiseConfig, this.engineFuncName, engine );
        }

        return whenConfig;
    }

    _parseWithDefaultType( config, defaultType, engine ) {

        if (config['@type'] === undefined) {

            config['@type'] = this.engineFuncName;
        }

        return this.parseSchema(config, engine);
    }
}

module.exports = BaseSchema;
