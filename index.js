#!/usr/bin/env node --harmony
'use-strict';

const path = require('path');
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
	themedescription: 'This theme was generated using create-wp-theme.', 
	themeauthor: 'Dreamsicle', 
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
	themedescription: 'description', 
	themeauthor: 'name', 
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
	themedescription: 'Description', 
	themeauthor: 'Author', 
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
	themedescription: 'The theme description', 
	themeauthor: 'The theme author', 
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
	themedescription: 'd', 
	themeauthor: 'A', 
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

const repoPath = 'https://github.com/dreamsicle-io/wp-theme-assets';
const tmpPath = path.join(__dirname, 'tmp');
const themePath = path.join(process.cwd(), program.args[0]);
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

function clonePackage(args = null) {
	del([tmpPath], { force: true })
		.then(function(paths) {
			console.info('Repo cleaned: ' + paths.join(', '));
			nodegit.Clone(repoPath, tmpPath, cloneOptions)
				.then(function(repo) {
					console.info('Repo cloned: ' + tmpPath);
					process.exit();
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