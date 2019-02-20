import React, { Component } from 'react';
import ReactTable from "react-table";
import "react-table/react-table.css";
import { Line, Bar, LinePath } from "@vx/shape";

import { localPoint } from "@vx/event";
import { extent, max, bisector } from "d3-array";
import {timeFormat} from "d3-time-format"

import { scaleTime, scaleLinear } from "@vx/scale";

import { withTooltip, Tooltip } from "@vx/tooltip";

const width = window.innerWidth+1000;
const height = window.innerHeight;

const xSelector = (d) => new Date(d.date);
const ySelector = (d) => d.price;



const formatDate = timeFormat("%b %d, '%y");

class Chart extends Component {
    state = {
        data: null
    };

    async componentDidMount() {
        const res = await fetch("https://api.coindesk.com/v1/bpi/historical/close.json");
        const data = await res.json();
        this.setState({
            data: Object.keys(data.bpi).map(date => {
                      return {
                          date,
                          price: data.bpi[date],
                      };
                  })
        })
        //console.log(this.state.data);
    }



    render() {

        const { data } = this.state;
        if (!data)  return null;

        const padding = 100;
        const xMax = width - padding;
        const yMax = height - padding;
        const xScale = scaleTime({
                   range: [padding, xMax],
                   domain: extent(data, xSelector),
        });
        const dataMax = max(data, ySelector);

        const yScale = scaleLinear({
            range: [yMax, padding],
            domain: [0, dataMax + dataMax/5],
        });


        return (

            <div>
                <svg width={width} height={height}>

                    <rect x={0} y={0} width={width} height={height} fill="transparent" />
                    <LinePath
                      data={data}
                      x = {d => xScale}
                      y = {d => yScale}
                      yScale={yScale}
                      x={xSelector}
                      y={ySelector}
                      strokeWidth={5}
                      stroke="#FFF"
                      strokeLinecap="round"
                      fill="transparent"
                    />
                </svg>
            </div>
        )
    }
}

export default withTooltip(Chart);


