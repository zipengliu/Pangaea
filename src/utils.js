/**
 * Created by Zipeng Liu on 2016-11-22.
 */

import {scaleLinear, extent, deviation,
    forceSimulation, forceCollide, forceLink, forceManyBody, forceCenter} from 'd3';
import tsnejs from './tsne';



function distance(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

export function avoidOverlap(coords, r) {
    let nodes = coords.map((d, i) => ({...d, index: i}));
    let simulation = forceSimulation(nodes).force('collide', forceCollide(r)).stop();
        // .on('tick', () => {console.log('tick')});
    for (let i = 0; i < 300; i++) {
        simulation.tick();
    }
    return nodes.map(d => ({x: d.x, y: d.y}));
}

// Rotate the coordinates around the centroid between starting point and ending point to achieve left-to-right viewing order of time curves
function rotate(coords) {
    let  s = coords[0], e = coords[coords.length - 1];
    let  dist = distance(s, e);
    let  c = {x: (s.x + e.x) / 2, y: (s.y + e.y) / 2};
    let  sin = (s.y - e.y) / dist, cos = (e.x - s.x) / dist;

    let  res = [];
    for (let  i = 0; i < coords.length; i++) {
        let  x = coords[i].x - c.x, y = coords[i].y - c.y;
        // res.push({x: sin * x + cos * y, y: -cos * x + sin * y});
        res.push({x: cos * x - sin * y, y: sin * x + cos * y});
    }
    return res;
}

// Normalize the coordinates to (0, 1) by linear transformation
// how much do you want to relax the extent of the coordinates so that they don't show up on the border of the dotplot
function normalize(coords) {
    let   relaxCoefficient = 0.8;
    let   xArr = coords.map(x => x.x);
    let   yArr = coords.map(x => x.y);
    let   xExtent = extent(xArr);
    let   xDeviation = deviation(xArr);
    let   yExtent = extent(yArr);
    let   yDeviation = deviation(yArr);
    xExtent[0] -= relaxCoefficient * xDeviation;
    xExtent[1] += relaxCoefficient * xDeviation;
    yExtent[0] -= relaxCoefficient * yDeviation;
    yExtent[1] += relaxCoefficient * yDeviation;
    console.log('extents: ' + xExtent + ' ' + yExtent);

    let xScale = scaleLinear().domain(xExtent);
    let yScale = scaleLinear().domain(yExtent);

    return coords.map(d => ({x: xScale(d.x), y: yScale(d.y)}));
}


export function reduceDim(d) {

    let opt = {};
    opt.epsilon = 10; // epsilon is learning rate (10 = default)
    opt.perplexity = 30; // roughly how many neighbors each point influences (30 = default)
    opt.dim = 2; // dimensionality of the embedding (2 = default)

    let tsne = new tsnejs.tSNE(opt); // create a tSNE instance

    tsne.initDataDist(d);

    console.log('Begin tSNE');
    for(let k = 0; k < 500; k++) {
        tsne.step(); // every time you call this, solution gets better
    }
    console.log('Finish tSNE');

    let  coords = tsne.getSolution().map(d => ({x: d[0], y: d[1]}));
    return normalize(rotate(coords));
}

export function performForceSimulation(nodes, links, width, height) {
    let simulation = forceSimulation(nodes)
        .force('link', forceLink(links).id(d => d.varName).distance(80))
        .force('charge', forceManyBody().strength(-30))
        .force('center', forceCenter(width / 2, height / 2))
        .stop();
    for (let i = 0; i < 300; i++) {
        simulation.tick();
    }
    return {nodes, links};
}

export function getDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

export function getTriangle(src, tgt, margin, d) {
    let l = getDistance(src.x, src.y, tgt.x, tgt.y);
    let sin = (tgt.y - src.y) / l;
    let cos = (tgt.x - src.x) / l;
    let tip = {x: src.x + margin * cos, y: src.y + margin * sin};
    let bottom = {x: tgt.x - margin * cos, y: tgt.y - margin * sin};

    let c1 = {x: bottom.x + d * sin, y: bottom.y - d * cos};
    let c2 = {x: bottom.x - d * sin, y: bottom.y + d * cos};

    return [tip, c1, c2];
}

export function happenBefore(a, b) {
    for (let node in a) {
        if (!(node in b) || a[node] > b[node]) return false;
    }
    return true;
}


export function isAllChecked(d, except) {
    for (let k in d) {
        if (k != except && !d[k]) return false;
    }
    return true;
}

export function isDotWithinBox(dot, box) {
    let {x1, x2, y1, y2} = box;
    return Math.min(x1, x2) <= dot.x && dot.x <= Math.max(x1, x2)
        && Math.min(y1, y2) <= dot.y && dot.y <= Math.max(y1, y2);
}


export function segmentPath(path, dt) {
    let n = path.getTotalLength(), i = 0;
    let segs = [];
    while (i + dt < n) {
        // add a new segment from point i to i+dt
        let a = path.getPointAtLength(i);
        let b = path.getPointAtLength(i + dt);
        segs.push({x1: a.x, y1: a.y, x2: b.x, y2: b.y});
        i += dt;
    }
    return segs;
}
