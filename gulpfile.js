const { src, dest, parallel, series } = require('gulp')
const rev = require('gulp-rev')
const revRewrite = require('gulp-rev-rewrite')
const del = require('delete')
const replace = require('gulp-replace-path')
const cleanCss = require('gulp-clean-css')
const cleanJs = require('gulp-uglify')
const cleanHtml = require('gulp-htmlmin')
const babel = require('gulp-babel')

// 位置
let distPath = 'assets'

function toDel(cb) {
  del(['dist'], cb)
}
// css部分
function css(cb) {
  return src('style/*.css')
    .pipe(cleanCss())
    .pipe(dest('dist/' + distPath + '/style'))
}
// js
function js(cb) {
  return src('js/*.js')
    .pipe(
      babel({
        presets: ['@babel/env']
      })
    )
    .pipe(cleanJs())
    .pipe(dest('dist/' + distPath + '/js'))
}

// html
function html(cb) {
  return (
    src('index.html')
      .pipe(replace(/\b((src|href)=(\"|'))(?!http)/g, `$1${distPath}/`))
      .pipe(cleanHtml({ collapseWhitespace: true }))
      .pipe(dest('dist'))
  )
}

// build 部分👇
// 去添加指纹
function toManifest(cb) {
  del(['manifest', 'build'])
  return src(`dist/${distPath}/**/*`)
    .pipe(rev())
    .pipe(dest(`build/${distPath}`))
    .pipe(rev.manifest())
    .pipe(dest('manifest'))
}

// rewrite rev
function replaceName(cb) {
  let manifest = src('manifest/rev-manifest.json')
  return src(`dist/index.html`)
    .pipe(revRewrite({ manifest }))
    .pipe(dest('build'))
}

exports.assets = parallel(css, js, html)
exports.default = series(toDel, parallel(css, js, html))
exports.build = series(toDel, parallel(css, js, html), toManifest, replaceName)
