# Create WP Theme

Create WP Theme is a node command line tool that will scaffold a new WordPress theme with an opinionated file structure and just the right amount of starter code to get a developer started building a modern WordPress theme. This package contains just the `create-wp-theme` command, all of the actual boilerplate code comes from [WP Theme Assets](https://github.com/dreamsicle-io/wp-theme-assets).

## Usage

Open a terminal, `cd` to the `/path/to/wordpress/wp-content/themes` directory of a local WordPress instance, and fire the `create-wp-theme` command.

```shell 
create-wp-theme [options] <file>
```

With this in mind, all that is necessary to start using the tool is a single argument of `file`, which corresponds to a param-cased string that will serve as the theme directory, the WordPress text-domain, and the package name. This will also serve as regular expression to replace all instances of `wp-theme` in the cloned package files.

```shell
create-wp-theme my-theme
```

Once this has been run, and the tool finds that the directory is unique, The tool will walk through a set of prompts that can be filled out inorder to customize the output of the package. 

```shell
The following tool will help you configure your new theme.
For each setting, set a value and hit "Enter" to continue.

Theme Name: (WP Theme)
Version: (0.0.1)
Template: () 
Theme URI: (https://github.com/example/my-theme) 
Theme Bugs URI: (https://github.com/example/wp-theme/issues) 
Theme Repository URI: (https://github.com/example/wp-theme.git) 
Theme Repository Type: (git) 
Description: (This theme was generated using create-wp-theme.) 
Author: (Example, INC.)
Author Email: (hello@example.com) 
Author URI: (https://example.com) 
License: (GPL-3.0) 
Tags: (accessibility-ready, translation-ready) 
WP Version Required: (4.9.8) 
WP Version Tested: (4.9.8) 
Function Prefix: (wp_theme) 
Class Prefix: (WP_Theme) 
```

The tool offers several options that will serve as defaults for the tool's prompt.These options can be used to customize the default options of the tool.

```shell 
create-wp-theme -X 1.0.0 -A "Example, INC." -E hello@example.com -u https://example.com my-theme
```

## The Prompts

S

## Help 

To get help with the tool and to learn more about usage and the available options, use the `--help` or `-h` flag.

```shell
create-wp-theme --help
```

This will output all help information available including how to use the command, option flags, option descriptions, and option defaults.

```shell
Usage: create-wp-theme [options] <file>

Options:
  -V, --version                         output the version number
  -N, --themeName <name>                The theme name (default: "WP Theme")
  -X, --themeVersion [version]          The theme version (default: "0.0.1")
  -T, --themeTemplate [theme]           The parent theme if this is a child theme (default: "")
  -U, --themeURI [uri]                  The theme URI (default: "https://github.com/dreamsicle-io/create-wp-theme")
  -B, --themeBugsURI [uri]              The theme bugs URI (default: "https://github.com/dreamsicle-io/create-wp-theme/issues")
  -R, --themeRepoURI [uri]              The theme repository URI (default: "https://github.com/dreamsicle-io/create-wp-theme.git")
  -r, --themeRepoType [type]            The theme repository type (default: "git")
  -d, --themeDescription [description]  The theme description (default: "This theme was generated using create-wp-theme.")
  -A, --themeAuthor [name]              The theme author (default: "Dreamsicle")
  -E, --themeAuthorEmail [email]        The theme author email (default: "hello@dreamsicle.io")
  -u, --themeAuthorURI [uri]            The theme author URI (default: "https://www.dreamsicle.io")
  -L, --themeLicense [spdx]             The theme license as a valid SPDX expression (default: "GPL-3.0")
  -t, --themeTags [tags]                A CSV of WordPress theme tags (default: "accessibility-ready, translation-ready")
  -W, --wpVersionRequired [version]     The version of WordPress the theme requires (default: "4.9.8")
  -w, --wpVersionTested [version]       The version of WordPress the theme has been tested up to (default: "4.9.8")
  -F, --functionPrefix [prefix]         The prefix for PHP functions (default: "wp_theme")
  -C, --classPrefix [prefix]            The prefix for PHP classes (default: "WP_Theme")
  -h, --help                            display help for command
```

