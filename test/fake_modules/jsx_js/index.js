const React = require('react');
const jsx = require('jsx-as-js');

// eslint-disable-next-line react/prefer-es6-class, react/prefer-stateless-function
export default React.createClass({
  render() {
    // eslint-disable-next-line react/jsx-filename-extension
    return <div>Enable {jsx} syntax in js file by default.</div>;
  },
});
