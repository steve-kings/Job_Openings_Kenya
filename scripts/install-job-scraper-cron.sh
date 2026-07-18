#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
readonly ENV_FILE="${JOBOPENINGS_ENV_FILE:-${APP_DIR}/.env.local}"
readonly CONFIG_DIR="${XDG_CONFIG_HOME:-${HOME}/.config}/jobopenings"
readonly CACHE_DIR="${XDG_CACHE_HOME:-${HOME}/.cache}"
readonly CURL_CONFIG="${CONFIG_DIR}/jobs-scraper.curl"
readonly RUNNER="${APP_DIR}/scripts/run-job-scraper.sh"
readonly MARKER='# jobopenings-jobs-scraper'

for required in node curl crontab flock bash; do
    command -v "$required" >/dev/null 2>&1 || { echo "Missing required command: $required" >&2; exit 1; }
done
[[ -f "$ENV_FILE" ]] || { echo "Missing environment file: $ENV_FILE" >&2; exit 1; }

cd "$APP_DIR"
scraper_secret="$(node - "$ENV_FILE" <<'NODE'
const fs = require('node:fs');
const dotenv = require('dotenv');
const envFile = process.argv[2];
const env = dotenv.parse(fs.readFileSync(envFile));
if (!env.CRON_SECRET) throw new Error('CRON_SECRET is missing');
if (!env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing');
if (!env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing');
const sources = JSON.parse(env.JOB_SCRAPER_SOURCES_JSON || '[]');
const source = sources.find(item => item?.name === 'annex' && item?.kind === 'annex' && item?.enabled !== false);
if (!source) throw new Error('An enabled Annex source named "annex" is required');
if (String(source.location || 'Kenya').trim().toLowerCase() !== 'kenya') {
    throw new Error('The Annex source location must be Kenya');
}
if (source.autoPublish === true) {
    console.error('NOTICE: Annex automatic publishing is enabled for new eligible jobs.');
}
process.stdout.write(env.CRON_SECRET);
NODE
)"
[[ "$scraper_secret" != *$'\n'* && "$scraper_secret" != *$'\r'* ]] || {
    echo 'CRON_SECRET must not contain line breaks' >&2
    exit 1
}

install -d -m 700 "$CONFIG_DIR" "$CACHE_DIR"
escaped_secret="${scraper_secret//\\/\\\\}"
escaped_secret="${escaped_secret//\"/\\\"}"
{
    printf '%s\n' \
        'silent' \
        'show-error' \
        'fail-with-body' \
        'connect-timeout = 10' \
        'max-time = 300' \
        'retry = 2' \
        'retry-delay = 15' \
        'retry-max-time = 180' \
        'retry-connrefused' \
        'header = "Accept: application/json"'
    printf 'header = "Authorization: Bearer %s"\n' "$escaped_secret"
} > "$CURL_CONFIG"
chmod 600 "$CURL_CONFIG" "$ENV_FILE"
unset scraper_secret escaped_secret

echo 'Running an authenticated dry run before installing cron...'
if ! bash "$RUNNER" --dry-run; then
    echo 'Dry run failed; cron was not installed.' >&2
    exit 1
fi

cron_tmp="$(mktemp)"
trap 'rm -f "$cron_tmp"' EXIT
(crontab -l 2>/dev/null || true) | grep -Fv "$MARKER" > "$cron_tmp" || true
printf '%s\n' \
    "15 */6 * * * $(command -v flock) -n -E 75 \"${CACHE_DIR}/jobopenings-scraper.lock\" $(command -v bash) \"${RUNNER}\" >/dev/null 2>&1 ${MARKER}" \
    >> "$cron_tmp"
crontab "$cron_tmp"

echo "Installed protected scraper credentials at $CURL_CONFIG"
echo 'Installed one job scraper cron entry:'
crontab -l | grep -F "$MARKER"
if command -v systemctl >/dev/null 2>&1 && ! systemctl is-active --quiet cron; then
    echo 'WARNING: cron is not active. Run: sudo systemctl enable --now cron' >&2
fi
echo 'Authenticated dry run passed; the scheduler is ready for the configured publication mode.'
