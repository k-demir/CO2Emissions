import React, { Component } from 'react';
import "./Search.css";


class Search extends Component {

  constructor(props) {
    super(props);
    this.countrylistUrl = "/api/countrylist";

    this.state = {
      countries: [],
      countriesLowerCase: [],
      searchText: "Finland",
      countryFound: true,
      suggestions: [],
      selectedSuggestion: null,
    }
  }

  componentDidMount() {
    fetch(this.countrylistUrl, {
      method: "GET",
      headers: {'Content-Type':'application/json'}
    })
    .then(res => res.json())
    .then(res => {
      this.setState({countries: res, countriesLowerCase: res.map(x => x.toLowerCase())})
    });
  }

  handleSearchChange(e) {
    this.setState({searchText: e.target.value}, () => {
      if (!this.state.countriesLowerCase.includes(this.state.searchText.toLowerCase())) {
        this.findSuggestions();
        this.setState({countryFound: false})
      } else {
        this.setState({countryFound: true})
      }
    });
  }

  findSuggestions() {
    let sug = [];
    for (let i=0; i < this.state.countriesLowerCase.length; i++) {
      try {
        let re = new RegExp("^" + this.state.searchText.toLowerCase());
        if (this.state.countriesLowerCase[i].match(re)) {
          sug.push(this.state.countries[i]);
        }
        if (sug.length === 5) {
          break;
        }
      } catch (e) {
        continue;
      }
    }
    this.setState({suggestions: sug, selectedSuggestion: Math.min(sug.length, this.state.suggestions.length)-1});
  }

  selectSuggestion(idx) {
    this.setState({selectedSuggestion: idx})
  }

  unselectSuggestion() {
    this.setState({selectedSuggestion: null})
  }

  replaceSearch(e, idx) {
    this.setState({searchText: e.target.getAttribute("text"), countryFound: true, selectedSuggestion: null});
    this.refs.inputArea.focus();
  }

  handleKeyPress(e) {
    if (e.key === "ArrowDown") {
      if (this.state.selectedSuggestion === null) {
        this.selectSuggestion(0);
      } else if (this.state.selectedSuggestion !== this.state.suggestions.length-1) {
        this.selectSuggestion(this.state.selectedSuggestion + 1)
      }
    } else if (e.key === "ArrowUp") {
      if (this.state.selectedSuggestion === null) {
        this.selectSuggestion(4);
      } else if (this.state.selectedSuggestion !== 0) {
        this.selectSuggestion(this.state.selectedSuggestion - 1)
      }
    } else if (e.key === "Enter" && !this.state.countryFound) {
      let txt = this.state.searchText;
      try {
        txt = this.refs["suggestion-"+this.state.selectedSuggestion].getAttribute("text");
        this.setState({searchText: txt, countryFound: true, selectSuggestion: null});
      } catch (e) {}
      this.refs.inputArea.focus();
    } else if (e.key === "Enter" && this.state.searchText.length > 0 && this.state.countryFound
      && this.state.countries.includes(this.state.searchText)) {
        this.handleSearch();
    }
  }

  handleSearch() {
    if (this.state.searchText.length > 0 && this.state.countryFound && this.state.countries.includes(this.state.searchText)) {
      this.props.performSearch(this.state.searchText);
      this.setState({searchText: "", countryFound: false, suggestions: []})
    }
  }

  render() {
    return (
      <div className={"Search" + (this.state.suggestions.length > 0 ? " expanded"+this.state.suggestions.length : "")}>
        <input
          type="text"
          autoComplete="off"
          autoFocus
          id="searchBar"
          onKeyDown={this.handleKeyPress.bind(this)}
          onChange={this.handleSearchChange.bind(this)}
          value={this.state.searchText}
          ref="inputArea"
        />
        <button className="searchButton" onClick={this.handleSearch.bind(this)}>
          <i className="fas fa-search" />
        </button>
        {(this.state.countryFound || this.state.searchText.length === 0) ? "" : <ul className="suggestionsArea">
          {this.state.suggestions.map((suggestion, idx) => (
            <li
              className={"suggestion" + (idx === this.state.selectedSuggestion ? " selected" : "")}
              key={"suggestion-"+idx}
              ref={"suggestion-"+idx}
              text={suggestion}
              onMouseEnter={() => this.selectSuggestion(idx)}
              onMouseLeave={() => this.unselectSuggestion()}
              onClick={(e) => this.replaceSearch(e)}
            >
              {suggestion}
            </li>
          ))}
        </ul>}
      </div>
    );
  }
}

export default Search;
