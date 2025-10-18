#!/bin/bash

# Quick Start Script for Autonomous Market Hunter

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║        🤖 Autonomous Market Hunter - Quick Start             ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Check if database exists
if [ ! -f "database/trading.db" ]; then
    echo "📂 Database not found. Initializing..."
    sqlite3 database/trading.db < database/schema.sql
    echo "✅ Database created"
else
    echo "✅ Database found"
fi

echo ""
echo "Choose an option:"
echo "  1) Start autonomous agent (continuous mode)"
echo "  2) Run single test cycle"
echo "  3) View agent documentation"
echo "  4) Check database status"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting Autonomous Market Hunter..."
        echo "   (Press Ctrl+C to stop)"
        echo ""
        npx tsx start-autonomous-market-hunter.ts
        ;;
    2)
        echo ""
        echo "🧪 Running test cycle..."
        echo ""
        npx tsx test-autonomous-market-hunter.ts
        ;;
    3)
        echo ""
        if command -v bat &> /dev/null; then
            bat AUTONOMOUS_MARKET_HUNTER.md
        else
            less AUTONOMOUS_MARKET_HUNTER.md
        fi
        ;;
    4)
        echo ""
        echo "📊 Database Status:"
        echo ""
        sqlite3 database/trading.db "
            SELECT 'Whale Movements: ' || COUNT(*) FROM whale_movements
            UNION ALL
            SELECT 'Narrative Shifts: ' || COUNT(*) FROM narrative_shifts
            UNION ALL
            SELECT 'Influencer Signals: ' || COUNT(*) FROM influencer_signals
            UNION ALL
            SELECT 'Institutional Flows: ' || COUNT(*) FROM institutional_flows
            UNION ALL
            SELECT 'Macro Signals: ' || COUNT(*) FROM macro_signals
            UNION ALL
            SELECT 'Agent Executions: ' || COUNT(*) FROM agent_executions WHERE agent_name='autonomous-market-hunter'
            UNION ALL
            SELECT 'System Alerts: ' || COUNT(*) FROM system_alerts;
        "
        echo ""
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac
