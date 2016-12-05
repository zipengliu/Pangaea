/**
 * Created by Zipeng Liu on 2016-10-26.
 */

import React, { Component } from 'react';
import {line, select, curveCatmullRom, scaleLinear} from 'd3';
import {OverlayTrigger, Popover, Table} from 'react-bootstrap';
import classNames from 'classnames';
import {avoidOverlap} from '../utils';
import  './TimeCurve.css';


let Spline = ({points}) => {
    let l = line()
        .x(d => d.x)
        .y(d => d.y)
        .curve(curveCatmullRom.alpha(0.5));
    return (
        <g>
            <path className="line" d={l(points)}/>
        </g>
    )
};


let StateDetail = props => {
    let d = props.data;
    let nodeNames = props.processes;
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
        let {width, height, padding, coordinates} = this.props.timeCurve;
        let xScale = scaleLinear().range([0, width]);
        let yScale = scaleLinear().range([0, height]);
        let points = coordinates.map(d => ({x: xScale(d.x), y: yScale(d.y)}));
        points = avoidOverlap(points, 4);

        let createPopover = (s, i) => <Popover id={'state-' + i} title={"State of Node " + i}>
            <StateDetail data={s} processes={this.props.processes} /></Popover>;
        return (
            <div>
                <svg width={width + padding.left + padding.right} height={height + padding.top + padding.bottom}>
                    <g transform={`translate(${padding.left},${padding.top})`}>
                        <Spline points={points} />
                        {points.map((p,i) => (
                            <OverlayTrigger key={i} trigger="click" placement="right" rootClose
                                            onEntered={this.props.onClickState.bind(null, i)}
                                            onExit={this.props.onClickState.bind(null, null)}
                                            overlay={createPopover(this.props.states[i], i)}>
                                <circle className={classNames('point', {'start-point': i == 0, 'end-point': i == points.length - 1})}
                                        cx={p.x} cy={p.y} r="5"></circle>
                            </OverlayTrigger>
                        ))}
                    </g>
                    <g className="legends" transform={`translate(${width + padding.left},20)`}>
                        <g>
                            <circle className="point" cx="0" cy="0" r="5"/>
                            <text x="10" y="0" dy="4">State (Snapshot)</text>
                        </g>
                        <g transform="translate(0,20)">
                            <circle className="point start-point" cx="0" cy="0" r="5"/>
                            <text x="10" y="0" dy="4">Starting state</text>
                        </g>
                        <g transform="translate(0,40)">
                            <circle className="point end-point" cx="0" cy="0" r="5"/>
                            <text x="10" y="0" dy="4">End state</text>
                        </g>

                    </g>
                </svg>
            </div>
        );
    }
}

export default TimeCurve;
