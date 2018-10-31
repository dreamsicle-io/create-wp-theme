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
	themetextdomain: 'wp-theme', 
	themeversion: '0.0.1', 
	themeuri: 'https://github.com/dreamsicle-io/create-wp-theme', 
	themedescription: 'This theme was generated using "create-wp-theme".', 
	themeauthor: 'Dreamsicle', 
	themeauthoruri: 'https://www.dreamsicle.io', 
	themelicense: 'GPL-3.0', 
	themetags: 'accessibility-ready, translation-ready', 
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
	themename: 'N', 
	themetextdomain: 'T',
	themeversion: 'X', 
	themeuri: 'U', 
	themedescription: 'D', 
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

program.name(cmd);
program.version(pkg.version);
program.arguments('<file>');

for (var key in defaultArgs) {
	const defaultValue = defaultArgs[key];
	const alias = argAliases[key];
	const description = argDescriptions[key];
	const isRequired = (requiredArgs.indexOf(key) !== -1);
	const variable = isRequired ? '<' + key + '>' : '[' + key + ']';
	program.option('-' + alias + ', --' + key + ' ' + variable, description + ' [' + defaultValue + ']', defaultValue);
}

program.parse(process.argv);
