#!/usr/bin/env sh
echo "begin deploy"

pkill -9 gvite

cd ~
curl https://swztest.oss-cn-beijing.aliyuncs.com/gv-latest.tgz -o gv-latest.tgz

tar -zxvf gv-latest.tgz

cd gvite-latest

ls -lah
./bootstrap
