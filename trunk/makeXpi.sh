#!/bin/bash

cd /root/travaux/cmsfeeder/trunk
#x=$(basename $(pwd))
x=cmsfeeder
mkdir -p build/chrome/
cd chrome
zip -r $x.jar *
mv $x.jar ../build/chrome/
cd ..
cp install.* build/
cd build
zip -r $x.xpi *
mv $x.xpi ../
cd ..
rm -r build/ 