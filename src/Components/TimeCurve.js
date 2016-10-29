/**
 * Created by Zipeng Liu on 2016-10-26.
 */

import React, { Component } from 'react';
import {line, select, curveCatmullRom} from 'd3';
import  './App.css'

class Point extends Component {
    render() {
        return (
            <circle cx={this.props.x} cy={this.props.y} r="5"></circle>
        )
    }
}

class Spline extends Component {
    componentDidMount() {
        this.path = select(this.refs.spline).append('path')
            .attr('class', 'line');
        this.renderSpline();
    }

    componentDidUpdate() {
        this.renderSpline();
    }

    renderSpline() {
        // D3 manipulation here
        console.log(this.path);
        this.path.datum(this.props.points);
        let l = line()
            .x(d => d[0])
            .y(d => d[1])
            .curve(curveCatmullRom.alpha(0.5));
        this.path.attr('d', l);
    }

    render() {
        return (
            <g ref="spline"></g>
        )
    }
}

class TimeCurve extends Component {
    getControlPoints() {

    }

    render() {
        return (
            <div>
                <svg width="800" height="500">
                    {this.props.points.map((p,i) => (
                        <Point x={p[0]} y={p[1]} key={i} ></Point>
                    ))}
                    <Spline points={this.props.points} />
                </svg>
            </div>
        );
    }
}

export default TimeCurve;
