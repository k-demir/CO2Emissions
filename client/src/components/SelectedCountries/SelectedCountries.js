import React, { Component } from 'react';
import './SelectedCountries.css';

class SelectedCountries extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
    }
  }

  render() {
    return (
      <div className="SelectedCountries">
        {this.props.selected.map((country, idx) => (
          <button
            className="selectedCountryButton" key={"country-" + idx}
            onClick={() => this.props.removeCountryFromSelected(country)}
          >
            {country} <i className="far fa-times-circle"></i>
          </button>
        ))}
        {this.props.selected.length > 0 ? (
          <button
          className="selectedCountryButton"
          onClick={() => this.props.removeAllSelectedCountries()}
        >
          Remove All <i className="far fa-times-circle"></i>
        </button>)
        : ""}
      </div>
    );
  }
}

export default SelectedCountries;
