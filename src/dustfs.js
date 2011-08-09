/* 
 * Simplified interface to dust and filesystem templates
 * Copyright (C) 2011 by Jaakko-Heikki Heusala <jheusala@iki.fi>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of 
 * this software and associated documentation files (the "Software"), to deal in 
 * the Software without restriction, including without limitation the rights to 
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies 
 * of the Software, and to permit persons to whom the Software is furnished to do 
 * so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all 
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
 * SOFTWARE.
 */

module.exports = (function() {
	var debug = false,
	    dust = require('dust'),
	    fs = require('fs'),
	    path = require('path'),
	    foreach = require('snippets').foreach,
	    compiled = {},
		dirs = [],
		mod = {};
	
	/* Returns the directory where file exists */
	function search_dir(file) {
		var matches = [];
		foreach(dirs).do(function(dir) {
			if(path.existsSync(dir+"/"+file)) matches.push(dir);
		});
		if(matches.length != 0) return matches.shift();
	}
	
	/* Compile template from filesystem */
	function do_compile(file, name) {
		var name = name || file;
		if(!file) throw new Error("file not defined");
		if(compiled[name]) return compiled[name];
		var source = fs.readFileSync(file, "UTF-8");
		    compiled[name] = dust.compile(source, name);
		if(debug) console.log("Template compiled: " + file + " as " + name);
		return compiled[name];
	}
	
	/* Load template from filesystem */
	function do_load(file, name) {
		var name = name || file;
		if(!file) throw new Error("file not defined");
		var c = do_compile(file, name);
		dust.loadSource(c);
		if(debug) console.log("Template loaded: " + file + " as " + name);
		return c;
	}
	
	/* Create context for dust */
	function do_create_context(context) {
		var context = context || {};
		
		if(!context.replace) {
			context.replace = (function(chunk, context, bodies, params) {
					return chunk.tap(function(data) {
						return (params.from && params.to && (data === params.from) ) ? params.to : data;
					}).render(bodies.block, context).untap();
				});
		}
		
		if(!context.toFixed) {
			context.toFixed = (function(chunk, context, bodies, params) {
					return chunk.tap(function(data) {
						return parseFloat(data).toFixed(params.x || 0);
					}).render(bodies.block, context).untap();
				}); // end of context
		}
		
		return context;
	}

	/* Render template with dust */
	function do_render(name, context, callback) {
		var context = do_create_context(context),
		    dir;
		if(!compiled[name]) {
			dir = search_dir(name);
			if(!dir) {
				callback("Could not find template: "+name);
				return;
			}
			do_load(dir+"/"+name, name);
		}
		if(debug) console.log("Rendering template: " + name);
		dust.render(name, context, callback);
	}
	
	/* Set directories to search files */
	function do_dirs() {
		foreach(arguments).do(function(dir) {
			dirs.push(dir);
			fs.readdir(dir, function(err, files) {
				if(err) {
					console.log(err);
					return;
				}
				foreach(files).do(function(file) {
					if(path.extname(file) != ".dust") return;
					do_load(dir+"/"+file, file);
				});
			});
		});
	}
	
	/* Enable or disable debug to console */
	function do_debug(enabled) {
		debug = (enabled === true) ? true : false;
	}
	
	/* Export functions */
	
	mod.debug = do_debug;

	mod.search_dir = search_dir;
	mod.compile = do_compile;
	mod.load = do_load;
	
	mod.render = do_render;
	mod.dirs = do_dirs;
	
	return mod;
})();

/* EOF */
