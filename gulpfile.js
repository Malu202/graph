const gulp  = require("gulp")
const closureCompiler = require('google-closure-compiler').gulp();

gulp.task('minifyPlot', function () {
  return gulp.src('./plot.js', {base: './'})
      .pipe(closureCompiler({
          compilation_level: 'SIMPLE',
          warning_level: 'VERBOSE',
          language_in: 'ECMASCRIPT6_STRICT',
          language_out: 'ECMASCRIPT5_STRICT',
          output_wrapper: '(function(){\n%output%\n}).call(this)',
          js_output_file: 'plot.min.js'
        }, {
          platform: ['native', 'java', 'javascript']
        }))
      .pipe(gulp.dest("./"));
});

gulp.task('minifyGauge', function () {
    return gulp.src('./gauge.js', {base: './'})
        .pipe(closureCompiler({
            compilation_level: 'SIMPLE',
            warning_level: 'VERBOSE',
            language_in: 'ECMASCRIPT6_STRICT',
            language_out: 'ECMASCRIPT5_STRICT',
            output_wrapper: '(function(){\n%output%\n}).call(this)',
            js_output_file: 'gauge.min.js'
          }, {
            platform: ['native', 'java', 'javascript']
          }))
        .pipe(gulp.dest("./"));
  });

  gulp.task('minify', gulp.parallel(["minifyPlot", "minifyGauge"]))