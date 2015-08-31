/* global require */

var jsonSass = require('gulp-json-sass'),
	gulp = require('gulp'),
	browserSync = require('browser-sync').create(),
	reload = browserSync.reload,
	concat = require('gulp-concat'),
	sass = require('gulp-ruby-sass'),
	del = require('del'),
	defaults = require('./style-defaults.js'),
	sassClass = require('./gulp-json-sass-class.js');

gulp.task('dev', ['sass:defaults','sass'], function () {
	browserSync.init({
		proxy: 'localhost:3000'
	});

	gulp.watch(['public/css/scss/main.scss', 'public/css/scss/slass.scss'], ['sass']);
	gulp.watch('./data/fonts.json', ['json:slass']);

	//delay the reload
	gulp.watch('public/css/slass.css').on('change', function(){
		setTimeout(function(){
			reload('public/css/slass.css');
		}, 400);
	});

});

gulp.task('clean:defaults', del.bind(null,['./defaults.json']));

gulp.task('sass:defaults',['clean:defaults'], function () {

	//run the defaults
	defaults.getDefaultStyles();

	return gulp.src(['./defaults.json'])
		.pipe(jsonSass({
			sass: false
		}))
		.pipe(concat('_defaultVariables.scss'))
		.pipe(gulp.dest('public/css/scss/'))
		.pipe(reload({stream:true}));
});


gulp.task('sass', function () {
	return sass('public/css/scss/')
		.on('error', function (err) {
			console.log('Error: ', err.message);
		})
		.pipe(gulp.dest('public/css/'))
		.pipe(browserSync.stream());
});

gulp.task('json:sass', function () {
	return gulp.src(['variables.json'])
		.pipe(jsonSass({
			sass: false
		}))
		.pipe(concat('_variables.scss'))
		.pipe(gulp.dest('public/css/scss/'))
		.pipe(browserSync.stream());
});

gulp.task('json:slass', function () {
	return gulp.src(['./data/fonts.json'])
		.pipe(sassClass({
			option: true
		}))
		.pipe(reload({stream:true}));
});
