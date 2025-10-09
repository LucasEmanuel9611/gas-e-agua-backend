#!/bin/bash

# Script de notificação de deploy
# Uso: ./scripts/deploy/notify.sh [success|failure] [env] [message]

set -e

STATUS=$1
ENV=$2
MESSAGE=$3

# Configure seu webhook do Discord/Slack aqui
DISCORD_WEBHOOK_URL="${DISCORD_WEBHOOK_URL:-}"
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"

if [ -z "$STATUS" ] || [ -z "$ENV" ]; then
  echo "Uso: $0 [success|failure] [env] [message]"
  exit 1
fi

# Cores
if [ "$STATUS" = "success" ]; then
  COLOR="3066993"  # Verde
  EMOJI="✅"
  TITLE="Deploy Successful"
elif [ "$STATUS" = "failure" ]; then
  COLOR="15158332"  # Vermelho
  EMOJI="❌"
  TITLE="Deploy Failed"
else
  COLOR="16776960"  # Amarelo
  EMOJI="⚠️"
  TITLE="Deploy Warning"
fi

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
AUTHOR=$(git log -1 --pretty=format:'%an' 2>/dev/null || echo "unknown")

# Discord Webhook
if [ -n "$DISCORD_WEBHOOK_URL" ]; then
  curl -H "Content-Type: application/json" \
    -X POST \
    -d "{
      \"embeds\": [{
        \"title\": \"$EMOJI $TITLE - $ENV\",
        \"description\": \"$MESSAGE\",
        \"color\": $COLOR,
        \"fields\": [
          {\"name\": \"Environment\", \"value\": \"$ENV\", \"inline\": true},
          {\"name\": \"Branch\", \"value\": \"$BRANCH\", \"inline\": true},
          {\"name\": \"Commit\", \"value\": \"$COMMIT\", \"inline\": true},
          {\"name\": \"Author\", \"value\": \"$AUTHOR\", \"inline\": true}
        ],
        \"timestamp\": \"$TIMESTAMP\"
      }]
    }" \
    "$DISCORD_WEBHOOK_URL" > /dev/null 2>&1
fi

# Slack Webhook
if [ -n "$SLACK_WEBHOOK_URL" ]; then
  curl -X POST \
    -H 'Content-type: application/json' \
    -d "{
      \"text\": \"$EMOJI *$TITLE* - $ENV\",
      \"attachments\": [{
        \"color\": \"#$(printf '%06x' $COLOR)\",
        \"fields\": [
          {\"title\": \"Message\", \"value\": \"$MESSAGE\", \"short\": false},
          {\"title\": \"Branch\", \"value\": \"$BRANCH\", \"short\": true},
          {\"title\": \"Commit\", \"value\": \"$COMMIT\", \"short\": true},
          {\"title\": \"Author\", \"value\": \"$AUTHOR\", \"short\": true}
        ]
      }]
    }" \
    "$SLACK_WEBHOOK_URL" > /dev/null 2>&1
fi

echo "$EMOJI Notification sent: $STATUS - $ENV"

