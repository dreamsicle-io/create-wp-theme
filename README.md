# Create WP Theme

Create WP Theme is a node command line tool that will scaffold a new WordPress theme with an opinionated file structure and just the right amount of starter code to get a developer started building a modern WordPress theme. This package contains just the `npx @dreamsicle.io/create-wp-theme` command, all of the actual boilerplate code comes from [WP Theme Assets](https://github.com/dreamsicle-io/wp-theme-assets).

## Usage

Open a terminal, `cd` to the `/path/to/wordpress/wp-content/themes` directory of a local WordPress instance, and fire the `create-wp-theme` command.

```shell 
npx @dreamsicle.io/create-wp-theme [options] <file>
```

## Getting Started

All that is necessary to start using the tool is a single argument of `file`, which corresponds to a param-cased string that will serve as the theme directory, the WordPress text-domain, and the package name. This will also serve as regular expression to replace all instances of `wp-theme` in the cloned package files.

### 1. Run the `create-wp-theme` command

```shell
npx @dreamsicle.io/create-wp-theme my-theme
```

> **Note:** Change `my-theme` to the desired theme directory/text-domain.

### 2. Follow the prompts

Once the command has been run, and the tool finds that the directory is unique, The tool will walk through a set of prompts that can be filled out inorder to customize the output of the package. 

```shell
⚡ The following tool will help you configure your new theme. For each setting, set a value and hit "Enter" to continue.

Theme Name: (WP Theme)
Version: (0.0.1)
Template: ()
Theme URI: (https://github.com/example/wp-theme)
Theme Bugs URI: (https://github.com/example/wp-theme/issues)
Theme Repository URI: (git@github.com:example/wp-theme.git)
Theme Repository Type: (git)
Description: (This theme was generated using create-wp-theme.)
Author: (Example, INC.)
Author Email: (hello@example.com)
Author URI: (https://www.example.com)
License: (UNLICENSED)
Tags: (accessibility-ready, translation-ready)
WP Version Required: (6.0.0)
WP Version Tested: (6.0.0)
Function Prefix: (wp_theme)
Class Prefix: (WP_Theme)
Constant Prefix: (WP_THEME)
```

## Logging

The tool will log its progress and errors in the console, exiting on completion and fatal errors.

```shell
👍 Got it! Creating WP Theme...

💡 Arguments → {
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
  path: 'tests'
}

📥 Repo cloned https://github.com/dreamsicle-io/wp-theme-assets.git (master)
🔨 Package written \package.json
🔨 File built \404.php
🔨 File built \comments.php
🔨 File built \functions.php
🔨 File renamed \includes\class-wp-theme-assets.php
🔨 File built \includes\class-wp-theme-assets.php
🔨 File renamed \includes\class-wp-theme-backstage.php
🔨 File built \includes\class-wp-theme-backstage.php
🔨 File renamed \includes\class-wp-theme-seo.php
🔨 File built \includes\class-wp-theme-seo.php
🔨 File renamed \includes\class-wp-theme-setup.php
🔨 File built \includes\class-wp-theme-setup.php
🔨 File built \includes\template-tags.php
🔨 File built \partials\card.php
🔨 File built \partials\colophon.php
🔨 File built \partials\error.php
🔨 File built \partials\list.php
🔨 File built \partials\masthead.php
🔨 File built \phpcs.xml
🔨 File built \src\modules\scss\reset.scss
📄 License written \LICENSE
🚀 Theme copied C:\Users\noahm\source\repos\create-wp-theme\tests\wp-theme
📁 Repo initialized Repo type: "git"
🔗 Remote repo added git@github.com:example/wp-theme.git
💾 Initial files committed [main (root-commit) 9a6a10f] ― 54 files changed, 3504 insertions(+)

⚡ WP Theme created successfully tests\wp-theme

⚡ What's next? Head over to the "wp-theme" directory to install dependencies and get started.    

> cd tests\wp-theme
> nvm use
> npm install
> npm start
```

## Options

The tool offers several options that will serve as defaults for the tool's prompt. These options can be used to customize the default options of the tool allowing the developer to go through the prompts faster. Options provided via the CLI will not be prompted for in the terminal.

```shell 
npx @dreamsicle.io/create-wp-theme -X 1.0.0 -A Dreamsicle -E hello@dreamsicle.com -u https://www.dreamsicle.com my-theme
```

> **Note:** If the option value has spaces in it, wrap it in quotes. For example - `"Example, Inc"`.

**The above would set the defaults for the following prompts:**

```shell
Author: (Dreamsicle) 
Author Email: (hello@dreamsicle.com) 
Author URI: (https://www.dreamsicle.com)  
```

## Help 

To get help with the tool and to learn more about usage and the available options, use the `--help` or `-h` flag. This will output all help information available including how to use the command, option flags, option descriptions, and option defaults.

```shell
npx @dreamsicle.io/create-wp-theme --help
```

**The above would ouput the following help information:**

```shell
Usage: create-wp-theme [options] <file>

Options:
  -V, --version                     output the version number
  -N, --themeName <string>          The theme name (default: "WP Theme")
  -X, --themeVersion [string]       The theme version (default: "0.0.1")
  -T, --themeTemplate [string]      The parent theme if this is a child theme (default: "")
  -U, --themeURI [string]           The theme URI (default: "https://github.com/example/wp-theme")
  -B, --themeBugsURI [string]       The theme bugs URI (default: "https://github.com/example/wp-theme/issues")
  -R, --themeRepoURI [string]       The theme repository URI (default: "git@github.com:example/wp-theme.git") 
  -r, --themeRepoType [string]      The theme repository type (default: "git")
  -d, --themeDescription [string]   The theme description (default: "This theme was generated using create-wp-theme.")
  -A, --themeAuthor [string]        The theme author (default: "Example, INC.")
  -E, --themeAuthorEmail [string]   The theme author email (default: "hello@example.com")
  -u, --themeAuthorURI [string]     The theme author URI (default: "https://www.example.com")
  -L, --themeLicense [string]       The theme license as a valid SPDX expression (default: "UNLICENSED")      
  -t, --themeTags [string]          A CSV of WordPress theme tags (default: "accessibility-ready, translation-ready")
  -W, --wpVersionRequired [string]  The version of WordPress the theme requires (default: "6.0.0")
  -w, --wpVersionTested [string]    The version of WordPress the theme has been tested up to (default: "6.0.0")
  -F, --functionPrefix [string]     The prefix for PHP functions (default: "wp_theme")
  -C, --classPrefix [string]        The prefix for PHP classes (default: "WP_Theme")
  -c, --constantPrefix [string]     The prefix for PHP constants (default: "WP_THEME")
  -p, --path [string]               The path where the built theme directory will be placed. (default: "C:\\Users\\noahm\\source\\repos\\create-wp-theme")
  -h, --help                        display help for command
```

