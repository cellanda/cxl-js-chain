var Chain = require('./chain');
var LinkApi = require('./link-api');

module.exports = function Builder(prototypeBuilder) {

    function usePrototype(prototypeBuilder) {
        if (prototypeBuilder) {
            var schema = prototypeBuilder.schema;
            var sourceTypeNames = Object.keys(schema);
            sourceTypeNames.forEach(function (sourceTypeName) {
                _public.schema[sourceTypeName] = _public.schema[sourceTypeName] || {};
                var sourceType = schema[sourceTypeName];
                var linkNames = Object.keys(sourceType);
                linkNames.forEach(function (linkName) {
                    var link = sourceType[linkName];
                    _public.schema[sourceTypeName][linkName] = link;
                });
            });
        }
    }

    function addLink(name, sourceType, returnType, maxArgs, parameters, call) {
        _public.schema[sourceType] = _public.schema[sourceType] || {};
        _public.schema[sourceType][name] = {
            name: name,
            configuration: {
                sourceType: sourceType,
                returnType: returnType,
                maxArgs: maxArgs,
                call: call
            },
            parameters: parameters
        }
    }


    var _public = {

        schema: {},

        addLink: function (name, sourceType, returnType, maxArgs, parameters, call) {
            return addLink (name, sourceType, returnType, maxArgs, parameters, call);
        },

        firstLink: function (startType) {
            startType = startType || '';
            return new LinkApi(this, new Chain(), startType);
        }

    }

    usePrototype(prototypeBuilder);

    return _public;
};

