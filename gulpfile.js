const gulp = require("gulp"),
  cssClean = require("gulp-clean-css"),
  gulpSequence = require("gulp-sequence"),
  uglify = require("gulp-uglify"),
  del = require("del"),
  babel = require("rollup-plugin-babel"),
  rollup = require("gulp-better-rollup"),
  imagemin = require("gulp-imagemin"),
  htmlmin = require("gulp-htmlmin"),
  size = require("gulp-size"),
  nunjucksRender = require("gulp-nunjucks-render");

let isRelease = false;

let tasks = {
  html: {
    src: "src/index.html",
    dest: "dist",
    fun: nunjucksRender,
    min: () => htmlmin({ collapseWhitespace: true, removeComments: true })
  },
  images: {
    src: "src/images/**/*",
    dest: "dist/images",
    min: imagemin
  },
  styles: {
    src: [
      "src/css/*.css",
    ],
    dest: "dist/css",
    banner: true,
    min: () => cssClean({ compatibility: "ie8" })
  },
  javascript: {
    src: "src/js/*",
    dest: "dist/js",
    banner: true,
    fun: () =>
      rollup({ plugins: [babel()] }, "cjs").on("error", e =>
        console.log(e.message)
      ),
    min: uglify
  }
};

function createTask(title) {
  let task = tasks[title];

  let gulpTask = gulp.src(task.src);

  if (task.fun) gulpTask = gulpTask.pipe(task.fun());

  if (isRelease && task.min) gulpTask = gulpTask.pipe(task.min());

  gulpTask = gulpTask.pipe(size({ pretty: true, title }));

  return gulpTask.pipe(gulp.dest(task.dest)).on("error", console.log);
}

gulp.task("html", function() {
  return createTask("html");
});

gulp.task("images", function() {
  return createTask("images");
});

gulp.task("styles", function() {
  return createTask("styles");
});

gulp.task("javascript", function() {
  return createTask("javascript");
});

gulp.task("clean", function() {
  return del("dist/**/*");
});

gulp.task("build", gulpSequence("clean", "html", "styles", "javascript", "images"));

gulp.task("release", ["clean"], function() {
  isRelease = true;

  return gulp.start(gulpSequence("build"));
});

gulp.task("dev", ["build"], function() {
  gulp.watch("src/css/*.css", ["styles"]);
  gulp.watch("src/js/*.js", ["javascript"]);
  gulp.watch("src/**/*.html", ["html"]);
  gulp.watch("src/images/**/*", ["images"]);

  startServer();
});

function startServer() {
  const Koa = require("koa"),
    serve = require("koa-static"),
    logger = require("koa-logger");

  let app = new Koa();
  app.use(logger());
  app.use(serve("./dist"));
  app.listen(8080);
  console.log("Listening on port 8080");
}
