#!/usr/bin/env node
// @ts-check
'use strict';

const pkg = require('./package.json');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const co = require('co');
const prompt = require('co-prompt');
const changeCase = require('change-case');
const chalk = require('chalk');
const { Command } = require('commander');
const program = new Command();

/**
 * @typedef {object} Args
 * @property {string} themeName
 * @property {string} themeVersion
 * @property {string} [themeTemplate]
 * @property {string} themeURI
 * @property {string} themeBugsURI
 * @property {string} themeRepoURI
 * @property {string} themeRepoType
 * @property {string} themeDescription
 * @property {string} themeAuthor
 * @property {string} themeAuthorEmail
 * @property {string} themeAuthorURI
 * @property {string} themeLicense
 * @property {string} [themeTags]
 * @property {string} wpVersionRequired
 * @property {string} wpVersionTested
 * @property {string} functionPrefix
 * @property {string} classPrefix
 * @property {string} constantPrefix
 * @property {string} path
 */

/**
 * @typedef {object} ArgDef
 * @property {string} key
 * @property {string} description
 * @property {string} [default]
 * @property {boolean} [isRequired]
 */

/**
 * @typedef {object} OptionDef
 * @property {string} key
 * @property {string} alias
 * @property {string} type
 * @property {string} title
 * @property {string} description
 * @property {string} [default]
 * @property {boolean} [isRequired]
 */

/**
 * @typedef {object} LogMessage
 * @property {string} title
 * @property {string} [emoji]
 * @property {string} [description]
 * @property {any} [dataLabel]
 * @property {any} [data]
 * @property {'top' | 'bottom' | 'both'} [padding]
 */

/**
 * @typedef {object} GitHubLicense
 * @property {string} key
 * @property {string} name
 * @property {string} spdx_id
 * @property {string} url
 * @property {string} node_id
 * @property {string} html_url
 * @property {string} description
 * @property {string} implementation
 * @property {string[]} permissions
 * @property {string[]} conditions
 * @property {string[]} limitations
 * @property {string} body
 * @property {boolean} featured
 */

/**
 * Construct argument definitions.
 * @type {ArgDef[]}
 */
const argDefs = [
	{
		key: 'dir',
		description: 'The name of the theme directory to create (example: "my-theme")',
		isRequired: true,
	},
];

/**
 * Construct option definitions.
 * @type {OptionDef[]}
 */
const optionDefs = [
	{
		key: 'themeName',
		alias: 'N',
		type: 'string',
		title: 'Theme Name',
		description: 'The theme name',
		default: 'WP Theme',
		isRequired: true,
	},
	{
		key: 'themeVersion',
		alias: 'X',
		type: 'string',
		title: 'Version',
		description: 'The theme version',
		default: '0.0.1',
		isRequired: true,
	},
	{
		key: 'themeTemplate',
		alias: 'T',
		type: 'string',
		title: 'Template',
		description: 'The parent theme if this is a child theme',
		default: '',
		isRequired: false,
	},
	{
		key: 'themeURI',
		alias: 'U',
		type: 'string',
		title: 'Theme URI',
		description: 'The theme URI',
		default: 'https://github.com/example/wp-theme',
		isRequired: true,
	},
	{
		key: 'themeBugsURI',
		alias: 'B',
		type: 'string',
		title: 'Theme Bugs URI',
		description: 'The theme bugs URI',
		default: 'https://github.com/example/wp-theme/issues',
		isRequired: true,
	},
	{
		key: 'themeRepoURI',
		alias: 'R',
		type: 'string',
		title: 'Theme Repository URI',
		description: 'The theme repository URI',
		default: 'git@github.com:example/wp-theme.git',
		isRequired: true,
	},
	{
		key: 'themeRepoType',
		alias: 'r',
		type: 'string',
		title: 'Theme Repository Type',
		description: 'The theme repository type',
		default: 'git',
		isRequired: true,
	},
	{
		key: 'themeDescription',
		alias: 'd',
		type: 'string',
		title: 'Description',
		description: 'The theme description',
		default: 'This theme was generated using create-wp-theme.',
		isRequired: true,
	},
	{
		key: 'themeAuthor',
		alias: 'A',
		type: 'string',
		title: 'Author',
		description: 'The theme author',
		default: 'Example, INC.',
		isRequired: true,
	},
	{
		key: 'themeAuthorEmail',
		alias: 'E',
		type: 'string',
		title: 'Author Email',
		description: 'The theme author email',
		default: 'hello@example.com',
		isRequired: true,
	},
	{
		key: 'themeAuthorURI',
		alias: 'u',
		type: 'string',
		title: 'Author URI',
		description: 'The theme author URI',
		default: 'https://www.example.com',
		isRequired: true,
	},
	{
		key: 'themeLicense',
		alias: 'L',
		type: 'string',
		title: 'License',
		description: 'The theme license as a valid SPDX expression',
		default: 'UNLICENSED',
		isRequired: true,
	},
	{
		key: 'themeTags',
		alias: 't',
		type: 'string',
		title: 'Tags',
		description: 'A CSV of WordPress theme tags',
		default: 'accessibility-ready, translation-ready',
		isRequired: false,
	},
	{
		key: 'wpVersionRequired',
		alias: 'W',
		type: 'string',
		title: 'WP Version Required',
		description: 'The version of WordPress the theme requires',
		default: '6.0.0',
		isRequired: true,
	},
	{
		key: 'wpVersionTested',
		alias: 'w',
		type: 'string',
		title: 'WP Version Tested',
		description: 'The version of WordPress the theme has been tested up to',
		default: '6.0.0',
		isRequired: true,
	},
	{
		key: 'functionPrefix',
		alias: 'F',
		type: 'string',
		title: 'Function Prefix',
		description: 'The prefix for PHP functions',
		default: 'wp_theme',
		isRequired: true,
	},
	{
		key: 'classPrefix',
		alias: 'C',
		type: 'string',
		title: 'Class Prefix',
		description: 'The prefix for PHP classes',
		default: 'WP_Theme',
		isRequired: true,
	},
	{
		key: 'constantPrefix',
		alias: 'c',
		type: 'string',
		title: 'Constant Prefix',
		description: 'The prefix for PHP constants',
		default: 'WP_THEME',
		isRequired: true,
	},
	{
		key: 'path',
		alias: 'p',
		type: 'string',
		title: 'Path',
		description: 'The path where the built theme directory will be placed',
		default: process.cwd(),
		isRequired: true,
	},
];

// Set program settings.
program.name('create-wp-theme');
program.description(pkg.description);
program.version(pkg.version);

// Define program arguments.
argDefs.forEach((argDef) => {
	const name = argDef.isRequired ? `<${argDef.key}>` : `[${argDef.key}]`;
	program.argument(name, argDef.description, argDef.default);
});

// Define program options.
optionDefs.forEach((optionDef) => {
	const type = optionDef.isRequired ? `<${optionDef.type}>` : `[${optionDef.type}]`;
	const flags = `-${optionDef.alias}, --${optionDef.key} ${type}`;
	program.option(flags, optionDef.description, optionDef.default);
});

// Parse the CLI options and store them in the program.
program.parse(process.argv);

// Construct repo settings.
const gitURL = 'https://github.com/dreamsicle-io/wp-theme-assets.git';
const gitBranch = 'master';

// Construct paths.
const tmpPath = path.join(__dirname, 'tmp');
const tmpThemePath = path.join(tmpPath, 'package');
const tmpThemePkgPath = path.join(tmpThemePath, 'package.json');
const tmpThemeComposerPath = path.join(tmpThemePath, 'composer.json');
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
const tmpThemeReadmePath = path.join(tmpThemePath, 'README.md');
const themeDirName = changeCase.paramCase(program.args[0]);

/**
 * @param {LogMessage} message 
 */
function logInfo(message) {
	let { title, description, emoji, data, dataLabel, padding } = message;
	/** 
	 * Construct the text.
	 * @type {string}
	 */
	let text = chalk.bold.green(title);
	if (description) text += ` ${description}`;
	if (emoji) text = `${emoji} ${text}`;
	// Add padding.
	if ((padding === 'top') || (padding === 'both')) text = `\n${text}`;
	if (((padding === 'bottom') || (padding === 'both')) && ! data) text = `${text}\n`;
	/** 
	 * Construct the params array.
	 * @type {any[]}
	 */
	let params = [text];
	// Construct the data.
	if (data) params.push(...[`\n\n💡 ${chalk.bold.cyan(dataLabel || 'Data')} →`, data, '\n']);
	console.info(...params);
}

/**
 * @param {unknown} error 
 */
function logError(error) {
	/**
	 * @type {Error}
	 */
	const errorInstance = (error instanceof Error) ? error : new Error((typeof error === 'string') ? error : 'An unknown error has occurred');
	console.error(chalk.bold.redBright(`\n\n❌ Error: ${errorInstance.message}\n\n`), errorInstance, '\n\n');
}

/**
 * @param {string} dirPath 
 * @returns {string[]}
 */
function walkDirectories(dirPath) {
	/**
	 * Initialize the results array.
	 * @type {string[]}
	 */
	let results = [];
	const files = fs.readdirSync(dirPath);
	files.forEach((file) => {
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

/**
 * @param {string} type 
 * @param {Buffer} stdout 
 * @returns {string}
 */
function formatStdoutMessage(type, stdout) {
	switch (type) {
		case 'git-commit': {
			const response = stdout.toString();
			const lines = response.split('\n').map((message) => message.trim());
			const commitMessage = lines[0]?.match(/(\[.*\])/)?.[0] || 'Unknown commit';
			const filesMessage = lines[1] || 'Unknown commit stats';
			return [commitMessage, filesMessage].join(' ― ');
		}
		default: {
			throw new Error(`Unsupported stdout type: "${type}"`);
		}
	}
}

/**
 * @returns {Promise<Args>}
 */
async function processArgs() {
	logInfo({
		title: 'The following tool will help you configure your new theme.',
		description: 'For each setting, set a value and hit "Enter" to continue.',
		emoji: '⚡',
		padding: 'bottom',
	});
	return await co(function* () {
		/**
		 * Clone the initial program options into args.
		 * @type {Args}
		 */
		const args = { ...program.opts() };
		// Loop over the arg definitions and prompt if not set through the CLI.
		// Note this cannot be a `forEach()` loop, because `yield` can only be
		// used inside of a `for` loop.
		for (const optionDef of optionDefs) {
			// If the arg matches its default, we can safely assume it was
			// not passed from the CLI, and we should prompt for it.
			if (args[optionDef.key] === optionDef.default) {
				const promptMessage = `${chalk.bold.cyanBright(optionDef.title + ':')} ${chalk.dim('(' + args[optionDef.key] + ')')} `;
				/**
				 * If there is a prompt value for this option, set it. If not, use the program option.
				 * @type {string}
				 */
				const promptValue = yield prompt(promptMessage);
				if (promptValue) args[optionDef.key] = promptValue;
			}
		}
		// Log the arguments for debugging.
		logInfo({
			title: 'Got it!',
			description: `Creating ${args.themeName}...`,
			emoji: '👍',
			padding: 'both',
			dataLabel: 'Arguments',
			data: args,
		});
		// The prompts have completed, return the processed args.
		return args;
	});
}

function clonePackage() {
	// Clean out the tmp directory.
	fs.rmSync(tmpPath, { recursive: true, force: true });
	// Clone the repo into the tmp directory.
	execSync(`git clone -b ${gitBranch} ${gitURL} ${tmpPath}`, { stdio: 'pipe' });
	logInfo({
		title: 'Repo cloned',
		description: `${gitURL} (${gitBranch})`,
		emoji: '📥',
	});
}

/**
 * @param {Args} args 
 */
function writePackage(args) {
	// Read the package.json file and parse the contents as JSON.
	const contents = fs.readFileSync(tmpThemePkgPath, 'utf8');
	const data = JSON.parse(contents);
	// Configure the data.
	data.name = themeDirName;
	data.themeName = args.themeName;
	data.version = args.themeVersion;
	data.description = args.themeDescription;
	data.keywords = args.themeTags ? args.themeTags.split(',').map(function (tag) { return tag.trim(); }) : [];
	data.author = {
		name: args.themeAuthor,
		email: args.themeAuthorEmail,
		url: args.themeAuthorURI,
	};
	data.license = args.themeLicense;
	data.wordpress = {
		versionRequired: args.wpVersionRequired,
		versionTested: args.wpVersionTested,
	};
	data.bugs = {
		url: args.themeBugsURI,
	};
	data.homepage = args.themeURI;
	data.repository = {
		type: args.themeRepoType,
		url: args.themeRepoURI,
	};
	// Stringify the data and write it back to the package.json file.
	const newContents = JSON.stringify(data, null, '\t');
	fs.writeFileSync(tmpThemePkgPath, newContents, { encoding: 'utf8' });
	logInfo({
		title: 'Package written',
		description: tmpThemePkgPath.replace(tmpThemePath, ''),
		emoji: '🔨',
	});
}

/**
 * @param {Args} args 
 */
function replaceRename(args) {
	const ignoreDirs = [
		tmpThemeVscodeDirPath,
		tmpThemeGithubDirPath,
		tmpThemeLanguagesDirPath,
	];
	const ignoreFiles = [
		tmpThemePkgPath, 
		tmpThemeComposerPath, 
		tmpThemeWebpackConfigPath, 
		tmpThemeLicPath, 
		tmpThemeEditorConfigPath, 
		tmpThemeEslintConfigPath, 
		tmpThemeStylelintPath, 
		tmpThemePrettierIgnorePath, 
		tmpThemeGitIgnorePath, 
		tmpThemeNvmPath,
		tmpThemeReadmePath,
	];
	// Walk all directories and collect file paths.
	const files = walkDirectories(tmpThemePath);
	// Loop over each file path.
	files.forEach(file => {
		// Determine if the file should be ignored.
		const isIgnoredDir = (ignoreDirs.findIndex((dir) => file.startsWith(dir)) !== -1);
		const isIgnoredFile = ignoreFiles.includes(file);
		if (! isIgnoredDir && ! isIgnoredFile) {
			// Get the file name from the path.
			const fileName = path.basename(file);
			// If the file is a class file, rename the file.
			if (/class-wp-theme/g.test(fileName)) {
				const newFile = file.replace(fileName, fileName.replace(/class-wp-theme/g, 'class-' + changeCase.paramCase(args.classPrefix)));
				fs.renameSync(file, newFile);
				logInfo({
					title: 'File renamed',
					description: newFile.replace(tmpThemePath, ''),
					emoji: '🔨',
				});
				file = newFile;
			}
			// Read the content of the file and test it to see if it needs replacements.
			let content = fs.readFileSync(file, 'utf8');
			if (/WP Theme/g.test(content) || /WP_Theme/g.test(content) || /WP_THEME/g.test(content) || /wp-theme/g.test(content) || /wp_theme/g.test(content)) {
				// Run all replacemnets.
				content = content
					.replace(/WP Theme/g, args.themeName)
					.replace(/WP_THEME/g, args.constantPrefix.replace(/[^a-zA-Z\d]/g, '_'))
					.replace(/WP_Theme/g, args.classPrefix.replace(/[^a-zA-Z\d]/g, '_'))
					.replace(/wp-theme/g, themeDirName)
					.replace(/wp_theme/g, changeCase.snakeCase(args.functionPrefix));
				// Write the file contents back in place.
				fs.writeFileSync(file, content);
				logInfo({
					title: 'File built',
					description: file.replace(tmpThemePath, ''),
					emoji: '🔨',
				});
			}
		}
	});
}

/**
 * @param {string} slug 
 * @returns {Promise<GitHubLicense>}
 */
async function fetchLicense(slug) {
	const formattedSlug = encodeURIComponent(slug.toLowerCase());
	const response = await fetch(`https://api.github.com/licenses/${formattedSlug}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});
	switch (response.status) {
		case 200: {
			return response.json();
		}
		default: {
			throw new Error(`Couldn't fetch license from GitHub for "${formattedSlug}"`);
		}
	}
}

/**
 * @param {Args} args 
 */
async function writeLicense(args) {
	if (args.themeLicense === 'UNLICENSED') {
		fs.writeFileSync(tmpThemeLicPath, 'UNLICENSED', { encoding: 'utf8' });
	} else {
		const license = await fetchLicense(args.themeLicense);
		logInfo({
			title: 'License fetched',
			description: license.name,
			emoji: '📥',
		});
		fs.writeFileSync(tmpThemeLicPath, license.body, { encoding: 'utf8' });
	}
	logInfo({
		title: 'License written',
		description: tmpThemeLicPath.replace(tmpThemePath, ''),
		emoji: '📄',
	});
}

/**
 * @param {Args} args 
 */
function putPackage(args) {
	// Prepare the final theme path.
	const themePath = path.resolve(args.path, themeDirName);
	// Check if the directory exists already and throw an error if not to avoid
	// accidnetally removing important data on the machine.
	if (fs.existsSync(themePath)) throw new Error(`There is already a directory at "${themePath}"`);
	// Copy the final build from the tmp directory to the real directory and clean the tmp directory.
	fs.cpSync(tmpThemePath, themePath, { recursive: true, force: true });
	fs.rmSync(tmpPath, { recursive: true, force: true });
	logInfo({
		title: 'Theme copied',
		description: themePath,
		emoji: '🚀',
	});
}

/**
 * @param {Args} args 
 */
function initRepo(args) {
	const cwdCache = process.cwd();
	const themePath = path.resolve(args.path, themeDirName);
	try {
		// Switch on the repo type and initialize a git repo with
		// remote origin based on repo type.
		switch (args.themeRepoType) {
			case 'git': {
				process.chdir(themePath);
				// Initialize repository.
				execSync(`git init -b main`, { stdio: 'pipe' });
				logInfo({
					title: 'Repo initialized',
					description: `Repo type: "${args.themeRepoType}"`,
					emoji: '📁',
				});
				// Add remote origin.
				execSync(`git remote add origin ${args.themeRepoURI}`, { stdio: 'pipe' });
				logInfo({
					title: 'Remote repo added',
					description: args.themeRepoURI,
					emoji: '🔗',
				});
				// Add and commit all files.
				const stdoutCommit = execSync('git add . && git commit -m "Initial commit ― Theme scaffolded with @dreamsicle.io/create-wp-theme."', { stdio: 'pipe' });
				const stdoutCommitMessage = formatStdoutMessage('git-commit', stdoutCommit);
				logInfo({
					title: 'Initial files committed',
					description: stdoutCommitMessage,
					emoji: '💾',
				});
				break;
			}
			default: {
				logInfo({
					title: 'Skipping repo initialization',
					description: `Unsupported repo type: "${args.themeRepoType}"`,
					emoji: '❕',
				});
				break;
			}
		}
	} catch(error) {
		// We don't want Git errors to exit the process, so don't throw.
		// Instead, catch them and log them so the user is aware, while
		// allowing the process to continue.
		logError(error);
	} finally {
		// Return to the cached CWD.
		if (cwdCache !== process.cwd()) process.chdir(cwdCache);
	}
}

/**
 * @param {Args} args 
 */
function logSuccess(args) {
	// Prepare the final theme path.
	const themePath = path.resolve(args.path, themeDirName);
	const themePathRel = path.relative(process.cwd(), themePath);
	// Log information to the console.
	logInfo({
		title: `${args.themeName} created successfully`,
		description: themePathRel,
		emoji: '⚡',
		padding: 'both',
	});
	logInfo({
		title: 'What\'s next?',
		description: `Head over to the "${themeDirName}" directory to install dependencies and get started.`,
		emoji: '⚡',
		padding: 'bottom',
	});
	logInfo({ title: '>', description: `cd ${themePathRel}` });
	logInfo({ title: '>', description: 'nvm use' });
	logInfo({ title: '>', description: 'npm install' });
	logInfo({ title: '>', description: 'npm start' });
}

async function run() {
	try {
		const args = await processArgs();
		clonePackage();
		writePackage(args);
		replaceRename(args);
		await writeLicense(args);
		putPackage(args);
		initRepo(args);
		logSuccess(args);
	} catch(error) {
		logError(error);
	} finally {
		process.exit();
	}
}

run();
