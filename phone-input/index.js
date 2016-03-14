'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _tcombReact = require('tcomb-react');

var _tcomb = require('tcomb');

var _PhoneInput = require('./PhoneInput');

var _PhoneInput2 = _interopRequireDefault(_PhoneInput);

require('./phone-input.styl');

var PhoneInput = (function (_Component) {
    _inherits(PhoneInput, _Component);

    function PhoneInput() {
        _classCallCheck(this, PhoneInput);

        _Component.apply(this, arguments);
    }

    PhoneInput.prototype.onChange = function onChange(value) {
        var onChange = this.props.onChange;

        onChange(value);
    };

    PhoneInput.prototype.getCountriesList = function getCountriesList() {
        var countries = this.props.countries;

        return countries.map(function (item) {
            return [item.country, item.isoCode, item.dialCode, item.mask];
        });
    };

    PhoneInput.prototype.render = function render() {
        var _props = this.props;
        var value = _props.value;
        var defaultCountry = _props.defaultCountry;
        var className = _props.className;

        return _react2['default'].createElement(
            'div',
            { className: className },
            _react2['default'].createElement(
                'div',
                { className: 'phone-input-container' },
                _react2['default'].createElement(_PhoneInput2['default'], {
                    defaultCountry: defaultCountry,
                    value: value,
                    countries: this.getCountriesList(),
                    onChange: this.onChange.bind(this)
                })
            )
        );
    };

    _createClass(PhoneInput, null, [{
        key: 'propTypes',
        value: _tcombReact.propTypes({
            className: _tcomb.maybe(_tcomb.Str),
            value: _tcomb.Str,
            countries: _tcomb.list(_tcomb.struct({
                country: _tcomb.Str,
                isoCode: _tcomb.Str,
                dialCode: _tcomb.Str,
                mask: _tcomb.Str
            })),
            defaultCountry: _tcomb.Str,
            onChange: _tcomb.Func
        }),
        enumerable: true
    }]);

    return PhoneInput;
})(_react.Component);

exports['default'] = PhoneInput;
module.exports = exports['default'];
//# sourceMappingURL=index.js.map