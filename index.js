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
 * @property {string} themeRepoSSH
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
 * @property {string} wpEngineEnv
 * @property {string} path
 * @property {boolean} [failExternals]
 * @property {boolean} [verbose]
 */

/**
 * @typedef {object} OptionDef
 * @property {string} key
 * @property {string} alias
 * @property {'string' | 'boolean'} type
 * @property {string} title
 * @property {string} description
 * @property {string | boolean} [default]
 * @property {boolean} [isRequired]
 * @property {boolean} [isPrompted]
 * @property {(value: any, prevValue?: any) => any} [sanitize]
 */

/**
 * @typedef {object} LogMessage
 * @property {string} title
 * @property {string} [emoji]
 * @property {string} [description]
 * @property {string} [dataLabel]
 * @property {any} [data]
 * @property {'top' | 'bottom' | 'both'} [padding]
 * @property {boolean} [verbose]
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

// Replicate magic constants in ES module scope.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the path for the tool's package.json file.
const pkgPath = path.join(__dirname, 'package.json');

/**
 * Read the package.json file.
 * @type {Record<string, any>}
 */
const pkg = JSON.parse(fs.readFileSync(pkgPath, { encoding: 'utf8' }).toString());

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

// Construct license settings.
const licenseProvider = 'GitHub';
const licenseAPIEndpoint = 'https://api.github.com/licenses';
const licenseAPIDocsURL = 'https://docs.github.com/en/rest/licenses/licenses';

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
		sanitize: (value => {
			return zod.string().trim().safeParse(value).data || '';
		}),
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
			const text = zod.string().trim().safeParse(value).data || '';
			const version = semver.coerce(text);
			return semver.valid(version) || '';
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
			const text = zod.string().trim().safeParse(value).data || '';
			return kebabCase(text);
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
			return zod.string().trim().url().safeParse(value).data || '';
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
			return zod.string().trim().url().safeParse(value).data || '';
		},
	},
	{
		key: 'themeRepoURI',
		alias: 'R',
		type: 'string',
		title: 'Theme Repository URI',
		description: 'The theme repository HTTPS URI',
		default: 'https://github.com/example/wp-theme.git',
		isRequired: true,
		isPrompted: true,
		sanitize: (value => {
			return zod.string().trim().url().safeParse(value).data || '';
		}),
	},
	{
		key: 'themeRepoSSH',
		alias: 'S',
		type: 'string',
		title: 'Theme Repository SSH',
		description: 'The theme repository SSH URI',
		default: '',
		isRequired: false,
		isPrompted: true,
		sanitize: (value => {
			// Parse this is a string rather than a URL, because the
			// SSH URI format does not pass Zod URL validation.
			return zod.string().trim().safeParse(value).data || '';
		}),
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
		sanitize: (value => {
			return zod.string().trim().safeParse(value).data || '';
		}),
	},
	{
		key: 'themeDescription',
		alias: 'D',
		type: 'string',
		title: 'Description',
		description: 'The theme description',
		default: 'This theme was generated using create-wp-theme.',
		isRequired: true,
		isPrompted: true,
		sanitize: (value => {
			return zod.string().trim().safeParse(value).data || '';
		}),
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
		sanitize: (value => {
			return zod.string().trim().safeParse(value).data || '';
		}),
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
			return zod.string().trim().email().safeParse(value).data || '';
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
			return zod.string().trim().url().safeParse(value).data || '';
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
		sanitize: (value => {
			return zod.string().trim().safeParse(value).data || '';
		}),
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
			const array = zod.string().trim().safeParse(value).data?.split(',') || [];
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
			const text = zod.string().trim().safeParse(value).data || '';
			const version = semver.coerce(text);
			return semver.valid(version) || '';
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
			const text = zod.string().trim().safeParse(value).data || '';
			const version = semver.coerce(text);
			return semver.valid(version) || '';
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
			const text = zod.string().trim().safeParse(value).data || '';
			return snakeCase(text);
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
			const text = zod.string().trim().safeParse(value).data || '';
			return pascalSnakeCase(text);
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
			const text = zod.string().trim().safeParse(value).data || '';
			return constantCase(text);
		},
	},
	{
		key: 'wpEngineEnv',
		alias: 'e',
		type: 'string',
		title: 'WP Engine Environment',
		description: 'The name of the WP Engine environment to deploy to',
		default: 'wpthemedev',
		isRequired: true,
		isPrompted: true,
		sanitize: (value => {
			return zod.string().trim().safeParse(value).data || '';
		}),
	},
	{
		key: 'path',
		alias: 'P',
		type: 'string',
		title: 'Path',
		description: 'The path where the built theme directory will be placed',
		default: process.cwd(),
		isRequired: true,
		isPrompted: false,
		sanitize: (value => {
			return zod.string().trim().safeParse(value).data || '';
		}),
	},
	{
		key: 'failExternals',
		alias: 'f',
		type: 'boolean',
		title: 'Fail Externals',
		description: 'Exit on errors from external calls like license fetching and git initializations',
		default: false,
		isRequired: false,
		isPrompted: false,
	},
	{
		key: 'verbose',
		alias: 'v',
		type: 'boolean',
		title: 'Verbose',
		description: 'Output extra information to the console',
		default: false,
		isRequired: false,
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
		const text = zod.string().trim().toLowerCase().safeParse(value).data || '';
		return kebabCase(text);
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
	let { title, description, emoji, data, dataLabel, padding, verbose } = message;
	const hasData = (data && verbose);
	/** 
	 * Construct the text.
	 * @type {string}
	 */
	let text = chalk.bold.green(title);
	if (description) text += ` ${chalk.dim('―')} ${description}`;
	if (emoji) text = `${emoji} ${text}`;
	// Add padding.
	if ((padding === 'top') || (padding === 'both')) text = `\n${text}`;
	if (((padding === 'bottom') || (padding === 'both')) && ! hasData) text = `${text}\n`;
	/** 
	 * Construct the params array.
	 * @type {any[]}
	 */
	let params = [text];
	// Construct the data.
	if (hasData) params.push(...[`\n\n💡 ${chalk.bold.cyan(dataLabel || 'Data')} →`, data, '\n']);
	console.info(...params);
}

/**
 * @param {unknown} error 
 * @param {boolean} [verbose] 
 */
function logError(error, verbose) {
	/**
	 * @type {Error}
	 */
	const errorInstance = (error instanceof Error) ? error : new Error((typeof error === 'string') ? error : 'An unknown error has occurred');
	if (verbose) {
		console.error(chalk.bold.redBright(`\n❌ Error: ${errorInstance.message}\n\n`), errorInstance, '\n');
	} else {
		console.error(chalk.bold.redBright(`\n❌ Error: ${errorInstance.message}\n`));
	}
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
		validate();
		await runPrompt();
		clonePackage();
		writePackage();
		replaceRename();
		await writeLicense();
		putPackage();
		initRepo();
		logSuccess();
	} catch(error) {
		logError(error, options.verbose);
	} finally {
		process.exit();
	}
}

function validate() {
	// Validate that the configured theme path does not exist.
	if (fs.existsSync(themePath)) throw new Error(`There is already a directory at "${themePath}"`);
}

async function runPrompt() {
	// Prepare the relative theme path.
	const relPath = path.relative(process.cwd(), themePath);
	// Determine if any of the options should be prompted for by filtering 
	// the option definitions for those that are marked as `isPrompted`,
	// and don't already have a value provided by the user.
	const promptedOptionDefs = optionDefs.filter((optionDef) => {
		// Determine if the option has already been set by the user.
		// Possible options value sources: `default`, `env`, `config`, `cli`.
		const isUserProvided = ['env', 'cli'].includes(program.getOptionValueSource(optionDef.key));
		return (optionDef.isPrompted && ! isUserProvided);
	});
	// If there are no options to prompt for, skip the prompt.
	if (promptedOptionDefs.length < 1) {
		logInfo({
			title: 'Creating theme',
			description: `Creating "${options.themeName}" in ${relPath}`,
			emoji: '⚡',
			padding: 'bottom',
			verbose: options.verbose,
			dataLabel: 'Options',
			data: options,
		});
		return;
	}
	// Clear the console.
	console.clear();
	// Introduce the prompt and log the pre-processed data for debugging.
	logInfo({
		title: 'Let\'s get started',
		description: `This tool will guide you through configuring your theme.\nFor each prompt, set a value and hit "ENTER" to continue. To exit early, hit\n"CMD+C" on Mac, or "CTRL+C" on Windows. For help, run the command with the "-h"\nor "--help" flags to output the tool's help information. If you need to log or\nview issues, visit ${pkg.bugs.url}.`,
		emoji: '⚡',
		padding: 'both',
		verbose: options.verbose,
		dataLabel: 'Initial options',
		data: options,
	});
	await co(function* () {
		// Loop over the prompted option definitions and prompt the user for values.
		// Note this cannot be a `forEach()` loop, because `yield` can only be
		// used inside of a `for` loop.
		for (const optionDef of promptedOptionDefs) {
			// Construct the prompt message.
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
	});
	// Confirm prompt completion and log the post-processed data for debugging.
	logInfo({
		title: 'Got it!',
		description: `Creating "${options.themeName}" in ${relPath}`,
		emoji: '👍',
		padding: 'both',
		verbose: options.verbose,
		dataLabel: 'Updated options',
		data: options,
	});
}

function clonePackage() {
	logInfo({
		title: 'Cloning package',
		description: `${gitURL} (${gitBranch})`,
		emoji: '⏳',
		verbose: options.verbose,
		dataLabel: 'Package information',
		data: {
			source: gitURL,
			destination: tmpPath,
			branch: gitBranch,
		},
	});
	// Clean out the tmp directory.
	fs.rmSync(tmpPath, { recursive: true, force: true });
	// Clone the repo into the tmp directory. Because the `stdio` of this execSync
	// call shows progress, we can't just print the `stdout` buffer with `pipe`. Instead,
	// inherit `stdio` so that the messages flow through to the console if `verbose`
	// option is set.
	execSync(`git clone -b ${gitBranch} ${gitURL} ${tmpPath}`, { stdio: options.verbose ? 'inherit' : 'ignore' });
	const clonedFiles = walkDirectories(tmpThemePath).map((file) => path.relative(tmpThemePath, file));
	logInfo({
		title: 'Package cloned',
		description: `${clonedFiles.length} files cloned`,
		emoji: '📥',
		dataLabel: 'Cloned files',
		padding: options.verbose ? 'top' : undefined,
		verbose: options.verbose,
		data: clonedFiles,
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
	data.wpEngine = {
		env: options.wpEngineEnv,
	};
	// Stringify the data and write it back to the package.json file.
	const newContents = JSON.stringify(data, null, '\t');
	fs.writeFileSync(tmpThemePkgPath, newContents, { encoding: 'utf8' });
	logInfo({
		title: 'Package written',
		description: path.relative(tmpThemePath, tmpThemePkgPath),
		emoji: '🔨',
		verbose: options.verbose,
		dataLabel: 'Package data',
		data: data,
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
	/**
	 * Initialize an array of renamed files for logging.
	 * @type {string[]}
	 */
	const renamedFiles = [];
	/**
	 * Initialize an array of built files for logging.
	 * @type {string[]}
	 */
	const builtFiles = [];
	// Loop over each file path.
	files.forEach(file => {
		// Determine if the file should be ignored.
		const isIgnoredDir = (ignoreDirs.findIndex((dir) => file.startsWith(dir)) !== -1);
		const isIgnoredFile = ignoreFiles.includes(file);
		if (! isIgnoredDir && ! isIgnoredFile) {
			// Get the file name from the path.
			const fileName = path.basename(file);
			// Format the class file name replacement. This is used when renaming the
			// class files, as well as in content when the class files are referenced.
			const classFileNameReplacement = `class-${kebabCase(options.classPrefix)}`;
			// If the file is a class file, rename the file.
			if (/class-wp-theme/g.test(fileName)) {
				const newFile = file.replace(fileName, fileName.replace(/class-wp-theme/g, classFileNameReplacement));
				fs.renameSync(file, newFile);
				file = newFile;
				renamedFiles.push(path.relative(tmpThemePath, file));
			}
			// Read the content of the file and test it to see if it needs replacements.
			let content = fs.readFileSync(file, { encoding: 'utf8' });
			if (/WP Theme/g.test(content) || /WP_Theme/g.test(content) || /WP_THEME/g.test(content) || /wp_theme/g.test(content) || /class-wp-theme/g.test(content) || /wp-theme/g.test(content)) {
				// Run all replacemnets.
				content = content
					.replace(/WP Theme/g, options.themeName)
					.replace(/WP_THEME/g, options.constantPrefix)
					.replace(/WP_Theme/g, options.classPrefix)
					.replace(/wp_theme/g, options.functionPrefix)
					// Make sure the `class-wp-theme` replacement happens before
					// the `wp-theme` replacement since the latter exists in the former.
					.replace(/class-wp-theme/g, classFileNameReplacement)
					.replace(/wp-theme/g, themeKey);
				// Write the file contents back in place.
				fs.writeFileSync(file, content);
				builtFiles.push(path.relative(tmpThemePath, file));
			}
		}
	});
	const renamedMessage = (renamedFiles.length === 1) ? `${renamedFiles.length} file renamed` : `${renamedFiles.length} files renamed`;
	const builtMessage = (builtFiles.length === 1) ? `${builtFiles.length} file built` : `${builtFiles.length} files built`;
	logInfo({
		title: 'Files built',
		description: `${renamedMessage}, ${builtMessage}`,
		emoji: '🔨',
		verbose: options.verbose,
		dataLabel: 'Modified files',
		data: {
			renamed: renamedFiles,
			built: builtFiles,
		},
	});
}

/**
 * @param {string} slug 
 * @returns {Promise<GitHubLicense>}
 */
async function fetchLicense(slug) {
	const formattedSlug = encodeURIComponent(slug.toLowerCase());
	const response = await fetch(`${licenseAPIEndpoint}/${formattedSlug}`, {
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
	try {
		if (options.themeLicense === 'UNLICENSED') {
			// If `UNLICENSED` write the file with only `UNLICENSED` as its content.
			fs.writeFileSync(tmpThemeLicPath, 'UNLICENSED', { encoding: 'utf8' });
		} else {
			// Let the user know we are fetching the license asynchronously, in case
			// the API takes a while to respond.
			logInfo({
				title: 'Fetching license',
				description: `Fetching license for SPDX ID: "${options.themeLicense}"`,
				emoji: '⏳',
				verbose: options.verbose,
				dataLabel: 'Request information',
				data: {
					spdx: options.themeLicense,
					provider: licenseProvider,
					endpoint: licenseAPIEndpoint,
					documentation: licenseAPIDocsURL,
				},
			});
			// Fetch the license from GitHub.
			const license = await fetchLicense(options.themeLicense);
			logInfo({
				title: 'License fetched',
				description: license.name,
				emoji: '📥',
				verbose: options.verbose,
				dataLabel: 'License information',
				data: {
					name: license.name,
					spdx: license.spdx_id,
					url: license.html_url,
					api: license.url,
				},
			});
			// Write the license content.
			fs.writeFileSync(tmpThemeLicPath, license.body, { encoding: 'utf8' });
		}
		// Log license generation success.
		logInfo({
			title: 'License written',
			description: path.relative(tmpThemePath, tmpThemeLicPath),
			emoji: '📄',
		});
	} catch (error) {
		// If `failExternals` option is true, throw an error. If it's false, we don't
		// want license errors to exit the process, so don't throw. Instead, catch them
		// and log them so the user is aware, while allowing the process to continue.
		if (options.failExternals) {
			throw (error instanceof Error) ? error : new Error('Couldn\'t write license');
		} else {
			logError(error, options.verbose);
		}
	}
}

function putPackage() {
	// Double check if the directory exists already and throw an error if not to
	// avoid accidentally removing important data on the machine.
	if (fs.existsSync(themePath)) throw new Error(`There is already a directory at "${themePath}"`);
	// Copy the final build from the tmp directory to the real directory and clean the tmp directory.
	fs.cpSync(tmpThemePath, themePath, { recursive: true, force: true });
	fs.rmSync(tmpPath, { recursive: true, force: true });
	// Log success.
	logInfo({
		title: 'Theme relocated',
		description: path.relative(process.cwd(), themePath),
		emoji: '📚',
		verbose: options.verbose,
		dataLabel: 'Theme files',
		data: walkDirectories(themePath).map((file) => path.relative(themePath, file)),
	});
}

function initGitRepo() {
	// Initialize git repository.
	const stdoutInit = execSync(`git init -b main`, { stdio: 'pipe' });
	logInfo({
		title: 'Repo initialized',
		description: `Repo type: "${options.themeRepoType}"`,
		emoji: '📁',
		verbose: options.verbose,
		dataLabel: 'Init response',
		data: stdoutInit.toString().trim(),
	});
	// Add remote origin.
	const remoteOrigin = options.themeRepoSSH || options.themeRepoURI;
	const stdoutAddRemote = execSync(`git remote add origin ${remoteOrigin}`, { stdio: 'pipe' });
	logInfo({
		title: 'Remote repo added',
		description: remoteOrigin,
		emoji: '🔗',
		verbose: options.verbose,
		dataLabel: 'Add remote response',
		data: stdoutAddRemote.toString().trim(),
	});
	// Add and commit all files.
	const stdoutCommit = execSync('git add . && git commit -m "Initial commit ― Theme scaffolded with @dreamsicle.io/create-wp-theme."', { stdio: 'pipe' });
	const stdoutCommitMessage = formatStdoutMessage('git-commit', stdoutCommit);
	logInfo({
		title: 'Initial files committed',
		description: stdoutCommitMessage,
		emoji: '💾',
		verbose: options.verbose,
		dataLabel: 'Commit response',
		data: stdoutCommit.toString().trim(),
	});
	// For the built in GitHub workflows, the included shell script responsible
	// for setting the environment needs the correct permissions to be able to run.
	// We can do this silently since we cannot be sure the user is using GitHub.
	execSync('git update-index --chmod=+x .github/workflows/scripts/env.sh', { stdio: 'ignore' });
}

function initRepo() {
	// Cache the current working directory and change
	// working directory to the theme path. At the end of repo
	// initialization, or on error, the process will be moved
	// back to the cached current working directory (cwd).
	const cwd = process.cwd();
	process.chdir(themePath);
	try {
		// Switch on the repo type and initialize a repo with remote origin.
		// Note that by this time, we have moved the process from the current
		// working directory into the theme, and the theme has already been 
		// moved to its final location.
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
		// Return the process back to the cached working directory.
		process.chdir(cwd);
	} catch (error) {
		// Return the process back to the cached working directory. Make sure
		// this happens before the error is thrown to ensure it returns no matter what.
		process.chdir(cwd);
		// If `failExternals` option is true, throw an error. If it's false, we don't
		// want repo init errors to exit the process, so don't throw. Instead, catch them
		// and log them so the user is aware, while allowing the process to continue.
		if (options.failExternals) {
			throw (error instanceof Error) ? error : new Error('Couldn\'t initialize repository');
		} else {
			logError(error, options.verbose);
		}
	}
}

function logSuccess() {
	// Prepare the relative theme path.
	const relPath = path.relative(process.cwd(), themePath);
	// Log information to the console.
	logInfo({
		title: `Theme created`,
		description: `Created "${options.themeName}" in ${relPath}`,
		emoji: '🚀',
		padding: 'both',
	});
	logInfo({
		title: 'What\'s next?',
		description: `Head over to your new theme directory to install dependencies\nand start cooking something up! If we've initialized a repository for you, we\ncommited the initial files and added a remote origin, but we didn't push\nupstream. It's also a good idea to check your LICENSE file to fill out any\nplaceholders that may be in the text. ${chalk.bold('Now, go build something beautiful.')}`,
		emoji: '⚡',
		padding: 'bottom',
	});
	logInfo({ title: '>', description: `cd ${relPath.replace(/\\+/g, '/')}` });
	logInfo({ title: '>', description: 'nvm use' });
	logInfo({ title: '>', description: 'npm install' });
	logInfo({ title: '>', description: 'npm start' });
}
