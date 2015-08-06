var styleDefaults 		= require('./data/style_defaults.js');
var styleDefinitions 	= require('./data/style_definitions.js');
var styleTypes			= require('./data/style_types.js');
var fs 					= require('fs');
var retObj				= {};
var outputFile			= './defaults.json';

function camelize (str) {
	return str.replace('-', ' ').replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
		if (+match === 0) {
			return '';
		}
		return index === 0 ? match.toLowerCase() : match.toUpperCase();
	});
};

exports.getDefaultStyles = function () {

	styleDefaults.forEach(function (obj) {

		var returnKey = "";

		//if the type exists within the definitions, add styles to the return object.
		if(styleDefinitions[obj.type]){
			styleDefinitions[obj.type].forEach(function (defObj){
				returnKey = camelize(obj.name + " " + defObj.name);
				retObj[returnKey] = defObj.default;
			});
		}
	});

	fs.writeFile(outputFile, JSON.stringify(retObj, null, 4), function (err){
		if(err){
			console.log(err);
		} else {
			console.log('Defaults Created: ' + outputFile);
		}
	});

	return;
};