#!/usr/bin/env bash
set -euo pipefail
# Grava o token de deploy do Azure Static Web Apps no GitHub (TwinsLabs).
# Pré-requisitos: gh auth login
# Uso:
#   export AZURE_STATIC_WEB_APPS_API_TOKEN="(token do portal Azure > SWA > Manage deployment token)"
#   ./scripts/gh-azure-swa-secret.sh TwinsLabs/lp-twinslabs

: "${AZURE_STATIC_WEB_APPS_API_TOKEN:?Defina AZURE_STATIC_WEB_APPS_API_TOKEN}"

REPO="${1:-}"
if [[ -z "$REPO" ]]; then
  REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)"
fi
if [[ -z "$REPO" ]]; then
  echo "Passe o repositório: ./scripts/gh-azure-swa-secret.sh TwinsLabs/lp-twinslabs"
  exit 1
fi

gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN --repo "$REPO" --body "$AZURE_STATIC_WEB_APPS_API_TOKEN"
echo "Secret configurado em $REPO"
