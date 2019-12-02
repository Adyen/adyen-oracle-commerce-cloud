#!/usr/bin/env sh

echo "Running pre-commit hook"
./scripts/run-tests.sh

if [ $? -ne 0 ]; then
 echo "Tests must pass before commit!"
 exit 1
fi

echo "Prettifying files"
./scripts/prettify.sh
