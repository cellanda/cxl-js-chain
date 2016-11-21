module.exports = function LinkApi(builder, chain, sourceType) {


    function contructApi() {
        var api = {};
        sourceType = sourceType || '';
        if (sourceType !== '.') {
            extendApi(api, builder.schema['*']);
            extendApi(api, builder.schema[sourceType]);
        }
        return api;
    }


    function extendApi(api, linkSchemas) {
        if (linkSchemas) {
            var keys = Object.keys(linkSchemas);
            keys.forEach(function (key) {
                var linkSchema = linkSchemas[key];

                var fn = function () {
                    var link = {
                        builder: builder,
                        schema: linkSchema,
                        args: Array.prototype.slice.call(arguments, 0)
                    };
                    var newChain = chain.addLink(link);
                    if (typeof(linkSchema.configuration.call) === 'function') {
                        linkSchema.configuration.call.call(link, newChain);
                    }
                    if (typeof(linkSchema.configuration.returnType) === 'function') {
                        return linkSchema.configuration.returnType.call(link, newChain);
                    }
                    else if (linkSchema.configuration.returnType !== '.') {
                        return new LinkApi(builder, newChain, linkSchema.configuration.returnType);
                    }
                };
                
                if (linkSchema.configuration.maxArgs === 0) {
                    Object.defineProperty(api, key, {
                        enumerable: !linkSchema.configuration.hidden,
                        configurable: false,
                        get: fn
                    });
                }
                else {
                    api[key] = fn;
                }
            });
        }
    }


    return contructApi();

    
};

