#!/usr/bin/env node
'use-strict';

const program = require('commander');
const pkg = require('./package.json');
var cmd = pkg.name;
if (pkg.bin) {
	for (var key in pkg.bin) {
		cmd = key;
	    break;
	}
}

const defaultArgs = {
	themename: 'WP Theme', 
	themeuri: 'https://github.com/dreamsicle-io/create-wp-theme', 
	themedescription: 'This theme was generated using "create-wp-theme".', 
	themeauthor: 'Dreamsicle', 
	themeauthoruri: 'https://www.dreamsicle.io', 
	themelicense: 'GPL-3.0', 
	themetextdomain: 'wp-theme', 
	themetags: 'accessibility-ready, translation-ready', 
	themeversion: '0.0.1', 
	wpversionrequired: '4.9.8', 
	wpversiontested: '4.9.8', 
};

const argDescriptions = {
	themename: 'The theme name', 
	themetextdomain: 'The theme text domain', 
	themeversion: 'The theme version',
	themeuri: 'The theme URI', 
	themedescription: 'The theme description', 
	themeauthor: 'The theme author', 
	themeauthoruri: 'The theme author URI', 
	themelicense: 'The theme license as a valid SPDX expression', 
	themetags: 'A comma separated list of valid WordPress theme repository tags', 
	wpversionrequired: 'The version of WordPress that this theme requires', 
	wpversiontested: 'The version of WordPress that this theme has been tested up to', 
};

const argAliases = {
	themename: 'n', 
	themetextdomain: 't',
	themeversion: 'x', 
	themeuri: 'u', 
	themedescription: 'd', 
	themeauthor: 'a', 
	themeauthoruri: 'U', 
	themelicense: 'l',  
	themetags: 'T', 
	wpversionrequired: 'w', 
	wpversiontested: 'W', 
};

const requiredArgs = [
	'themename', 
	'themetextdomain', 
];

program.name(cmd);
program.version(pkg.version);
program.arguments('<file>');

for (var key in defaultArgs) {
	const defaultValue = defaultArgs[key];
	const alias = argAliases[key];
	const description = argDescriptions[key];
	const isRequired = (requiredArgs.indexOf(key) !== -1);
	if (isRequired) {
		program.option('-' + alias + ', --' + key + ' <' + key + '>', description + ' [' + defaultValue + ']');
	} else {
		program.option('-' + alias + ', --' + key + ' [' + key + ']', description + ' [' + defaultValue + ']');
	}
}

program.parse(process.argv);

const args = defaultArgs;
for (var key in defaultArgs) {
	if (program[key]) {
		args[key] = program[key];
	}
}

console.log(args);
