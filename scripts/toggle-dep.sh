#!/bin/bash
# Toggle @sprlab/microfront dependency between local (file:) and npm registry.
# Usage:
#   ./scripts/toggle-dep.sh local        # Switch to file:../libs/spr-microfront
#   ./scripts/toggle-dep.sh npm          # Switch to npm registry version
#   ./scripts/toggle-dep.sh npm 0.0.3    # Switch to specific npm version
#   ./scripts/toggle-dep.sh              # Show current mode

PROJECTS=("shell" "remote1" "remote2")
PKG="@sprlab/microfront"
LOCAL_PATH="file:../libs/spr-microfront"

get_current() {
  local project=$1
  grep "\"$PKG\"" "$project/package.json" | sed 's/.*: *"\(.*\)".*/\1/'
}

show_status() {
  echo "Current @sprlab/microfront dependency:"
  for project in "${PROJECTS[@]}"; do
    local current=$(get_current "$project")
    if [[ "$current" == file:* ]]; then
      echo "  $project: local ($current)"
    else
      echo "  $project: npm ($current)"
    fi
  done
}

set_dep() {
  local project=$1
  local value=$2
  # Use a temp file for portability (macOS sed -i requires backup extension)
  sed "s|\"$PKG\": *\"[^\"]*\"|\"$PKG\": \"$value\"|" "$project/package.json" > "$project/package.json.tmp"
  mv "$project/package.json.tmp" "$project/package.json"
}

if [ -z "$1" ]; then
  show_status
  exit 0
fi

case "$1" in
  local)
    echo "Switching to local (file:) dependency..."
    for project in "${PROJECTS[@]}"; do
      set_dep "$project" "$LOCAL_PATH"
    done
    echo "Done. Run 'yarn install' in each project to apply."
    show_status
    ;;
  npm)
    # Read version from lib's package.json if not specified
    if [ -z "$2" ]; then
      LIB_VERSION=$(grep '"version"' libs/spr-microfront/package.json | sed 's/.*: *"\(.*\)".*/\1/')
      VERSION="^$LIB_VERSION"
    else
      VERSION="$2"
    fi
    echo "Switching to npm registry ($VERSION)..."
    for project in "${PROJECTS[@]}"; do
      set_dep "$project" "$VERSION"
    done
    echo "Done. Run 'yarn install' in each project to apply."
    show_status
    ;;
  *)
    echo "Usage: $0 [local|npm [version]]"
    echo "  local          Use file:../libs/spr-microfront"
    echo "  npm [version]  Use npm registry (default: read from libs/spr-microfront/package.json)"
    echo "  (no args)      Show current status"
    exit 1
    ;;
esac
