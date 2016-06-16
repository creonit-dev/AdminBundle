var gulp = require('gulp'),
    gulpif = require('gulp-if'),
    less = require('gulp-less'),
    stylus = require('gulp-stylus'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    runSequence = require('run-sequence').use(gulp),
    streamqueue = require('streamqueue'),
    bower = require('main-bower-files'),
    browserSync,
    nib = require('nib'),
    merge = require('merge-stream'),
    path = require('path'),
    ts = require('gulp-typescript'),
    fs = require('fs'),
    sort = require('gulp-sort'),
    replace = require('gulp-replace'),
    through = require('through');

var outputDir = './src/Resources/public',
    optimize;

/**
 * @task css:main
 * Generate /web/*.css
 */
gulp.task('css', function(callback){
    var stream = gulp.src('./assets/css/*.styl')
        .pipe(stylus({use: [nib()]}))
        .on('error', function(error){
            console.log(error.message);
            callback();
        })
        .pipe(gulp.dest(outputDir + '/css'));

    if(browserSync){
        stream.pipe(browserSync.reload({stream: true}));
    }

    return stream;
});

/**
 * @task css:bootstrap
 * Generate /web/bootstrap.css
 */
gulp.task('css:bootstrap', function(callback){
    var stream = gulp.src('./assets/css/bootstrap.less')
        .pipe(less())
        .on('error', function(error){
            console.log(error.message);
            callback();
        })
        .pipe(gulp.dest(outputDir + '/css'));

    if(browserSync){
        stream.pipe(browserSync.reload({stream: true}));
    }

    return stream;
});

/**
 * @task css:vendor
 * Generate /web/vendor.css
 */
gulp.task('css:vendor', function(){
    var stream = gulp.src('./assets/css/vendor/*.css');

    if(fs.existsSync('./bower.json')){
        stream = streamqueue(
            {objectMode: true},
            gulp.src(
                bower({
                    includeDev: true,
                    filter: '**/*.css'
                })
            )
            .pipe(replace(/url\('/gm, 'url(\'/images/vendor/'))
            .pipe(replace(/url\((?!')/gm, 'url(/images/vendor/')),
            stream
        );
    }

    stream
        .pipe(concat('vendor.css'))
        .pipe(gulp.dest(outputDir + '/css'));

    return stream;
});


/**
 * @task js
 * Generate /web/js/*.js
 */
gulp.task('js', function(callback){
    var dir = './assets/js',
        dest = outputDir + '/js',
        stream;

    if(!fs.existsSync(dir)){
        return callback();
    }

    stream = fs
        .readdirSync(dir)
        .filter(function(file){
            return fs.statSync(path.join(dir, file)).isDirectory() && file != 'vendor';
        })
        .map(function(folder){
            return merge(gulp.src(path.join(dir, folder, '/**/*.js')), gulp.src(path.join(dir, folder, '/**/*.ts')).pipe(ts({noImplicitAny: false, out: 'ts.js', target: 'es5'})).js)
                .pipe(sort())
                .pipe(concat(folder + '.js'))
                .pipe(gulpif(optimize, uglify()))
                .pipe(gulp.dest(dest));
        });

    stream = merge(
        stream,
        merge(gulp.src(dir + '/*.js'), gulp.src(dir + '/*.ts').pipe(ts({noImplicitAny: false})).js)
            .pipe(sort())
            .pipe(concat('common.js'))
            .pipe(gulpif(optimize, uglify()))
            .pipe(gulp.dest(dest))
    );

    if(browserSync){
        stream.pipe(browserSync.reload({stream: true}));
    }

    return stream;
});


/**
 * @task js:vendor
 * Generate /web/js/vendor.js
 */
gulp.task('js:vendor', ['js:tinymce'], function(){
    var stream = gulp.src('./assets/js/vendor/**/*.js');

    if(fs.existsSync('./bower.json')){
        stream = streamqueue(
            {objectMode: true},
            gulp.src(bower({includeDev: true, filter: '**/*.js'})),
            stream
        );
    }

    stream
        .pipe(concat('vendor.js'))
        .pipe(gulpif(optimize, uglify()))
        .pipe(gulp.dest(outputDir + '/js'));

    if(browserSync){
        stream.pipe(browserSync.reload({stream: true}));
    }

    return stream;
});

/**
 * @task js:tinymce
 * Generate /web/js/tinymce/*
 */
gulp.task('js:tinymce', ['js:tinymce.ru'], function(){
    var stream = gulp.src([
        './bower_components/tinymce/tinymce.js',
        './bower_components/tinymce/jquery.tinymce.js',
        './bower_components/tinymce/plugins/**/*',
        './bower_components/tinymce/skins/**/*',
        './bower_components/tinymce/themes/**/*',
        './bower_components/tinymce-i18n/langs/ru.js'
    ], {base: './bower_components/tinymce'});

    stream
        .pipe(gulp.dest(outputDir + '/js/tinymce/'));

    if(browserSync){
        stream.pipe(browserSync.reload({stream: true}));
    }

    return stream;
});

/**
 * @task js:tinymce.ru
 * Generate /web/js/tinymce/langs/ru.js
 */
gulp.task('js:tinymce.ru', function(){
    var stream = gulp.src([
        './bower_components/tinymce-i18n/langs/ru.js'
    ], {base: './bower_components/tinymce-i18n'});

    stream
        .pipe(gulp.dest(outputDir + '/js/tinymce/'));

    if(browserSync){
        stream.pipe(browserSync.reload({stream: true}));
    }

    return stream;
});


/**
 * @task fonts
 * Copy font files to /web/fonts/*
 */
gulp.task('fonts', function(){
    return gulp.src('./assets/fonts/**/*').pipe(gulp.dest(outputDir + '/fonts'));
});


/**
 * @task images
 * Copy image files to /web/images/*
 */
gulp.task('images', function(){
    if(fs.existsSync('./bower.json')){
        gulp.src(
            bower({
                includeDev: true,
                filter: ['**/*.png', '**/*.jpg', '**/*.gif']
            })
        ).pipe(gulp.dest(outputDir + '/images/vendor'));
    }

    return gulp.src('./assets/images/**/*').pipe(gulp.dest(outputDir + '/images'));
});


/**
 * @task sync
 */
gulp.task('sync', function(){
    browserSync = require('browser-sync');
    browserSync({proxy: path.basename(__dirname.replace(/[\/\\]vendor[\/\\]creonit[\/\\]admin-bundle$/, '')), open: false, notify: false, ghostMode: false});
});

/**
 * @task watch
 */
gulp.task('watch', ['sync'], function(){
    gulp.watch('./assets/css/**/*.styl', ['css']);
    gulp.watch(['./assets/css/variables.less', './assets/css/bootstrap.less'], ['css:bootstrap']);
    gulp.watch('./assets/css/vendor/*.css', ['css:vendor']);
    gulp.watch(['./assets/js/**/*.js', './assets/js/**/*.ts', '!./assets/js/vendor/**/*.js'], ['js']);
    gulp.watch('./assets/js/vendor/**/*.js', ['js:vendor']);
    gulp.watch('./assets/fonts/**/*', ['fonts']);
    gulp.watch('./assets/images/**/*', ['images']);
});


gulp.task('default', function(){
    runSequence(
        ['css', 'css:bootstrap', 'css:vendor', 'js', 'js:vendor', 'fonts', 'images'],
        'watch'
    );
});

gulp.task('build', function(){
    optimize = true;
    runSequence(
        ['css', 'css:bootstrap', 'css:vendor', 'js', 'js:vendor', 'fonts', 'images']
    );
});

