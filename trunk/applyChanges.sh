#!/bin/sh

nomExtension=cmsfeeder
repTravail=/root/travaux/cmsfeeder/trunk
repTest=/root/.mozilla/firefox/test.q9p/extensions/{1a106bdc-804e-4bea-a011-689398701943}

cd $repTravail/chrome
zip -r $nomExtension.jar *
cp -f $repTravail/install.rdf $repTest
mv -f $repTravail/chrome/$nomExtension.jar $repTest/chrome

