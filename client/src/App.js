import React, { Component } from 'react';
import { Container, Row, Col } from "react-bootstrap";
import Search from "./components/Search/Search";
import OptionsBar from "./components/OptionsBar/OptionsBar";
import ResultArea from "./components/ResultArea/ResultArea";
import SelectedCountries from "./components/SelectedCountries/SelectedCountries";
import Recommendations from "./components/Recommendations/Recommendations";
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
      selectedCountries: [],
      fromYear: "2014",
      toYear: "2014",
      perCapita: false,
    }
  }

  performSearch = (country) => {
    if (!this.state.selectedCountries.includes(country)) {
      this.setState((prev) => ({selectedCountries: [...prev.selectedCountries, country]}));
    }
  }

  removeCountryFromSelected = (country) => {
    this.setState({selectedCountries: this.state.selectedCountries.filter(d => d !== country)});
  }

  removeAllSelectedCountries = () => {
    this.setState({selectedCountries: []})
  }

  updateFromYear = (e) => {
    this.setState({fromYear: e.target.value});
  }

  updateToYear = (e) => {
    this.setState({toYear: e.target.value});
  }

  togglePerCapita = () => {
    this.setState((prev) => ({perCapita: !prev.perCapita}));
  }

  render() {
    return (
      <div className="App">
        <Container id="container">
          <Row>
            <Col md={12} xs={12}>
              <h1 id="title">CO<sup>2</sup>-emissions</h1>
            </Col>
          </Row>
          <Row>
            <Col md={6} xs={12}>
              <Search performSearch={this.performSearch} />
            </Col>
            <Col md={6} xs={12}>
              <OptionsBar
                date={this.state.date}
                updateFromYear={this.updateFromYear}
                updateToYear={this.updateToYear}
                togglePerCapita={this.togglePerCapita}
                fromYear={this.state.fromYear}
                toYear={this.state.toYear}
                perCapita={this.state.perCapita}
              />
            </Col>
          </Row>
          <Row id="resRow">
            <Col xs={12} id="resCol">
              <ResultArea
                selected={this.state.selectedCountries}
                fromYear={this.state.fromYear}
                toYear={this.state.toYear}
                perCapita={this.state.perCapita}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <SelectedCountries
                selected={this.state.selectedCountries}
                removeCountryFromSelected={this.removeCountryFromSelected}
                removeAllSelectedCountries={this.removeAllSelectedCountries}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <Recommendations
                addCountry={this.performSearch}
              />
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default App;
