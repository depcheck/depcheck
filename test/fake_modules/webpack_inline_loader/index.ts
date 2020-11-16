import 'script-loader!slickity-slick';

// https://webpack.js.org/concepts/loaders/#inline
import 'style-loader-01!css-loader-01?modules!./styles.css';
import '!style-loader-02!css-loader-02?modules!./styles.css';
import '!!style-loader-03!css-loader-03?modules!./styles.css';
import '-!style-loader-04!css-loader-04?modules!./styles.css';

// https://v4.webpack.js.org/loaders/imports-loader/#multiple-values
import 'imports-loader?$=jquery,angular,config=>{size:50}!lodash-01';
import 'imports-loader?$=jquery,angular,config=>{size:50}!another-module-01';

require('script-loader!slickity-slick');

require('style-loader-11!css-loader-10?modules!./styles.css');
require('!style-loader-12!css-loader-11?modules!./styles.css');
require('!!style-loader-13!css-loader-12?modules!./styles.css');
require('-!style-loader-14!css-loader-13?modules!./styles.css');

require('imports-loader?$=jquery,angular,config=>{size:50}!lodash-01');
require('imports-loader?$=jquery,angular,config=>{size:50}!another-module-01');
