#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"/..
docker-compose --project-directory . -f docker-compose.int-test.yaml up --always-recreate-deps --abort-on-container-exit --exit-code-from tester tester