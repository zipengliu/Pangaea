/**
 * Created by Zipeng Liu on 2016-10-26.
 */

import React, { Component } from 'react';
import {line, select, curveCatmullRom, scaleLinear} from 'd3';
import {OverlayTrigger, Popover, Table} from 'react-bootstrap';
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


let StateDetail = props => {
    let d = props.data;
    let nodeNames = Object.keys(d.Cut.Clocks[0]);
    let rows = [];
    for (let i = 0; i < nodeNames.length; i++) {
        let vars = d.Points[i].Dump;
        for (let j = 0; j < vars.length; j++) {
            rows.push(<tr key={nodeNames[i] + j}>
                {j == 0 && <td rowSpan={vars.length} style={{verticalAlign: 'middle'}}>{nodeNames[i]}</td>}
                <td>{vars[j].VarName}</td>
                <td>{vars[j].Type}</td>
                <td className="value-cell">{JSON.stringify(vars[j].Value)}</td>
            </tr>)
        }
    }
    console.log(rows);

    return (
        <div>
            <h3>Vector Clock</h3>
            <Table condensed striped bordered>
                <thead>
                <tr>
                    <th>Node</th>
                    {nodeNames.map((k, i) => <th key={i}>{k}</th>)}
                </tr>
                </thead>

                <tbody>
                {d.Cut.Clocks.map((c, i) => <tr key={i}>
                    <td>{nodeNames[i]}</td>
                    {nodeNames.map((x, j) => <td key={j}>{c[x]}</td>)}
                </tr>)}
                </tbody>
            </Table>

            <Table condensed striped bordered hover>
                <thead>
                <tr>
                    <th>Node</th><th>Variable</th><th>Type</th><th>Value</th>
                </tr>
                </thead>

                <tbody>
                {rows}
                </tbody>

            </Table>
        </div>
    )
};

class TimeCurve extends Component {

    render() {
        let {width, height} = this.props;
        let xScale = scaleLinear().range([0, width]);
        let yScale = scaleLinear().range([0, height]);
        let points = this.props.points.map(d => ({x: xScale(d.x), y: yScale(d.y)}));
        points = avoidOverlap(points, 4);

        let createPopover = (s, i) => <Popover id={'state-' + i} title={"State of Node " + i}>
            <StateDetail data={s} /></Popover>;
        return (
            <div>
                <svg width={width} height={height}>
                    <Spline points={points} />
                    {points.map((p,i) => (
                        <OverlayTrigger key={i} trigger="click" placement="right" rootClose
                                        overlay={createPopover(this.props.states[i], i)}>
                            <circle className={classNames('point', {'start-point': i == 0, 'end-point': i == points.length - 1})}
                                    cx={p.x} cy={p.y} r="5"></circle>
                        </OverlayTrigger>
                    ))}
                </svg>
            </div>
        );
    }
}

export default TimeCurve;
