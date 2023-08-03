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
The following tool will help you configure your new theme.
For each setting, set a value and hit "Enter" to continue.

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
WP Version Required: (5.0.0) 
WP Version Tested: (5.0.0) 
Function Prefix: (wp_theme) 
Class Prefix: (WP_Theme) 
Path: () 
```

## Logging

The tool will log its progress and errors in the console, exiting on completion and fatal errors.

```shell
Creating theme: WP Theme in C:\Users\noahm\Code\create-wp-theme-dev\app\public\wp-content\themes\my-theme

Repo cloned: https://github.com/dreamsicle-io/wp-theme-assets.git --> C:\Users\noahm\Code\create-wp-theme\tmp
package-lock.json cleaned: C:\Users\noahm\Code\create-wp-theme\tmp\package\package-lock.json
package.json written: C:\Users\noahm\Code\create-wp-theme\tmp\package\package.json
File Renamed: C:\Users\noahm\Code\create-wp-theme\tmp\package\includes\class-wp-theme-assets.php
File built: C:\Users\noahm\Code\create-wp-theme\tmp\package\includes\class-wp-theme-assets.php
License written: C:\Users\noahm\Code\create-wp-theme\tmp\package\LICENSE
Theme copied: C:\Users\noahm\Code\create-wp-theme-dev\app\public\wp-content\themes\my-theme
Repo cleaned: C:\Users\noahm\Code\create-wp-theme\tmp

Theme created: WP Theme in C:\Users\noahm\Code\create-wp-theme-dev\app\public\wp-content\themes\my-theme
```

## Options

The tool offers several options that will serve as defaults for the tool's prompt. These options can be used to customize the default options of the tool allowing the developer to go through the prompts faster.

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
  -B, --themeBugsURI [string]       The theme bugs URI (default:
                                    "https://github.com/example/wp-theme/issues")
  -R, --themeRepoURI [string]       The theme repository URI (default: "git@github.com:example/wp-theme.git") 
  -r, --themeRepoType [string]      The theme repository type (default: "git")
  -d, --themeDescription [string]   The theme description (default: "This theme was generated using
                                    create-wp-theme.")
  -A, --themeAuthor [string]        The theme author (default: "Example, INC.")
  -E, --themeAuthorEmail [string]   The theme author email (default: "hello@example.com")
  -u, --themeAuthorURI [string]     The theme author URI (default: "https://www.example.com")
  -L, --themeLicense [string]       The theme license as a valid SPDX expression (default: "UNLICENSED")      
  -t, --themeTags [string]          A CSV of WordPress theme tags (default: "accessibility-ready,
                                    translation-ready")
  -W, --wpVersionRequired [string]  The version of WordPress the theme requires (default: "5.0.0")
  -w, --wpVersionTested [string]    The version of WordPress the theme has been tested up to (default:        
                                    "5.0.0")
  -F, --functionPrefix [string]     The prefix for PHP functions (default: "wp_theme")
  -C, --classPrefix [string]        The prefix for PHP classes (default: "WP_Theme")
  -p, --path [string]               The path where the built theme directory will be placed. (default:        
                                    "C:\\Users\\noahm\\source\\repos\\create-wp-theme")
  -h, --help                        display help for command
```

