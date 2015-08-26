'use strict';

var StyleBox = React.createClass({
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
	loadStyleTypesFromServer: function () {
		console.log("loadStyleTypesFromServer");
	},
	getInitialState: function() {
		return {
			data: []
		};
	},
	componentDidMount: function() {
		this.loadFontsFromServer();
		setInterval(this.loadFontsFromServer, this.props.pollInterval);
	},
	onStyleSubmit: function(font) {
		var styles = {};
		var data = this.state.data;
		
		for(let item in data.fonts){
			if(data.fonts[item].name === font.name && Object.keys(data.fonts[item].styles).length){
				data.fonts[item].styles = $.extend(data.fonts[item].styles, font.styles);
			}
		}

		this.setState({data: data}, function() {
			$.ajax({
				url: this.props.url,
				dataType: 'json',
				type: 'POST',
				data: data,
				success: function(data) {
					this.setState({data: data});
				}.bind(this),
				error: function(xhr, status, err) {
					console.error(this.props.url, status, err.toString());
				}.bind(this)
			});
		});
	},
	render: function () {

		return (
			<div className="fontBox">
				<StyleClassList data={this.state.data} handleStyleSubmit={this.onStyleSubmit} />
			</div>
		);
	}
});

var StyleClassList = React.createClass({
	render: function () {

		var data = this.props.data;
		var styleClasses;
		var styleSubmit = this.props.handleStyleSubmit;

		if(data.fonts !== undefined){
			styleClasses = data.fonts.map(function(item, index){
				return <StyleClass key={index} name={item.name} styles={item.styles} onEditSubmit={styleSubmit} />;
			});
		}

		return (
			<div className="style-class">
				{styleClasses}
			</div>
		);
	}
});

var StyleClass = React.createClass({
	render: function () {
		var data = this.props;
		var onEditSubmit = this.props.onEditSubmit;
		var name = data.name;
		var styles = Object.keys(data.styles).map(function(styleItem){

			return <StyleItem styleClassName={name} keyValue={styleItem} property={data.styles[styleItem]} onEdit={onEditSubmit} />;
		});

		return (
			<div>
				<span className={name}>.{name}</span>
				<ul>{styles}</ul>
				<StyleForm styleName={name} onStyleSubmit={onEditSubmit}/>
			</div>
		);
	}
});

var StyleItem = React.createClass({
	getInitialState: function () {
		return {editable: false};
	},
	handleEdit: function () {
		if (!this.state.editable){
			this.setState({editable:true});
		}
	},
	handleSave: function () {

		if (this.state.editable){

			var submitObj = {};
			submitObj.styles = {};
			var styleClassName = this.props.styleClassName;
 			var inputValue = React.findDOMNode(this.refs.editInput).value.trim();

			//set back to initial value if nothing returned
			if(inputValue === "" || inputValue === undefined){
				inputValue = this.props.property;
			}

			//pass classname w/ the obj
			submitObj.name = styleClassName;

			submitObj.styles[this.props.keyValue] = inputValue;

			this.props.onEdit(submitObj);

			this.setState({editable:false});
		}
	},
	handleCancel: function () {
		if(this.state.editable){
			this.setState({editable:false});
		}
	},
	render: function () {

		var editClassName = this.state.editable ? 'editing' : '';

		return (
			<li className={editClassName}>
				{this.props.keyValue}: 
				<label>{this.props.property}</label>
				<input type='text' placeholder={this.props.property} ref='editInput' />
				<button className='btn-edit' onClick={this.handleEdit}>Edit</button>
				<button className='btn-save' onClick={this.handleSave}>Save</button>
				<button className='btn-cancel' onClick={this.handleCancel}>Cancel</button>
			</li>
		)
	}
});

var StyleForm = React.createClass({
	
	getInitialState: function () {
		return {
			showForm: '',
			styleTypes: [
				{
					"name": "color",
					"type": "color",
					"default": "#000000"
				},
				{
					"name": "font-family",
					"type": "string",
					"default": "Arial"
				},
				{
					"name": "font-style",
					"type": "list",
					"default": "normal",
					"options": [
						"normal",
						"italic",
						"oblique",
						"initial",
						"inherit"
					]
				},
				{
					"name": "font-weight",
					"type": "list",
					"default": "400",
					"options": [
						"100",
						"200",
						"300",
						"400",
						"500",
						"600",
						"700",
						"800",
						"900"
					]
				},
				{
					"name": "font-size",
					"type": "string",
					"default": "1em"
				},
				{
					"name": "line-height",
					"type": "string",
					"default": "1.1"
				},
				{
					"name": "letter-spacing",
					"type": "string",
					"default": "normal"
				},
				{
					"name": "margin-top",
					"type": "string",
					"default": "0"
				},
				{
					"name": "margin-bottom",
					"type": "string",
					"default": "0"
				},
				{
					"name": "margin-left",
					"type": "string",
					"default": "0"
				},
				{
					"name": "margin-right",
					"type": "string",
					"default": "0"
				},
				{
					"name": "padding-top",
					"type": "string",
					"default": "0"
				},
				{
					"name": "padding-bottom",
					"type": "string",
					"default": "0"
				},
				{
					"name": "padding-left",
					"type": "string",
					"default": "0"
				},
				{
					"name": "padding-right",
					"type": "string",
					"default": "0"
				}
			]
		};
	},
	handleAddClick: function (e) {

		e.preventDefault();

		if(!this.state.showForm){	
			this.setState({showForm: true});
		} else{
			this.setState({showForm: false})
		}
	},
	handleSubmit: function (e) {

		e.preventDefault();

		var varName = React.findDOMNode(this.refs.styleType).value.trim();
		var varValue = React.findDOMNode(this.refs.styleValue).value.trim();
		var objPush = {};
		objPush.styles = {};

		if(!varName || !varValue) {
			return;
		}

		objPush.name = this.props.styleName;
		objPush.styles[varName] = varValue;


		this.props.onStyleSubmit(objPush);

		this.setState({showForm:false});

	},
	render: function() {

		var styleTypeOptions = this.state.styleTypes.map(function (obj) {
			return (
				<option>{obj.name}</option>
			);
		});

		var activeClass = (this.state.showForm) ? 'active': '';
		

		return (
			<div className={activeClass}>
				<span onClick={this.handleAddClick}>+</span>
				<form onSubmit={this.handleSubmit}>
					<select ref='styleType'>
						{styleTypeOptions}
					</select>
					<input type='text' ref='styleValue'/>
					<input type='submit' value='Add'/>
				</form>
			</div>
		);
	}
});

React.render(
	<StyleBox url="./data/fonts.json" pollInterval={2000} />,
	document.getElementById('font-list')
);