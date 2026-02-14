#!/bin/bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YjEzMDJkOS00YWNlLTRmYzktYTdlZS03Y2M0YjNkNGU5NjAiLCJlbWFpbCI6Im5hbm9vLnNoYXNod2F0QGdtYWlsLmNvbSIsIm5hbWUiOiJIYXJsYW4gR1AiLCJpYXQiOjE3NzEwNTk1MjYsImV4cCI6MTc3MzY1MTUyNn0.5gUV0ZIkwjOh8ZpYi-UL2ceQVfUcwRdomvzYJWh-fcc"

curl -i https://pressscape-d1-cloudflare.pages.dev/buyer/dashboard \
  -H "Cookie: auth_token=${TOKEN}" 2>&1 | head -60
