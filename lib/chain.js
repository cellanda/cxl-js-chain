module.exports = function Chain(startingChain) {

    function copyLinks (input) {
        var output = [];
        input.forEach(function (item) {
            output.push(item);
        });
        return output;
    }


    var _public = {

        links: [],

        addLink: function (link) {
            var newChain = new Chain(this);
            newChain.links.push(link);
            return newChain;
        }
    };

    if (startingChain) {
        _public.links = copyLinks(startingChain.links);
    }

    return _public;
};

