#!/bin/bash
# Kill processes on dev server ports before starting
PORTS=(4000 4001 4002 4003 4004 4005 4006 4007 4010 4011 4012 4020 4021 4022)

for port in "${PORTS[@]}"; do
  pid=$(lsof -ti :$port 2>/dev/null)
  if [ -n "$pid" ]; then
    kill -9 $pid 2>/dev/null
    echo "Killed port $port (pid $pid)"
  fi
done
