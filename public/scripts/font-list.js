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
	removeStyle: function (styleClassName, styleProperty) {
		var data = this.state.data;

		//delete the property from the class styles object
		for(let item in data.fonts){
			if(data.fonts[item].name === styleClassName && Object.keys(data.fonts[item].styles).length){
				delete data.fonts[item].styles[styleProperty];
			}
		}

		//post to file and set state
		this.setState({data: data}, function() {
			$.ajax({
				url: this.props.url,
				dataType: 'json',
				type: 'POST',
				data: JSON.stringify(data),
				contentType:' application/json',
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
		return {
			data: []
		};
	},
	componentDidMount: function() {
		this.loadFontsFromServer();
		setInterval(this.loadFontsFromServer, this.props.pollInterval);
	},
	delete: function (type, className, classNameProperty) {
		var deleteType = {};

		deleteType.class = function (classNameClass) {
			console.log("delete class");
		};

		deleteType.style = function (classNameClass, classProperty){
			console.log("delete style");
		};
	},
	add: function (type, obj) {

		var data = this.state.data;
		var styles = {};
		var postObj = {};
		var addType = {};

		addType.class = function (classObj) {

			data.fonts.push(classObj);

			return data;
		};

		addType.style = function (styleObj) {
			for(let item in data.fonts){
				if(data.fonts[item].name === obj.name && data.fonts[item].styles !== undefined){
					data.fonts[item].styles = $.extend(data.fonts[item].styles, obj.styles);
				}
			}
			return data;
		};

		postObj = addType[type](obj);

		// console.log(postObj);

		this.setState({data: postObj}, function() {
			$.ajax({
				url: this.props.url,
				dataType: 'json',
				type: 'POST',
				data: JSON.stringify(postObj),
				contentType:"application/json",
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

		var props = {};
			props.data = this.state.data;
			props.removeStyle = this.removeStyle;
			props.add = this.add;

		return (
			<div className="fontBox">
				<StyleClassList {...props} />
			</div>
		);
	}
});

var StyleClassList = React.createClass({
	addNewClass: function () {
		// console.log("hey");
	},
	render: function () {

		var data = this.props.data;
		var styleClasses;
		var props = this.props;

		if(data.fonts !== undefined){
			styleClasses = data.fonts.map(function(item, index){
				return <StyleClass {...props} key={index} name={item.name} styles={item.styles}/>;
			});
		}

		return (
			<div>
				{styleClasses}
				<ClassForm {...props} />
			</div>

		);
	}
});

var StyleClass = React.createClass({
	getInitialState: function () {
		return {editable: false};
	},
	handleClassEdit: function () {
		console.log("edit class");
		console.log(this.props);
	},
	render: function () {
		var props = this.props;
		var editClass = (this.state.editable) ? 'isEditing':'';

		var styles = Object.keys(props.styles).map(function(styleItem, index){
			return <StyleItem {...props} key={index} keyValue={styleItem} property={props.styles[styleItem]} />;
		});

		return (
			<div className={editClass}>
				<div className="class-item-block">
					<div className="style-block">
						<span className={props.name}>.{props.name}</span>
						{/*<input type="text" />
								<button onClick={this.handleClassEdit}>Edit</button>
								<button onClick={this.handleClassSave}>Save</button>
								<button onClick={this.handleClassCancel}>Cancel</button>
								<button onClick={this.handleClassDelete}>Delete</button>*/}
					</div>
					
					<div className="style-list">
						<ul>{styles}</ul>
						<StyleForm styleName={name} {...props}/>
					</div>
				</div>
				
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
		} else{
			this.setState({editable:false});
		}
	},
	handleSave: function () {

		if (this.state.editable){

			var submitObj = {};
				submitObj.styles = {};

 			var inputValue = React.findDOMNode(this.refs.editInput).value.trim();

 			//set back to initial value if nothing returned
			if(inputValue === "" || inputValue === undefined){
				inputValue = this.props.property;
			}

			//pass classname w/ the obj
			submitObj.name = this.props.name;

			submitObj.styles[this.props.keyValue] = inputValue;

			this.props.add('style', submitObj);

			this.setState({editable:false});
		}
	},
	handleDelete: function () {
		var styleClassName = this.props.name;
		var styleProperty = this.props.keyValue;

		this.props.removeStyle(styleClassName, styleProperty);
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
				<input type='text' defaultValue={this.props.property} ref='editInput' />
				<button className='btn-edit' onClick={this.handleEdit}>Edit</button>
				<button className='btn-delete' onClick={this.handleDelete}>Delete</button>
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
				},
				{
					"name": "text-shadow",
					"type": "string",
					"default": ""
				},
				{
					"name": "background-color",
					"type": "color",
					"default": "transparent"
				},
				{
					"name":"text-align",
					"type":"string",
					"default":"left"
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

		objPush.name = this.props.name;
		objPush.styles[varName] = varValue;

		this.props.add('style', objPush);

		this.setState({showForm:false});

	},
	render: function() {

		var styleTypeOptions = this.state.styleTypes.map(function (obj, index) {
			return (
				<option key={index}>{obj.name}</option>
			);
		});

		var styleFormContainer = "style-form-container";
			styleFormContainer += (this.state.showForm) ? ' active': '';

		var ctaText = (this.state.showForm) ? 'x cancel':'+ add style';
		

		return (
			<div className={styleFormContainer}>
				<form onSubmit={this.handleSubmit}>
					<select ref='styleType'>
						{styleTypeOptions}
					</select>
					<input type='text' ref='styleValue'/>
					<input type='submit' className="btn" value='Add'/>
				</form>
				<button className="btn" onClick={this.handleAddClick}>{ctaText}</button>
			</div>
		);
	}
});

var ClassForm = React.createClass({
	getInitialState: function () {
		return {
			classFormActive: false
		};
	},
	//push to add
	handleClassSubmit: function () {

		var classNameVal = React.findDOMNode(this.refs.classNameInput).value.trim();
		var pushObj = {};

		//check if it already exists

		if(classNameVal === ""){
			return;
		}

		//build the obj
		pushObj.name = classNameVal;
		pushObj.type = "font";
		pushObj.content = "The quick brown fox jumps over the lazy dog.";
		pushObj.styles = {};

		//push obj to the json file
		this.props.add('class', pushObj);

		//hide the form
		this.setState({
			classFormActive:false
		});
	},
	//toggle form
	handleClassToggle: function () {
		if(!this.state.classFormActive){
			this.setState({
				classFormActive:true
			});
		} else {
			this.setState({
				classFormActive:false
			});
		}
	},
	render: function () {
		var classBtnContent = (!this.state.classFormActive) ? 'New Class':'Cancel';
		var classFormContainer = 'class-form-container';

		//add class active to container
		classFormContainer += (this.state.classFormActive) ? ' active' :'';

		return (
			<div className={classFormContainer}>
				<label>
					Class Name:&nbsp;
					<input ref="classNameInput" type="text" />
				</label>
				<button className="submit-class" onClick={this.handleClassSubmit}>Save</button>
				<button className="toggle-class" onClick={this.handleClassToggle}>{classBtnContent}</button>
			</div>
		);
	}
});

React.render(
	<StyleBox url="./data/fonts.json" pollInterval={2000} />,
	document.getElementById('font-list')
);