/* globals process, __dirname */

/**
 * This file provided by Facebook is for non-commercial testing and evaluation purposes only.
 * Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var mergeObjects = function (defaults, options) {
	var extended = {};
		var prop;
		for (prop in defaults) {
				if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
						extended[prop] = defaults[prop];
				}
		}
		for (prop in options) {
				if (Object.prototype.hasOwnProperty.call(options, prop)) {
						extended[prop] = options[prop];
				}
		}
		return extended;
};

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/data/variables.json', function(req, res) {
	fs.readFile('./data/variables.json', function(err, data) {
		res.setHeader('Cache-Control', 'no-cache');
		res.json(JSON.parse(data));
	});
});

app.post('/data/variables.json', function(req, res) {

	fs.readFile('/data/variables.json', function(err, data) {
	
		var variables = JSON.parse(data);

		variables = mergeObjects(variables, req.body);

		fs.writeFile('/data/variables.json', JSON.stringify(variables, null, 4), function(err) {
			res.setHeader('Cache-Control', 'no-cache');
			res.json(variables);
		});
	});
});

app.get('/data/fonts.json', function(req, res) {
	fs.readFile('./data/fonts.json', function(err, data) {
		res.setHeader('Cache-Control', 'no-cache');
		res.json(JSON.parse(data));
	});
});

app.post('/data/fonts.json', function(req, res) {

	fs.readFile('./data/fonts.json', function(err, data) {
	
		var fonts = JSON.parse(data);

		fonts = mergeObjects(fonts, req.body);

		fs.writeFile('./data/fonts.json', JSON.stringify(fonts, null, 4), function(err) {
			res.setHeader('Cache-Control', 'no-cache');
			res.json(fonts);
		});
	});
});


app.listen(app.get('port'), function() {
	console.log('Server started: http://localhost:' + app.get('port') + '/');
});
