import * as d3 from 'd3';
import * as _ from 'lodash';

export class TrafficService {
	c10 = d3.scaleOrdinal(d3.schemeCategory10);
	slowest = 0;
	slowestMax = 0;
	scaleMax = d3.scaleLinear().domain([0, 0]).range([2, 175]);
	statusCodes: any[] = [];
	responseTimes: any[] = [];
	requests: any[] = [];
	svg: any = {};
	width: number = 0;
	lastUpdate: string = '';

	constructor(svg: any, width: number) {
		this.svg = svg;
		this.width = width;
	}

	viewHits(nodes: any[], hits: any[], isActive: boolean) {
		if (!hits || hits.length === 0)
			return;

		let lastRunLogId = 0;
		let start = hits[0].timestamp;
		let delay = 0;
		let requests: any[] = [];
		let startTime = new Date().getTime();

		for (let i = 0; i < hits.length; i++) {
			if (hits[i].id === lastRunLogId) {
				break;
			}

			// process up till the last processed from previous run
			delay = delay + hits[i].timestamp - start + 15;
			start = hits[i].timestamp;

			// process requests data for the legend
			if (requests.indexOf(hits[i].requestId) < 0) {
				requests.unshift(hits[i].requestId);
				if (requests.length > 20) {
					requests.pop();
				}
			}

			// count non 200 status codes
			let statusCodeIndex = this.statusCodes.findIndex((item: any) => {
				return item.code === hits[i].statusCode;
			});

			if (hits[i].statusCode && statusCodeIndex < 0 && (hits[i].statusCode < '200' || hits[i].statusCode > '299')) {
				this.statusCodes.push({code: hits[i].statusCode, count: 1})
			} else if (hits[i].statusCode && (hits[i].statusCode < '200' || hits[i].statusCode > '299')) {
				this.statusCodes[statusCodeIndex].count++;
			}

			// collect response times
			let responseTimesIndex = this.responseTimes.findIndex((item: any) => {
				return item.service === hits[i].target;
			});

			if (hits[i].processingTimeMs && responseTimesIndex < 0) {
				hits[i].processingTimeMs = parseInt(hits[i].processingTimeMs);
				this.responseTimes.push({
					service: hits[i].target,
					count: 1,
					average: hits[i].processingTimeMs,
					rpm: 1,
					max: hits[i].processingTimeMs
				});
			} else if (hits[i].processingTimeMs) {
				hits[i].processingTimeMs = parseInt(hits[i].processingTimeMs);
				this.responseTimes[responseTimesIndex].average = Math.round(((this.responseTimes[responseTimesIndex].average * this.responseTimes[responseTimesIndex].count)
					+ hits[i].processingTimeMs) / (this.responseTimes[responseTimesIndex].count + 1) * 10) / 10;
				if (hits[i].processingTimeMs > this.responseTimes[responseTimesIndex].max) {
					this.responseTimes[responseTimesIndex].max = hits[i].processingTimeMs;
					this.responseTimes[responseTimesIndex].maxHit = hits[i];
				}
				if (this.responseTimes[responseTimesIndex].average > this.slowest) {
					this.slowest = this.responseTimes[responseTimesIndex].average;
				}
				if (this.responseTimes[responseTimesIndex].max > this.slowestMax) {
					this.slowestMax = this.responseTimes[responseTimesIndex].max;
					this.scaleMax = d3.scaleLinear().domain([0, this.slowestMax]).range([2, 175]);
					this.updateResponseTimes();
				}
				this.responseTimes[responseTimesIndex].count++;
				let now = new Date().getTime();
				this.responseTimes[responseTimesIndex].rpm = Math.round(this.responseTimes[responseTimesIndex].count / ((now - startTime) / 1000) * 60);
			} else {
				hits[i].processingTimeMs = 0;
			}

			let totalDelay = delay;
			if (hits[i].processingTimeMs) {
				totalDelay += hits[i].processingTimeMs;
			}

			if (isActive) {
				setTimeout(() => {
						if (nodes) {
							let sourceNode = _.find(nodes, (node: any) => {
								return node.name === hits[i].source;
							});
							let targetNode = _.find(nodes, (node: any) => {
								return node.name === hits[i].target;
							});
							this.drawCircle(this.statusCodes, 'node' + sourceNode.index, 'node' + targetNode.index,
								hits[i].requestId, hits[i].statusCode, hits[i].processingTimeMs);
						} else {
							this.drawCircle(this.statusCodes, hits[i].source, hits[i].target,
								hits[i].requestId, hits[i].statusCode, hits[i].processingTimeMs);
						}
					}, totalDelay
				);
			}
			lastRunLogId = hits[i].id;
			this.lastUpdate = hits[i].timestamp;
		}
		this.requests = requests;
		if (hits && hits.length >= 1000) {
			this.lastUpdate = "init";
		}
		this.updateLegend(this.requests);

		return this.requests;
	};

	drawCircle(statusCodes: any[], source: string, target: string, requestId: string, statusCode: any, processingTime: number) {
		if (statusCode === 'undefined') {
			statusCode = null
		}
		let tempLink: any = d3.select('line.' + source + '-' + target);
		let link: any = tempLink._groups[0][0];

		if (link) {
			let circle = this.svg.append('circle')
				.attr('r', this.width / 350)
				.attr('cx', link.getAttribute('x1'))
				.attr('cy', link.getAttribute('y1'))
				.attr('class', 'hit');
			if (requestId !== 'no-request-id') {
				circle.attr('style', () => {
					return 'fill:' + this.c10(requestId)
				});
			}

			circle.transition().on('end', () => {
				this.moveIt(circle, link.getAttribute('x2'), link.getAttribute('y2'), statusCode, false, processingTime);
			});
		}
	};

	moveIt(item: any, x2: number, y2: number, statusCode: any, error: boolean, processingTime: number) {
		if (item) {
			item.transition()
				.duration(1000 + processingTime)
				.attr('cx', x2)
				.attr('cy', y2)
				.on('end', (d: any) => item.remove());
		}
	};

	drawLegend(requests: any[]) {
		if (!requests || requests.length === 0)
			return;

		if (this.svg.selectAll('.legendHeading')._groups[0] && this.svg.selectAll('.legendHeading')._groups[0].length === 0) {
			this.svg.append('text')
				.attr('dx', this.width - 240)
				.attr('dy', 20)
				.text('Unique Request id (last 20)')
				.attr('class', 'legendHeading');
		}

		let legend = this.svg.selectAll('.legend');
		legend = legend.data(requests, (d: any) => {
			return d
		});

		let g = legend.enter().append('g').attr('class', (d: any) => {
			return 'legend ' + d
		});

		let circle = g.append('circle');
		circle
			.attr('r', 6)
			.attr('class', 'hit')
			.attr('cx', this.width - 230)
			.attr('cy', (d: any, i: any) => {
				return i * 20 + 30;
			})
			.attr('style', (d: any) => {
				if (d !== 'no-request-id') {
					return 'fill:' + this.c10(d);
				}
				return '';
			});

		g.append('text')
			.attr('class', 'legendRequestId')
			.attr('dx', this.width - 220)
			.attr('dy', (d: any, i: any) => {
				return i * 20 + 34;
			})
			.text((d: any) => {
				return d
			});
		legend.exit().remove();
	};

	updateLegend(requests: any[]) {
		if (!requests || requests.length === 0)
			return;

		let items = this.svg.selectAll('.legend').data(requests, (d: any) => {
			return d
		});
		items.select('circle')
			.transition()
			.attr('cx', this.width - 230)
			.attr('cy', (d: any, i: any) => {
				return i * 20 + 30;
			});
		items.select('text')
			.transition()
			.attr('dx', this.width - 220)
			.attr('dy', (d: any, i: any) => {
				return i * 20 + 34;
			})
	};

	drawResponseTimes() {
		if (this.svg.selectAll('.responseHeading')._groups[0].length === 0) {
			this.svg.append('text')
				.attr('dx', 20)
				.attr('dy', 25)
				.text('Response times (ms)')
				.attr('class', 'responseHeading');
			this.svg.append('rect')
				.attr('x', 20)
				.attr('y', 30)
				.attr('width', 8)
				.attr('height', 4)
				.attr('class', 'responseTimesChart');
			this.svg.append('text')
				.text('average')
				.attr('dx', 30)
				.attr('dy', 36)
				.attr('class', 'heading');
			this.svg.append('rect')
				.attr('x', 120)
				.attr('y', 30)
				.attr('width', 8)
				.attr('height', 4)
				.attr('class', 'responseTimesChartMax');
			this.svg.append('text')
				.text('maximum')
				.attr('dx', 130)
				.attr('dy', 36)
				.attr('class', 'heading');
		}

		let responseItem = this.svg.selectAll('.responseTime');
		responseItem = responseItem.data(this.responseTimes, (d: any) => {
			return d.service;
		});

		let g = responseItem.enter().append('g').attr('class', (d: any) => {
			return 'responseTime ' + d.service;
		});
		g.append('rect')
			.attr('height', 4)
			.attr('width', (d: any) => {
				let w = this.scaleMax(d.max);
				if (isNaN(w) || w === 0) {
					w = 2;
				}
				if (w > 200) {
					w = 200;
				}
				return w;
			})
			.attr('x', 20)
			.attr('y', (d: any, i: number) => {
				return i * 22 + 56;
			})
			.attr('class', 'responseTimesChartMax');
		g.append('rect')
			.attr('height', 4)
			.attr('width', (d: any) => {
				let w = this.scaleMax(d.average);
				if (isNaN(w) || w === 0) {
					w = 2;
				}
				return w;
			})
			.attr('x', 20)
			.attr('y', (d: any, i: number) => {
				return i * 22 + 56;
			})
			.attr('class', 'responseTimesChart');

		let label = g.append('text');
		label.attr('class', 'responseTimesText')
			.attr('dx', 20)
			.attr('dy', (d: any, i: number) => {
				return i * 22 + 53;
			});

		label.append('tspan').text((d: any) => {
			return d.service;
		});
		label.append('tspan').text((d: any) => {
			return d.average;
		}).attr('class', 'averageLabel').attr('dx', 5);
		label.append('tspan').text((d: any) => {
			return d.max;
		}).attr('class', 'maxLabel').attr('dx', 8);
		label.append('tspan').text((d: any) => {
			return d.rpm + ' rpm';
		}).attr('class', 'rpmLabel').attr('dx', 8)
			.on('click', (d: any) => {
				let content = d3.select('#overlayContent');
				content.selectAll('*').remove();
				content.append('b').text('Details maximum log entry: ').append('br');
				content.append('pre').html(TrafficService.syntaxHighlight(d.maxHit)).append('br').append('br');

				TrafficService.overlay();
			});

		responseItem.exit().remove();
	};

	updateResponseTimes() {
		let responseItem = this.svg.selectAll('.responseTime');
		responseItem = responseItem.data(this.responseTimes, (d: any) => {
			return d.service;
		});
		responseItem.select('rect.responseTimesChart')
			.transition()
			.attr('width', (d: any) => {
				let w = this.scaleMax(d.average);
				if (isNaN(w) || w === 0) {
					w = 2;
				}
				if (w > 200) {
					w = 200;
				}
				return w;
			});
		responseItem.select('rect.responseTimesChartMax')
			.transition()
			.attr('width', (d: any) => {
				let w = this.scaleMax(d.max);
				if (isNaN(w) || w === 0) {
					w = 2;
				}
				if (w > 200) {
					w = 200;
				}
				return w;
			});
		let label = responseItem.select('text');
		label.select('tspan.averageLabel').text((d: any) => {
			return d.average;
		}).attr('dx', 5);
		label.select('tspan.maxLabel').text((d: any) => {
			return d.max;
		}).attr('dx', 8);
	};

	static overlay() {
		let el = document.getElementById('overlay');
		el.style.visibility = (el.style.visibility === 'visible') ? 'hidden' : 'visible';
	};

	static syntaxHighlight(json: any) {
		if (typeof json !== 'string') {
			json = JSON.stringify(json, undefined, 2);
		}
		json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		return json.replace(/('(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\'])*'(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match: any) => {
			let cls = 'number';
			if (/^'/.test(match)) {
				if (/:$/.test(match)) {
					cls = 'key';
				} else {
					cls = 'string';
				}
			} else if (/true|false/.test(match)) {
				cls = 'boolean';
			} else if (/null/.test(match)) {
				cls = 'null';
			}
			return '<span class="' + cls + '">' + match + '</span>';
		});
	};
}
