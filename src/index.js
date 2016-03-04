import React, { Component } from 'react'
import { render } from 'react-dom'
import PhoneInput from './phone-input'
import countries from './country_data'

export default class App extends Component {

    constructor(props) {
        super(props)
        this.state = {
            value: ''
        }
    }

    onChange(value) {
        this.setState({ value: value })
    }

    render() {
        return (
            <div style={{ maxWidth: 400 }}>
                <PhoneInput
                    value={this.state.value}
                    defaultCountry={'ru'}
                    countries={countries}
                    onChange={::this.onChange}
                    />
            </div>
        )
    }

}

render(<App/>, document.getElementById('app'))