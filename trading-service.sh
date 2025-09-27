#!/bin/bash
# 24/7 Autonomous Trading Service Launcher
# Runs the production trading service in the background

SERVICE_NAME="autonomous-trading"
SERVICE_FILE="/workspaces/TweetBot/enhanced-24x7-trading.ts"
PID_FILE="/tmp/autonomous-trading.pid"
LOG_FILE="/workspaces/TweetBot/trading-service.log"

start_service() {
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        echo "🔄 Autonomous trading service is already running (PID: $(cat $PID_FILE))"
        return 1
    fi
    
    echo "🚀 Starting 24/7 PRODUCTION Trading Service..."
    echo "� Managing $10K corpus with REAL market data"
    echo "📊 Trading: Every 30min | Prices: Every 5min"
    echo "📁 Logs: $LOG_FILE"
    
    # Start the service in background
    nohup node --loader ts-node/esm "$SERVICE_FILE" > "$LOG_FILE" 2>&1 &
    
    # Save PID
    echo $! > "$PID_FILE"
    
    echo "✅ Service started (PID: $!)"
    echo "🔍 Use 'tail -f $LOG_FILE' to monitor"
    echo "🛑 Use './trading-service.sh stop' to stop"
}

stop_service() {
    if [ ! -f "$PID_FILE" ]; then
        echo "❌ Service not running (no PID file found)"
        return 1
    fi
    
    PID=$(cat "$PID_FILE")
    
    if kill -0 "$PID" 2>/dev/null; then
        echo "🛑 Stopping autonomous trading service (PID: $PID)..."
        kill -SIGINT "$PID"
        
        # Wait for graceful shutdown
        for i in {1..10}; do
            if ! kill -0 "$PID" 2>/dev/null; then
                break
            fi
            sleep 1
        done
        
        # Force kill if still running
        if kill -0 "$PID" 2>/dev/null; then
            echo "⚠️ Force killing service..."
            kill -9 "$PID"
        fi
        
        rm -f "$PID_FILE"
        echo "✅ Service stopped"
    else
        echo "❌ Service not running (PID $PID not found)"
        rm -f "$PID_FILE"
    fi
}

status_service() {
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        echo "✅ Autonomous trading service is RUNNING (PID: $(cat $PID_FILE))"
        echo "📊 Portfolio status:"
        tail -n 10 "$LOG_FILE" 2>/dev/null || echo "   📁 No recent logs"
    else
        echo "❌ Autonomous trading service is NOT running"
    fi
}

monitor_service() {
    echo "🔍 Monitoring autonomous trading service..."
    echo "📁 Log file: $LOG_FILE"
    echo "🛑 Press Ctrl+C to stop monitoring"
    tail -f "$LOG_FILE"
}

case "$1" in
    start)
        start_service
        ;;
    stop)
        stop_service
        ;;
    restart)
        stop_service
        sleep 2
        start_service
        ;;
    status)
        status_service
        ;;
    monitor|logs)
        monitor_service
        ;;
    *)
        echo "🤖 Autonomous Trading Service Controller"
        echo ""
        echo "Usage: $0 {start|stop|restart|status|monitor}"
        echo ""
        echo "Commands:"
        echo "  start   - Start 24/7 autonomous trading service"
        echo "  stop    - Stop the trading service"
        echo "  restart - Restart the service"
        echo "  status  - Check if service is running"
        echo "  monitor - Watch live trading decisions"
        echo ""
        echo "📊 The service manages a $10K corpus with autonomous agent decisions"
        echo "🔄 Makes trading decisions every 30 minutes"
        echo "📁 All decisions logged to database and files"
        exit 1
        ;;
esac