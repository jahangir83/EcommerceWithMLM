#!/bin/bash

# stop-server.sh
# Kill backend dev server and any related child processes

print_status() {
    echo -e "\033[1;33m$1\033[0m"
}

print_success() {
    echo -e "\033[1;32m$1\033[0m"
}

print_status "Stopping servers..."

# Stop backend if PID file exists
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID 2>/dev/null
        print_success "Backend server (PID $BACKEND_PID) stopped."
    else
        print_status "Backend process not running."
    fi
    rm .backend.pid
else
    print_status "No backend PID file found."
fi

# Also kill any lingering pnpm or node processes from start:dev
pkill -f "pnpm run start:dev" 2>/dev/null
pkill -f "node dist/main" 2>/dev/null

print_success "All matching processes stopped."
