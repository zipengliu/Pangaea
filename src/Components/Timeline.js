/**
 * Created by Zipeng Liu on 2016-12-04.
 */

import React, { Component } from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {scaleOrdinal, schemeCategory10} from 'd3';

import './Timeline.css';


class Timeline extends Component {
    render() {
        let {processGap, eventGap, padding, processes, displayCut} = this.props.timeline;
        let events = this.props.events;
        let width = (processes.length - 1) * processGap;
        let maxLevel = 0;
        for (let n in events) {
            maxLevel = Math.max(maxLevel, events[n][events[n].length - 1].level);
        }
        let colors = scaleOrdinal(schemeCategory10);

        let processIndex = processes.reduce((a, p, i) => {a[p] = i; return a}, {})
        let links = [];
        for (let n in events) {
            for (let i = 0; i < events[n].length; i++) {
                let d = events[n][i];
                if (d.justHappenBefore != null && d.justHappenBefore.host != n) {
                    let just = d.justHappenBefore;
                    links.push({
                        x1: processIndex[just.host] * processGap,
                        y1: (just.level + 1) * eventGap,
                        x2: processIndex[n] * processGap,
                        y2: (d.level + 1) * eventGap
                    })
                }
            }
        }
        let headerHeight = 25;

        let cutPos = null;
        if (displayCut) {
            cutPos = {};
            for (let n in displayCut) {
                cutPos[n] = (events[n][displayCut[n] || 0].level + 1) * eventGap + 10;
            }
        }

        return (
            <svg id="timeline" width={width + padding.left + padding.right}
                 height={(maxLevel + 2) * eventGap + headerHeight + padding.top + padding.bottom}>
                <g transform={`translate(${padding.left},${padding.top})`}>
                    <g className="links" transform={`translate(0,${headerHeight})`}>
                        {links.map((link, i) =>
                            <line className="link" key={i} x1={link.x1} y1={link.y1} x2={link.x2} y2={link.y2} />
                        )}
                    </g>
                    {processes.map((processName, idx) => (
                        <g key={processName} transform={`translate(${idx * processGap},0)`}>
                            <g className="header">
                                <text className="process-name" x="0" y="0" dx="-20">{processName}</text>
                                <rect className="process-color-block" x="-6" y="8" width="12" height="12"
                                      style={{fill: colors(processName)}} />
                            </g>
                            <g className="timeline-content" transform={`translate(0,${headerHeight})`}>
                                <line className="line" x1="0" y1="0" x2="0"
                                      y2={(events[processName][events[processName].length - 1].level + 2) * eventGap + eventGap}
                                      style={{stroke: colors(processName)}}/>
                                <g>
                                    {events[processName].map((e, i) => (
                                        <OverlayTrigger key={i} placement="left"
                                                        overlay={<Tooltip id={`tip-${e.host}-${i}`}>{JSON.stringify(e.clock) + ' ' + e.event}</Tooltip>}>
                                            <circle className="dot" cx="0" cy={(e.level + 1) * eventGap} r="5"
                                                    style={{fill: colors(processName)}} />
                                        </OverlayTrigger>
                                    ))}
                                </g>
                                {cutPos && cutPos[processName] && <g className="cut">
                                    <rect className="cut-block" x={-30} y={cutPos[processName]}
                                          width={60} height={10} />
                                </g>}
                            </g>
                        </g>
                    ))}
                </g>
            </svg>
        )
    }
}

export default Timeline;
