// TODO - fix the onlyContries props. Currently expects that as an array of country object, but users should be able to send in array of country isos

import { some, reduce, map, filter, includes } from 'lodash/collection'
import findWhere from 'lodash.findwhere'
import { findIndex, tail } from 'lodash/array'
import first from 'lodash.first'
import { debounce, memoize } from 'lodash/function'
import { trim, startsWith } from 'lodash/string'
import React from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import {Overlay} from 'react-overlays'
import {findDOMNode} from 'react-dom'
import clone from 'clone'

function nameSpace(allCountriesIn) {
    const allCountries = clone(allCountriesIn)
    const allCountryCodes = {}
    const addCountryCode = function addingCountryCode(iso2, dialCode, priority) {
        if (!(dialCode in allCountryCodes)) {
            allCountryCodes[dialCode] = []
        }
        const index = priority || 0
        allCountryCodes[dialCode][index] = iso2
    }

    for (let i = 0; i < allCountries.length; i++) {
        const c = allCountries[i]
        allCountries[i] = {
            name: c[0],
            iso2: c[1],
            dialCode: c[2],
            priority: c[4] || 0
        }
        if (c[3]) {
            allCountries[i].format = c[3]
        }
        if (c[5]) {
            allCountries[i].hasAreaCodes = true
            for (let j = 0; j < c[5].length; j++) {
                const dialCode = c[2] + c[5][j]
                addCountryCode(c[1], dialCode)
            }
        }
        addCountryCode(c[1], c[2], c[4])
    }

    return {
        allCountries: allCountries,
        allCountryCodes: allCountryCodes
    }
}

let countryData
let allCountries

const isModernBrowser = Boolean(document.createElement('input').setSelectionRange)
const keys = {
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
}

function isNumberValid(inputNumber) {
    const countries = countryData.allCountries
    return some(countries, function anonymousFunction1(country) {
        return startsWith(inputNumber, country.dialCode) || startsWith(country.dialCode, inputNumber)
    })
}

function getOnlyCountries(onlyCountriesArray) {
    if (onlyCountriesArray.length === 0) {
        return allCountries
    }
    const selectedCountries = []
    allCountries.map(function anonymousFunction2(country) {
        onlyCountriesArray.map(function anonymousFunction3(selCountry) {
            if (country.iso2 === selCountry) {
                selectedCountries.push(country)
            }
        })
    })
    return selectedCountries
}

function excludeCountries(selectedCountries, excludedCountries) {
    if (excludedCountries.length === 0) {
        return selectedCountries
    }
    const newSelectedCountries = filter(selectedCountries, function anonymousFunction4(selCountry) {
        return !includes(excludedCountries, selCountry.iso2)
    })
    return newSelectedCountries
}

class ReactPhoneInput extends React.Component {

    constructor(props) {
        super(props)
        countryData = nameSpace(props.countries || [[ 'Россия', 'ru', '7' ]])
        allCountries = countryData.allCountries
        const inputNumber = this.props.value || ''
        const onlyCountries = excludeCountries(getOnlyCountries(props.onlyCountries), props.excludeCountries)
        const selectedCountryGuess = this.guessSelectedCountry(inputNumber.replace(/\D/g, ''), onlyCountries)
        const selectedCountryGuessIndex = findIndex(allCountries, selectedCountryGuess)
        const formattedNumber = this.formatNumber(inputNumber.replace(/\D/g, ''), selectedCountryGuess ? selectedCountryGuess.format : null)
        const preferredCountries = filter(allCountries, function anonymousFunction5(country) {
            return some(this.props.preferredCountries, function anonymousFunction6(preferredCountry) {
                return preferredCountry === country.iso2
            })
        }.bind(this), this)

        this.getNumber = this.getNumber.bind(this)
        this.getValue = this.getValue.bind(this)
        this.scrollTo = this.scrollTo.bind(this)
        this.formatNumber = this.formatNumber.bind(this)
        this._cursorToEnd = this._cursorToEnd.bind(this)
        this.guessSelectedCountry = this.guessSelectedCountry.bind(this)
        this.getElement = this.getElement.bind(this)
        this.handleFlagDropdownClick = this.handleFlagDropdownClick.bind(this)
        this.handleInput = this.handleInput.bind(this)
        this.handleInputClick = this.handleInputClick.bind(this)
        this.handleFlagItemClick = this.handleFlagItemClick.bind(this)
        this.handleInputFocus = this.handleInputFocus.bind(this)
        this._getHighlightCountryIndex = this._getHighlightCountryIndex.bind(this)
        this._searchCountry = this._searchCountry.bind(this)
        this.searchCountry = this.searchCountry.bind(this)
        this.handleKeydown = this.handleKeydown.bind(this)
        this.handleInputKeyDown = this.handleInputKeyDown.bind(this)
        this.getCountryDropDownList = this.getCountryDropDownList.bind(this)
        this.maxPhoneLength = props.maxPhoneLength || 16
        this.id = Math.round(Math.random() * 1e9)

        this.state = {
            preferredCountries: preferredCountries,
            selectedCountry: selectedCountryGuess,
            highlightCountryIndex: selectedCountryGuessIndex,
            formattedNumber: formattedNumber,
            showDropDown: false,
            queryString: '',
            freezeSelection: false,
            debouncedQueryStingSearcher: debounce(this.searchCountry, 100),
            onlyCountries: onlyCountries
        }
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeydown)
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeydown)
    }

    getElement(index) {
        return ReactDOM.findDOMNode(this.refs[`flag_no_${index}`])
    }

    getValue() {
        return this.getNumber()
    }

    getNumber() {
        return this.state.formattedNumber !== '+' ? this.state.formattedNumber : ''
    }

    getCountryDropDownList() {
        const countryDropDownList = map(this.state.preferredCountries.concat(this.state.onlyCountries), function anonymousFunction10(country, index) {
            const itemClasses = classNames({
                country: true,
                preferred: country.iso2 === 'us' || country.iso2 === 'gb',
                active: country.iso2 === 'us',
                highlight: this.state.highlightCountryIndex === index
            })

            const inputFlagClasses = `flag ${country.iso2}`

            return (
                <li
                    ref={`flag_no_${index}`}
                    key={`flag_no_${index}`}
                    data-flag-key={`flag_no_${index}`}
                    className={itemClasses}
                    data-dial-code="1"
                    data-country-code={country.iso2}
                    onClick={this.handleFlagItemClick.bind(this, country)}>
                    <div className={inputFlagClasses} />
                    <span className="country-name">{country.name}</span>
                    <span className="dial-code">{'+' + country.dialCode}</span>
                </li>
            )
        }.bind(this), this)

        const dashedLi = (<li key={"dashes"} className="phone-input-divider" />)
        // let's insert a dashed line in between preffered countries and the rest
        countryDropDownList.splice(this.state.preferredCountries.length, 0, dashedLi)

        const dropDownClasses = classNames({
            'country-list': true,
            'hide': !this.state.showDropDown
        })

        return (
            <ul ref="flagDropdownList" className={dropDownClasses}>
                {countryDropDownList}
            </ul>
        )
    }

    handleInputKeyDown(event) {
        if (event.which === keys.ENTER) {
            this.props.onEnterKeyPress(event)
        }
    }

    handleKeydown(event) {
        if (!this.state.showDropDown) {
            return
        }

        // ie hack
        if (event.preventDefault) {
            event.preventDefault()
        } else {
            event.returnValue = false
        }

        const _moveHighlight = function __moveHighlight(direction) {
            this.setState({
                highlightCountryIndex: this._getHighlightCountryIndex(direction)
            }, () => {
                this.scrollTo(this.getElement(this.state.highlightCountryIndex), true)
            })
        }.bind(this)

        switch (event.which) {
            case keys.DOWN:
                _moveHighlight(1)
                break
            case keys.UP:
                _moveHighlight(-1)
                break
            case keys.ENTER:
                this.handleFlagItemClick(this.state.onlyCountries[this.state.highlightCountryIndex], event)
                break
            case keys.ESC:
                this.setState({showDropDown: false}, this._cursorToEnd)
                break
            default:
                if ((event.which >= keys.A && event.which <= keys.Z) || event.which === keys.SPACE) {
                    this.setState({
                        queryString: this.state.queryString + String.fromCharCode(event.which)
                    }, this.state.debouncedQueryStingSearcher)
                }
        }
    }

    searchCountry() {
        const probableCandidate = this._searchCountry(this.state.queryString) || this.state.onlyCountries[0]
        const probableCandidateIndex = findIndex(this.state.onlyCountries, probableCandidate) + this.state.preferredCountries.length

        this.scrollTo(this.getElement(probableCandidateIndex), true)

        this.setState({
            queryString: '',
            highlightCountryIndex: probableCandidateIndex
        })
    }

    _getHighlightCountryIndex(direction) {
        // had to write own function because underscore does not have findIndex. lodash has it
        const highlightCountryIndex = this.state.highlightCountryIndex + direction

        if (highlightCountryIndex < 0
            || highlightCountryIndex >= (this.state.onlyCountries.length + this.state.preferredCountries.length)) {
            return highlightCountryIndex - direction
        }

        return highlightCountryIndex
    }

    handleInputFocus() {
        const { placeholder } = this.props
        // if the input is blank, insert dial code of the selected country
        if (
            placeholder && ReactDOM.findDOMNode(this.refs.numberInput).value === '' ||
            !placeholder && ReactDOM.findDOMNode(this.refs.numberInput).value === '+'
        ) {
            this.setState({formattedNumber: '+' + this.state.selectedCountry.dialCode})
        }
    }

    handleFlagItemClick(country) {
        const currentSelectedCountry = this.state.selectedCountry
        const nextSelectedCountry = findWhere(this.state.onlyCountries, country)

        if (currentSelectedCountry.iso2 !== nextSelectedCountry.iso2) {
            // TODO - the below replacement is a bug. It will replace stuff from middle too
            const newNumber = this.state.formattedNumber.replace(currentSelectedCountry.dialCode, nextSelectedCountry.dialCode)
            const formattedNumber = this.formatNumber(newNumber.replace(/\D/g, ''), nextSelectedCountry.format)

            this.setState({
                showDropDown: false,
                selectedCountry: nextSelectedCountry,
                freezeSelection: true,
                formattedNumber: formattedNumber
            }, function anonymousFunction9() {
                this._cursorToEnd()
                if (this.props.onChange) {
                    this.props.onChange(formattedNumber)
                }
            })
        }
    }

    handleInputClick() {
        this.setState({showDropDown: false})
    }

    handleInput(event) {
        let formattedNumber = '+'
        let newSelectedCountry = this.state.selectedCountry
        let freezeSelection = this.state.freezeSelection

        // Does not exceed 16 digit phone number limit
        if (event.target.value.replace(/\D/g, '').length > this.maxPhoneLength) {
            return
        }

        // if the input is the same as before, must be some special key like enter etc.
        if (event.target.value === this.state.formattedNumber) {
            return
        }

        // ie hack
        if (event.preventDefault) {
            event.preventDefault()
        } else {
            event.returnValue = false
        }

        if (event.target.value.length > 0) {
            // before entering the number in new format, lets check if the dial code now matches some other country
            const inputNumber = event.target.value.replace(/\D/g, '')

            // we don't need to send the whole number to guess the country... only the first 6 characters are enough
            // the guess country function can then use memoization much more effectively since the set of input it gets has drastically reduced
            if (!this.state.freezeSelection || this.state.selectedCountry.dialCode.length > inputNumber.length) {
                newSelectedCountry = this.guessSelectedCountry(inputNumber.substring(0, 6), this.state.onlyCountries)
                freezeSelection = false
            }
            // let us remove all non numerals from the input
            formattedNumber = this.formatNumber(inputNumber, newSelectedCountry.format)
        }

        let caretPosition = event.target.selectionStart
        const oldFormattedText = this.state.formattedNumber
        const diff = formattedNumber.length - oldFormattedText.length

        this.setState({
            formattedNumber: formattedNumber,
            freezeSelection: freezeSelection,
            selectedCountry: newSelectedCountry.dialCode.length > 0 ? newSelectedCountry : this.state.selectedCountry
        }, function anonymousFunction8() {
            if (isModernBrowser) {
                if (diff > 0) {
                    caretPosition = caretPosition - diff
                }

                if (caretPosition > 0 && oldFormattedText.length >= formattedNumber.length) {
                    ReactDOM.findDOMNode(this.refs.numberInput).setSelectionRange(caretPosition, caretPosition)
                }
            }

            if (this.props.onChange) {
                this.props.onChange(this.state.formattedNumber)
            }
        })
    }

    handleFlagDropdownClick() {
        // need to put the highlight on the current selected country if the dropdown is going to open up
        this.setState({
            showDropDown: !this.state.showDropDown,
            highlightCountry: findWhere(this.state.onlyCountries, this.state.selectedCountry),
            highlightCountryIndex: findIndex(this.state.onlyCountries, this.state.selectedCountry)
        }, () => {
            if (this.state.showDropDown) {
                this.scrollTo(this.getElement(this.state.highlightCountryIndex + this.state.preferredCountries.length))
            }
        })
    }

    // put the cursor to the end of the input (usually after a focus event)
    _cursorToEnd() {
        const input = ReactDOM.findDOMNode(this.refs.numberInput)
        input.focus()
        if (isModernBrowser) {
            const len = input.value.length
            input.setSelectionRange(len, len)
        }
    }

    formatNumber(text, pattern) {
        if (!text || text.length === 0) {
            return '+'
        }

        // for all strings with length less than 3, just return it (1, 2 etc.)
        // also return the same text if the selected country has no fixed format
        if ((text && text.length < 2) || !pattern || !this.props.autoFormat) {
            return `+${text}`
        }

        const formattedObject = reduce(pattern, function anonymousFunction7(acc, character) {
            if (acc.remainingText.length === 0) {
                return acc
            }

            if (character !== '.') {
                return {
                    formattedText: acc.formattedText + character,
                    remainingText: acc.remainingText
                }
            }

            return {
                formattedText: acc.formattedText + first(acc.remainingText),
                remainingText: tail(acc.remainingText)
            }
        }, {formattedText: '', remainingText: text.split('')})
        return formattedObject.formattedText + formattedObject.remainingText.join('')
    }

    scrollTo(country, middle) {
        if (!country) return

        const container = ReactDOM.findDOMNode(this.refs.flagDropdownList)

        if (!container) return

        const containerHeight = container.offsetHeight
        const containerOffset = container.getBoundingClientRect()
        const containerTop = containerOffset.top + document.body.scrollTop
        const containerBottom = containerTop + containerHeight

        const element = country
        const elementOffset = element.getBoundingClientRect()

        const elementHeight = element.offsetHeight
        const elementTop = elementOffset.top + document.body.scrollTop
        const elementBottom = elementTop + elementHeight
        let newScrollTop = elementTop - containerTop + container.scrollTop
        const middleOffset = (containerHeight / 2) - (elementHeight / 2)

        if (elementTop < containerTop) {
            // scroll up
            if (middle) {
                newScrollTop -= middleOffset
            }
            container.scrollTop = newScrollTop
        } else if (elementBottom > containerBottom) {
            // scroll down
            if (middle) {
                newScrollTop += middleOffset
            }
            const heightDifference = containerHeight - elementHeight
            container.scrollTop = newScrollTop - heightDifference
        }
    }

    handleClickOutside() {
        if (this.state.showDropDown) {
            this.setState({
                showDropDown: false
            })
        }
    }

    render() {
        const { placeholder } = this.props

        const arrowClasses = classNames({
            'arrow': true,
            'up': this.state.showDropDown
        })
        const inputClasses = classNames({
            'form-control': true,
            'invalid-number': !this.props.isValid(this.state.formattedNumber.replace(/\D/g, ''))
        })

        const flagViewClasses = classNames({
            'flag-dropdown': true,
            'open-dropdown': this.state.showDropDown
        })

        const inputFlagClasses = `flag ${this.state.selectedCountry.iso2}`

        return (
            <div>
                <input
                    onChange={this.handleInput}
                    onClick={this.handleInputClick}
                    onFocus={this.handleInputFocus}
                    onKeyDown={this.handleInputKeyDown}
                    value={this.state.formattedNumber === '+' && placeholder ? '' : this.state.formattedNumber}
                    ref="numberInput"
                    type="tel"
                    className={inputClasses}
                    required="required"
                    id={this.id}
                />
                {
                    !placeholder ? null :
                        <label className={'form-control-label'} htmlFor={this.id}>
                            <span className={'form-control-label-content'}>
                                {placeholder}
                            </span>
                        </label>
                }
                <div ref="flagDropDownButton" className={flagViewClasses} onKeyDown={this.handleKeydown} >
                    <div ref="selectedFlag" onClick={this.handleFlagDropdownClick} className="selected-flag" title={`${this.state.selectedCountry.name}: + ${this.state.selectedCountry.dialCode}`}>
                        <div className={inputFlagClasses}>
                            <div className={arrowClasses}></div>
                        </div>
                    </div>
                    <Overlay
                        show={this.state.showDropDown}
                        placement="bottom"
                        onHide={() => { this.setState({ showDropDown: false }) }}
                        container={this}
                        target={() => findDOMNode(this.refs.numberInput)}
                        rootClose
                        >
                        {this.getCountryDropDownList()}
                    </Overlay>
                </div>
            </div>
        )
    }
}
ReactPhoneInput.prototype._searchCountry = memoize(function anonymousFunction11(queryString) {
    if (!queryString || queryString.length === 0) {
        return null
    }
    // don't include the preferred countries in search
    const probableCountries = filter(this.state.onlyCountries, function anonymousFunction12(country) {
        return startsWith(country.name.toLowerCase(), queryString.toLowerCase())
    }, this)
    return probableCountries[0]
})

ReactPhoneInput.prototype.guessSelectedCountry = memoize(function anonymousFunction13(inputNumber, onlyCountries) {
    const secondBestGuess = findWhere(allCountries, {iso2: this.props.defaultCountry}) || onlyCountries[0]
    let bestGuess
    if (trim(inputNumber) !== '') {
        bestGuess = reduce(onlyCountries, function anonymousFunction14(selectedCountry, country) {
            if (startsWith(inputNumber, country.dialCode)) {
                if (country.dialCode.length > selectedCountry.dialCode.length) {
                    return country
                }
                if (country.dialCode.length === selectedCountry.dialCode.length && country.priority < selectedCountry.priority) {
                    return country
                }
            }

            return selectedCountry
        }, {dialCode: '', priority: 10001}, this)
    } else {
        return secondBestGuess
    }

    if (!bestGuess.name) {
        return secondBestGuess
    }

    return bestGuess
})

ReactPhoneInput.defaultProps = {
    value: '',
    autoFormat: true,
    onlyCountries: [],
    excludeCountries: [],
    isValid: isNumberValid,
    onEnterKeyPress: function emtyFunction() {}
}

ReactPhoneInput.propTypes = {
    value: React.PropTypes.string,
    autoFormat: React.PropTypes.bool,
    defaultCountry: React.PropTypes.string,
    onlyCountries: React.PropTypes.arrayOf(React.PropTypes.string),
    preferredCountries: React.PropTypes.arrayOf(React.PropTypes.string),
    onChange: React.PropTypes.func
}

export default ReactPhoneInput

// React.render(
//   <ReactPhoneInput defaultCountry={'us'} preferredCountries={['us', 'de']} excludeCountries={'in'}/>,
//   document.getElementById('content'))
