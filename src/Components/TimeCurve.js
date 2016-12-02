/**
 * Created by Zipeng Liu on 2016-10-26.
 */

import React, { Component } from 'react';
import {line, select, curveCatmullRom, scaleLinear} from 'd3';
import classNames from 'classnames';
import {avoidOverlap} from '../utils';
import  './TimeCurve.css';

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
            .x(d => d.x)
            .y(d => d.y)
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

    render() {
        let {width, height} = this.props;
        let xScale = scaleLinear().range([0, width]);
        let yScale = scaleLinear().range([0, height]);
        let points = this.props.points.map(d => ({x: xScale(d.x), y: yScale(d.y)}));
        points = avoidOverlap(points, 4);
        return (
            <div>
                <svg width={width} height={height}>
                    <Spline points={points} />
                    {points.map((p,i) => (
                        <circle className={classNames('point', {'start-point': i == 0, 'end-point': i == points.length - 1})}
                                cx={p.x} cy={p.y} key={i} r="5"></circle>
                    ))}
                </svg>
            </div>
        );
    }
}

export default TimeCurve;
