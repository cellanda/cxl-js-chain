var LinkApi = require('../../lib/link-api');
var Chain = require('../../lib/chain');

describe('builder link set', function () {
	var builder;


	beforeEach(function () {
		builder = {
			schema: {
				myType1: {
					link1a: {
						name: 'link1a',
						configuration: {
							sourceType: 'myType1',
							returnType: 'myType2',
							maxArgs: 1
						},
						parameters: {}
					},
					link1b: {
						name: 'link1b',
						configuration: {
							sourceType: 'myType1',
							returnType: 'myType2',
							maxArgs: 1
						},
						parameters: {}
					}
				},
				myType2: {
					link2a: {
						name: 'link2a',
						configuration: {
							sourceType: 'myType2',
							returnType: 'myType3',
							maxArgs: 1
						},
						parameters: {}
					},
					link2b: {
						name: 'link2b',
						configuration: {
							sourceType: 'myType2',
							returnType: 'myType3',
							maxArgs: 0
						},
						parameters: {}
					}
				}
			}
		};
	})


	it('provides the next link', function () {
		var linkStack = [];
		var linkApi = new LinkApi(builder, linkStack, 'myType1');

		expect(linkApi.link1a).to.exist;
		expect(linkApi.link1b).to.exist;
		expect(linkApi.link2a).not.to.exist;
		expect(linkApi.link2b).not.to.exist;
	});


	it('provides type restricted links and unrestricted links', function () {
		builder.schema['*'] = {
			omni: {
				name: 'omni',
				configuration: {
					sourceType: 'myType2',
					returnType: 'myType3',
					maxArgs: 1
				},
				parameters: {}
			}
		}

		var linkStack = [];
		var linkApi = new LinkApi(builder, linkStack, 'myType1');

		expect(linkApi.link1a).to.exist;
		expect(linkApi.link1b).to.exist;
		expect(linkApi.link2a).not.to.exist;
		expect(linkApi.link2b).not.to.exist;
		expect(linkApi.omni).to.exist;
	});


	it('provides the next link and the next link', function () {
		var linkApi = new LinkApi(builder, new Chain(), 'myType1');

		expect(linkApi.link1a().link2a).to.exist;
	});


	it('provides the next link and the next link with unrestricted links', function () {
		builder.schema['*'] = {
			omni: {
				name: 'omni',
				configuration: {
					sourceType: 'myType2',
					returnType: 'myType3',
					maxArgs: 1
				},
				parameters: {}
			}
		}

		var linkApi = new LinkApi(builder, new Chain(), 'myType1');

		expect(linkApi.link1a().link2a).to.exist;
		expect(linkApi.omni).to.exist;
		expect(linkApi.link1a().omni).to.exist;
	});


	it('links with no return type only provide unrestricted links', function () {
		builder.schema.myType1.link1a.configuration.returnType = undefined;
		builder.schema['*'] = {
			omni: {
				name: 'omni',
				configuration: {
					sourceType: 'myType2',
					returnType: 'myType3',
					maxArgs: 1
				},
				parameters: {}
			}
		}

		var linkApi = new LinkApi(builder, new Chain(), 'myType1');

		expect(linkApi.link1a().link2a).not.to.exist;
		expect(linkApi.omni).to.exist;
		expect(linkApi.link1a().omni).to.exist;
	});


	it('final links do not provide unrestricted links', function () {
		builder.schema.myType1.link1a.configuration.returnType = '.';
		builder.schema['*'] = {
			omni: {
				name: 'omni',
				configuration: {
					sourceType: 'myType2',
					returnType: 'myType3',
					maxArgs: 1
				},
				parameters: {}
			}
		}

		var linkApi = new LinkApi(builder, new Chain(), 'myType1');

		expect(linkApi.link1a()).not.to.exist;
		expect(linkApi.omni).to.exist;
	});


	it('calls the custom function with the correct data available', function () {
		var currentChain;
		var linkInstance;
		builder.schema.myType1.link1a.configuration.call = function (chain) {
			currentChain = chain;
			linkInstance = this;
		}
		builder.schema.myType1.link1a.parameters.test = 'test parameter';
		builder.testProperty = 'builder test property';

		var chain = (new Chain()).addLink('link item 1');
		var linkApi = new LinkApi(builder, chain, 'myType1');
		linkApi.link1a('test');

		expect(currentChain.links.length).to.equal(2);
		expect(currentChain.links[0]).to.equal('link item 1');
		expect(currentChain.links[1].schema.name).to.equal('link1a');
		expect(currentChain.links[1].schema.configuration.sourceType).to.equal('myType1');
		expect(currentChain.links[1].schema.parameters.test).to.equal('test parameter');
		expect(currentChain.links[1].args.length).to.equal(1);
		expect(currentChain.links[1].args[0]).to.equal('test');
		expect(linkInstance.schema.name).to.equal('link1a');
		expect(linkInstance.builder.testProperty).to.equal('builder test property');
	});


	it('with no arguments, calls the custom function', function () {
		var currentChain;
		builder.schema.myType1.link1a.configuration.maxArgs = 0;
		builder.schema.myType1.link1a.configuration.call = function (chain) {
			currentChain = chain;
		}

		var chain = (new Chain()).addLink('link item 1');
		var linkApi = new LinkApi(builder, chain, 'myType1');
		linkApi.link1a;

		expect(currentChain.links.length).to.equal(2);
		expect(currentChain.links[1].args.length).to.equal(0);
	});


	it('final link with returnType of function returns the result of that function', function () {
		var currentChain;
		builder.schema.myType1.link1a.configuration.returnType = function (chain) {
			return this.args[0] + ' custom';
		}
		builder.schema.myType1.link1a.configuration.call = function (chain) {
			currentChain = chain;
		}

		var chain = (new Chain()).addLink('link item 1');
		var linkApi = new LinkApi(builder, chain, 'myType1');
		var linkResult = linkApi.link1a('test');

		expect(currentChain.links.length).to.equal(2);
		expect(currentChain.links[0]).to.equal('link item 1');
		expect(currentChain.links[1].args.length).to.equal(1);
		expect(currentChain.links[1].args[0]).to.equal('test');
		expect(linkResult).to.equal('test custom');
	});


	it('final link with no return function returns nothing', function () {
		var currentChain;
		builder.schema.myType1.link1a.configuration.returnType = '.'
		builder.schema.myType1.link1a.configuration.call = function (chain) {
			currentChain = chain;
		}

		var chain = (new Chain()).addLink('link item 1');
		var linkApi = new LinkApi(builder, chain, 'myType1');
		var linkResult = linkApi.link1a('test');

		expect(currentChain.links.length).to.equal(2);
		expect(currentChain.links[0]).to.equal('link item 1');
		expect(currentChain.links[1].args.length).to.equal(1);
		expect(currentChain.links[1].args[0]).to.equal('test');
		expect(linkResult).to.be.undefined;
	});


	it('can enumerate links', function () {
		builder.schema.myType1.link1a.configuration.maxArgs = 0;

		var linkApi = new LinkApi(builder, [], 'myType1');
		var links = Object.keys(linkApi);
		
		expect(links.length).to.equal(2);
		expect(links[0]).to.equal('link1a');
		expect(links[1]).to.equal('link1b');
	});


	it('can honour hidden links', function () {
		builder.schema.myType1.link1a.configuration.maxArgs = 0;
		builder.schema.myType1.link1a.configuration.hidden = true;

		var linkApi = new LinkApi(builder, [], 'myType1');
		var links = Object.keys(linkApi);
		
		expect(links.length).to.equal(1);
		expect(links[0]).to.equal('link1b');
	});


});