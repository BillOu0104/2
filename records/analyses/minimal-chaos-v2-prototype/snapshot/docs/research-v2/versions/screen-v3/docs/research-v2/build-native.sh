#!/bin/sh
set -eu
cd "$(dirname "$0")/../.."
mkdir -p docs/research-v2/bin
g++ -std=c++17 -O3 -ffp-contract=off -Wall -Wextra -pedantic docs/research-v2/native.cpp -o docs/research-v2/bin/native
