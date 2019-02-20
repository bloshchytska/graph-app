import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-force-graph',
  templateUrl: './force-graph.component.html',
  styleUrls: ['./force-graph.component.css']
})

export class ForceGraphComponent implements OnInit {


  constructor() { }

  ngOnInit() {
    let svg = d3.select("svg"),
    width  = +svg.attr("width"),
    height = +svg.attr("height");

    let marker = svg.append('defs')
      .append('marker')
      .attr("id", "triangle")
      .attr("refX", 13)
      .attr("refY", 4)
      .attr("viewBox", "0 0 10 10")
      .attr("markerUnits", "strokeWidth")
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("orient", 'auto')
      .append('path')
      .attr("d", 'M 0 0 L 8 4 L 0 8 z')
      .attr("fill", '#999');

    let color = d3.scaleOrdinal(d3.schemeCategory20);



    let simulation = d3.forceSimulation()
      .force("link",  d3.forceLink().id((d) => { return d.id; }))
      .force("charge", d3.forceManyBody().strength(-40))
      .force("center", d3.forceCenter(width / 2, height / 2));

    d3.json("../../assets/miserables.json", (error, graph) => {
      if (error) throw error;


      let link = svg
        .append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.edges)
        .enter()
        .append("line")
        .attr("stroke-width", 2);


      let nodeEnter = svg.selectAll("g.node")
        .data(graph.nodes, d => d.id)
        .enter()
        .append("g")
        .attr("class", "node");

      nodeEnter
        .append("circle")
        .attr("r", 5)
        .attr("fill", function(d) { return color(d.id); });

      nodeEnter
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", 15)
        .text((d) => d.id);

      nodeEnter
        .call(
          d3.drag()
          .on("start", drag_started)
          .on("drag", dragged)
          .on("end", drag_ended)
        );



      simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

      simulation.force("link")
        .links(graph.edges);



      function ticked() {
        link
          .attr("x1", (d) => { return d.source.x; })
          .attr("y1", (d) => { return d.source.y; })
          .attr("x2", (d) => { return d.target.x; })
          .attr("y2", (d) => { return d.target.y; });

        nodeEnter
          .attr("cx", (d) => { return d.x; })
          .attr("cy", (d) => { return d.y; });

        d3.selectAll("g.node")
          .attr("transform", d => `translate(${d.x}, ${d.y})`);

        d3.selectAll("line")
          .attr("marker-end", 'url(#triangle)');
      }
    });

    function drag_started(d) {
      if (!d3.event.active) simulation.alphaTarget(.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function drag_ended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

  }
}
