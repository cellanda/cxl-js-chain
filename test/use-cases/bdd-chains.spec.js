var Builder = require('../../index').Builder;


describe('use-case: bdd builders', function () {
	var myExpect;

	beforeEach(function () {
		myExpect = function (actual) {
			var finalLinkType = '.';
			var builder = new Builder();
			builder.actual = actual;
			builder.addLink('to', 'preposition', 'preposition', 0, {}, null);
			builder.addLink('not', 'preposition', 'preposition', 0, {}, null);
			builder.addLink('equal', 'preposition', finalLinkType, 1, {}, function (chain) {
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
