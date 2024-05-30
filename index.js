#!/usr/bin/env node
'use strict';

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const co = require('co');
const prompt = require('co-prompt');
const del = require('del');
const ncp = require('ncp').ncp;
const fetch = require('node-fetch');
const changeCase = require('change-case');
const chalk = require('chalk');
const pkg = require('./package.json');
const Command = require('commander').Command;
const program = new Command();

const defaultArgs = {
	themeName: 'WP Theme',
	themeVersion: '0.0.1',
	themeTemplate: '',
	themeURI: 'https://github.com/example/wp-theme',
	themeBugsURI: 'https://github.com/example/wp-theme/issues',
	themeRepoURI: 'git@github.com:example/wp-theme.git',
	themeRepoType: 'git',
	themeDescription: 'This theme was generated using create-wp-theme.',
	themeAuthor: 'Example, INC.',
	themeAuthorEmail: 'hello@example.com',
	themeAuthorURI: 'https://www.example.com',
	themeLicense: 'UNLICENSED',
	themeTags: 'accessibility-ready, translation-ready',
	wpVersionRequired: '6.0.0',
	wpVersionTested: '6.0.0',
	functionPrefix: 'wp_theme',
	classPrefix: 'WP_Theme',
	constantPrefix: 'WP_THEME',
	path: process.cwd(),
};

const argTypes = {
	themeName: 'string',
	themeVersion: 'string',
	themeTemplate: 'string',
	themeURI: 'string',
	themeBugsURI: 'string',
	themeRepoURI: 'string',
	themeRepoType: 'string',
	themeDescription: 'string',
	themeAuthor: 'string',
	themeAuthorEmail: 'string',
	themeAuthorURI: 'string',
	themeLicense: 'string',
	themeTags: 'string',
	wpVersionRequired: 'string',
	wpVersionTested: 'string',
	functionPrefix: 'string',
	classPrefix: 'string',
	constantPrefix: 'string',
	path: 'string',
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
	functionPrefix: 'Function Prefix',
	classPrefix: 'Class Prefix',
	constantPrefix: 'Constant Prefix',
	path: 'Path',
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
	functionPrefix: 'The prefix for PHP functions',
	classPrefix: 'The prefix for PHP classes',
	constantPrefix: 'The prefix for PHP constants',
	path: 'The path where the built theme directory will be placed.',
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
	functionPrefix: 'F',
	classPrefix: 'C',
	constantPrefix: 'c',
	path: 'p',
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

const gitURL = 'https://github.com/dreamsicle-io/wp-theme-assets.git';
const gitBranch = 'master';

const tmpPath = path.join(__dirname, 'tmp');
const tmpThemePath = path.join(tmpPath, 'package');
const tmpThemePkgPath = path.join(tmpThemePath, 'package.json');
const tmpThemePkgLockPath = path.join(tmpThemePath, 'package-lock.json');
const tmpThemeComposerPath = path.join(tmpThemePath, 'composer.json');
const tmpThemeComposerLockPath = path.join(tmpThemePath, 'composer.lock');
const tmpThemeWebpackConfigPath = path.join(tmpThemePath, 'webpack.config.js');
const tmpThemeLicPath = path.join(tmpThemePath, 'LICENSE');
const tmpThemeEditorConfigPath = path.join(tmpThemePath, '.editorconfig');
const tmpThemeEslintConfigPath = path.join(tmpThemePath, '.eslintrc');
const tmpThemeStylelintPath = path.join(tmpThemePath, '.stylelintrc');
const tmpThemePrettierIgnorePath = path.join(tmpThemePath, '.prettierignore');
const tmpThemeGitIgnorePath = path.join(tmpThemePath, '.gitignore');
const tmpThemeNvmPath = path.join(tmpThemePath, '.nvmrc');
const tmpThemeVscodeDirPath = path.join(tmpThemePath, '.vscode');
const tmpThemeGithubDirPath = path.join(tmpThemePath, '.github');
const tmpThemeLanguagesDirPath = path.join(tmpThemePath, 'languages');
const themeDirName = changeCase.paramCase(program.args[0]);

function walkDirectories(dirPath) {
	var results = [];
	const files = fs.readdirSync(dirPath);
	files.forEach(function (file) {
		const filePath = path.join(dirPath, file);
		const stat = fs.statSync(filePath);
		if (stat.isDirectory()) {
			results = results.concat(walkDirectories(filePath));
		} else {
			results.push(filePath);
		}
	});
	return results;
}

function pathExists(path = '') {
	var exists = true;
	try {
		fs.statSync(path);
	} catch (error) {
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
	const themePath = path.join(args.path, themeDirName);
	if (!pathExists(args.path)) {
		fs.mkdirSync(args.path);
	}
	ncp(tmpThemePath, themePath, function (error) {
		if (error) {
			console.error(chalk.bold.redBright('Error:'), error);
			process.exit();
		} else {
			console.info(chalk.bold.yellow('Theme copied:'), themePath);
			del([tmpPath], { force: true })
				.then(function (paths) {
					if (paths.length > 0) {
						console.info(chalk.bold.yellow('Repo cleaned:'), paths.join(', '));
					}
					console.info('\n' + chalk.bold.green('Theme created:'), args.themeName + ' in ' + themePath + '\n');
					process.exit();
				}).catch(function (error) {
					console.error(chalk.bold.redBright('Error:'), error);
					process.exit();
				});
		}
	});
}

function writeLicense(args = null) {
	if (args.themeLicense !== 'UNLICENSED') {
		fetch('https://api.github.com/licenses/' + encodeURIComponent(args.themeLicense.toLowerCase()))
			.then(function (response) {
				if (response.status === 200) {
					return response.json();
				} else {
					throw new Error(response.json().message);
				}
			}).then(function (data) {
				console.info(chalk.bold.yellow('License fetched:'), data.name);
				fs.writeFile(tmpThemeLicPath, data.body, function (error) {
					if (error) {
						console.error(chalk.bold.redBright('Error:'), error);
						process.exit();
					} else {
						console.info(chalk.bold.yellow('License written:'), tmpThemeLicPath);
						putPackage(args);
					}
				});
			}).catch(function (error) {
				console.error(chalk.bold.redBright('Error:'), error);
				putPackage(args);
			});
	} else {
		fs.writeFile(tmpThemeLicPath, 'UNLICENSED', function (error) {
			if (error) {
				console.error(chalk.bold.redBright('Error:'), error);
				process.exit();
			} else {
				console.info(chalk.bold.yellow('License written:'), tmpThemeLicPath);
				putPackage(args);
			}
		});
	}
}

function replaceRename(args = null) {
	const ignoreDirs = [
		tmpThemeVscodeDirPath,
		tmpThemeGithubDirPath,
		tmpThemeLanguagesDirPath
	];
	const ignoreFiles = [
		tmpThemePkgPath, 
		tmpThemePkgLockPath, 
		tmpThemeComposerPath, 
		tmpThemeComposerLockPath,
		tmpThemeWebpackConfigPath, 
		tmpThemeLicPath, 
		tmpThemeEditorConfigPath, 
		tmpThemeEslintConfigPath, 
		tmpThemeStylelintPath, 
		tmpThemePrettierIgnorePath, 
		tmpThemeGitIgnorePath, 
		tmpThemeNvmPath,
	];
	const files = walkDirectories(tmpThemePath);
	files.forEach(file => {
		const isIgnoredDir = (ignoreDirs.findIndex((dir) => file.startsWith(dir)) !== -1);
		const isIgnoredFile = ignoreFiles.includes(file);
		if (! isIgnoredDir && ! isIgnoredFile) {
			const fileName = path.basename(file);
			if (/class-wp-theme/g.test(fileName)) {
				const newFile = file.replace(fileName, fileName.replace(/class-wp-theme/g, 'class-' + changeCase.paramCase(args.classPrefix)));
				fs.renameSync(file, newFile);
				console.info(chalk.bold.yellow('File Renamed:'), newFile);
				file = newFile;
			}
			var content = fs.readFileSync(file, 'utf8');
			if (/WP Theme/g.test(content) || /WP_Theme/g.test(content) || /WP_THEME/g.test(content) || /wp-theme/g.test(content) || /wp_theme/g.test(content)) {
				content = content
					.replace(/WP Theme/g, args.themeName)
					.replace(/WP_THEME/g, args.constantPrefix.replace(/[^a-zA-Z\d]/g, '_'))
					.replace(/WP_Theme/g, args.classPrefix.replace(/[^a-zA-Z\d]/g, '_'))
					.replace(/wp-theme/g, themeDirName)
					.replace(/wp_theme/g, changeCase.snakeCase(args.functionPrefix));
				fs.writeFileSync(file, content);
				console.info(chalk.bold.yellow('File built:'), file);
			}
		}
	});
	writeLicense(args);
}

function writePackage(args = null) {
	del([tmpThemePkgLockPath, tmpThemeComposerLockPath], { force: true })
		.then(function (paths) {
			if (paths.length > 0) {
				console.info(chalk.bold.yellow('Lock files cleaned:'), paths.join(', '));
			}
			fs.readFile(tmpThemePkgPath, function (error, data) {
				if (error) {
					console.error(chalk.bold.redBright('Error:'), error);
					process.exit();
				} else {
					const themePkg = JSON.parse(data);
					themePkg.name = themeDirName;
					themePkg.themeName = args.themeName;
					themePkg.version = args.themeVersion;
					themePkg.description = args.themeDescription;
					themePkg.keywords = args.themeTags ? args.themeTags.split(',').map(function (tag) { return tag.trim(); }) : [];
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
					fs.writeFile(tmpThemePkgPath, JSON.stringify(themePkg, null, '\t'), function (error) {
						if (error) {
							console.error(chalk.bold.redBright('Error:'), error);
							process.exit();
						} else {
							console.info(chalk.bold.yellow('package.json written:'), tmpThemePkgPath);
							replaceRename(args);
						}
					});
				}
			});
		}).catch(function (error) {
			console.error(chalk.bold.redBright('Error:'), error);
			process.exit();
		});
}

function clonePackage(args = null) {
	del([tmpPath], { force: true })
		.then(function (paths) {
			if (paths.length > 0) {
				console.info(chalk.bold('Repo cleaned:'), paths.join(', '));
			}
			exec(`git clone -b ${gitBranch} ${gitURL} ${tmpPath}`, (error) => {
				if (error) {
					console.error(chalk.bold.redBright('Error:'), error);
					process.exit();
				} else {
					console.info(chalk.bold.yellow('Repo cloned:'), `${gitURL}@${gitBranch}` + ' --> ' + tmpPath);
					writePackage(args);
				}
			})
		})
		.catch(function (error) {
			console.error(chalk.bold.redBright('Error:'), error);
			process.exit();
		});
}

co(function* () {
	console.info('\n' + chalk.bold('The following tool will help you configure your new theme.'), '\nFor each setting, set a value and hit "Enter" to continue.\n');
	var args = defaultArgs;
	var options = program.opts();
	for (var key in defaultArgs) {
		const promptValue = yield prompt(chalk.bold(argTitles[key] + ': ') + '(' + options[key] + ') ');
		if (promptValue || options[key]) {
			args[key] = promptValue || options[key];
		}
	}
	return args;
}).then(function (args) {
	const themePath = path.join(args.path, themeDirName);
	if (pathExists(themePath)) {
		console.error('\n' + chalk.bold.redBright('Error:'), chalk.bold('Path already exists:'), themePath);
		process.exit();
	}
	console.info('\n' + chalk.bold.green('Creating theme:'), args.themeName + ' in ' + themePath + '\n');
	clonePackage(args);
}).catch(function (error) {
	console.error(chalk.bold.redBright('Error:'), error);
	process.exit();
});
