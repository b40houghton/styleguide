/* globals require, module */
/*jshint esnext:true, node:true */

'use strict';

var through	= require('through2');
var gutil = require('gulp-util');
var fs = require('fs');
var PluginError = gutil.PluginError;

module.exports = function (options) {

	//option defaults
	options.outputFile = options.outputFile || './public/css/scss/slass.scss';

	return through.obj(function(file, enc, callback){

		//return if null file
		if (file.isNull()) {
			return callback(null, file);
		}

		//return if stream
		if (file.isStream()) {
	 		return callback(new PluginError('gulp-json-sass-class', 'Streaming not supported'));
	 	}

		var slassObj = JSON.parse(file.contents.toString('utf8'));
		var classStyles = slassObj.classes.map(function (i){

			var classKeys = Object.keys(i.styles);

			if (classKeys.length) {

				var className = "." + i.name;
				var styleKeys = Object.keys(i.styles);
				var styleProperties = styleKeys.map(function(style) {
					if(styleKeys.length){
						return "\t" + style + ": " + i.styles[style];
					}
				});

				return className + " {\n" + styleProperties.join(";\n") + "\n}";
			}
		});

		fs.writeFile(options.outputFile, classStyles.join('\n'), function (err,data){
			if(err) {
				return console.log(err);
			}
		});

	 	callback(null, file);

	});

};