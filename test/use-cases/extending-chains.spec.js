var Builder = require('../../index').Builder;


// Extend the Builder class with my own links
var MyBuilder = (function () {
	var finalLinkType = '.';
	var prototypeBuilder = new Builder();
	prototypeBuilder.addLink('to', 'preposition', 'preposition', 0, {}, null);
	prototypeBuilder.addLink('not', 'preposition', 'preposition', 0, {}, null);
	prototypeBuilder.addLink('equal', 'preposition', finalLinkType, 1, {}, function (chain) {
		//console.log(stack)
		var invert = false;
		chain.links.forEach(function (link) {
			if (link.schema.name === 'not') {
				invert = !invert;
			}
			if (link.schema.name === 'equal') {
				var actual = link.builder.actual;
				var expected = link.args[0];
				if (actual == expected) {
					if (invert) {
						throw new Error('expected ' + actual + ' to not equal ' + expected);
					}
				}
				else {
					if (!invert) {
						throw new Error('expected ' + actual + ' to equal ' + expected);
					}
				}
			}
		});
	});

	return function () {
		return new Builder(prototypeBuilder);
	}
})();


describe('use-case: extending builders', function () {
	var myExpect;

	beforeEach(function () {
		myExpect = function (actual) {
			var builder = new MyBuilder();
			builder.actual = actual;

			return builder.firstLink('preposition');
		}
	});


	it('expects equality', function () {
		var errorMessage = '';
		try {
			myExpect('one').to.equal('one');
		}
		catch (err) {
			errorMessage = err.message;
		}
		expect(errorMessage).to.equal('');
	});


	it('expects inequality', function () {
		var errorMessage = '';
		try {
			myExpect('one').to.not.equal('two');
		}
		catch (err) {
			errorMessage = err.message;
		}
		expect(errorMessage).to.equal('');
	});


	it('does not expect equality', function () {
		var errorMessage = '';
		try {
			myExpect('one').to.equal('two');
		}
		catch (err) {
			errorMessage = err.message;
		}
		expect(errorMessage).to.equal('expected one to equal two');
	});


	it('does not expect inequality', function () {
		var errorMessage = '';
		try {
			myExpect('one').to.not.equal('one');
		}
		catch (err) {
			errorMessage = err.message;
		}
		expect(errorMessage).to.equal('expected one to not equal one');
	});


});
