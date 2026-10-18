#!/bin/bash
e2eFolder="../e2e"
mkdir -p "$e2eFolder"
# for each folder inside the e2e folder, create a corresponding snapshots folder
for dir in "$e2eFolder"/*/; do
  mkdir -p "$dir/chromium/desktop"
  mkdir -p "$dir/chromium/mobile"
  mkdir -p "$dir/webkit/desktop"
  mkdir -p "$dir/webkit/mobile"
done