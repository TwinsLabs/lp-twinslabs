#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

PROJECT_REF="fyxisscuycxoffsitesv"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

: "${BREVO_API_KEY:?Defina BREVO_API_KEY (export ou arquivo .env)}"
: "${CONTACT_FROM_EMAIL:?Defina CONTACT_FROM_EMAIL (remetente verificado no Brevo)}"

CONTACT_TO_EMAIL="${CONTACT_TO_EMAIL:-elialber@twinslabs.com.br}"

if ! supabase projects list >/dev/null 2>&1; then
  echo "Faça login primeiro: supabase login"
  exit 1
fi

supabase secrets set --project-ref "$PROJECT_REF" \
  BREVO_API_KEY="$BREVO_API_KEY" \
  CONTACT_TO_EMAIL="$CONTACT_TO_EMAIL" \
  CONTACT_FROM_EMAIL="$CONTACT_FROM_EMAIL"

supabase functions deploy send-contact --project-ref "$PROJECT_REF"

echo "Pronto. URL: https://${PROJECT_REF}.supabase.co/functions/v1/send-contact"
