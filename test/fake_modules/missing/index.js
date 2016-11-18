require('missing-dep');
require('fs'); // recognize node.js built-in module

require(1); // ignore require number call
require(); // ignore require call with no arguments
