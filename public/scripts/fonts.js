/*global React, $*/
var styleName = 'Primary Heading';
var fontStyles = [
	{
		'name': 'color',
		'type': 'color',
		'default': '#000000'
	},
	{
		'name': 'font-family',
		'type': 'string',
		'default': 'Arial'
	},
	{
		'name': 'font-style',
		'type': 'list',
		'default': 'normal',
		'options': ['normal', 'italic', 'oblique', 'initial', 'inherit']
	},
	{
		'name': 'font-weight',
		'type': 'list',
		'default': '400',
		'options': ['100', '200', '300', '400', '500', '600', '700', '800', '900']
	},
	{
		'name': 'font-size',
		'type': 'string',
		'default': '1em'
	},
	{
		'name': 'line-height',
		'type': 'string',
		'default': '1.1'
	},
	{
		'name': 'letter-spacing',
		'type': 'string',
		'default': 'normal'
	},
	{
		'name': 'margin-top',
		'type': 'string',
		'default': '0'
	},
	{
		'name': 'margin-bottom',
		'type': 'string',
		'default': '0'
	},
	{
		'name': 'margin-left',
		'type': 'string',
		'default': '0'
	},
	{
		'name': 'margin-right',
		'type': 'string',
		'default': '0'
	},
	{
		'name': 'padding-top',
		'type': 'string',
		'default': '0'
	},
	{
		'name': 'padding-bottom',
		'type': 'string',
		'default': '0'
	},
	{
		'name': 'padding-left',
		'type': 'string',
		'default': '0'
	},
	{
		'name': 'padding-right',
		'type': 'string',
		'default': '0'
	}];

var camelCase = function (str) {
	return str.replace('-', ' ').replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
		if (+match === 0) {
			return '';
		}

		return index === 0 ? match.toLowerCase() : match.toUpperCase();
	});
};

var FontBox = React.createClass({
	loadFontsFromServer: function () {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: function(data) {
				this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	handleStyleSubmit: function(font) {

		var fonts = $.extend(this.state.data, font);

		this.setState({data: fonts}, function() {
			$.ajax({
				url: this.props.url,
				dataType: 'json',
				type: 'POST',
				data: font,
				success: function(data) {
					this.setState({data: data});
				}.bind(this),
				error: function(xhr, status, err) {
					console.error(this.props.url, status, err.toString());
				}.bind(this)
			});
		});
	},
	getInitialState: function() {
		return {data: []};
	},
	componentDidMount: function() {
		this.loadFontsFromServer();
		setInterval(this.loadFontsFromServer, this.props.pollInterval);
	},
	render: function () {

		return (
			<div className="fontBox">
				<StyleList data={this.state.data} />
				<StyleForm onStyleSubmit={this.handleStyleSubmit} />
			</div>
		);
	}
});

var StyleItem = React.createClass({

	render: function () {
		return (
			<li>{this.props.varName}: {this.props.val}</li>
		);
	}
});

var StyleList = React.createClass({
	render: function () {

		var data = this.props.data;


		var styleNodes = Object.keys(data).map(function(style, index) {

			var retValue = data[style];

			return (
				<StyleItem key={index} varName={style} val={retValue} />
			);
		});

		return (
			<ul className="styleList">
				{styleNodes}
			</ul>
		);
	}
});

var StyleForm = React.createClass({
	handleSubmit: function(e) {
		e.preventDefault();
		var varName = React.findDOMNode(this.refs.styleType).value.trim();
		var varValue = React.findDOMNode(this.refs.styleValue).value.trim();
		var pushValue = camelCase(styleName + ' ' + varName);
		var objPush = {};

		if (!varName || !varValue) {
			return;
		}

		objPush[pushValue] = varValue;
		this.props.onStyleSubmit(objPush);
		React.findDOMNode(this.refs.styleType).value = '';
		React.findDOMNode(this.refs.styleValue).value = '';
	},
	handleTypeSelect: function () {
		var currentStyleType = React.findDOMNode(this.refs.styleType).value.trim();
		var currentDefaultValue = '';

		fontStyles.map(function (obj) {
			if (obj.name === currentStyleType) {
				currentDefaultValue = obj.default.toString();
			}
		});

		React.findDOMNode(this.refs.styleValue).placeholder = currentDefaultValue;
	},
	render: function() {

		var styleTypeOptions = fontStyles.map(function (obj) {
			return (
				<option>{obj.name}</option>
			);
		});

		return (
			<form className="commentForm" onSubmit={this.handleSubmit}>
				<select ref='styleType' onChange={this.handleTypeSelect}>
					{styleTypeOptions}
				</select>
				<input type="text" ref='styleValue' />
				<input type="submit" value="Add" />
			</form>
		);
	}
});


React.render(
	<FontBox url="variables.json" pollInterval={2000} />,
	document.getElementById('font')
);
