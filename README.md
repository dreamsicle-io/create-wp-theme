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

```
⚡ Let's get started ― This tool will guide you through configuring your theme.
For each prompt, set a value and hit "ENTER" to continue. To exit early, hit
"CMD+C" on Mac, or "CTRL+C" on Windows. For help, run "create-wp-theme -h" to
output the tool's help information. If you need to log or view issues, visit
https://github.com/dreamsicle-io/create-wp-theme/issues.

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
Tags: (accessibility-ready,translation-ready) 
WP Version Required: (6.0.0) 
WP Version Tested: (6.0.0) 
Function Prefix: (wp_theme) 
Class Prefix: (WP_Theme) 
Constant Prefix: (WP_THEME)
```

## Logging

The tool will log its progress and errors in the console, exiting on completion and fatal errors.

```
👍 Got it! ― Creating "WP Theme" in tests\wp-theme

📥 Cloning package ― https://github.com/dreamsicle-io/wp-theme-assets.git (master)
📥 Package cloned ― 54 files cloned
🔨 Package written ― package.json
🔨 Files built ― 4 files renamed, 15 files built
📥 License fetched ― GNU General Public License v3.0
📄 License written ― LICENSE
📚 Theme relocated ― tests\wp-theme
📁 Repo initialized ― Repo type: "git"
🔗 Remote repo added ― git@github.com:example/wp-theme.git
💾 Initial files committed ― [main (root-commit) 0d70104] ― 54 files changed, 4177 insertions(+)

🚀 Theme created ― Created "WP Theme" in tests\wp-theme

⚡ What's next? ― Head over to your new theme directory to install dependencies
and start cooking something up! If we've initialized a repository for you, we
commited the initial files and added a remote origin, but we didn't push
upstream. It's also a good idea to check your LICENSE file to fill out any
placeholders that may be in the text. Now, go build something beautiful.

> ― cd tests/wp-theme
> ― nvm use
> ― npm install
> ― npm start
```

## Options

The tool offers several options that will serve as defaults for the tool's prompt. These options can be used to customize the default options of the tool allowing the developer to go through the prompts faster. Options provided via the CLI will not be prompted for in the terminal. To see a list of all available options and their aliases, jump to the [Help](#help) section.

```shell 
npx @dreamsicle.io/create-wp-theme -A Dreamsicle -E hello@dreamsicle.com -u https://www.dreamsicle.com my-theme
```

> **Note:** If the option value has spaces in it, wrap it in quotes. For example - `"Example, INC."`.

**The above would set the following options:**

```
themeAuthor:      Dreamsicle
themeAuthorEmail: hello@dreamsicle.com
themeAuthorURI:   https://www.dreamsicle.com
```

## Help 

To get help with the tool and to learn more about usage and the available options, use the `--help` or `-h` flag. This will output all help information available including how to use the command, arguments, option flags, option descriptions, and option defaults.

```shell
npx @dreamsicle.io/create-wp-theme --help
```

**The above would ouput the following help information:**

```
Usage: create-wp-theme [options] <dir>

A command line tool for creating modern, optimized WordPress themes.

Arguments:
  dir                               The name of the theme directory to create (example: "wp-theme")

Options:
  -V, --version                     output the version number
  -N, --themeName <string>          The theme name (default: "WP Theme")
  -X, --themeVersion <string>       The theme version (default: "0.0.1")
  -T, --themeTemplate [string]      The parent theme if this is a child theme (default: "")
  -U, --themeURI <string>           The theme URI (default: "https://github.com/example/wp-theme")
  -B, --themeBugsURI <string>       The theme bugs URI (default: "https://github.com/example/wp-theme/issues")
  -R, --themeRepoURI <string>       The theme repository URI (default: "git@github.com:example/wp-theme.git")
  -r, --themeRepoType <string>      The theme repository type (default: "git")
  -d, --themeDescription <string>   The theme description (default: "This theme was generated using create-wp-theme.")
  -A, --themeAuthor <string>        The theme author (default: "Example, INC.")
  -E, --themeAuthorEmail <string>   The theme author email (default: "hello@example.com")
  -u, --themeAuthorURI <string>     The theme author URI (default: "https://www.example.com")
  -L, --themeLicense <string>       The theme license as a valid SPDX expression (default: "UNLICENSED")
  -t, --themeTags [string]          A CSV of WordPress theme tags (default: "accessibility-ready,translation-ready")
  -W, --wpVersionRequired <string>  The version of WordPress the theme requires (default: "6.0.0")
  -w, --wpVersionTested <string>    The version of WordPress the theme has been tested up to (default: "6.0.0")
  -F, --functionPrefix <string>     The prefix for PHP functions (default: "wp_theme")
  -C, --classPrefix <string>        The prefix for PHP classes (default: "WP_Theme")
  -c, --constantPrefix <string>     The prefix for PHP constants (default: "WP_THEME")
  -p, --path <string>               The path where the built theme directory will be placed (default: "...\\wp-content\\themes")
  -v, --verbose [boolean]           Output extra information to the console (default: false)
  -h, --help                        display help for command
```

