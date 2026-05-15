#!/usr/bin/env bash
set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${CYAN} =========================================="
echo -e "  AI Interview Behavior Analyzer - Frontend"
echo -e " ==========================================${NC}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/frontend"

# Check Node
if ! command -v node &>/dev/null; then
    echo -e "${RED}[ERROR] Node.js not found. Install from https://nodejs.org${NC}"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}[OK] Node.js $NODE_VERSION${NC}"

# Create .env if missing
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${YELLOW}[INFO] Created frontend/.env — edit if needed${NC}"
fi

# Install node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[SETUP] Installing npm packages...${NC}"
    npm install || npm install --legacy-peer-deps
fi

echo ""
echo -e "${GREEN}[START] Frontend running at http://localhost:5173${NC}"
echo -e "${CYAN}[INFO]  Press Ctrl+C to stop${NC}"
echo ""

npm run dev
