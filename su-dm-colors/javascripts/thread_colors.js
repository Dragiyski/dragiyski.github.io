(function () {
	"use strict";
	var clampColor = function (value) {
		if (value < 0) {
			return 0;
		} else if (value > 255) {
			return 255;
		} else {
			return value;
		}
	};
	var simpleClustering = function (data, threshold) {
		var distance = function (a, b) {
			return Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) +
				(a[1] - b[1]) * (a[1] - b[1]) +
				(a[2] - b[2]) * (a[2] - b[2]));
		};
		data = new Uint8ClampedArray(data);
		var means = [], pointMap = {};
		(function () {
			var x, y, z, i;
			i = [128, 128, 128];
			i.tmpsum = [0, 0, 0];
			i.count = 0;
			i.points = [];
			means.push(i);
			for (x = 128 + threshold; x < 256; x += threshold) {
				for (y = 128 + threshold; y < 256; y += threshold) {
					for (z = 128 + threshold; z < 256; z += threshold) {
						i = [x, y, z];
						i.tmpsum = [0, 0, 0];
						i.count = 0;
						i.points = [];
						means.push(i);
					}
				}
			}
			for (x = 128 - threshold; x > 0; x -= threshold) {
				for (y = 128 - threshold; y > 0; y -= threshold) {
					for (z = 128 - threshold; z > 0; z -= threshold) {
						i = [x, y, z];
						i.tmpsum = [0, 0, 0];
						i.count = 0;
						i.points = [];
						means.push(i);
					}
				}
			}
		})();
		(function () {
			var i = 0, j, p;
			while(i < data.length) {
				for (j = 0; i < data.length && j < 20000; i += 4, ++j) {
					p = [data[i], data[i + 1], data[i + 2]];
					if (!pointMap[p]) {
						p.frequency = 1;
						pointMap[p] = p;
					} else {
						++pointMap[p].frequency;
					}
				}
				postMessage({
					'response': 'progress',
					'progress': 'image',
					'read': i / 4,
					'length': data.length / 4
				})
			}
		})();
		var iterate = function () {
			var i, j, k, minDistance, minMean, maxDistance, tmpDistance, tmpData, pointKey = Object.getOwnPropertyNames(pointMap), updateDistance = 0;
			for (i = 0; i < pointKey.length; ++i) {
				minDistance = Infinity;
				minMean = null;
				for (j = 0; j < means.length; ++j) {
					tmpDistance = distance(means[j], pointMap[pointKey[i]]);
					if (tmpDistance < minDistance) {
						minDistance = tmpDistance;
						minMean = means[j];
					}
				}
				if (pointMap[pointKey[i]].mean !== minMean) {
					if (pointMap[pointKey[i]].mean) {
						pointMap[pointKey[i]].mean.count -= pointMap[pointKey[i]].frequency;
						pointMap[pointKey[i]].mean.tmpsum[0] -= pointMap[pointKey[i]].frequency * pointMap[pointKey[i]][0];
						pointMap[pointKey[i]].mean.tmpsum[1] -= pointMap[pointKey[i]].frequency * pointMap[pointKey[i]][1];
						pointMap[pointKey[i]].mean.tmpsum[2] -= pointMap[pointKey[i]].frequency * pointMap[pointKey[i]][2];
						k = pointMap[pointKey[i]].mean.points.indexOf(pointMap[pointKey[i]]);
						if (k !== -1) {
							pointMap[pointKey[i]].mean.points.splice(pointMap[pointKey[i]].mean.points.indexOf(pointMap[pointKey[i]]), 1);
						}
					}
					pointMap[pointKey[i]].mean = minMean;
					minMean.count += pointMap[pointKey[i]].frequency;
					minMean.tmpsum[0] += pointMap[pointKey[i]].frequency * pointMap[pointKey[i]][0];
					minMean.tmpsum[1] += pointMap[pointKey[i]].frequency * pointMap[pointKey[i]][1];
					minMean.tmpsum[2] += pointMap[pointKey[i]].frequency * pointMap[pointKey[i]][2];
					minMean.points.push(pointMap[pointKey[i]]);
				}
			}
			for (i = 0; i < means.length; ++i) {
				if (means[i].count === 0) {
					means.splice(i--, 1);
					continue;
				}
				tmpDistance = [
						means[i].tmpsum[0] / means[i].count,
						means[i].tmpsum[1] / means[i].count,
						means[i].tmpsum[2] / means[i].count
				];
				updateDistance += distance(tmpDistance, means[i]);
				means[i][0] = tmpDistance[0];
				means[i][1] = tmpDistance[1];
				means[i][2] = tmpDistance[2];
			}
			for (i = 0; i < means.length; ++i) {
				for (j = i + 1; j < means.length; ++j) {
					tmpDistance = distance(means[i], means[j]);
					if (tmpDistance < threshold) {
						means[i][0] = (means[i][0] * means[i].count + means[j][0] * means[j].count) / (means[i].count + means[j].count);
						means[i][1] = (means[i][1] * means[i].count + means[j][1] * means[j].count) / (means[i].count + means[j].count);
						means[i][2] = (means[i][2] * means[i].count + means[j][2] * means[j].count) / (means[i].count + means[j].count);
						means[i].tmpsum[0] += means[j].tmpsum[0];
						means[i].tmpsum[1] += means[j].tmpsum[1];
						means[i].tmpsum[2] += means[j].tmpsum[2];
						means[i].count += means[j].count;
						for (k = 0; k < means[j].points.length; ++k) {
							means[j].points[k].mean = means[i];
						}
						means[i].points = means[i].points.concat(means[j].points);
						means.splice(j--, 1);
					}
				}
			}
			console.log(means.reduce(function(total, mean) {
				return total + mean.count;
			}, 0) + ' | ' + pointKey.reduce(function(total, key) {
				return total + pointMap[key].frequency;
			}, 0));
			//console.log('[' + updated + ' | ' + (Math.floor((updateDistance / means.length) * 1000) / 1000) + ']');
			postMessage({
				'response': 'progress',
				'progress': 'iteration',
				'updateDistance': (updateDistance / means.length)
			});
			return (updateDistance / means.length) > (Math.sqrt(3));
		};
		postMessage({
			'response': 'progress',
			'progress': 'initialize',
			'means': means.length,
			'length': data.length
		});
		while (iterate());
		postMessage({'response': 'colors', 'length' : data.length / 4, 'colors': means.sort(function (a, b) {
			return b.count - a.count;
		}).map(function (mean) {
			var result = [
				clampColor(Math.round(mean[0])),
				clampColor(Math.round(mean[1])),
				clampColor(Math.round(mean[2]))
			];
			result.percentage = mean.count / (data.length / 4);
			result.count = mean.count;
			return result;
		})});
	};
	var onRequest = function (event) {
		if (!event.data.op) {
			postMessage({'response': 'op', 'op': 'terminate'});
			return;
		}
		if (event.data.op === 'colors') {
			if (!(event.data.buffer instanceof ArrayBuffer)) {
				postMessage({'response': 'op', 'op': 'terminate'});
				return;
			}
			if (typeof(event.data.threshold) !== "number" || event.data.threshold < 0) {
				event.data.threshold = 64;
			}
			simpleClustering(event.data.buffer, event.data.threshold);
		}
	};
	addEventListener('message', onRequest);
})();