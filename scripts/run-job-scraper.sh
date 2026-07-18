#!/usr/bin/env bash
set -u
umask 077

readonly CONFIG_FILE="${JOB_SCRAPER_CURL_CONFIG:-${HOME}/.config/jobopenings/jobs-scraper.curl}"
readonly BASE_URL="${JOB_SCRAPER_BASE_URL:-http://127.0.0.1:3000}"
readonly SOURCE="${JOB_SCRAPER_SOURCE:-annex}"
readonly LOG_TAG='jobopenings-scraper'

if [[ ! -r "$CONFIG_FILE" ]]; then
    echo "Missing protected curl configuration: $CONFIG_FILE" >&2
    exit 1
fi
if [[ ! "$SOURCE" =~ ^[A-Za-z0-9._-]+$ ]]; then
    echo 'JOB_SCRAPER_SOURCE contains unsupported characters' >&2
    exit 1
fi

query="source=${SOURCE}"
case "${1:-}" in
    '') ;;
    --dry-run) query="${query}&dryRun=true" ;;
    *) echo "Usage: $0 [--dry-run]" >&2; exit 2 ;;
esac

readonly endpoint="${BASE_URL%/}/api/cron/jobs-scraper?${query}"
timestamp="$(date --iso-8601=seconds)"

if response="$(curl --disable --config "$CONFIG_FILE" --url "$endpoint" 2>&1)"; then
    message="${timestamp} scraper-success ${response}"
    command -v logger >/dev/null 2>&1 && logger -t "$LOG_TAG" -- "$message"
    printf '%s\n' "$message"
    exit 0
else
    result=$?
fi

message="${timestamp} scraper-failed curl_exit=${result} ${response}"
command -v logger >/dev/null 2>&1 && logger -p user.err -t "$LOG_TAG" -- "$message"
printf '%s\n' "$message" >&2
exit "$result"
