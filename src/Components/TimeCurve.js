/**
 * Created by Zipeng Liu on 2016-10-26.
 */

import React, { Component } from 'react';
import reactDOM from 'react-dom';
import {line, curveCatmullRom, interpolateRgb} from 'd3';
import {OverlayTrigger, Popover, Table} from 'react-bootstrap';
import classNames from 'classnames';
import {segmentPath} from '../utils';
import  './TimeCurve.css';


class Spline extends Component {
    componentDidMount() {
        let path = reactDOM.findDOMNode(this.refs.path);
        let segments = segmentPath(path, 8);
        this.props.onPathSegmentReady(segments);
    }
    render() {
        let {segments} = this.props;
        if (segments == null) {
            let l = line()
                .x(d => d.x)
                .y(d => d.y)
                .curve(curveCatmullRom.alpha(0.5));
            return (
                <g>
                    <path className="line" ref="path" d={l(this.props.points)}/>
                </g>
            )
        } else {
            let color = interpolateRgb('red', 'black');
            let n = segments.length - 1;
            return (
                <g>
                    {segments.map((s, i) => <line key={i} className="line-segment" style={{stroke: color(i/n)}}
                                                  x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}/>)}
                </g>
            )
        }
    }
}


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
        let {width, height, padding, coordinates, isSelecting, selectionArea, selectedStates} = this.props.timeCurve;

        let selRect;
        if (isSelecting) {
            let {x1, x2, y1, y2} = selectionArea;
            selRect = {x: Math.min(x1, x2), y: Math.min(y1, y2), width: Math.abs(x1 - x2), height: Math.abs(y1 - y2)};
        }

        let dotColor = interpolateRgb('red', 'black');
        let n = coordinates.length;

        let createPopover = (s, i) => <Popover id={'state-' + i} title={"State of Node " + i}>
            <StateDetail data={s} processes={this.props.processes} /></Popover>;
        return (
            <div>
                <svg width={width + padding.left + padding.right} height={height + padding.top + padding.bottom}
                    onMouseDown={(e) => {
                        let svgPos = e.currentTarget.getBoundingClientRect();
                        this.props.onDragStart(e.pageX - svgPos.left - padding.left, e.pageY - svgPos.top - padding.top)
                    }}
                    onMouseMove={(e) => {
                        if (isSelecting) {
                            let svgPos = e.currentTarget.getBoundingClientRect();
                            this.props.onDrag(e.pageX - svgPos.left - padding.left, e.pageY - svgPos.top - padding.top)
                        }
                    }}
                    onMouseUp={this.props.onDragEnd}>

                    <g transform={`translate(${padding.left},${padding.top})`}>
                        <Spline points={coordinates} segments={this.props.timeCurve.pathSegments} onPathSegmentReady={this.props.onPathSegmentReady} />
                        {coordinates.map((p,i) => (
                            <OverlayTrigger key={i} trigger="click" placement="right" rootClose
                                            onEntered={this.props.onClickState.bind(null, i)}
                                            onExit={this.props.onClickState.bind(null, null)}
                                            overlay={createPopover(this.props.states[i], i)}>
                                <circle className={classNames('point', {'start-point': i == 0, 'end-point': i == coordinates.length - 1, selected: selectedStates.indexOf(i) !== -1})}
                                        style={{fill: dotColor(i/n)}}
                                        cx={p.x} cy={p.y} r="4"/>
                            </OverlayTrigger>
                        ))}
                        {isSelecting && selRect.width && selRect.height &&
                        <rect {...selRect} className="selecting-box"/>}
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
                        <g transform="translate(0,60)">
                            <circle className="point selected" cx="0" cy="0" r="5"/>
                            <text x="10" y="0" dy="4">Selected state</text>
                        </g>

                    </g>
                </svg>
            </div>
        );
    }
}

export default TimeCurve;
