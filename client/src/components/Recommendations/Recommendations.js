import React, { Component } from 'react';
import "./Recommendations.css";

class Recommendations extends Component {

  constructor(props) {
    super(props);

    this.recs = [
      {
        name: "Nordic Countries",
        incl: ["Finland", "Sweden", "Norway", "Denmark", "Iceland"]
      },
      {
        name: "G7 Countries",
        incl: ["United States", "Germany", "France", "United Kingdom", "Japan", "Italy", "Canada"]
      },
      {
        name: "The 5 Most Populous Countries",
        incl: ["China", "India", "United States", "Indonesia", "Brazil"]
      }
    ];
  }

  handleRecommendationClick(countries) {
    countries.forEach((country) => {
      this.props.addCountry(country);
    });
  }

  render() {
    return (
      <div className="Recommendations">
        {this.recs.map((rec, idx) => (
          <button
            className="recommendation"
            key={"rec-" + idx}
            onClick={() => this.handleRecommendationClick(rec.incl)}
          >
            {rec.name} <i className="fas fa-plus"></i>
          </button>
        ))}
      </div>
    );
  }
}

export default Recommendations;
