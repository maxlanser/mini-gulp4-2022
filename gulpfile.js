import gulp from 'gulp';
import concat from 'gulp-concat';
import pug from 'gulp-pug';
import clean from 'gulp-clean';
import sourcemaps from 'gulp-sourcemaps';
import browserSync from 'browser-sync';

const server = browserSync.create();

import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const scss = gulpSass(dartSass);
import autoprefixer from 'gulp-autoprefixer';

import imagemin from 'gulp-imagemin';
import extReplace from 'gulp-ext-replace';
import webp from 'imagemin-webp';

function serve(done) {
  server.init({
      watch: false,
      server: {
          baseDir: './dev'
      }
    });
  done();
}

function reload(done) {
  server.reload();
  done();
}


function cleanTask() {
  return gulp.src('./dev/**/*.*', {read:false})
    .pipe(clean({force: true}));
}

function pugTask() {
    return gulp.src('./pug/views/**/*.pug')
        .pipe(pug({
            doctype: 'html',
            pretty: true
        }))
        .pipe(gulp.dest('./dev'));
}

// You can remove this array if you not use jquery or another plugins, or add you liked vendors or any plugin installed via NPM

const vendorsList = [
  './node_modules/jquery/dist/jquery.js'
];

const pluginsList = [
  './node_modules/owl.carousel/dist/owl.carousel.js'
];

function scriptsTask() {
  return gulp.src(['./scripts/vendors/*.js', ...vendorsList, './scripts/plugins/*.js', ...pluginsList, './scripts/main.js'])
    .pipe(concat('main.js'))
    .pipe(gulp.dest('./dev/js'));
}

const vendorsCssList = [
  './node_modules/normalize.css/normalize.css'
];

function scssTask() {
  return gulp.src([...vendorsCssList, './scss/main.scss'])
    .pipe(sourcemaps.init())
    .pipe(scss().on('error', scss.logError))
    .pipe(autoprefixer())
    .pipe(concat('main.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dev/css'))
    .pipe(server.stream());
};

function fontsTask() {
  return gulp.src('./fonts/*.*')
    .pipe(gulp.dest('./dev/fonts'));
}

function imagesTask() {
  return gulp.src('./images/**/*.*')
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({quality: 75, progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
        plugins: [
          {removeViewBox: true},
          {cleanupIDs: false}
        ]
      })
    ]))
    .pipe(gulp.dest('./dev/images'));
}

function webpTask() {
  return gulp.src('./images/**/*.*')
    .pipe(imagemin([
      webp({
        quality: 50
      })
    ]))
    .pipe(extReplace(".webp"))
    .pipe(gulp.dest('./dev/images'));
}


function watching() {
  gulp.watch('./scss/**/*.*', scssTask);
  gulp.watch('./scripts/**/*.*', gulp.series(scriptsTask, reload));
  gulp.watch('./pug/**/*.*', gulp.series(pugTask, reload));
}

export default gulp.series(cleanTask, gulp.parallel(imagesTask, webpTask, fontsTask, pugTask, scriptsTask, scssTask), serve, watching);
