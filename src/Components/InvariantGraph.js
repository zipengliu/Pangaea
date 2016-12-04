/**
 * Created by Zipeng Liu on 2016-12-01.
 */

import React, { Component } from 'react';
import {line, curveLinearClosed} from 'd3';
import cn from 'classnames';
import {getTriangle} from '../utils';
import './invariantGraph.css';


class InvariantGraph extends Component {
    render() {
        let {nodes, links, width, height} = this.props.data;
        let getLink = (d, i) => {
            let margin = 4, w = 4;
            let points;
            let path = line()
                .x(d => d.x)
                .y(d => d.y)
                .curve(curveLinearClosed);
            if (d.op == '==') {
                return <line className="link equal" key={i} x1={d.source.x} y1={d.source.y} x2={d.target.x} y2={d.target.y} />;
            } else if (d.op[0] == '<') {
                points = getTriangle(d.source, d.target, margin, w);
                return <path className={cn('link', 'non-equal', {'equal': d.op == '<='})}
                             key={i} d={path(points)}/>
            } else {
                points = getTriangle(d.target, d.source, margin, w);
                return <path className={cn('link', 'non-equal', {'equal': d.op == '<='})}
                             key={i} d={path(points)}/>
            }
        };

        return (
            <svg width={width} height={height}>
                <g className="nodes">
                    {nodes.map(d => <circle key={d.varName} className="dot" cx={d.x} cy={d.y} r={5} />)}
                </g>
                <g className="links">
                    {links.map(getLink)}
                </g>
            </svg>
        )
    }
}

export default InvariantGraph;
