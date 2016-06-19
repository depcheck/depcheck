const React = require('react');
const jsx = require('jsx-as-js');

// eslint-disable-next-line react/prefer-es6-class, react/prefer-stateless-function
export default React.createClass({
  render() {
    return <div>Enable {jsx} syntax in js file by default.</div>;
  },
});
