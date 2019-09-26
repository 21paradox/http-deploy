#!/usr/bin/env bash

PROG_NAME=$0
ACTION=$1
PARAM=$2

function startApp {
    pidApp=$(ps -ef| awk '/[g]vite\s\-pprof/{print $2}')
    if [ -z "$pidApp" ]; then
        echo "start App"
        cd ~/gvite-latest
        nohup ./gvite -pprof >> gvite.log 2>&1 &
        PID=$!
        wait $PID
    fi
}

function monitor {
    echo "begin monitor"
    # keep process running
    while [ 1 ]
    do
        startApp
        sleep 1;
    done
}

function install() {
    echo "begin deploy"
    cd ~
    curl https://swztest.oss-cn-beijing.aliyuncs.com/gv-2.6.tgz -o gv-latest.tgz
    tar -zxvf gv-latest.tgz

    gvitePid=$(ps -ef| awk '/[g]vite\s\-pprof/{print $2}')
    [[ ! -z "$gvitePid" ]] && kill -9 $gvitePid 2>/dev/null

    pkill -f gvmonitor
    cd ~
    nohup $PROG_NAME gvmonitor > monitor.log 2>&1 &
    echo "finish deploy"
}

case "$ACTION" in
    gvmonitor)
        monitor
    ;;
    *)
        install
    ;;
esac