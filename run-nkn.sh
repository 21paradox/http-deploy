#!/usr/bin/env bash

PROG_NAME=$0
ACTION=$1
PARAM=$2


function startApp {
    echo "start App"
    cd ~/nkn
    export NKN_WALLET_PASSWORD=xxxx
    nohup ./nknd --chaindb ~/ChainDB >> run.log
    PID=$!
    wait $PID
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
    curl https://swztest.oss-cn-beijing.aliyuncs.com/nkn.tgz -o nkn.tgz
    tar -zxf nkn.tgz

    pkill -f nknmonitor

    cd ~/nkn
    nohup $PROG_NAME nknmonitor > monitor.log 2>&1 &
    echo "finish deploy"
}

case "$ACTION" in
    nknmonitor)
        monitor
    ;;
    *)
        install
    ;;
esac