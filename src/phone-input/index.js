import React, { Component } from 'react'
import { propTypes } from 'tcomb-react'
import { Str, Func, struct, list } from 'tcomb'
import APhoneInput from './PhoneInput'

export default class PhoneInput extends Component {

    static propTypes = propTypes({
        className: Str,
        value: Str,
        countries: list(struct({
            country: Str,
            isoCode: Str,
            dialCode: Str,
            mask: Str
        })),
        defaultCountry: Str,
        onChange: Func
    })

    onChange(value) {
        const { onChange } = this.props
        onChange(value)
    }

    getCountriesList() {
        const { countries } = this.props
        return countries.map(item => [
            item.country,
            item.isoCode,
            item.dialCode,
            item.mask
        ])
    }

    render() {
        const { value, defaultCountry, className } = this.props
        return (
            <div className={className}>
                <APhoneInput
                  defaultCountry={defaultCountry}
                  value={value}
                  countries={this.getCountriesList()}
                  onChange={::this.onChange}
                />
            </div>
        )
    }
}
