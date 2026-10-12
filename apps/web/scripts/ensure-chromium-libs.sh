#!/bin/sh
# Host workaround: some hosts run Playwright's Chromium without libnspr4/libnss3/
# libasound2 installed and without root to install them. This fetches those .deb
# packages with apt-get (no root required for download) and extracts the shared
# libraries into .cache/chromium-libs so playwright.config.ts can point
# LD_LIBRARY_PATH at them. Delete this script once the host has those packages
# installed properly; it is not part of the component's own dependencies.
set -e

[ "$(uname -s)" = "Linux" ] || exit 0
command -v apt-get >/dev/null 2>&1 || exit 0

SHELL_BIN=$(ls "$HOME"/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | head -n1)
[ -n "$SHELL_BIN" ] || exit 0

if ! ldd "$SHELL_BIN" 2>/dev/null | grep -q "not found"; then
  exit 0
fi

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
CACHE_DIR="$ROOT_DIR/.cache/chromium-libs"
DEB_DIR="$CACHE_DIR/debs"
EXTRACT_DIR="$CACHE_DIR/root"

mkdir -p "$DEB_DIR" "$EXTRACT_DIR"

cd "$DEB_DIR"
apt-get download libnspr4 libnss3 >/dev/null
apt-get download libasound2t64 >/dev/null 2>&1 || apt-get download libasound2 >/dev/null

for deb in *.deb; do
  dpkg-deb -x "$deb" "$EXTRACT_DIR"
done
