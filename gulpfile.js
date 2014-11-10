'use strict';
var del = require('del');
var gulp = require('gulp');
var sass = require('gulp-sass');
var tsc = require('gulp-tsc');
var tslint = require('gulp-tslint');
var uglify = require('gulp-uglify');

var paths = {
  scss: {
    src: 'scss/*.scss',
    dest: 'css'
  },
  ts: {
    src: 'ts/*.ts',
    dest: 'js'
  },
  out: 'release/',
  clean: [
    'css/*',
    'js/*'
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

gulp.task('tslint', function() {
  gulp.src(paths.ts.src)
    .pipe(tslint())
    .pipe(tslint.report('verbose'));
});

gulp.task('ts', function () {
  gulp.src(paths.ts.src)
    .pipe(tsc())
    .pipe(gulp.dest(paths.ts.dest));
});

gulp.task('ts-release', function () {
  gulp.src(paths.ts.src)
    .pipe(tsc())
    .pipe(uglify())
    .pipe(gulp.dest(paths.ts.dest));
});

gulp.task('watch', function() {
  gulp.watch('scss/*.scss', ['sass']);
  gulp.watch('ts/*.ts', ['ts']);
});

gulp.task('compile', ['sass','ts']);
gulp.task('release', ['clean', 'sass-release', 'ts-release']);
gulp.task('default', ['sass','ts']);
