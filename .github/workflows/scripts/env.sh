#!/bin/bash

# This file must have permissions to run in a GitHub action.
# To do this cross-env, use the following command from the project root:
# git update-index --chmod=+x .github/workflows/scripts/env.sh

# Get the node version from the .nvmrc file.

NODE_VERSION=$(cat .nvmrc)

# Get the module version from the package.json file.

MODULE_VERSION=$(jq -r ".version" package.json)

# Get the author name from the package.json file.

GIT_USER_NAME=$(jq -r ".author.name" package.json)

# Get the author email from the package.json file.

GIT_USER_EMAIL=$(jq -r ".author.email" package.json)

# Set environment variables on $GITHUB_ENV.

echo "NODE_VERSION=$(echo $NODE_VERSION)" >> $GITHUB_ENV
echo "MODULE_VERSION=$(echo $MODULE_VERSION)" >> $GITHUB_ENV
echo "GIT_USER_NAME=$(echo $GIT_USER_NAME)" >> $GITHUB_ENV
echo "GIT_USER_EMAIL=$(echo $GIT_USER_EMAIL)" >> $GITHUB_ENV
