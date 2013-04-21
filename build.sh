#!/bin/bash

grunt
cat dev.html | sed 's:js/require-jquery.js:dreddrl.js:' | sed 's:data-main="dev":data-main="app":'  > index.html
