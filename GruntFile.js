module.exports=function(grunt){
  	grunt.initConfig(
	{
		less: {
			dist: {
				options: {
					compress: true,
					yuicompress: true,
					optimization: 2
				},
				files: {
	          		"public/all.css": "public/stylesheets/*.less" // destination file and source file
	          		
	      		}
		  	}	  	
		},
		concat: {
			options: {
				separator: ';\n',
			},
			dist: {
				src: ['public/javascripts/*.js'],
				dest: 'public/all.js',
			}	
		},	
		watch: {
			styles: {
		        files: ['public/stylesheets/*.less'], // which files to watch
		        tasks: ['less'],
		        options: {
		        	nospawn: true
		        }
		    },
		    javascripts:{
		        files: ['public/javascripts/*.js'], // which files to watch
		        tasks: ['concat'],
		        options: {
		        	nospawn: true
		        }		    	
		    }
		},
		execute: {
			target: {
				src: ['app.js']
			}
		},
		concurrent: {
			options: {
				logConcurrentOutput: true
			},
			we: {
				tasks: ["watch", "execute"]
			}
		}		
	});
	grunt.loadNpmTasks('grunt-contrib-less');	
	grunt.loadNpmTasks('grunt-contrib-concat');	
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-execute');
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.registerTask('default', ['less', 'concat','concurrent']);
}