const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const sync = require("browser-sync").create();
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const del = require("del");
const { src, dest, watch, series, parallel } = require(`gulp`);
const babel = require(`gulp-babel`);

// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

//HTML

const html = () => {
  return gulp.src("source/*.html")
    .pipe(gulp.dest("build"))
    .pipe(sync.stream());
}

//JS

const js = () => {
  return src([
    `source/js/**.js`
  ])
    .pipe(babel({
      presets: ["@babel/preset-env"]
    }))
    .pipe(dest(`build/js/`))
    .pipe(sync.stream());
}

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: "build"
    },
    cors: true,
    notify: false,
    ui: false,
    tunnel: true,
  });
  done();
}

exports.server = server;

//Images

const images = () => {
  return gulp.src ("source/img/**/*.{jpg,png,svg}")
    .pipe (imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.mozjpeg({quality: 75, progressive: true}),
      imagemin.svgo()
    ]))
}

exports.images = images;

const webP = () => {
  return gulp.src ("source/img/**/*.{jpg,png}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("source/img"))
}

exports.webP = webP;

const sprite = () => {
  return gulp.src ("source/img/**/icon-*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"))
}

exports.sprite = sprite;

const copy = () => {
  return gulp.src ([
    "source/img/**",
    "source/*.ico",
    "source/fonts/**"
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"));
};

exports.copy = copy;

//Clean

const clean = () => {
  return del ("build");
}

exports.clean = clean;

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series(styles));
  gulp.watch("source/js/**.js", gulp.series(js));
  gulp.watch("source/*.html").on("change", gulp.series(html));
}

const build = gulp.series(
  clean,
  copy,
  images,
  styles,
  sprite,
  js,
  html
);

exports.build = build;

exports.default = gulp.series(
  build, server, watcher
);
