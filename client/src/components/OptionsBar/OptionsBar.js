import React, { Component } from 'react';
import "./OptionsBar.css";

class OptionsBar extends Component {

  render() {
    let fromYearOptions = [];
    let toYearOptions = [];

    for (let i = 2018; i >= 1960; i--) {
      fromYearOptions.push(
        <option value={i} key={"option-"+i}>{i}</option>
      )
    }
    for (let i = 2018; i >= 1960; i--) {
      toYearOptions.push(
        <option value={i} key={"option-"+i}>{i}</option>
      )
    }

    return (
      <div className="OptionsBar">
        <span className="yearselector">
          Year
          <select name="from-year" onChange={(e) => this.props.updateFromYear(e)} defaultValue="2014">
            {fromYearOptions}
          </select>
          –
          <select name="to-year" onChange={(e) => this.props.updateToYear(e)} defaultValue="2014">
            {toYearOptions}
          </select>
        </span>
        <br />
        <span className="percapita">
          <button onClick={this.props.togglePerCapita}>
            <div className={this.props.perCapita ? "perCapitaSelected" : ""} />
          </button>
          <span className="perCapitaSpan" onClick={this.props.togglePerCapita}>Per Capita</span>
        </span>
      </div>
    );
  }
}

export default OptionsBar;
