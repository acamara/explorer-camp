var fs = require('fs'), gulp = require('gulp'), zip = require('gulp-zip');

gulp.task('default', function() {  
  console.log('gulp!');
});

gulp.task('zip', () => {
	gulp.src(['assets/**/*.png', 'index.html', 'game.js', 'style.css'], {base: './'})
    .pipe(zip('game.zip'))
    .pipe(gulp.dest('./'));
});

gulp.task('report', function() {
  var stat = fs.statSync('game.zip'),
      limit = 1024 * 13,
      size = stat.size,
      remaining = limit - size,
      percentage = (remaining / limit) * 100;

  percentage = Math.round(percentage * 100) / 100

  console.log('\n\n-------------');
  console.log('BYTES USED: ' + stat.size);
  console.log('BYTES REMAINING: ' + remaining);
  console.log(percentage +'%');
  console.log('-------------\n\n');
});