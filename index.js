#!/usr/bin/env node --harmony
'use-strict';

const path = require('path');
const fs = require('fs');
const program = require('commander');
const co = require('co');
const prompt = require('co-prompt');
const nodegit = require('nodegit');
const del = require('del');
const ncp = require('ncp').ncp;
const fetch = require('node-fetch');
const pkg = require('./package.json');

const defaultArgs = {
	themeName: 'WP Theme', 
	themeVersion: '0.0.1', 
	themeTemplate: '', 
	themeURI: 'https://github.com/dreamsicle-io/create-wp-theme', 
	themeBugsURI: 'https://github.com/dreamsicle-io/create-wp-theme/issues', 
	themeRepoURI: 'https://github.com/dreamsicle-io/create-wp-theme.git', 
	themeRepoType: 'git', 
	themeDescription: 'This theme was generated using create-wp-theme.', 
	themeAuthor: 'Dreamsicle', 
	themeAuthorEmail: 'hello@dreamsicle.io', 
	themeAuthorURI: 'https://www.dreamsicle.io', 
	themeLicense: 'GPL-3.0', 
	themeTags: 'accessibility-ready, translation-ready', 
	wpVersionRequired: '4.9.8', 
	wpVersionTested: '4.9.8', 
};

const argTypes = {
	themeName: 'name', 
	themeVersion: 'version',
	themeTemplate: 'theme', 
	themeURI: 'uri', 
	themeBugsURI: 'uri', 
	themeRepoURI: 'uri', 
	themeRepoType: 'type', 
	themeDescription: 'description', 
	themeAuthor: 'name', 
	themeAuthorEmail: 'email', 
	themeAuthorURI: 'uri', 
	themeLicense: 'spdx', 
	themeTags: 'tags', 
	wpVersionRequired: 'version', 
	wpVersionTested: 'version', 
};

const argTitles = {
	themeName: 'Theme Name', 
	themeVersion: 'Version',
	themeTemplate: 'Template', 
	themeURI: 'Theme URI', 
	themeBugsURI: 'Theme Bugs URI', 
	themeRepoURI: 'Theme Repository URI', 
	themeRepoType: 'Theme Repository Type', 
	themeDescription: 'Description', 
	themeAuthor: 'Author', 
	themeAuthorEmail: 'Author Email', 
	themeAuthorURI: 'Author URI', 
	themeLicense: 'License', 
	themeTags: 'Tags', 
	wpVersionRequired: 'WP Version Required', 
	wpVersionTested: 'WP Version Tested', 
};

const argDescriptions = {
	themeName: 'The theme name', 
	themeVersion: 'The theme version',
	themeTemplate: 'The parent theme if this is a child theme', 
	themeURI: 'The theme URI', 
	themeBugsURI: 'The theme bugs URI', 
	themeRepoURI: 'The theme repository URI', 
	themeRepoType: 'The theme repository type', 
	themeDescription: 'The theme description', 
	themeAuthor: 'The theme author', 
	themeAuthorEmail: 'The theme author email', 
	themeAuthorURI: 'The theme author URI', 
	themeLicense: 'The theme license as a valid SPDX expression', 
	themeTags: 'A CSV of WordPress theme tags', 
	wpVersionRequired: 'The version of WordPress the theme requires', 
	wpVersionTested: 'The version of WordPress the theme has been tested up to', 
};

const argAliases = {
	themeName: 'N', 
	themeVersion: 'X', 
	themeTemplate: 'T', 
	themeURI: 'U', 
	themeBugsURI: 'B', 
	themeRepoURI: 'R', 
	themeRepoType: 'r', 
	themeDescription: 'd', 
	themeAuthor: 'A', 
	themeAuthorEmail: 'E', 
	themeAuthorURI: 'u', 
	themeLicense: 'L', 
	themeTags: 't', 
	wpVersionRequired: 'W', 
	wpVersionTested: 'w', 
};

const requiredArgs = [
	'themeName', 
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
const tmpThemePath = path.join(tmpPath, 'package');
const tmpThemePkgPath = path.join(tmpThemePath, 'package.json');
const tmpThemePkgLockPath = path.join(tmpThemePath, 'package-lock.json');
const tmpThemeLicPath = path.join(tmpThemePath, 'LICENSE');
const themeDirName = program.args[0];
const themePath = path.join(process.cwd(), themeDirName);
const cloneOptions = {
	fetchOpts: {
		callbacks: {
			// This is a required callback for OS X machines.  There is a known issue
			// with libgit2 being able to verify certificates from GitHub.
			certificateCheck: function() { return 1; }
		}
	}
};

function pathExists(path = '') {
	var exists = true;
	try {
		fs.statSync(path);
	} catch(error) {
		exists = false;
	}
	return exists;
}

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

function putPackage(args = null) {
	ncp(tmpThemePath, themePath, function(error) {
		if (error) {
			console.error(error);
			process.exit();
		} else {
			console.info('Theme copied: ' + themePath);
			del([tmpPath], { force: true })
				.then(function(paths) {
					if (paths.length > 0) {
						console.info('Repo cleaned: ' + paths.join(', '));
					}
					console.info('\nTheme created: ' + args.themeName + ' in ' + themePath);
					process.exit();
				}).catch(function(error) {
					console.error(error);
					process.exit();
				});
		}
	});
}

function writeLicense(args = null) {
	fetch('https://api.github.com/licenses/' + encodeURIComponent(args.themeLicense.toLowerCase()))
		.then(function(response) {
			if (response.status === 200) {
				return response.json();
			} else {
				throw new Error('License not found: ' + args.themeLicense);
			}
		}).then(function(data) {
			console.info('License fetched: ' + data.name);
			fs.writeFile(tmpThemeLicPath, data.body, function(error) {
				if (error) {
					console.error(error);
					process.exit();
				} else {
					console.info('License written: ' + tmpThemeLicPath);
					putPackage(args);
				}
			});
		}).catch(function(error) {
			console.info(error.message);
			putPackage(args);
		});
}

function writePackage(args = null) {
	del([tmpThemePkgLockPath], { force: true })
		.then(function(paths) {
			if (paths.length > 0) {
				console.info('package-lock.json cleaned: ' + paths.join(', '));
			}
			fs.readFile(tmpThemePkgPath, function(error, data) {
				if (error) {
					console.error(error);
					process.exit();
				} else {
					themePkg = JSON.parse(data);
					themePkg.name = themeDirName;
					themePkg.themeName = args.themeName;
					themePkg.version = args.themeVersion;
					themePkg.description = args.themeDescription;
					themePkg.keywords = args.themeTags ? args.themeTags.split(',').map(function(tag) { return tag.trim(); }) : [];
					themePkg.author = {
						name: args.themeAuthor, 
						email: args.themeAuthorEmail, 
						url: args.themeAuthorURI, 
					};
					themePkg.license = args.themeLicense;
					themePkg.wordpress = {
						versionRequired: args.wpVersionRequired,
						versionTested: args.wpVersionTested, 
					};
					themePkg.bugs = {
						url: args.themeBugsURI, 
					};
					themePkg.homepage = args.themeURI;
					themePkg.repository = {
						type: args.themeRepoType, 
						url: args.themeRepoURI, 
					};
					fs.writeFile(tmpThemePkgPath, JSON.stringify(themePkg, null, '\t'), function(error) {
						if (error) {
							console.error(error);
							process.exit();
						} else {
							console.info('package.json written: ' + tmpThemePkgPath);
							writeLicense(args);
						}
					});
				}
			});
		}).catch(function(error) {
			console.error(error);
			process.exit();
		});
}

function clonePackage(args = null) {
	del([tmpPath], { force: true })
		.then(function(paths) {
			if (paths.length > 0) {
				console.info('Repo cleaned: ' + paths.join(', '));
			}
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
	if (pathExists(themePath)) {
		console.log('\nPath already exists: ' + themePath);
		process.exit();
	}
	console.info('\nThe following tool will help you configure your new theme.\nFor each setting, set a value and hit "Enter" to continue.\n');
	var values = defaultArgs;
	for (var key in defaultArgs) {
		const promptValue = yield prompt(argTitles[key] + ': (' + program[key] + ') ');
		if (promptValue || program[key]) {
			values[key] = promptValue || program[key];
		}
	}
	return values;
}).then(function(args) {
	console.info('\nCreating theme: ' + args.themeName + ' in ' + themePath + '\n');
	clonePackage(args);
}, function(error) {
	console.error(error);
	process.exit();
});