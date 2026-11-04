#!/usr/bin/env bash
#
# provision.sh: wire a new project from ywg-project-template to Cloudflare.
# Setup guide Part 2, Step 4.
#
# What it does:
#   1. Confirms wrangler and gh are logged in, and finds the Cloudflare account ID.
#   2. Fills the [PROJECT-NAME] placeholder in wrangler.toml and both deploy workflows.
#   3. Makes sure the GitHub environments `staging` and `production` exist.
#   4. Pushes CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID to both environments.
#
# What it doesn't do:
#   - Mint the API token. Cloudflare has no CLI for that, so it's one dashboard
#     step: My Profile -> API Tokens -> Create Token -> "Edit Cloudflare Workers".
#   - Create D1 or R2. That's a per-project decision (Part 2, Step 4.3).
#   - Deploy. Deploys only happen through GitHub Actions: merge to `staging`
#     for staging, to `main` for production. Never run `wrangler deploy` by hand.
#     The Worker is created by its first deploy; there's no dashboard project.
#
# Usage, from the repo root:
#   ./scripts/provision.sh [project-name]
#
# Set CF_ACCOUNT_ID to skip account detection. Safe to re-run.

set -euo pipefail

PROJECT_NAME="${1:-}"
if [[ -z "$PROJECT_NAME" ]]; then
  echo "Usage: $0 [project-name]"
  echo "Example: $0 arizona-pacific-plastics"
  exit 1
fi

# Worker names: lowercase letters, digits and hyphens, 63 characters at most.
# The staging Worker adds "-staging", so the base name gets 55.
if [[ ! "$PROJECT_NAME" =~ ^[a-z0-9]([a-z0-9-]{0,53}[a-z0-9])?$ ]]; then
  echo "\"$PROJECT_NAME\" isn't a valid Worker name: use lowercase letters, digits and hyphens, 55 characters at most."
  exit 1
fi

if [[ ! -d ".git" || ! -f "wrangler.toml" ]]; then
  echo "Run this from the project repo root (needs .git and wrangler.toml)."
  exit 1
fi

for cmd in gh bunx perl; do
  command -v "$cmd" >/dev/null || { echo "Missing $cmd. Install it and re-run."; exit 1; }
done

echo "== 1. Check logins =="
gh auth status >/dev/null 2>&1 || { echo "Not logged in to gh. Run: gh auth login"; exit 1; }
REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
echo "GitHub repo: $REPO"

ACCOUNT_ID="${CF_ACCOUNT_ID:-}"
if [[ -z "$ACCOUNT_ID" ]]; then
  if ! WHOAMI=$(bunx wrangler whoami 2>&1); then
    echo "$WHOAMI"
    echo "Not logged in to wrangler. Run: bunx wrangler login"
    exit 1
  fi
  echo "$WHOAMI"
  IDS=$(grep -oE '\b[a-f0-9]{32}\b' <<<"$WHOAMI" | sort -u || true)
  COUNT=$(grep -c . <<<"$IDS" || true)
  if [[ "$COUNT" -eq 1 ]]; then
    ACCOUNT_ID="$IDS"
  else
    [[ "$COUNT" -gt 1 ]] && echo "More than one Cloudflare account is listed above."
    read -r -p "Paste the Cloudflare Account ID to use: " ACCOUNT_ID
  fi
fi
if [[ ! "$ACCOUNT_ID" =~ ^[a-f0-9]{32}$ ]]; then
  echo "\"$ACCOUNT_ID\" doesn't look like a Cloudflare Account ID (32 hex characters)."
  exit 1
fi
echo "Cloudflare account: $ACCOUNT_ID"

echo ""
echo "== 2. Fill in the project name =="
for f in wrangler.toml .github/workflows/deploy-staging.yml .github/workflows/deploy-production.yml; do
  if [[ -f "$f" ]] && grep -q '\[PROJECT-NAME\]' "$f"; then
    perl -pi -e "s/\\[PROJECT-NAME\\]/${PROJECT_NAME}/g" "$f"
    echo "Updated $f"
  fi
done
grep -q "^name = \"${PROJECT_NAME}\"" wrangler.toml \
  || echo "Warning: wrangler.toml's name isn't \"${PROJECT_NAME}\". Check it before the first deploy."

echo ""
echo "== 3. GitHub environments =="
for ENV in staging production; do
  gh api --silent -X PUT "repos/${REPO}/environments/${ENV}"
  echo "Environment ready: ${ENV}"
done

echo ""
echo "== 4. Cloudflare API token =="
echo "If you don't have one for this project yet:"
echo "  dash.cloudflare.com -> My Profile -> API Tokens -> Create Token -> \"Edit Cloudflare Workers\""
echo "  Name it \"${PROJECT_NAME} Edit Cloudflare Workers\". Cloudflare shows it only once."
read -r -s -p "Paste the API token (input hidden, Enter to skip): " CF_API_TOKEN
echo ""

if [[ -z "$CF_API_TOKEN" ]]; then
  echo "Skipped. Re-run this script once you have the token."
else
  for ENV in staging production; do
    printf '%s' "$CF_API_TOKEN" | gh secret set CLOUDFLARE_API_TOKEN --env "$ENV" --repo "$REPO"
    printf '%s' "$ACCOUNT_ID" | gh secret set CLOUDFLARE_ACCOUNT_ID --env "$ENV" --repo "$REPO"
    echo "Secrets set on: ${ENV}"
  done
fi
unset CF_API_TOKEN

echo ""
echo "Done. Next:"
echo "  1. If D1 or R2 is needed, uncomment the block in wrangler.toml and create it (Part 2, Step 4.3)."
echo "  2. Commit wrangler.toml and the deploy workflows on dev."
echo "  3. The first deploy happens when dev is merged into staging (Part 2, Step 6)."
