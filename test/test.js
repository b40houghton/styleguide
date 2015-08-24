var assert = require("assert");
var Camelize = require("../style-defaults.js");



describe('String', function () {
	describe('camelize()', function () {
		it('should return camel case', function () {
			assert.equal(Camelize.camelize('This is a Test'), 'thisIsATest');
			assert.equal(Camelize.camelize('another-test-example'), 'anotherTestExample');
		});
	});
});