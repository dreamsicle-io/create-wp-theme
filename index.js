#!/usr/bin/env node
'use-strict';

const program = require('commander');

const defaultArgs = {
	themename: 'WP Theme', 
	themeuri: 'https://github.com/dreamsicle-io/create-wp-theme', 
	themeversion: '0.0.1', 
	themedescription: 'This theme was generated using "create-wp-theme".', 
	author: 'Dreamsicle', 
	authoruri: 'https://www.dreamsicle.io', 
	license: 'GPL-3.0', 
	textdomain: 'wp-theme', 
	tags: 'accessibility-ready, translation-ready', 
};

const argDescriptions = {
	themename: 'The theme name.', 
	themeuri: 'The theme URI.', 
	themeversion: 'The theme version.', 
	themedescription: 'The theme description', 
	author: 'The theme author.', 
	authoruri: 'The theme author URI.', 
	license: 'The theme license as a valid SPDX expression.', 
	textdomain: 'The theme text domain.', 
	tags: 'A comma separated list of valid WordPress theme repository tags.', 
};

const argAliases = {
	themename: 'tn', 
	themeuri: 'tu', 
	themeversion: 'tv', 
	themedescription: 'td', 
	author: 'a', 
	authoruri: 'au', 
	license: 'l', 
	textdomain: 'td', 
	tags: 't', 
};

const requiredArgs = [
	'themename', 
	'textdomain', 
];

program.arguments('<file>');

for (var key in defaultArgs) {
	const defaultValue = defaultArgs[key];
	const alias = argAliases[key];
	const description = argDescriptions[key];
	const isRequired = (requiredArgs.indexOf(key) !== -1);
	program.option('-' + alias + ', --' + key + ' <' + key + '>', description);
}

program.parse(process.argv);

const args = defaultArgs;
for (var key in defaultArgs) {
	if (program[key]) {
		args[key] = program[key];
	}
}

console.log(args);
