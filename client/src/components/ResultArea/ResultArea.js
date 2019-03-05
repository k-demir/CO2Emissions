import React, { Component } from 'react';
import "./ResultArea.css";

class ResultArea extends Component {

  constructor(props) {
    super(props);
    this.apiurl = "/api/countries/";
    this.state = {
      data: [],
      iw: window.innerWidth,
      ih: window.innerHeight,
    }
  }

  componentDidMount() {
    this.initCanvas();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }

  updateDimensions() {
    this.setState({iw: window.innerWidth, ih: window.innerHeight}, () => {
      this.initCanvas();
      this.updateCanvas();
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.fromYear !== this.props.fromYear
      || prevProps.toYear !== this.props.toYear
      || prevProps.perCapita !== this.props.perCapita) {
        this.updateCanvas();
    } else {
      let c = [];
      for (let d of this.state.data) {
        c.push(d.name);
      }
      if (!this.arraysEqual(c, this.props.selected)) {
        let countryQuery = "";
        for (let i=0; i < this.props.selected.length; i++) {
          countryQuery += (this.props.selected[i]);
          if (i !== this.props.selected.length - 1) {
            countryQuery += "+"
          }
        }
        if (this.props.selected.length > 0) {
          fetch(this.apiurl + countryQuery, {
            method: "GET",
            headers: {'Content-Type':'application/json'}
          })
          .then(res => res.json())
          .then(res => {
            this.setState(() => ({data: res}), () => {
              this.updateCanvas();
            });
          });
        } else {
          this.setState({data: []}, () => {
            this.updateCanvas();
          })
        }
      }
    }
  }

  arraysEqual(p, n) {
    if (p.length !== n.length)
        return false;
    if (p.every((d) => n.includes(d)) && n.every((d) => p.includes(d)))
      return true;
    return false;
  }


  initCanvas() {
    let wd = this.state.iw <= 992 ? this.state.iw - 30 : this.state.iw * 0.6 - 30;
    let ht = this.state.ih * 0.6;

    var canvas = this.refs.canvas;
    var ctx = this.refs.canvas.getContext("2d");

    // Make the canvas sharp for retina screens
    canvas.style.width = wd + "px";
    canvas.style.height = ht + "px";
    var scale = window.devicePixelRatio;
    canvas.width = wd * scale;
    canvas.height = ht * scale;
    ctx.scale(scale, scale);
  }


  updateCanvas() {
    let wd = this.state.iw <= 992 ? this.state.iw - 30 : this.state.iw * 0.6 - 30;
    let ht = this.state.ih * 0.6;

    let scalingPerCapita = 1000000;
    let colors = ["#230007", "#700303", "#111D4A", "#7F674C", "#A40606",
                  "#1E1E24", "#92140C", "#D98324", "#FFCF99", "#99582A",
                  "#432818", "#D7CF07", "#2A0C4E", "#EEBA0B", "#090C02",
                  "#441144", "#114444", "#444411", "#114411", "#441111"
                ];

    var ctx = this.refs.canvas.getContext("2d");
    ctx.clearRect(0, 0, wd, ht);
    ctx.lineWidth = 2;
    ctx.font = "300 12px 'Raleway'";

    // Bar chart
    if (this.props.fromYear === this.props.toYear) {
      let ncountries = this.state.data.length;
      let maxVal = 0;

      // Determine maximum value
      for (let i=0; i < ncountries; i++) {
        for (let j=0; j < this.state.data[i].data.length; j++) {
          // If per capita
          if (this.props.perCapita
            && this.state.data[i].data[j].year === this.props.fromYear
            && scalingPerCapita * this.state.data[i].data[j].emissions / this.state.data[i].data[j].population > maxVal
            && this.state.data[i].data[j].population !== null
            && this.state.data[i].data[j].population !== 0
          )
            maxVal = scalingPerCapita * this.state.data[i].data[j].emissions / this.state.data[i].data[j].population;
          // If not per capita
          else if (!this.props.perCapita
            && this.state.data[i].data[j].year === this.props.fromYear
            && this.state.data[i].data[j].emissions > maxVal
          )
            maxVal = this.state.data[i].data[j].emissions;
        }
      }
      // Draw the chart
      for (let i=0; i < ncountries; i++) {
        for (let j=0; j < this.state.data[i].data.length; j++) {
          if (this.state.data[i].data[j].year === this.props.fromYear) {
            let barHeight = 0;
            if (this.state.data[i].data[j].emissions !== null)
                barHeight = -(this.state.data[i].data[j].emissions * ht * 0.9 / maxVal);

            if (this.props.perCapita && this.state.data[i].data[j].emissions !== null)
              barHeight = -(scalingPerCapita * this.state.data[i].data[j].emissions / this.state.data[i].data[j].population * ht * 0.9 / maxVal);

            ctx.fillStyle = colors[i]

            ctx.fillRect(
              ncountries === 1 ? wd/4 : 35 + i*(wd-35) / ncountries,
              ht-20,
              ncountries === 1 ? wd/2 : (wd-70)/ncountries,
              barHeight
            );

            ctx.textAlign = "center";
            ctx.fillText(
              this.state.data[i].name,
              35 + ((i+0.5)*(wd-35) - 17.5 )/ ncountries,
              ht-5
            );
          }
        }
      }
      this.drawAxes(ctx, ht, wd, maxVal, 0, false);
    }


    // Line chart
    else if (this.props.fromYear < this.props.toYear) {
      let ncountries = this.state.data.length;
      let maxVal = 0;

      // Determine maximum value
      for (let i=0; i < ncountries; i++) {
        for (let j=0; j < this.state.data[i].data.length; j++) {
          if (this.state.data[i].data[j].year >= this.props.fromYear && this.state.data[i].data[j].year <= this.props.toYear) { 
            // If per capita
            if (this.props.perCapita) {
              if (this.state.data[i].data[j].emissions !== null
                && this.state.data[i].data[j].population !== null
                && this.state.data[i].data[j].population !== 0
                && scalingPerCapita * this.state.data[i].data[j].emissions / this.state.data[i].data[j].population > maxVal
              )
                maxVal = scalingPerCapita * this.state.data[i].data[j].emissions / this.state.data[i].data[j].population;
            }
            // If not per capita
            else {
              if (this.state.data[i].data[j].emissions !== null && this.state.data[i].data[j].emissions > maxVal) {
                maxVal = this.state.data[i].data[j].emissions;
              }
            }
          }
        }
      }
      // Save the points
      let allArrs = [];
      for (let i=0; i < ncountries; i++) {
        let arr = new Array(this.props.toYear - this.props.fromYear + 1).fill(0);
        for (let j=0; j < this.state.data[i].data.length; j++) {
          // If per capita
          if (this.props.perCapita) {
            if (this.state.data[i].data[j].year >= this.props.fromYear
              && this.state.data[i].data[j].year <= this.props.toYear
              && this.state.data[i].data[j].emissions !== null
              && this.state.data[i].data[j].population !== null
            ) {
              arr[this.state.data[i].data[j].year - this.props.fromYear] = scalingPerCapita * this.state.data[i].data[j].emissions / this.state.data[i].data[j].population;
            }
          }
          // If not per capita
          else {
            if (this.state.data[i].data[j].year >= this.props.fromYear && this.state.data[i].data[j].year <= this.props.toYear && this.state.data[i].data[j].emissions !== null) {
              arr[this.state.data[i].data[j].year - this.props.fromYear] = this.state.data[i].data[j].emissions;
            }
          }
        }
        allArrs.push({name: this.state.data[i].name, arr: arr})
      }

      // Draw the chart
      allArrs.forEach(function(country, i) {
        let lastValPos = 0;
        ctx.strokeStyle = colors[i];
        ctx.fillStyle = colors[i];
        ctx.beginPath();
        ctx.moveTo(35, ht - country.arr[0]/maxVal * (ht-60) - 20)

        let endTemp = false;
        for (let k=0; k < country.arr.length; k++) {
          if (country.arr[k] === null || country.arr[k] === 0) {
            endTemp = true;
            ctx.stroke();
            continue;
          }
          if (endTemp) {
            ctx.beginPath();
            ctx.moveTo(35 + k*(wd-100)/country.arr.length, ht - country.arr[k]/maxVal * (ht-60) - 20);
            endTemp = false;
            continue;
          }
          lastValPos = ht - country.arr[k]/maxVal * (ht-60) - 20;
          ctx.lineTo(35 + k*(wd-100)/(country.arr.length-1), ht - country.arr[k]/maxVal * (ht-60) - 20);
        }
        ctx.stroke();

        // Add labels
        ctx.textAlign = "end";

        let textYpos = 0;
        if (country.arr.length > 2)
          textYpos = lastValPos -
          country.arr[country.arr.length-1] / (2*country.arr[country.arr.length-2]+country.arr[country.arr.length-3])/3 * 4;
        else
            textYpos = lastValPos -
          country.arr[country.arr.length-1] / country.arr[country.arr.length-2] * 4;

        ctx.fillText(
          country.name,
          wd - 15,
          textYpos
        );
      });

      this.drawAxes(ctx, ht, wd, maxVal, true);
    }
  }


  drawAxes(ctx, ht, wd, maxVal, x) {
    if (this.state.data.length > 0) {
      ctx.font = "10px Arial";
      ctx.fillStyle = "#ccc";
      ctx.strokeStyle = "#ccc";
      ctx.lineWidth = 1;

      // y-axis
      ctx.beginPath();
      ctx.moveTo(33, ht-20);
      ctx.lineTo(33, 20);
      ctx.stroke();

      ctx.font = "10px Arial";
      ctx.fillStyle = "#ccc";
      // y-axis ticks & labels
      let s = Math.floor(Math.log10(maxVal));
      let p = 1;
      if (maxVal > 100)
        p = Math.floor(Math.log10(maxVal)-0.6);

      let sparsenLabels = false;
      if (p < s)
        sparsenLabels = true;

      for (let v=0; v <= Math.floor(maxVal); v += Math.pow(10, p)) {
        if (v % Math.pow(10, s) === 0 || (sparsenLabels && v % (2*Math.pow(10, p)) === 0)) {
          ctx.beginPath();
          ctx.moveTo(30, ht - v/maxVal * (ht-60) - 20);
          ctx.lineTo(36, ht - v/maxVal * (ht-60) - 20);
          ctx.stroke();

          let label = v;
          if (!this.props.perCapita)
            label *= 1000000;

          if (label >= Math.pow(1000, 4))
            label = (label / Math.pow(1000, 4)) + "T";
          else if (label >= Math.pow(1000, 3))
            label = (label / Math.pow(1000, 3)) + "B";
          else if (label >= Math.pow(1000, 2))
            label = (label / Math.pow(1000, 2)) + "M";
          else if (label >= 1000)
            label = (label / 1000) + "k";

          ctx.textAlign = "end";
          ctx.fillText(label, 29, ht - v/maxVal * (ht-60) - 17);
        }
      }

      if (x) {
        // x-axis
        ctx.beginPath();
        ctx.moveTo(33, ht-20);
        ctx.lineTo(wd-20, ht-20);
        ctx.stroke();

        // x-axis ticks & labels
        for (let y=this.props.fromYear; y <= this.props.toYear; y++) {
          ctx.textAlign = "center";

          if (this.props.toYear - this.props.fromYear <= 10
            || (this.props.toYear - this.props.fromYear > 10 && this.props.toYear - this.props.fromYear <= 30 && y % 2 === 0)
            || (this.props.toYear - this.props.fromYear > 30 && y % 5 === 0)
          ) {
            ctx.beginPath();
            ctx.moveTo(35 + (y - this.props.fromYear)*(wd-100)/(this.props.toYear - this.props.fromYear), ht-17);
            ctx.lineTo(35 + (y - this.props.fromYear)*(wd-100)/(this.props.toYear - this.props.fromYear), ht-23);
            ctx.stroke();

            ctx.fillText(y, 35 + (y - this.props.fromYear)*(wd-100)/(this.props.toYear - this.props.fromYear), ht-5)
          }
        }
      }
    }
  }

  render() {
    return (
      <div className="ResultArea">
        <canvas id="results" ref="canvas" />
      </div>
    );
  }
}

export default ResultArea;
