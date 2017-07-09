module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.loadNpmTasks('grunt-execute');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.initConfig({

    clean: ["dist"],

    copy: {
      src_to_dist: {
        cwd: 'src',
        expand: true,
        src: ['**/*', '!**/*.js', '!**/*.scss'],
        dest: 'dist'
      },
      moment_timezone: {
        cwd: 'node_modules/moment-timezone',
        expand: true,
        src: ['**/*.js'],
        dest: 'dist/vendor/public'
      },
      pluginDef: {
        expand: true,
        src: ['README.md'],
        dest: 'dist',
      }
    },

    watch: {
      rebuild_all: {
        files: ['src/**/*', 'README.md'],
        tasks: ['default'],
        options: {spawn: false}
      },
    },

    ts: {
        build: {
            src: ["dist/**/*.ts", "!src/spec/**/*", "!**/*.d.ts", "!dist/vendor/**/*"],
            //dest: 'dist/',
            options: {
                compile: true,
                module: 'system',
                target: 'es5',
                declaration: true,
                emitDecoratorMetadata: true,
                experimentalDecorators: true,
                sourceMap: true,
                noImplicitAny: false,
                fast: "never",
                sourceRoot: '',
                mapRoot: '',
                moduleResolution: 'node',
                allowJs: false,
            }
        },
        distTests: {
            src: ["src/**/*.ts", "!src/spec/**/*", "!**/*.d.ts"],
            dest: 'dist/test/',
            options: {
                module: 'commonjs', //or commonjs
                target: 'es5', //or es5
                rootDir: 'src/',
                sourceRoot: 'src/',
                declaration: true,
                emitDecoratorMetadata: true,
                experimentalDecorators: true,
                sourceMap: true,
                noImplicitAny: false,
            }
        },
    },

    babel: {
      options: {
        sourceMap: true,
        presets:  ["es2015"],
        plugins: ['transform-es2015-modules-systemjs', "transform-es2015-for-of"],
      },
      dist: {
        files: [{
          cwd: 'src',
          expand: true,
          src: ['**/*.js'],
          dest: 'dist',
          ext:'.js'
        }]
      },
    },

  });

  grunt.registerTask('default', ['clean', 'copy', 'babel', 'ts:build']);
};
