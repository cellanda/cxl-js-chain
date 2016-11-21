var Builder = require('../../lib/builder');

describe('builder', function () {


	beforeEach(function () {
	})


	it('adds a link to the schema', function () {
		var currentLinkStack;
		var builder = new Builder();
		builder.addLink('link1', 'myType1', 'myType2', 1, {p1: 'p1'}, 'dummy call');

		var expectedSchema = {
			'myType1': {
				link1: {
					name: 'link1',
					configuration: {
						sourceType: 'myType1',
						returnType: 'myType2',
						maxArgs: 1,
						call: 'dummy call'
					},
					parameters: {
						p1: 'p1'
					}
				},
			}
		}

		expect(builder.schema).to.compareTo(expectedSchema);
	});


	it('provides a first link', function () {
		var currentChain;
		var builder = new Builder();
		builder.addLink('link1', '', 'myType1', 1, {}, function (chain) {
			currentChain = chain;
		});
		builder.firstLink().link1('one');

		expect(currentChain.links.length).to.equal(1);
		expect(currentChain.links[0].args.length).to.equal(1);
		expect(currentChain.links[0].args[0]).to.equal('one');
	});


});
