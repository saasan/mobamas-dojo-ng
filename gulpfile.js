/* jshint node: true */
'use strict';
var del = require('del');
var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglifyjs');
var concat = require('gulp-concat');
var autoprefixer = require('gulp-autoprefixer');

var paths = {
  scss: {
    src: 'scss/*.scss',
    dest: 'css/'
  },
  js: {
    src: [
      'bower_components/angular/angular.min.js',
      'bower_components/angular-sanitize/angular-sanitize.min.js',
      'bower_components/ngstorage/ngStorage.min.js',
      'bower_components/moment/min/moment.min.js',
      'bower_components/moment/locale/ja.js',
      'bower_components/angular-moment/angular-moment.min.js',
      'js/birthday.js',
      'js/common.js',
      'js/toast.js',
      'js/settings.js',
      'js/main.js'
    ],
    dest: 'js/',
    filename: 'mobamas-dojo.min.js'
  },
  clean: [
    'css/*',
    'js/mobamas-dojo.min.js'
  ]
};

gulp.task('clean', del.sync.bind(null, paths.clean, { dot: true }));

gulp.task('sass', function () {
  gulp.src(paths.scss.src)
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulp.dest(paths.scss.dest));
});

gulp.task('sass-release', function () {
  gulp.src(paths.scss.src)
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(autoprefixer())
    .pipe(gulp.dest(paths.scss.dest));
});

gulp.task('js', function () {
  gulp.src(paths.js.src)
    .pipe(concat(paths.js.filename))
    .pipe(gulp.dest(paths.js.dest));
});

gulp.task('js-release', function () {
  gulp.src(paths.js.src)
    .pipe(uglify(paths.js.filename))
    .pipe(gulp.dest(paths.js.dest));
});

gulp.task('watch', function() {
  gulp.watch('scss/*.scss', ['sass']);
  gulp.watch('js/*.js', ['js']);
});

gulp.task('help', function() {
  var tasks = Object.keys(gulp.tasks).sort();

  console.log('');
  tasks.forEach(function(name) {
    console.log('  ' + name);
  });
  console.log('');
});

gulp.task('compile', ['clean', 'sass','js']);
gulp.task('release', ['clean', 'sass-release', 'js-release']);
gulp.task('default', ['compile']);
