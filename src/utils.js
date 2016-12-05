/**
 * Created by Zipeng Liu on 2016-11-22.
 */

import {scaleLinear, extent, deviation, forceSimulation, forceCollide} from 'd3';
import tsnejs from './tsne';



function distance(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

export function avoidOverlap(coords, r) {
    let nodes = coords.map((d, i) => ({...d, index: i}));
    let simulation = forceSimulation(nodes).force('collide', forceCollide(r)).stop();
        // .on('tick', () => {console.log('tick')});
    for (let i = 0; i < 100; i++) {
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
    let   relaxCoefficient = 0.5;
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