import * as d3 from 'd3';
import map from './gridmap.csv';
import data from './data_test.csv';
import "./style.scss"

console.log(d3.version)

const w = 840, h = 462
//scales
const rowscale = d3.scaleLinear()
    .domain([0, 10])
    .range([0, h])

const colscale = d3.scaleLinear()
    .domain([0, 19])
    .range([0, w])


const color = d3.scaleSequential(d3.interpolateBlues)
    .domain([0, 100]);

const colorRed = d3.scaleSequential(d3.interpolateBuPu)
    .domain([0, 100]);

const svg = d3.select("#root").append("svg").classed("mainChart", true)
    .attr("width", '70vw')
    .attr("fill", "black")
    .attr("viewBox", '0 0 ' + w + ' ' + h)

svg.append("rect").classed("back", true)
    .attr("width", w)
    .attr("height", h)
    .attr("x", 0)
    .attr("y", 0)

d3.csv(map).then(mapData => {
    d3.csv(data).then(valueData => {
        //setInterval(function () {
        let data = mapData.map(d => {
            let values = valueData.find(el => el.name.toLowerCase() === d.subject.toLowerCase())
            console.log(values)
            let obj = {};
            if (values) obj = Object.keys(values)
                .reduce((obj, key) => {
                    obj[key.toLowerCase()] = values[key];
                    return obj;
                }, {});
            console.log(obj)
            return {
                col: +d.col,
                row: +d.row,
                subject: d.subject,
                subject_short: d.subject_short,
                value: (+obj[d.subject.toLowerCase()]).toFixed(2),
                values: obj,
            }
        })
        drawMap(data)
        //}, 4000)

    });
});


function drawMap(mapData) {
    svg.select(".back").on('click', d => drawMap.call(null, mapData))

// label boxes
    const labelboxes = svg.selectAll("rect.boxes")
        .data(mapData)
        .join(
            enter => enter.append("rect")
                .attr("fill", d => color(d.value))
                .attr("class", "boxes")
                .attr("width", colscale(1))
                .attr("height", rowscale(1))
                .attr("x", d => {
                    return colscale(+d.col);
                })
                .attr("y", d => {
                    return rowscale(+d.row);
                })
                .on('click', d => showContracts.call(null, d, mapData))
                .append("title")
                .text(d => d.subject),
            update => update.attr("fill", d => color(d.value)))

    // Labels
    const labels = svg.selectAll("text.label")
        .data(mapData)
        .join(
            enter => enter.append("text")
                .attr("class", "label")
                .attr("text-anchor", "middle")
                .attr("fill", "black")
                .attr("x", d => {
                    if (d) return colscale(+d.col + 0.5)
                })
                .attr("y", d => {
                    if (d) return rowscale(+d.row + 0.3);
                })
                .text(d => d.subject_short),
            //update => update.attr("fill", d => getContrastYIQ(color(+d.value)))
        )


    const values = svg.selectAll("text.value")
        .data(mapData)
        .join(
            enter => enter.append("text")
                .attr("class", "value")
                .attr("font-size", 16)
                .attr("fill", "black")
                .attr("x", d => {
                    if (d) return colscale(+d.col) + 3
                })
                .attr("y", d => {
                    if (d) return rowscale(+d.row + 1) - 3;
                })
                .text(d => d.value),
            update => update
                .text(d => d.value)
        )


}

function showContracts(regionData, mapData) {

    let combine = mapData.map(d => {

        return {
            col: d.col,
            row: d.row,
            subject: d.subject,
            subject_short: d.subject_short,
            value: (+regionData.values[d.subject.toLowerCase()]).toFixed(2),
            values: d.values,
        }
    })
    console.log(combine)
    const values = svg.selectAll("text.value")
        .data(combine)
        .join(
            enter => enter,
            update => update
                .text(d => d.value)
        );
   /* const labels = svg.selectAll("text.label")
        .data(combine)
        .join(
            enter => enter.attr("fill",d => getContrastYIQ(colorRed(d.value))),
            update => update
                .attr("fill",d => getContrastYIQ(colorRed(d.value))),
            remove => remove.exit()
        );*/
    const labelboxes = svg.selectAll("rect.boxes")
        .data(combine)
        .join(
            enter => enter.attr("fill", d => colorRed(d.value)),
            update => update
                .attr("fill", d => colorRed(d.value)),
            remove => remove.exit()
        );
}

function getContrastYIQ(hexcolor){
    hexcolor = d3.color(hexcolor)

    var yiq = ((hexcolor.r*299)+(hexcolor.g*587)+(hexcolor.b*114))/1000;

    return (yiq >= 128) ? 'black' : 'white';
}