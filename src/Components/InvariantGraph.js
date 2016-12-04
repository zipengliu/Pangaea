/**
 * Created by Zipeng Liu on 2016-12-01.
 */

import React, { Component } from 'react';
import {line, curveLinearClosed} from 'd3';
import cn from 'classnames';
import {getTriangle} from '../utils';
import './InvariantGraph.css';


class InvariantGraph extends Component {
    render() {
        let {nodes, links, width, height} = this.props.data;
        let h = this.props.highlightedNodes;

        let getLink = (d, i) => {
            let highlightClass = {highlight: h[d.source.varName] && h[d.target.varName]};

            let margin = 4, w = 4;
            let points;
            let path = line()
                .x(d => d.x)
                .y(d => d.y)
                .curve(curveLinearClosed);
            if (d.op == '==' || d.op == '!=') {
                return <line className={cn('link', highlightClass, {'equal': d.op == '==', 'not-equal': d.op == '!='})}
                             key={i} x1={d.source.x} y1={d.source.y} x2={d.target.x} y2={d.target.y} />;
            } else if (d.op[0] == '<') {
                points = getTriangle(d.source, d.target, margin, w);
                return <path className={cn('link', 'non-equal', {'and-equal': d.op == '<='}, highlightClass)}
                             key={i} d={path(points)}/>
            } else if (d.op[0] == '>') {
                points = getTriangle(d.target, d.source, margin, w);
                return <path className={cn('link', 'non-equal', {'and-equal': d.op == '<='}, highlightClass)}
                             key={i} d={path(points)}/>
            } else {

            }
        };

        let legendPos = width * 0.9;
        return (
            <svg width={width} height={height}>
                <g className="nodes">
                    {nodes.map(d => <circle key={d.varName} className={cn('dot', {highlight: h[d.varName]})}
                                            onMouseEnter={this.props.onToggleHighlight.bind(null, d.varName)}
                                            onMouseOut={this.props.onToggleHighlight.bind(null, null)}
                                            cx={d.x} cy={d.y} r={5} />)}
                </g>
                <g className="links">
                    {links.map(getLink)}
                </g>
                <g className="labels">
                    {this.props.data.showLabel && !this.props.data.highlightNodeName &&
                    nodes.map((d, i) => <text key={i} className="label" x={d.x} y={d.y} dx="-10" dy="14">{d.varName}</text>)
                    }
                    {this.props.data.highlightNodeName &&
                    nodes.filter(d => h[d.varName]).map((d, i) => <text key={i} className="label" x={d.x} y={d.y} dx="-10" dy="14">{d.varName}</text>)
                    }
                </g>

                <g className="legends" transform={'translate(' + legendPos + ',20)'}>
                    <g>
                        <line className="equal" x1="0" x2="20" y1="0" y2="0"/>
                        <text x="25" y="0" dy="4">==</text>
                    </g>
                    <g transform="translate(0, 20)">
                        <line className="not-equal" x1="0" x2="20" y1="0" y2="0"/>
                        <text x="25" y="0" dy="4">!=</text>
                    </g>
                    <g transform="translate(0, 40)">
                        <path className="non-equal" d="M0,0L20,-5L20,5Z"/>
                        <text x="25" y="0" dy="4">{'<'}</text>
                    </g>
                    <g transform="translate(0, 60)">
                        <path className="non-equal equal" d="M0,0L20,-5L20,5Z"/>
                        <text x="25" y="0" dy="4">{'<='}</text>
                    </g>
                </g>
            </svg>
        )
    }
}

export default InvariantGraph;
