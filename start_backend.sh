#!/usr/bin/env bash
set -e

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${CYAN} ========================================="
echo -e "  AI Interview Behavior Analyzer - Backend"
echo -e " =========================================${NC}"
echo ""

# Move to backend dir (relative to this script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/backend"

# Check Python
if ! command -v python3 &>/dev/null; then
    echo -e "${RED}[ERROR] python3 not found. Install from https://python.org${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
echo -e "${GREEN}[OK] Python $PYTHON_VERSION${NC}"

# Create venv
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}[SETUP] Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate
source venv/bin/activate
echo -e "${GREEN}[OK] Virtual environment activated${NC}"

# Install requirements
echo -e "${YELLOW}[SETUP] Installing Python packages...${NC}"
pip install -r requirements.txt --quiet --disable-pip-version-check

# Create .env if missing
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo ""
    echo -e "${YELLOW}[ACTION REQUIRED] Edit backend/.env and fill in:${NC}"
    echo "  MONGODB_URL=your-mongodb-atlas-url"
    echo "  JWT_SECRET=any-long-random-string"
    echo "  ANTHROPIC_API_KEY=sk-ant-..."
    echo ""
    echo -e "Press Enter after editing .env to continue..."
    read -r
fi

# Seed database
echo -e "${YELLOW}[SETUP] Seeding database...${NC}"
python seed.py

echo ""
echo -e "${GREEN}[START] Backend running at http://localhost:8000${NC}"
echo -e "${CYAN}[INFO]  API docs → http://localhost:8000/docs${NC}"
echo -e "${CYAN}[INFO]  Press Ctrl+C to stop${NC}"
echo ""

uvicorn main:app --reload --port 8000 --host 0.0.0.0
