#!/usr/bin/env node
// @ts-check

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { constantCase, kebabCase, pascalSnakeCase, snakeCase } from 'change-case';
import semver from 'semver';
import zod from 'zod';
import chalk from 'chalk';
import co from 'co';
import prompt from 'co-prompt';
import { Command } from 'commander';

/**
 * @typedef {object} Options
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
 * @typedef {object} OptionDef
 * @property {string} key
 * @property {string} alias
 * @property {string} type
 * @property {string} title
 * @property {string} description
 * @property {string} [default]
 * @property {boolean} [isRequired]
 * @property {boolean} [isPrompted]
 * @property {(value: any, prevValue?: any) => any} [sanitize]
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
 * Read the package.json file.
 * @type {Record<string, any>}
 */
const pkg = JSON.parse(fs.readFileSync(path.resolve('./package.json'), { encoding: 'utf8' }).toString());

// Replicate magic constants in ES module scope.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Construct repo settings.
const gitURL = 'https://github.com/dreamsicle-io/wp-theme-assets.git';
const gitBranch = 'master';

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
		isPrompted: true,
	},
	{
		key: 'themeVersion',
		alias: 'X',
		type: 'string',
		title: 'Version',
		description: 'The theme version',
		default: '0.0.1',
		isRequired: true,
		isPrompted: true,
		sanitize: (value) => {
			return semver.clean(value) || '';
		},
	},
	{
		key: 'themeTemplate',
		alias: 'T',
		type: 'string',
		title: 'Template',
		description: 'The parent theme if this is a child theme',
		default: '',
		isRequired: false,
		isPrompted: true,
		sanitize: (value) => {
			return kebabCase(value);
		},
	},
	{
		key: 'themeURI',
		alias: 'U',
		type: 'string',
		title: 'Theme URI',
		description: 'The theme URI',
		default: 'https://github.com/example/wp-theme',
		isRequired: true,
		isPrompted: true,
		sanitize: (value) => {
			return zod.string().url().safeParse(value).data || '';
		},
	},
	{
		key: 'themeBugsURI',
		alias: 'B',
		type: 'string',
		title: 'Theme Bugs URI',
		description: 'The theme bugs URI',
		default: 'https://github.com/example/wp-theme/issues',
		isRequired: true,
		isPrompted: true,
		sanitize: (value) => {
			return zod.string().url().safeParse(value).data || '';
		},
	},
	{
		key: 'themeRepoURI',
		alias: 'R',
		type: 'string',
		title: 'Theme Repository URI',
		description: 'The theme repository URI',
		default: 'git@github.com:example/wp-theme.git',
		isRequired: true,
		isPrompted: true,
	},
	{
		key: 'themeRepoType',
		alias: 'r',
		type: 'string',
		title: 'Theme Repository Type',
		description: 'The theme repository type',
		default: 'git',
		isRequired: true,
		isPrompted: true,
	},
	{
		key: 'themeDescription',
		alias: 'd',
		type: 'string',
		title: 'Description',
		description: 'The theme description',
		default: 'This theme was generated using create-wp-theme.',
		isRequired: true,
		isPrompted: true,
	},
	{
		key: 'themeAuthor',
		alias: 'A',
		type: 'string',
		title: 'Author',
		description: 'The theme author',
		default: 'Example, INC.',
		isRequired: true,
		isPrompted: true,
	},
	{
		key: 'themeAuthorEmail',
		alias: 'E',
		type: 'string',
		title: 'Author Email',
		description: 'The theme author email',
		default: 'hello@example.com',
		isRequired: true,
		isPrompted: true,
		sanitize: (value) => {
			return zod.string().email().safeParse(value).data || '';
		},
	},
	{
		key: 'themeAuthorURI',
		alias: 'u',
		type: 'string',
		title: 'Author URI',
		description: 'The theme author URI',
		default: 'https://www.example.com',
		isRequired: true,
		isPrompted: true,
		sanitize: (value) => {
			return zod.string().url().safeParse(value).data || '';
		},
	},
	{
		key: 'themeLicense',
		alias: 'L',
		type: 'string',
		title: 'License',
		description: 'The theme license as a valid SPDX expression',
		default: 'UNLICENSED',
		isRequired: true,
		isPrompted: true,
	},
	{
		key: 'themeTags',
		alias: 't',
		type: 'string',
		title: 'Tags',
		description: 'A CSV of WordPress theme tags',
		default: 'accessibility-ready,translation-ready',
		isRequired: false,
		isPrompted: true,
		sanitize: (value) => {
			const array = zod.string().safeParse(value).data?.split(',') || [];
			const clean = array.map((item) => kebabCase(item.trim()));
			return clean.toString();
		},
	},
	{
		key: 'wpVersionRequired',
		alias: 'W',
		type: 'string',
		title: 'WP Version Required',
		description: 'The version of WordPress the theme requires',
		default: '6.0.0',
		isRequired: true,
		isPrompted: true,
		sanitize: (value) => {
			return semver.clean(value) || '';
		},
	},
	{
		key: 'wpVersionTested',
		alias: 'w',
		type: 'string',
		title: 'WP Version Tested',
		description: 'The version of WordPress the theme has been tested up to',
		default: '6.0.0',
		isRequired: true,
		isPrompted: true,
		sanitize: (value) => {
			return semver.clean(value) || '';
		},
	},
	{
		key: 'functionPrefix',
		alias: 'F',
		type: 'string',
		title: 'Function Prefix',
		description: 'The prefix for PHP functions',
		default: 'wp_theme',
		isRequired: true,
		isPrompted: true,
		sanitize: (value) => {
			return snakeCase(value);
		},
	},
	{
		key: 'classPrefix',
		alias: 'C',
		type: 'string',
		title: 'Class Prefix',
		description: 'The prefix for PHP classes',
		default: 'WP_Theme',
		isRequired: true,
		isPrompted: true,
		sanitize: (value) => {
			return pascalSnakeCase(value);
		},
	},
	{
		key: 'constantPrefix',
		alias: 'c',
		type: 'string',
		title: 'Constant Prefix',
		description: 'The prefix for PHP constants',
		default: 'WP_THEME',
		isRequired: true,
		isPrompted: true,
		sanitize: (value) => {
			return constantCase(value);
		},
	},
	{
		key: 'path',
		alias: 'p',
		type: 'string',
		title: 'Path',
		description: 'The path where the built theme directory will be placed',
		default: process.cwd(),
		isRequired: true,
		isPrompted: false,
	},
];

/**
 * Options are initialized in the `program.action()`.
 * @type {Options}
 */
let options;

/**
 * The `themeKey` is a kebab-cased key, taken from the directory name, that is
 * used as the package name, the theme's textdomain, and in text replacements.
 * @type {string}
 */
let themeKey;

/**
 * The `themePath` is a resolved directory path, pointing to the desired install
 * directory by joining the `path` option with the `dir` argument.
 * @type {string}
 */
let themePath;

// Construct the program.
const program = new Command();
program.name('create-wp-theme');
program.description(pkg.description);
program.version(pkg.version);

// Define program arguments.
program.argument(
	'<dir>',
	'The name of the theme directory to create (example: "my-theme")',
	(value) => {
		return kebabCase(value) || '';
	}
);

// Define program options.
optionDefs.forEach((optionDef) => {
	const type = optionDef.isRequired ? `<${optionDef.type}>` : `[${optionDef.type}]`;
	const flags = `-${optionDef.alias}, --${optionDef.key} ${type}`;
	if (optionDef.sanitize) {
		program.option(flags, optionDef.description, optionDef.sanitize, optionDef.default);
	} else {
		program.option(flags, optionDef.description, optionDef.default);
	}
});

// Define the program action.
program.action((dir, opts) => {
	// Initialize args and options.
	options = { ...opts };
	themeKey = dir;
	themePath = path.resolve(options.path, dir);
	// Prompt the user and create the theme.
	create();
});

// Parse the CLI options and store them in the program.
program.parse(process.argv);

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

async function create() {
	try {
		await runPrompt();
		clonePackage();
		writePackage();
		replaceRename();
		await writeLicense();
		putPackage();
		initRepo();
		logSuccess();
	} catch(error) {
		logError(error);
	} finally {
		process.exit();
	}
}

async function runPrompt() {
	// Introduce the prompt and log the pre-processed data for debugging.
	logInfo({
		title: 'The following tool will help you configure your new theme.',
		description: 'For each setting, set a value and hit "Enter" to continue.',
		emoji: '⚡',
		padding: 'bottom',
		dataLabel: 'Initial options',
		// data: options,
	});
	await co(function* () {
		// Loop over the option definitions and prompt if not set through the CLI.
		// Note this cannot be a `forEach()` loop, because `yield` can only be
		// used inside of a `for` loop.
		for (const optionDef of optionDefs) {
			// If the option matches its default, we can safely assume it was
			// not passed from the CLI, and we should prompt for it. Also check
			// if the option definition marks the option as `isPrompted`.
			if (optionDef.isPrompted && (options[optionDef.key] === optionDef.default)) {
				const promptMessage = `${chalk.bold.cyanBright(optionDef.title + ':')} ${chalk.dim('(' + options[optionDef.key] + ')')} `;
				/**
				 * If there is a prompt value for this option, set it. If not,
				 * use the program option. Sanitize again here because the prompt
				 * values have not been sanitized yet.
				 * @type {string}
				 */
				const promptValue = yield prompt(promptMessage);
				if (promptValue) options[optionDef.key] = optionDef.sanitize ? optionDef.sanitize(promptValue) : promptValue;
			}
		}
	});
	// Confirm prompt completion and log the post-processed data for debugging.
	logInfo({
		title: 'Got it!',
		description: `Creating "${options.themeName}" in ${path.relative(process.cwd(), themePath)}`,
		emoji: '👍',
		padding: 'both',
		dataLabel: 'Updated options',
		// data: options,
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

function writePackage() {
	// Read the package.json file and parse the contents as JSON.
	const contents = fs.readFileSync(tmpThemePkgPath, { encoding: 'utf8' });
	const data = JSON.parse(contents);
	// Configure the data.
	data.name = themeKey;
	data.themeName = options.themeName;
	data.version = options.themeVersion;
	data.description = options.themeDescription;
	data.keywords = options.themeTags?.split(',');
	data.author = {
		name: options.themeAuthor,
		email: options.themeAuthorEmail,
		url: options.themeAuthorURI,
	};
	data.license = options.themeLicense;
	data.wordpress = {
		versionRequired: options.wpVersionRequired,
		versionTested: options.wpVersionTested,
	};
	data.bugs = {
		url: options.themeBugsURI,
	};
	data.homepage = options.themeURI;
	data.repository = {
		type: options.themeRepoType,
		url: options.themeRepoURI,
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

function replaceRename() {
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
				const newFile = file.replace(fileName, fileName.replace(/class-wp-theme/g, `class-${kebabCase(options.classPrefix)}`));
				fs.renameSync(file, newFile);
				logInfo({
					title: 'File renamed',
					description: newFile.replace(tmpThemePath, ''),
					emoji: '🔨',
				});
				file = newFile;
			}
			// Read the content of the file and test it to see if it needs replacements.
			let content = fs.readFileSync(file, { encoding: 'utf8' });
			if (/WP Theme/g.test(content) || /WP_Theme/g.test(content) || /WP_THEME/g.test(content) || /wp-theme/g.test(content) || /wp_theme/g.test(content)) {
				// Run all replacemnets.
				content = content
					.replace(/WP Theme/g, options.themeName)
					.replace(/WP_THEME/g, options.constantPrefix)
					.replace(/WP_Theme/g, options.classPrefix)
					.replace(/wp-theme/g, themeKey)
					.replace(/wp_theme/g, options.functionPrefix);
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

async function writeLicense() {
	if (options.themeLicense === 'UNLICENSED') {
		fs.writeFileSync(tmpThemeLicPath, 'UNLICENSED', { encoding: 'utf8' });
	} else {
		const license = await fetchLicense(options.themeLicense);
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

function putPackage() {
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

function initGitRepo() {
	// Cache the current working directory and change
	// working directory to the theme path.
	const cwd = process.cwd();
	process.chdir(themePath);
	// Initialize repository.
	execSync(`git init -b main`, { stdio: 'pipe' });
	logInfo({
		title: 'Repo initialized',
		description: `Repo type: "${options.themeRepoType}"`,
		emoji: '📁',
	});
	// Add remote origin.
	execSync(`git remote add origin ${options.themeRepoURI}`, { stdio: 'pipe' });
	logInfo({
		title: 'Remote repo added',
		description: options.themeRepoURI,
		emoji: '🔗',
	});
	// Add and commit all files.
	const stdout = execSync('git add . && git commit -m "Initial commit ― Theme scaffolded with @dreamsicle.io/create-wp-theme."', { stdio: 'pipe' });
	const stdoutMessage = formatStdoutMessage('git-commit', stdout);
	logInfo({
		title: 'Initial files committed',
		description: stdoutMessage,
		emoji: '💾',
	});
	// Return the process back to the original working directory.
	process.chdir(cwd);
}

function initRepo() {
	try {
		// Switch on the repo type and initialize a git repo with
		// remote origin based on repo type.
		switch (options.themeRepoType) {
			case 'git': {
				initGitRepo();
				break;
			}
			default: {
				logInfo({
					title: 'Skipping repo initialization',
					description: `Unsupported repo type: "${options.themeRepoType}"`,
					emoji: '❕',
				});
				break;
			}
		}
	} catch (error) {
		// We don't want Git errors to exit the process, so don't throw.
		// Instead, catch them and log them so the user is aware, while
		// allowing the process to continue.
		logError(error);
	}
}

function logSuccess() {
	// Prepare the final theme path.
	const relDir = path.relative(process.cwd(), themePath);
	// Log information to the console.
	logInfo({
		title: `${options.themeName} created successfully`,
		description: 'TODO: this message.',
		emoji: '🚀',
		padding: 'both',
	});
	logInfo({
		title: 'What\'s next?',
		description: `Head over to the "${themePath}" directory to install dependencies and get started.`,
		emoji: '⚡',
		padding: 'bottom',
	});
	logInfo({ title: '>', description: `cd ${relDir.replace(/\\+/g, '/')}` });
	logInfo({ title: '>', description: 'nvm use' });
	logInfo({ title: '>', description: 'npm install' });
	logInfo({ title: '>', description: 'npm start' });
}
