'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const Mindmap = () => {
  const [issues, setIssues] = useState([]);
  const svgRef = useRef();

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await fetch('/api/issues');
        const data = await response.json();
        setIssues(data);
      } catch (error) {
        console.error('Error fetching issues:', error);
      }
    };

    fetchIssues();
  }, []);

  useEffect(() => {
    if (issues.length === 0) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const rootNode = { id: 'root', title: 'Issues', isRoot: true };
    const nodes = [rootNode, ...issues.map(issue => ({ ...issue, id: `issue-${issue.id}` }))];
    const links = issues.map(issue => ({
      source: 'root',
      target: `issue-${issue.id}`,
    }));

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-width / 2, -height / 2, width, height]);

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter());

    const link = svg.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 1.5);

    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(drag(simulation));

    node.append('circle')
      .attr('r', d => d.isRoot ? 40 : 25)
      .attr('fill', d => d.isRoot ? '#ff6347' : '#4682b4')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', 'white')
      .attr('font-size', '10px')
      .text(d => d.title.substring(0, 10));

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function drag(simulation) {
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }

    return () => {
      simulation.stop();
    };

  }, [issues]);

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default Mindmap;
