#!/bin/bash

grunt
cat dev.html | sed 's:js/require-jquery.js:dreddrl.js:' > index.html
