/* global require */

var jsonSass = require('gulp-json-sass'),
	gulp = require('gulp'),
	browserSync = require('browser-sync').create(),
	concat = require('gulp-concat'),
	sass = require('gulp-ruby-sass');

gulp.task('dev', ['sass'], function () {
	browserSync.init({
		proxy: 'localhost:3000'
	});

	gulp.watch(['public/css/scss/main.scss', 'public/css/scss/_variables.scss'], ['sass']);
	gulp.watch('variables.json', ['jsonSass']);
});

gulp.task('sass', function () {
	return sass('public/css/scss/')
		.on('error', function (err) {
			console.log('Error: ', err.message);
		})
		.pipe(gulp.dest('public/css/'))
		.pipe(browserSync.stream());
});

gulp.task('jsonSass', function () {
	return gulp.src(['variables.json'])
		.pipe(jsonSass({
			sass: false
		}))
		.pipe(concat('_variables.scss'))
		.pipe(gulp.dest('public/css/scss/'))
		.pipe(browserSync.stream());
});

gulp.task('watch', function () {
	gulp.watch('./public/css/scss/*.scss', ['sass']);
	gulp.watch('./variables.json', ['jsonSass']);
});
