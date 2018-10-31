#!/usr/bin/env node --harmony
'use-strict';

const path = require('path');
const fs = require('fs');
const program = require('commander');
const co = require('co');
const prompt = require('co-prompt');
const nodegit = require('nodegit');
const del = require('del');
const pkg = require('./package.json');

const defaultArgs = {
	themename: 'WP Theme', 
	themetextdomain: 'wp-theme', 
	themeversion: '0.0.1', 
	themetemplate: '', 
	themeuri: 'https://github.com/dreamsicle-io/create-wp-theme', 
	themebugsuri: 'https://github.com/dreamsicle-io/create-wp-theme/issues', 
	themerepouri: 'https://github.com/dreamsicle-io/create-wp-theme.git', 
	themerepotype: 'git', 
	themedescription: 'This theme was generated using create-wp-theme.', 
	themeauthor: 'Dreamsicle', 
	themeauthoremail: 'hello@dreamsicle.io', 
	themeauthoruri: 'https://www.dreamsicle.io', 
	themelicense: 'GPL-3.0', 
	themetags: 'accessibility-ready, translation-ready', 
	wpversionrequired: '4.9.8', 
	wpversiontested: '4.9.8', 
};

const argTypes = {
	themename: 'name', 
	themetextdomain: 'textdomain', 
	themeversion: 'version',
	themetemplate: 'theme', 
	themeuri: 'uri', 
	themebugsuri: 'uri', 
	themerepouri: 'uri', 
	themerepotype: 'type', 
	themedescription: 'description', 
	themeauthor: 'name', 
	themeauthoremail: 'email', 
	themeauthoruri: 'uri', 
	themelicense: 'spdx', 
	themetags: 'tags', 
	wpversionrequired: 'version', 
	wpversiontested: 'version', 
};

const argTitles = {
	themename: 'Theme Name', 
	themetextdomain: 'Text Domain', 
	themeversion: 'Version',
	themetemplate: 'Template', 
	themeuri: 'Theme URI', 
	themebugsuri: 'Theme Bugs URI', 
	themerepouri: 'Theme Repository URI', 
	themerepotype: 'Theme Repository Type', 
	themedescription: 'Description', 
	themeauthor: 'Author', 
	themeauthoremail: 'Author Email', 
	themeauthoruri: 'Author URI', 
	themelicense: 'License', 
	themetags: 'Tags', 
	wpversionrequired: 'WP Version Required', 
	wpversiontested: 'WP Version Tested', 
};

const argDescriptions = {
	themename: 'The theme name', 
	themetextdomain: 'The theme text domain', 
	themeversion: 'The theme version',
	themetemplate: 'The parent theme if this is a child theme', 
	themeuri: 'The theme URI', 
	themebugsuri: 'The theme bugs URI', 
	themerepouri: 'The theme repository URI', 
	themerepotype: 'The theme repository type', 
	themedescription: 'The theme description', 
	themeauthor: 'The theme author', 
	themeauthoremail: 'The theme author email', 
	themeauthoruri: 'The theme author URI', 
	themelicense: 'The theme license as a valid SPDX expression', 
	themetags: 'A CSV of WordPress theme tags', 
	wpversionrequired: 'The version of WordPress the theme requires', 
	wpversiontested: 'The version of WordPress the theme has been tested up to', 
};

const argAliases = {
	themename: 'N', 
	themetextdomain: 'D',
	themeversion: 'X', 
	themetemplate: 'T', 
	themeuri: 'U', 
	themebugsuri: 'B', 
	themerepouri: 'R', 
	themerepotype: 'r', 
	themedescription: 'd', 
	themeauthor: 'A', 
	themeauthoremail: 'E', 
	themeauthoruri: 'u', 
	themelicense: 'L', 
	themetags: 't', 
	wpversionrequired: 'W', 
	wpversiontested: 'w', 
};

const requiredArgs = [
	'themename', 
	'themetextdomain', 
];

program.name(getCommandName());
program.version(pkg.version);
program.arguments('<file>');

for (var key in defaultArgs) {
	const defaultValue = defaultArgs[key];
	const alias = argAliases[key];
	const description = argDescriptions[key];
	const isRequired = (requiredArgs.indexOf(key) !== -1);
	const argType = argTypes[key];
	const type = isRequired ? '<' + argType + '>' : '[' + argType + ']';
	program.option('-' + alias + ', --' + key + ' ' + type, description, defaultValue);
}

program.parse(process.argv);

const repoPath = 'https://github.com/dreamsicle-io/wp-theme-assets.git';
const tmpPath = path.join(__dirname, 'tmp');
const pkgPath = path.join(tmpPath, 'package');
const themeDir = program.args[0];
const themePath = path.join(process.cwd(), themeDir);
const cloneOptions = {
	fetchOpts: {
		callbacks: {
			// This is a required callback for OS X machines.  There is a known issue
			// with libgit2 being able to verify certificates from GitHub.
			certificateCheck: function() { return 1; }
		}
	}
};

function getCommandName() {
	var cmd = pkg.name;
	if (pkg.bin) {
		for (var key in pkg.bin) {
			cmd = key;
			break;
		}
	}
	return cmd;
}

function writePackage(args = null) {
	const themePkgPath = path.join(pkgPath, 'package.json');
	fs.readFile(themePkgPath, function(error, data) {
		if (error) {
			console.error(error);
			process.exit();
		} else {
			themePkg = JSON.parse(data);
			themePkg.name = themeDir;
			themePkg.version = args.themeversion;
			themePkg.description = args.themedescription;
			themePkg.keywords = args.themetags ? args.themetags.split(',') : [];
			themePkg.author = {
				name: args.themeauthor, 
				email: args.themeauthoremail, 
				url: args.themeauthoruri, 
			};
			themePkg.license = args.themelicense;
			themePkg.wordpress = {
				versionRequired: args.wpversionrequired,
				versionTested: args.wpversiontested, 
			};
			themePkg.bugs = {
				url: args.themebugsuri, 
			};
			themePkg.homepage = args.themeuri;
			themePkg.repository = {
				type: args.themerepotype, 
				url: args.themerepouri, 
			};
			fs.writeFile(themePkgPath, JSON.stringify(themePkg, null, '\t'), function(error) {
				if (error) {
					console.error(error);
					process.exit();
				} else {
					console.info('package.json written: ' + themePkgPath);
					process.exit();
				}
			});
		}
	});
}

function clonePackage(args = null) {
	del([tmpPath], { force: true })
		.then(function(paths) {
			console.info('Repo cleaned: ' + paths.join(', '));
			nodegit.Clone(repoPath, tmpPath, cloneOptions)
				.then(function(repo) {
					console.info('Repo cloned: ' + repoPath + ' --> ' + tmpPath);
					writePackage(args);
				}).catch(function(error) {
					console.error(error);
					process.exit();
				});
		})
		.catch(function(error) {
			console.error(error);
			process.exit();
		});
}

co(function *() {
	var values = defaultArgs;
	for (var key in defaultArgs) {
		const promptValue = yield prompt(argTitles[key] + ': (' + defaultArgs[key] + ') ');
		if (promptValue || program[key]) {
			values[key] = promptValue || program[key];
		}
	}
	return values;
}).then(function(args) {
	clonePackage(args);
}, function(error) {
	console.error(error);
	process.exit();
});