
{dust} with fs
==============

Description
-----------

This is a simplified interface to use templates from filesystem with 
[{dust}](http://akdubya.github.com/dustjs/) using Node.js.

Installation for Node.js
------------------------

Simplest way to install is to use [npm](http://npmjs.org/), just simply `npm 
install dustfs`. This will also install {dust} from npm.

License
-------

MIT-style license, see [INSTALL.txt](http://github.com/jheusala/js-snippets/blob/master/LICENSE.txt).

Example 1 - Single template
---------------------------

File `templates/hello.dust`:

	Hello {name}!

File `hello.js`:

	var dustfs = require('dustfs');
	dustfs.dirs('templates'); // Read templates from this directory
	dustfs.render('hello.dust', {'name':'Captain Jack'}, function(err, out) {
		if(err) console.log('Error: '+err);
		else console.log(out);
	});

Results for `node hello.js`:

	Hello Captain Jack!

Example 2 - Multiple templates
------------------------------

File `templates/layout.dust`:

	<body>
	<div id="header">
	{+header}
	Header
	{/header}
	</div>
	<div id="content">
	{+content}
	Default content.
	{/content}
	</div>
	</body>

File `templates/partial.dust`:

	{>"layout.dust"/}
	
	{<header}
	Hello, {name}!
	{/header}
	
	{<content}
	This is our own content.
	{/content}

File `partial.js`:

	var dustfs = require('dustfs');
	dustfs.debug(true);       // Enable optional debug using console.log
	dustfs.dirs('templates'); // Read templates from that sub directory
	dustfs.render('partial.dust', {'name':'Captain Jack'}, function(err, out) {
		if(err) console.log('Error: '+err);
		else console.log('Output:\n' + out);
	});

Results for `node partial.js`:

	[dustfs] [partial.dust] Waiting until directory loading is done before rendering...
	[dustfs] [layout.dust] Template compiled from templates/layout.dust
	[dustfs] [layout.dust] Template loaded: templates/layout.dust
	[dustfs] [hello.dust] Template compiled from templates/hello.dust
	[dustfs] [hello.dust] Template loaded: templates/hello.dust
	[dustfs] [partial.dust] Template compiled from templates/partial.dust
	[dustfs] [partial.dust] Template loaded: templates/partial.dust
	[dustfs] [partial.dust] Loading done! Let's render!
	[dustfs] [partial.dust] Rendering template...
	Output:
	<body><div id="header">Hello, Captain Jack!</div><div id="content">This is our own content.</div></body>

dustfs.dirs()
-------------

There is multiple ways to call `dustfs.dirs`.

Full syntax is:
	[returns EventEmiter] dustfs.dirs(dir[, dir2[, ...[, callback]]])

Note that dustfs.render() will also wait for any ongoing call to dirs() so handling callbacks is not required.

Call to `dustfs.dirs(dir[, dir2[, ...]])` returns an EventEmitter which can be 
used to catch errors or to catch when the loading has ended:

	var loading = dustfs.dirs('templates', 'docroot');
	loading.on('error', function(err) {
		console.log('Error: '+err);
	});
	loading.on('end', function() {
		console.log('Loading done!');
	});

Call to `dustfs.dirs(dir[, callback])` is a second way to handle events:

	var loading = dustfs.dirs('templates', function(err) {
		if(err) console.log('Errors: ' + err);
		else console.log('Loading done!');
	});
