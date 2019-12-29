/* eslint-disable react/jsx-one-expression-per-line,
                  react/jsx-one-expression-per-line,
                  react/prefer-stateless-function,
                  react/jsx-filename-extension,
                  react/no-deprecated
*/
const React = require('react');
const jsx = require('jsx-as-js');

export default React.createClass({
  render() {
    return <div>Enable {jsx} syntax in js file by default.</div>;
  },
});
