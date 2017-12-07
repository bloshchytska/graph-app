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
      width = +svg.attr("width"),
      height = +svg.attr("height");

    let color = d3.scaleOrdinal(d3.schemeCategory20);

    let simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id((d) => { return d.id; }))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));

    d3.json("../../assets/miserables.json", (error, graph) => {
      if (error) throw error;

      let link = svg
        .append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter()
        .append("line")
        .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

      let node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("r", 5)
        .attr("fill", function(d) { return color(d.group); })
        .call(d3.drag()
          .on("start", drag_started)
          .on("drag", dragged)
          .on("end", drag_ended));

      node.append("title")
        .text((d) => { return d.id; });

      simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

      simulation.force("link")
        .links(graph.links);

      function ticked() {
        link
          .attr("x1", (d) => { return d.source.x; })
          .attr("y1", (d) => { return d.source.y; })
          .attr("x2", (d) => { return d.target.x; })
          .attr("y2", (d) => { return d.target.y; });

        node
          .attr("cx", (d) => { return d.x; })
          .attr("cy", (d) => { return d.y; });
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
