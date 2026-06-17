#!/usr/bin/env bash
set -e
# Usage: ./deploy-to-github.sh git@github.com:USER/REPO.git
REMOTE="${1:?Pass your GitHub repo URL, e.g. git@github.com:user/vitatrack.git}"
git init
git add .
git commit -m "VitaTrack: clean build-ready release"
git branch -M main
git remote add origin "$REMOTE" 2>/dev/null || git remote set-url origin "$REMOTE"
git push -u origin main
echo "Done. Pushed to $REMOTE"
