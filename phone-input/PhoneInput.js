// TODO - fix the onlyContries props. Currently expects that as an array of country object, but users should be able to send in array of country isos

'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _lodashCollection = require('lodash/collection');

var _lodashFindwhere = require('lodash.findwhere');

var _lodashFindwhere2 = _interopRequireDefault(_lodashFindwhere);

var _lodashArray = require('lodash/array');

var _lodashFirst = require('lodash.first');

var _lodashFirst2 = _interopRequireDefault(_lodashFirst);

var _lodashFunction = require('lodash/function');

var _lodashString = require('lodash/string');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _reactOverlays = require('react-overlays');

var _clone = require('clone');

var _clone2 = _interopRequireDefault(_clone);

function nameSpace(allCountriesIn) {
    var allCountries = _clone2['default'](allCountriesIn);
    var allCountryCodes = {};
    var addCountryCode = function addingCountryCode(iso2, dialCode, priority) {
        if (!(dialCode in allCountryCodes)) {
            allCountryCodes[dialCode] = [];
        }
        var index = priority || 0;
        allCountryCodes[dialCode][index] = iso2;
    };

    for (var i = 0; i < allCountries.length; i++) {
        var c = allCountries[i];
        allCountries[i] = {
            name: c[0],
            iso2: c[1],
            dialCode: c[2],
            priority: c[4] || 0
        };
        if (c[3]) {
            allCountries[i].format = c[3];
        }
        if (c[5]) {
            allCountries[i].hasAreaCodes = true;
            for (var j = 0; j < c[5].length; j++) {
                var dialCode = c[2] + c[5][j];
                addCountryCode(c[1], dialCode);
            }
        }
        addCountryCode(c[1], c[2], c[4]);
    }

    return {
        allCountries: allCountries,
        allCountryCodes: allCountryCodes
    };
}

var countryData = undefined;
var allCountries = undefined;

var isModernBrowser = Boolean(document.createElement('input').setSelectionRange);
var keys = {
    UP: 38,
    DOWN: 40,
    RIGHT: 39,
    LEFT: 37,
    ENTER: 13,
    ESC: 27,
    PLUS: 43,
    A: 65,
    Z: 90,
    SPACE: 32
};

function isNumberValid(inputNumber) {
    var countries = countryData.allCountries;
    return _lodashCollection.some(countries, function anonymousFunction1(country) {
        return _lodashString.startsWith(inputNumber, country.dialCode) || _lodashString.startsWith(country.dialCode, inputNumber);
    });
}

function getOnlyCountries(onlyCountriesArray) {
    if (onlyCountriesArray.length === 0) {
        return allCountries;
    }
    var selectedCountries = [];
    allCountries.map(function anonymousFunction2(country) {
        onlyCountriesArray.map(function anonymousFunction3(selCountry) {
            if (country.iso2 === selCountry) {
                selectedCountries.push(country);
            }
        });
    });
    return selectedCountries;
}

function excludeCountries(selectedCountries, excludedCountries) {
    if (excludedCountries.length === 0) {
        return selectedCountries;
    }
    var newSelectedCountries = _lodashCollection.filter(selectedCountries, function anonymousFunction4(selCountry) {
        return !_lodashCollection.includes(excludedCountries, selCountry.iso2);
    });
    return newSelectedCountries;
}

var ReactPhoneInput = (function (_React$Component) {
    _inherits(ReactPhoneInput, _React$Component);

    function ReactPhoneInput(props) {
        _classCallCheck(this, ReactPhoneInput);

        _React$Component.call(this, props);
        countryData = nameSpace(props.countries || [['Россия', 'ru', '7']]);
        allCountries = countryData.allCountries;
        var inputNumber = this.props.value || '';
        var onlyCountries = excludeCountries(getOnlyCountries(props.onlyCountries), props.excludeCountries);
        var selectedCountryGuess = this.guessSelectedCountry(inputNumber.replace(/\D/g, ''), onlyCountries);
        var selectedCountryGuessIndex = _lodashArray.findIndex(allCountries, selectedCountryGuess);
        var formattedNumber = this.formatNumber(inputNumber.replace(/\D/g, ''), selectedCountryGuess ? selectedCountryGuess.format : null);
        var preferredCountries = _lodashCollection.filter(allCountries, (function anonymousFunction5(country) {
            return _lodashCollection.some(this.props.preferredCountries, function anonymousFunction6(preferredCountry) {
                return preferredCountry === country.iso2;
            });
        }).bind(this), this);

        this.getNumber = this.getNumber.bind(this);
        this.getValue = this.getValue.bind(this);
        this.scrollTo = this.scrollTo.bind(this);
        this.formatNumber = this.formatNumber.bind(this);
        this._cursorToEnd = this._cursorToEnd.bind(this);
        this.guessSelectedCountry = this.guessSelectedCountry.bind(this);
        this.getElement = this.getElement.bind(this);
        this.handleFlagDropdownClick = this.handleFlagDropdownClick.bind(this);
        this.handleInput = this.handleInput.bind(this);
        this.handleInputClick = this.handleInputClick.bind(this);
        this.handleFlagItemClick = this.handleFlagItemClick.bind(this);
        this.handleInputFocus = this.handleInputFocus.bind(this);
        this._getHighlightCountryIndex = this._getHighlightCountryIndex.bind(this);
        this._searchCountry = this._searchCountry.bind(this);
        this.searchCountry = this.searchCountry.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
        this.handleInputKeyDown = this.handleInputKeyDown.bind(this);
        this.getCountryDropDownList = this.getCountryDropDownList.bind(this);
        this.maxPhoneLength = props.maxPhoneLength || 16;
        this.id = Math.round(Math.random() * 1e9);

        this.state = {
            preferredCountries: preferredCountries,
            selectedCountry: selectedCountryGuess,
            highlightCountryIndex: selectedCountryGuessIndex,
            formattedNumber: formattedNumber,
            showDropDown: false,
            queryString: '',
            freezeSelection: false,
            debouncedQueryStingSearcher: _lodashFunction.debounce(this.searchCountry, 100),
            onlyCountries: onlyCountries
        };
    }

    ReactPhoneInput.prototype.componentDidMount = function componentDidMount() {
        document.addEventListener('keydown', this.handleKeydown);
    };

    ReactPhoneInput.prototype.componentWillUnmount = function componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeydown);
    };

    ReactPhoneInput.prototype.getElement = function getElement(index) {
        return _reactDom2['default'].findDOMNode(this.refs['flag_no_' + index]);
    };

    ReactPhoneInput.prototype.getValue = function getValue() {
        return this.getNumber();
    };

    ReactPhoneInput.prototype.getNumber = function getNumber() {
        return this.state.formattedNumber !== '+' ? this.state.formattedNumber : '';
    };

    ReactPhoneInput.prototype.getCountryDropDownList = function getCountryDropDownList() {
        var countryDropDownList = _lodashCollection.map(this.state.preferredCountries.concat(this.state.onlyCountries), (function anonymousFunction10(country, index) {
            var itemClasses = _classnames2['default']({
                country: true,
                preferred: country.iso2 === 'us' || country.iso2 === 'gb',
                active: country.iso2 === 'us',
                highlight: this.state.highlightCountryIndex === index
            });

            var inputFlagClasses = 'flag ' + country.iso2;

            return _react2['default'].createElement(
                'li',
                {
                    ref: 'flag_no_' + index,
                    key: 'flag_no_' + index,
                    'data-flag-key': 'flag_no_' + index,
                    className: itemClasses,
                    'data-dial-code': '1',
                    'data-country-code': country.iso2,
                    onClick: this.handleFlagItemClick.bind(this, country) },
                _react2['default'].createElement('div', { className: inputFlagClasses }),
                _react2['default'].createElement(
                    'span',
                    { className: 'country-name' },
                    country.name
                ),
                _react2['default'].createElement(
                    'span',
                    { className: 'dial-code' },
                    '+' + country.dialCode
                )
            );
        }).bind(this), this);

        var dashedLi = _react2['default'].createElement('li', { key: "dashes", className: 'phone-input-divider' });
        // let's insert a dashed line in between preffered countries and the rest
        countryDropDownList.splice(this.state.preferredCountries.length, 0, dashedLi);

        var dropDownClasses = _classnames2['default']({
            'country-list': true,
            'hide': !this.state.showDropDown
        });

        return _react2['default'].createElement(
            'ul',
            { ref: 'flagDropdownList', className: dropDownClasses },
            countryDropDownList
        );
    };

    ReactPhoneInput.prototype.handleInputKeyDown = function handleInputKeyDown(event) {
        if (event.which === keys.ENTER) {
            this.props.onEnterKeyPress(event);
        }
    };

    ReactPhoneInput.prototype.handleKeydown = function handleKeydown(event) {
        if (!this.state.showDropDown) {
            return;
        }

        // ie hack
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }

        var _moveHighlight = (function __moveHighlight(direction) {
            var _this = this;

            this.setState({
                highlightCountryIndex: this._getHighlightCountryIndex(direction)
            }, function () {
                _this.scrollTo(_this.getElement(_this.state.highlightCountryIndex), true);
            });
        }).bind(this);

        switch (event.which) {
            case keys.DOWN:
                _moveHighlight(1);
                break;
            case keys.UP:
                _moveHighlight(-1);
                break;
            case keys.ENTER:
                this.handleFlagItemClick(this.state.onlyCountries[this.state.highlightCountryIndex], event);
                break;
            case keys.ESC:
                this.setState({ showDropDown: false }, this._cursorToEnd);
                break;
            default:
                if (event.which >= keys.A && event.which <= keys.Z || event.which === keys.SPACE) {
                    this.setState({
                        queryString: this.state.queryString + String.fromCharCode(event.which)
                    }, this.state.debouncedQueryStingSearcher);
                }
        }
    };

    ReactPhoneInput.prototype.searchCountry = function searchCountry() {
        var probableCandidate = this._searchCountry(this.state.queryString) || this.state.onlyCountries[0];
        var probableCandidateIndex = _lodashArray.findIndex(this.state.onlyCountries, probableCandidate) + this.state.preferredCountries.length;

        this.scrollTo(this.getElement(probableCandidateIndex), true);

        this.setState({
            queryString: '',
            highlightCountryIndex: probableCandidateIndex
        });
    };

    ReactPhoneInput.prototype._getHighlightCountryIndex = function _getHighlightCountryIndex(direction) {
        // had to write own function because underscore does not have findIndex. lodash has it
        var highlightCountryIndex = this.state.highlightCountryIndex + direction;

        if (highlightCountryIndex < 0 || highlightCountryIndex >= this.state.onlyCountries.length + this.state.preferredCountries.length) {
            return highlightCountryIndex - direction;
        }

        return highlightCountryIndex;
    };

    ReactPhoneInput.prototype.handleInputFocus = function handleInputFocus() {
        var placeholder = this.props.placeholder;

        // if the input is blank, insert dial code of the selected country
        if (placeholder && _reactDom2['default'].findDOMNode(this.refs.numberInput).value === '' || !placeholder && _reactDom2['default'].findDOMNode(this.refs.numberInput).value === '+') {
            this.setState({ formattedNumber: '+' + this.state.selectedCountry.dialCode });
        }
    };

    ReactPhoneInput.prototype.handleFlagItemClick = function handleFlagItemClick(country) {
        var _this2 = this;

        var currentSelectedCountry = this.state.selectedCountry;
        var nextSelectedCountry = _lodashFindwhere2['default'](this.state.onlyCountries, country);

        if (currentSelectedCountry.iso2 !== nextSelectedCountry.iso2) {
            (function () {
                // TODO - the below replacement is a bug. It will replace stuff from middle too
                var newNumber = _this2.state.formattedNumber.replace(currentSelectedCountry.dialCode, nextSelectedCountry.dialCode);
                var formattedNumber = _this2.formatNumber(newNumber.replace(/\D/g, ''), nextSelectedCountry.format);

                _this2.setState({
                    showDropDown: false,
                    selectedCountry: nextSelectedCountry,
                    freezeSelection: true,
                    formattedNumber: formattedNumber
                }, function anonymousFunction9() {
                    this._cursorToEnd();
                    if (this.props.onChange) {
                        this.props.onChange(formattedNumber);
                    }
                });
            })();
        }
    };

    ReactPhoneInput.prototype.handleInputClick = function handleInputClick() {
        this.setState({ showDropDown: false });
    };

    ReactPhoneInput.prototype.handleInput = function handleInput(event) {
        var formattedNumber = '+';
        var newSelectedCountry = this.state.selectedCountry;
        var freezeSelection = this.state.freezeSelection;

        // Does not exceed 16 digit phone number limit
        if (event.target.value.replace(/\D/g, '').length > this.maxPhoneLength) {
            return;
        }

        // if the input is the same as before, must be some special key like enter etc.
        if (event.target.value === this.state.formattedNumber) {
            return;
        }

        // ie hack
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }

        if (event.target.value.length > 0) {
            // before entering the number in new format, lets check if the dial code now matches some other country
            var inputNumber = event.target.value.replace(/\D/g, '');

            // we don't need to send the whole number to guess the country... only the first 6 characters are enough
            // the guess country function can then use memoization much more effectively since the set of input it gets has drastically reduced
            if (!this.state.freezeSelection || this.state.selectedCountry.dialCode.length > inputNumber.length) {
                newSelectedCountry = this.guessSelectedCountry(inputNumber.substring(0, 6), this.state.onlyCountries);
                freezeSelection = false;
            }
            // let us remove all non numerals from the input
            formattedNumber = this.formatNumber(inputNumber, newSelectedCountry.format);
        }

        var caretPosition = event.target.selectionStart;
        var oldFormattedText = this.state.formattedNumber;
        var diff = formattedNumber.length - oldFormattedText.length;

        this.setState({
            formattedNumber: formattedNumber,
            freezeSelection: freezeSelection,
            selectedCountry: newSelectedCountry.dialCode.length > 0 ? newSelectedCountry : this.state.selectedCountry
        }, function anonymousFunction8() {
            if (isModernBrowser) {
                if (diff > 0) {
                    caretPosition = caretPosition - diff;
                }

                if (caretPosition > 0 && oldFormattedText.length >= formattedNumber.length) {
                    _reactDom2['default'].findDOMNode(this.refs.numberInput).setSelectionRange(caretPosition, caretPosition);
                }
            }

            if (this.props.onChange) {
                this.props.onChange(this.state.formattedNumber);
            }
        });
    };

    ReactPhoneInput.prototype.handleFlagDropdownClick = function handleFlagDropdownClick() {
        var _this3 = this;

        // need to put the highlight on the current selected country if the dropdown is going to open up
        this.setState({
            showDropDown: !this.state.showDropDown,
            highlightCountry: _lodashFindwhere2['default'](this.state.onlyCountries, this.state.selectedCountry),
            highlightCountryIndex: _lodashArray.findIndex(this.state.onlyCountries, this.state.selectedCountry)
        }, function () {
            if (_this3.state.showDropDown) {
                _this3.scrollTo(_this3.getElement(_this3.state.highlightCountryIndex + _this3.state.preferredCountries.length));
            }
        });
    };

    // put the cursor to the end of the input (usually after a focus event)

    ReactPhoneInput.prototype._cursorToEnd = function _cursorToEnd() {
        var input = _reactDom2['default'].findDOMNode(this.refs.numberInput);
        input.focus();
        if (isModernBrowser) {
            var len = input.value.length;
            input.setSelectionRange(len, len);
        }
    };

    ReactPhoneInput.prototype.formatNumber = function formatNumber(text, pattern) {
        if (!text || text.length === 0) {
            return '+';
        }

        // for all strings with length less than 3, just return it (1, 2 etc.)
        // also return the same text if the selected country has no fixed format
        if (text && text.length < 2 || !pattern || !this.props.autoFormat) {
            return '+' + text;
        }

        var formattedObject = _lodashCollection.reduce(pattern, function anonymousFunction7(acc, character) {
            if (acc.remainingText.length === 0) {
                return acc;
            }

            if (character !== '.') {
                return {
                    formattedText: acc.formattedText + character,
                    remainingText: acc.remainingText
                };
            }

            return {
                formattedText: acc.formattedText + _lodashFirst2['default'](acc.remainingText),
                remainingText: _lodashArray.tail(acc.remainingText)
            };
        }, { formattedText: '', remainingText: text.split('') });
        return formattedObject.formattedText + formattedObject.remainingText.join('');
    };

    ReactPhoneInput.prototype.scrollTo = function scrollTo(country, middle) {
        if (!country) return;

        var container = _reactDom2['default'].findDOMNode(this.refs.flagDropdownList);

        if (!container) return;

        var containerHeight = container.offsetHeight;
        var containerOffset = container.getBoundingClientRect();
        var containerTop = containerOffset.top + document.body.scrollTop;
        var containerBottom = containerTop + containerHeight;

        var element = country;
        var elementOffset = element.getBoundingClientRect();

        var elementHeight = element.offsetHeight;
        var elementTop = elementOffset.top + document.body.scrollTop;
        var elementBottom = elementTop + elementHeight;
        var newScrollTop = elementTop - containerTop + container.scrollTop;
        var middleOffset = containerHeight / 2 - elementHeight / 2;

        if (elementTop < containerTop) {
            // scroll up
            if (middle) {
                newScrollTop -= middleOffset;
            }
            container.scrollTop = newScrollTop;
        } else if (elementBottom > containerBottom) {
            // scroll down
            if (middle) {
                newScrollTop += middleOffset;
            }
            var heightDifference = containerHeight - elementHeight;
            container.scrollTop = newScrollTop - heightDifference;
        }
    };

    ReactPhoneInput.prototype.handleClickOutside = function handleClickOutside() {
        if (this.state.showDropDown) {
            this.setState({
                showDropDown: false
            });
        }
    };

    ReactPhoneInput.prototype.render = function render() {
        var _this4 = this;

        var placeholder = this.props.placeholder;

        var arrowClasses = _classnames2['default']({
            'arrow': true,
            'up': this.state.showDropDown
        });
        var inputClasses = _classnames2['default']({
            'form-control': true,
            'invalid-number': !this.props.isValid(this.state.formattedNumber.replace(/\D/g, ''))
        });

        var flagViewClasses = _classnames2['default']({
            'flag-dropdown': true,
            'open-dropdown': this.state.showDropDown
        });

        var inputFlagClasses = 'flag ' + this.state.selectedCountry.iso2;

        return _react2['default'].createElement(
            'div',
            null,
            _react2['default'].createElement('input', {
                onChange: this.handleInput,
                onClick: this.handleInputClick,
                onFocus: this.handleInputFocus,
                onKeyDown: this.handleInputKeyDown,
                value: this.state.formattedNumber === '+' && placeholder ? '' : this.state.formattedNumber,
                ref: 'numberInput',
                type: 'tel',
                className: inputClasses,
                required: 'required',
                id: this.id
            }),
            !placeholder ? null : _react2['default'].createElement(
                'label',
                { className: 'form-control-label', htmlFor: this.id },
                _react2['default'].createElement(
                    'span',
                    { className: 'form-control-label-content' },
                    placeholder
                )
            ),
            _react2['default'].createElement(
                'div',
                { ref: 'flagDropDownButton', className: flagViewClasses, onKeyDown: this.handleKeydown },
                _react2['default'].createElement(
                    'div',
                    { ref: 'selectedFlag', onClick: this.handleFlagDropdownClick, className: 'selected-flag', title: this.state.selectedCountry.name + ': + ' + this.state.selectedCountry.dialCode },
                    _react2['default'].createElement(
                        'div',
                        { className: inputFlagClasses },
                        _react2['default'].createElement('div', { className: arrowClasses })
                    )
                ),
                _react2['default'].createElement(
                    _reactOverlays.Overlay,
                    {
                        show: this.state.showDropDown,
                        placement: 'bottom',
                        onHide: function () {
                            _this4.setState({ showDropDown: false });
                        },
                        container: this,
                        target: function () {
                            return _reactDom.findDOMNode(_this4.refs.numberInput);
                        },
                        rootClose: true
                    },
                    this.getCountryDropDownList()
                )
            )
        );
    };

    return ReactPhoneInput;
})(_react2['default'].Component);

ReactPhoneInput.prototype._searchCountry = _lodashFunction.memoize(function anonymousFunction11(queryString) {
    if (!queryString || queryString.length === 0) {
        return null;
    }
    // don't include the preferred countries in search
    var probableCountries = _lodashCollection.filter(this.state.onlyCountries, function anonymousFunction12(country) {
        return _lodashString.startsWith(country.name.toLowerCase(), queryString.toLowerCase());
    }, this);
    return probableCountries[0];
});

ReactPhoneInput.prototype.guessSelectedCountry = _lodashFunction.memoize(function anonymousFunction13(inputNumber, onlyCountries) {
    var secondBestGuess = _lodashFindwhere2['default'](allCountries, { iso2: this.props.defaultCountry }) || onlyCountries[0];
    var bestGuess = undefined;
    if (_lodashString.trim(inputNumber) !== '') {
        bestGuess = _lodashCollection.reduce(onlyCountries, function anonymousFunction14(selectedCountry, country) {
            if (_lodashString.startsWith(inputNumber, country.dialCode)) {
                if (country.dialCode.length > selectedCountry.dialCode.length) {
                    return country;
                }
                if (country.dialCode.length === selectedCountry.dialCode.length && country.priority < selectedCountry.priority) {
                    return country;
                }
            }

            return selectedCountry;
        }, { dialCode: '', priority: 10001 }, this);
    } else {
        return secondBestGuess;
    }

    if (!bestGuess.name) {
        return secondBestGuess;
    }

    return bestGuess;
});

ReactPhoneInput.defaultProps = {
    value: '',
    autoFormat: true,
    onlyCountries: [],
    excludeCountries: [],
    isValid: isNumberValid,
    onEnterKeyPress: function emtyFunction() {}
};

ReactPhoneInput.propTypes = {
    value: _react2['default'].PropTypes.string,
    autoFormat: _react2['default'].PropTypes.bool,
    defaultCountry: _react2['default'].PropTypes.string,
    onlyCountries: _react2['default'].PropTypes.arrayOf(_react2['default'].PropTypes.string),
    preferredCountries: _react2['default'].PropTypes.arrayOf(_react2['default'].PropTypes.string),
    onChange: _react2['default'].PropTypes.func
};

exports['default'] = ReactPhoneInput;

// React.render(
//   <ReactPhoneInput defaultCountry={'us'} preferredCountries={['us', 'de']} excludeCountries={'in'}/>,
//   document.getElementById('content'))
module.exports = exports['default'];
//# sourceMappingURL=PhoneInput.js.map