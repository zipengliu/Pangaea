/**
 * Created by Zipeng Liu on 2016-12-01.
 */

import React, { Component } from 'react';
import './invariantGraph.css';


class InvariantGraph extends Component {
    render() {
        let {nodes, links, width, height} = this.props.data;
        return (
            <svg width={width} height={height}>
                <g className="nodes">
                    {nodes.map(d => <circle key={d.varName} className="dot" cx={d.x} cy={d.y} r={5} />)}
                </g>
                <g className="links">
                    {links.map((d, i) => <line key={i} className="link"
                                               x1={d.source.x} y1={d.source.y} x2={d.target.x} y2={d.target.y} />)}
                </g>
            </svg>
        )
    }
}

export default InvariantGraph;
