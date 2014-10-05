'use strict';
var gulp = require('gulp');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');  // env
var sass = require('gulp-sass');
var tsc = require('gulp-tsc');
var closureCompiler = require('gulp-closure-compiler');

var isRelease = gutil.env.release || false;

gulp.task('sass', function () {
  gulp.src('scss/*.scss')
    .pipe(
      gulpif(
        isRelease,
        sass({ outputStyle: 'compressed' }),
        sass()
      )
    )
    .pipe(gulp.dest('css'));
});

gulp.task('ts', function () {
  gulp.src('ts/*.ts')
    .pipe(tsc())
    .pipe(
      gulpif(
        isRelease,
        closureCompiler({
          compilerPath: 'closure-compiler/compiler.jar',
          fileName: 'mobamas-dojo.js'
        })
      )
    )
    .pipe(gulp.dest('js'));
});

gulp.task('watch', function() {
  gulp.watch('scss/*.scss', ['sass']);
  gulp.watch('ts/*.ts', ['ts']);
});

gulp.task('compile', ['sass','ts']);
gulp.task('default', ['sass','ts']);
