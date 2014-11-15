'use strict';
var del = require('del');
var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglifyjs');
var concat = require('gulp-concat');

var paths = {
  scss: {
    src: 'scss/*.scss',
    dest: 'css/'
  },
  js: {
    src: ['js/birthday.js', 'js/common.js', 'js/toast.js', 'js/settings.js', 'js/main.js'],
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
    .pipe(gulp.dest(paths.scss.dest));
});

gulp.task('sass-release', function () {
  gulp.src(paths.scss.src)
    .pipe(sass({ outputStyle: 'compressed' }))
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

gulp.task('compile', ['clean', 'sass','js']);
gulp.task('release', ['clean', 'sass-release', 'js-release']);
gulp.task('default', ['compile']);
