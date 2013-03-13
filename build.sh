#!/bin/bash

grunt
cat dev.html | sed 's:js/game.js:dreddrl.js:' > index.html
