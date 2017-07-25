$('#ca-container').contentcarousel();
sigma.classes.graph.addMethod('neighbors', function (nodeId) {
    var k,
        neighbors = {},
        index = this.allNeighborsIndex[nodeId] || {};

    for (k in index)
        neighbors[k] = this.nodesIndex[k];

    return neighbors;
});

sigma.prototype.resetZoom = function (camera) {
    if (typeof camera == "undefined") {
        camera = this.cameras[0];
    }
    camera.ratio = 1;
    camera.x = 0;
    camera.y = 0;
    this.refresh();
};

var post = gup('post');
if (post === "") {
    post = 0;
}
var json_global;
$.ajax({
    type: "GET",
    url: "json/reddit_500.json",
    dataType: "json",
    success: function (json) {
        var prop = "users";
        json_global = json.sort(function (a, b) {
            return (b.prediction_targets[prop] > a.prediction_targets[prop]) ? 1 : ((b.prediction_targets[prop] < a.prediction_targets[prop]) ? -1 : 0);
        });
        get_post("first");
    }
});
function get_post(source) {

    var post_timestamp = json_global[post].post_timestamp;
    $('#title').html(json_global[post].post_title);
    $('#post').attr("href", json_global[post].post_url);
    $('#value_users').html(json_global[post].prediction_targets.users);
    $('#value_comments').html(json_global[post].prediction_targets.comments);
    $('#value_score').html(normalize_values(json_global[post].prediction_targets.score_wilson));
    $('#value_contro').html(normalize_values(json_global[post].prediction_targets.controversiality_wilson));

    if (source === "first") {

        $('#date1').attr("data-date", d3.time.format('%d/%m/%Y T%H:%M:%S')(new Date(post_timestamp * 1000))).html(d3.time.format('%d-%m-%Y at %H:%M:%S')(new Date(post_timestamp * 1000)));
        $('#date2').attr("data-date", d3.time.format('%d/%m/%Y T%H:%M:%S')(new Date((post_timestamp + 617) * 1000)));
        $('#date3').attr("data-date", d3.time.format('%d/%m/%Y T%H:%M:%S')(new Date((post_timestamp + 1235) * 1000)));
        $('#date4').attr("data-date", d3.time.format('%d/%m/%Y T%H:%M:%S')(new Date((post_timestamp + 1853) * 1000)));
        $('#date5').attr("data-date", d3.time.format('%d/%m/%Y T%H:%M:%S')(new Date((post_timestamp + 2471) * 1000)));
        $('#date6').attr("data-date", d3.time.format('%d/%m/%Y T%H:%M:%S')(new Date((post_timestamp + 3088) * 1000)));
        $('#date7').attr("data-date", d3.time.format('%d/%m/%Y T%H:%M:%S')(new Date((post_timestamp + 3706) * 1000)));
        $('#date8').attr("data-date", d3.time.format('%d/%m/%Y T%H:%M:%S')(new Date((post_timestamp + 4324) * 1000)));
        $('#date9').attr("data-date", d3.time.format('%d/%m/%Y T%H:%M:%S')(new Date((post_timestamp + 4942) * 1000)));
        $('#date10').attr("data-date", d3.time.format('%d/%m/%Y T%H:%M:%S')(new Date((post_timestamp + 5559) * 1000)));
        $('#date11').attr("data-date", d3.time.format('%d/%m/%Y T%H:%M:%S')(new Date((post_timestamp + 6177) * 1000)));
        $('#date12').attr("data-date", d3.time.format('%d/%m/%Y T%H:%M:%S')(new Date((post_timestamp + 6795) * 1000)));
        $('#date13').attr("data-date", d3.time.format('%d/%m/%Y T%H:%M:%S')(new Date((post_timestamp + 7413) * 1000)));
        $('#date14').attr("data-date", d3.time.format('%d/%m/%Y T%H:%M:%S')(new Date((post_timestamp + 8031) * 1000)));
        $('#date15').attr("data-date", d3.time.format('%d/%m/%Y T%H:%M:%S')(new Date((post_timestamp + 8648) * 1000)));

        var timelines = $('.timeline_wrapper'),
            eventsMinDistance = 160;

        (timelines.length > 0) && initTimeline(timelines);

        function initTimeline(timelines) {
            timelines.each(function () {
                var timeline = $(this),
                    timelineComponents = {};
                timelineComponents['timelineWrapper'] = timeline.find('.events-wrapper');
                timelineComponents['eventsWrapper'] = timelineComponents['timelineWrapper'].children('.events');
                timelineComponents['fillingLine'] = timelineComponents['eventsWrapper'].children('.filling-line');
                timelineComponents['timelineEvents'] = timelineComponents['eventsWrapper'].find('a');
                timelineComponents['timelineDates'] = parseDate(timelineComponents['timelineEvents']);
                timelineComponents['eventsMinLapse'] = minLapse(timelineComponents['timelineDates']);
                timelineComponents['timelineNavigation'] = timeline.find('.timeline-navigation');
                timelineComponents['eventsContent'] = timeline.children('.events-content');

                //assign a left postion to the single events along the timeline
                setDatePosition(timelineComponents, eventsMinDistance);
                //assign a width to the timeline
                var timelineTotWidth = setTimelineWidth(timelineComponents, eventsMinDistance);
                //the timeline has been initialize - show it
                timeline.addClass('loaded');

                //detect click on the next arrow
                timelineComponents['timelineNavigation'].on('click', '.next', function (event) {
                    event.preventDefault();
                    updateSlide(timelineComponents, timelineTotWidth, 'next');
                });
                //detect click on the prev arrow
                timelineComponents['timelineNavigation'].on('click', '.prev', function (event) {
                    event.preventDefault();
                    updateSlide(timelineComponents, timelineTotWidth, 'prev');
                });
                //detect click on the a single event - show new event content
                timelineComponents['eventsWrapper'].on('click', 'a', function (event) {
                    event.preventDefault();
                    timelineComponents['timelineEvents'].removeClass('selected');
                    $(this).addClass('selected');
                    //updateOlderEvents($(this));
                    updateFilling($(this), timelineComponents['fillingLine'], timelineTotWidth);
                    //updateVisibleContent($(this), timelineComponents['eventsContent']);
                });

                //on swipe, show next/prev event content
                timelineComponents['eventsContent'].on('swipeleft', function () {
                    var mq = checkMQ();
                    ( mq == 'mobile' ) && showNewContent(timelineComponents, timelineTotWidth, 'next');
                });
                timelineComponents['eventsContent'].on('swiperight', function () {
                    var mq = checkMQ();
                    ( mq == 'mobile' ) && showNewContent(timelineComponents, timelineTotWidth, 'prev');
                });

                //keyboard navigation
                $(document).keyup(function (event) {
                    if (event.which == '37' && elementInViewport(timeline.get(0))) {
                        showNewContent(timelineComponents, timelineTotWidth, 'prev');
                    } else if (event.which == '39' && elementInViewport(timeline.get(0))) {
                        showNewContent(timelineComponents, timelineTotWidth, 'next');
                    }
                });
            });
        }

        function updateSlide(timelineComponents, timelineTotWidth, string) {
            //retrieve translateX value of timelineComponents['eventsWrapper']
            var translateValue = getTranslateValue(timelineComponents['eventsWrapper']),
                wrapperWidth = Number(timelineComponents['timelineWrapper'].css('width').replace('px', ''));
            //translate the timeline to the left('next')/right('prev')
            (string == 'next')
                ? translateTimeline(timelineComponents, translateValue - wrapperWidth + eventsMinDistance, wrapperWidth - timelineTotWidth)
                : translateTimeline(timelineComponents, translateValue + wrapperWidth - eventsMinDistance);
        }

        function updateTimelinePosition(string, event, timelineComponents) {
            //translate timeline to the left/right according to the position of the selected event
            var eventStyle = window.getComputedStyle(event.get(0), null),
                eventLeft = Number(eventStyle.getPropertyValue("left").replace('px', '')),
                timelineWidth = Number(timelineComponents['timelineWrapper'].css('width').replace('px', '')),
                timelineTotWidth = Number(timelineComponents['eventsWrapper'].css('width').replace('px', ''));
            var timelineTranslate = getTranslateValue(timelineComponents['eventsWrapper']);

            if ((string == 'next' && eventLeft > timelineWidth - timelineTranslate) || (string == 'prev' && eventLeft < -timelineTranslate)) {
                translateTimeline(timelineComponents, -eventLeft + timelineWidth / 2, timelineWidth - timelineTotWidth);
            }
        }

        function translateTimeline(timelineComponents, value, totWidth) {
            var eventsWrapper = timelineComponents['eventsWrapper'].get(0);
            value = (value > 0) ? 0 : value; //only negative translate value
            value = ( !(typeof totWidth === 'undefined') && value < totWidth ) ? totWidth : value; //do not translate more than timeline width
            setTransformValue(eventsWrapper, 'translateX', value + 'px');
            //update navigation arrows visibility
            (value == 0 ) ? timelineComponents['timelineNavigation'].find('.prev').addClass('inactive') : timelineComponents['timelineNavigation'].find('.prev').removeClass('inactive');
            (value == totWidth ) ? timelineComponents['timelineNavigation'].find('.next').addClass('inactive') : timelineComponents['timelineNavigation'].find('.next').removeClass('inactive');
        }

        function updateFilling(selectedEvent, filling, totWidth) {
            //change .filling-line length according to the selected event
            var eventStyle = window.getComputedStyle(selectedEvent.get(0), null),
                eventLeft = eventStyle.getPropertyValue("left"),
                eventWidth = eventStyle.getPropertyValue("width");
            eventLeft = Number(eventLeft.replace('px', '')) + Number(eventWidth.replace('px', '')) / 2;
            var scaleValue = eventLeft / totWidth;
            setTransformValue(filling.get(0), 'scaleX', scaleValue);
        }

        function setDatePosition(timelineComponents, min) {
            for (i = 0; i < timelineComponents['timelineDates'].length; i++) {
                var distance = daydiff(timelineComponents['timelineDates'][0], timelineComponents['timelineDates'][i]),
                    distanceNorm = Math.round(distance / timelineComponents['eventsMinLapse']) + 2;
                if (i === timelineComponents['timelineDates'].length - 1) {
                    //console.log(distanceNorm);
                    distanceNorm -= 1
                }
                timelineComponents['timelineEvents'].eq(i).css('left', distanceNorm * min + 'px');
            }
        }

        function setTimelineWidth(timelineComponents, width) {
            var timeSpan = daydiff(timelineComponents['timelineDates'][0], timelineComponents['timelineDates'][timelineComponents['timelineDates'].length - 1]),
                timeSpanNorm = timeSpan / timelineComponents['eventsMinLapse'],
                timeSpanNorm = Math.round(timeSpanNorm) + 4,
                totalWidth = timeSpanNorm * width;
            timelineComponents['eventsWrapper'].css('width', totalWidth + 'px');
            updateFilling(timelineComponents['eventsWrapper'].find('a.selected'), timelineComponents['fillingLine'], totalWidth);
            updateTimelinePosition('next', timelineComponents['eventsWrapper'].find('a.selected'), timelineComponents);

            return totalWidth;
        }

        function getTranslateValue(timeline) {
            var timelineStyle = window.getComputedStyle(timeline.get(0), null),
                timelineTranslate = timelineStyle.getPropertyValue("-webkit-transform") ||
                    timelineStyle.getPropertyValue("-moz-transform") ||
                    timelineStyle.getPropertyValue("-ms-transform") ||
                    timelineStyle.getPropertyValue("-o-transform") ||
                    timelineStyle.getPropertyValue("transform");

            if (timelineTranslate.indexOf('(') >= 0) {
                var timelineTranslate = timelineTranslate.split('(')[1];
                timelineTranslate = timelineTranslate.split(')')[0];
                timelineTranslate = timelineTranslate.split(',');
                var translateValue = timelineTranslate[4];
            } else {
                var translateValue = 0;
            }

            return Number(translateValue);
        }

        function setTransformValue(element, property, value) {
            element.style["-webkit-transform"] = property + "(" + value + ")";
            element.style["-moz-transform"] = property + "(" + value + ")";
            element.style["-ms-transform"] = property + "(" + value + ")";
            element.style["-o-transform"] = property + "(" + value + ")";
            element.style["transform"] = property + "(" + value + ")";
        }

        function parseDate(events) {
            var dateArrays = [];
            events.each(function () {
                var singleDate = $(this),
                    dateComp = singleDate.data('date').split('T');
                if (dateComp.length > 1) { //both DD/MM/YEAR and time are provided
                    var dayComp = dateComp[0].split('/'),
                        timeComp = dateComp[1].split(':');
                } else if (dateComp[0].indexOf(':') >= 0) { //only time is provide
                    var dayComp = ["2000", "0", "0"],
                        timeComp = dateComp[0].split(':');
                } else { //only DD/MM/YEAR
                    var dayComp = dateComp[0].split('/'),
                        timeComp = ["0", "0"];
                }
                var newDate = new Date(dayComp[2], dayComp[1] - 1, dayComp[0], timeComp[0], timeComp[1]);
                dateArrays.push(newDate);
            });
            return dateArrays;
        }

        function daydiff(first, second) {
            return Math.round((second - first));
        }

        function minLapse(dates) {
            //determine the minimum distance among events
            var dateDistances = [];
            for (i = 1; i < dates.length; i++) {
                var distance = daydiff(dates[i - 1], dates[i]);
                dateDistances.push(distance);
            }
            return Math.min.apply(null, dateDistances);
        }

        function elementInViewport(el) {
            var top = el.offsetTop;
            var left = el.offsetLeft;
            var width = el.offsetWidth;
            var height = el.offsetHeight;

            while (el.offsetParent) {
                el = el.offsetParent;
                top += el.offsetTop;
                left += el.offsetLeft;
            }

            return (
                top < (window.pageYOffset + window.innerHeight) &&
                left < (window.pageXOffset + window.innerWidth) &&
                (top + height) > window.pageYOffset &&
                (left + width) > window.pageXOffset
            );
        }

        function checkMQ() {
            return window.getComputedStyle(document.querySelector('.timeline_wrapper'), '::before').getPropertyValue('content').replace(/'/g, "").replace(/"/g, "");
        }

        $("ol li").click(function () {
            fill_boxes($(this).index());

            if ($('#filter_but').is(":checked")) {
                $('#network').show();
                $('#graph').hide();
                fill_network($(this).index());
            }
            else {
                $('#network').hide();
                $('#graph').show();
                fill_graph($(this).index());
            }
        });

        $('#filter_but').click(function () {
            if ($('#filter_but').is(":checked")) {
                $('#network').show();
                $('#graph').hide();
                fill_network($('.selected').parent().index());
            }
            else {
                $('#network').hide();
                $('#graph').show();
                fill_graph($('.selected').parent().index());
            }
        });

        for (var b = 0; b < json_global.length; b++) {
            $('.post_list').append("<div class='posts'><span>" + json_global[b].post_title + "</span></div>");
        }

    }
    else {
        $('#date1').html(d3.time.format('%d-%m-%Y at %H:%M:%S')(new Date(post_timestamp * 1000)));
    }
    fill_boxes($('.selected').parent().index());
    if ($('#filter_but').is(":checked")) {
        $('#network').show();
        $('#graph').hide();
        fill_network($('.selected').parent().index());
    }
    else {
        $('#network').hide();
        $('#graph').show();
        fill_graph($('.selected').parent().index());
    }

    $('#loading').hide();
    $('.row').show();

    function fill_boxes(index) {

        $('#value1').html(normalize_values(json_global[post].graph_snapshots[index].features.user_graph_hirsch_index));
        $('#value2').html(normalize_values(json_global[post].graph_snapshots[index].features.user_graph_indegree_normalized_entropy));
        $('#value3').html(normalize_values(json_global[post].graph_snapshots[index].features.basic_comment_count));
        $('#value4').html(normalize_values(json_global[post].graph_snapshots[index].features.branching_randic_index));
        $('#value5').html(normalize_values(json_global[post].graph_snapshots[index].features.basic_ave_width));
        $('#value6').html(normalize_values(json_global[post].graph_snapshots[index].features.temporal_std_time));
        $('#value7').html(normalize_values(json_global[post].graph_snapshots[index].features.temporal_timestamp_range));
        $('#value8').html(normalize_values(json_global[post].graph_snapshots[index].features.basic_max_width));
        $('#value9').html(normalize_values(json_global[post].graph_snapshots[index].features.user_graph_randic_index));
        $('#value10').html(normalize_values(json_global[post].graph_snapshots[index].features.basic_max_depth_max_width_ratio));
        $('#value11').html(normalize_values(json_global[post].graph_snapshots[index].features.basic_max_depth));
        $('#value12').html(normalize_values(json_global[post].graph_snapshots[index].features.temporal_last_half_mean_time));
        $('#value14').html(normalize_values(json_global[post].graph_snapshots[index].features.user_graph_user_count));
        $('#value15').html(normalize_values(json_global[post].graph_snapshots[index].features.basic_ave_depth));
        $('#value16').html(normalize_values(json_global[post].graph_snapshots[index].features.basic_depth_width_ratio_ave));
        $('#value17').html(normalize_values(json_global[post].graph_snapshots[index].features.branching_hirsch_index));
        $('#value18').html(normalize_values(json_global[post].graph_snapshots[index].features.user_graph_indegree_entropy));
        $('#value19').html(normalize_values(json_global[post].graph_snapshots[index].features.temporal_first_half_mean_time));
        $('#value20').html(normalize_values(json_global[post].graph_snapshots[index].features.branching_wiener_index));
        $('#value21').html(normalize_values(json_global[post].graph_snapshots[index].features.temporal_first_half_mean_time));
        $('#value22').html(normalize_values(json_global[post].graph_snapshots[index].features.user_graph_outdegree_entropy));
    }

    function fill_graph(index) {
        $('#graph svg').remove();
        var flatArray = [
            {
                name: "POST",
                guid: "0",
                parent: null
            }
        ];

        for (var k = 0; k < json_global[post].graph_snapshots[index].comment_tree.length; k++) {
            var parts = json_global[post].graph_snapshots[index].comment_tree[k];
            if (parts[0] !== parts[1]) {
                flatArray.push({"name": "", "guid": parts[0], parent: parts[1]});
            }
        }

        var data = flatToHierarchy(flatArray);

        function flatToHierarchy(flat) {

            var roots = []; // things without parent

            // make them accessible by guid on this map
            var all = {};

            flat.forEach(function (item) {
                all[item.guid] = item
            });

            // connect childrens to its parent, and split roots apart
            Object.keys(all).forEach(function (guid) {
                var item = all[guid];
                if (item.parent === null) {
                    roots.push(item)
                } else if (item.parent in all) {
                    var p = all[item.parent]
                    if (!('children' in p)) {
                        p.children = []
                    }
                    p.children.push(item)
                }
            });

            // done!
            return roots
        }

        var diameter = 1800;
        var height = diameter;

        var i = 0,
        //duration = 350,
            root;

        var tree = d3.layout.tree()
            .size([360, diameter / 2 - 120])
            .separation(function (a, b) {
                return (a.parent == b.parent ? 1 : 2) / a.depth;
            });

        var diagonal = d3.svg.diagonal.radial()
            .projection(function (d) {
                return [d.y, d.x / 180 * Math.PI];
            });

        var svg = d3.select("#graph").append("svg")
            .attr("width", $(window).width() - 20)
            .append("g");
        var one = 1;
        var zero = 1;
        if (data[0].hasOwnProperty('children')) {
            one = data[0].children.length;
        }
        else {
            zero = 0;
        }
        root = data[0];
        root.x0 = height / 2;
        root.y0 = 0;
        window.onresize = function(event) {
            setTimeout(function () {
                var div = 2;
                if (root.hasOwnProperty('children')) {
                    if (root.children.length === 1) {
                        div = 1;
                    }
                }
                d3.select("#graph svg").attr("height", $('#graph svg > g ')[0].getBBox().height + $('#graph svg > g ')[0].getBBox().height / 2);
                d3.select("#graph svg > g ").attr("transform", "translate(" + (($(window).width() / 2) - 10) + "," + $('#graph svg > g ')[0].getBBox().height / div + ")").style('opacity', '1');
                d3.select("#graph svg").attr("width", $(window).width() - 20);
            }, 150);
        };
//root.children.forEach(collapse); // start with all children collapsed
        update(root, 0);
        setTimeout(function () {
            var div = 2;
            if (root.hasOwnProperty('children')) {
                if (root.children.length === 1) {
                    div = 1;
                }
            }
            d3.select("#graph svg").attr("height", $('#graph svg > g ')[0].getBBox().height + $('#graph svg > g ')[0].getBBox().height / 2);
            d3.select("#graph svg > g ").attr("transform", "translate(" + (($(window).width() / 2) - 10) + "," + $('#graph svg > g ')[0].getBBox().height / div + ")").style('opacity', '1');
        }, 150);

//d3.select(self.frameElement).style("height", "800px");

        function update(source, duration) {

            // Compute the new tree layout.
            var nodes = tree.nodes(root),
                links = tree.links(nodes);

            // Normalize for fixed-depth.
            nodes.forEach(function (d) {
                d.y = d.depth * 60;
            });

            // Update the nodes…
            var node = svg.selectAll("g.node")
                .data(nodes, function (d) {
                    return d.id || (d.id = ++i);
                });

            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .on("click", click);

            nodeEnter.append("circle")
                .attr("r", 1e-6)
                .style("fill", function (d) {
                    if ($('#filter_but').is(":checked")) {
                        return d._children ? "lightsteelblue" : "#fff";
                    }
                    else {
                        return d._children ? "lightsteelblue" : "#677554";
                    }

                })
                .style("stroke", function (d) {
                    if ($('#filter_but').is(":checked")) {
                        return "steelblue";
                    }
                    else {
                        return "#819369";
                    }
                });

            nodeEnter.append("text")
                .attr("x", 10)
                .attr("dy", ".35em")
                .attr("text-anchor", "start")
                .text(function (d) {
                    return d.name;
                })
                .style("fill-opacity", 1e-6);

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .duration(duration)
                .attr("transform", function (d) {
                    if (one === 1) {
                        d.x = 0;
                    }
                    if (zero === 0) {
                        d.x = 180;
                    }
                    return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
                });

            nodeUpdate.select("circle")
                .attr("r", 4.5)
                .style("fill", function (d) {
                    return d._children ? "lightsteelblue" : "#fff";
                });

            nodeUpdate.select("text")
                .style("fill-opacity", 1)
                .attr("transform", function (d) {
                    return d.x < 180 ? "translate(0)" : "rotate(180)translate(-" + (d.name.length + 50) + ")";
                });

            var nodeExit = node.exit().transition()
                .duration(duration)
                .remove();

            nodeExit.select("circle")
                .attr("r", 1e-6);

            nodeExit.select("text")
                .style("fill-opacity", 1e-6);

            // Update the links…
            var link = svg.selectAll("path.link")
                .data(links, function (d) {
                    return d.target.id;
                });

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
                .attr("class", "link")
                .attr("d", function (d) {
                    var o = {x: source.x0, y: source.y0};
                    return diagonal({source: o, target: o});
                });

            // Transition links to their new position.
            link.transition()
                .duration(duration)
                .attr("d", diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                .duration(duration)
                .attr("d", function (d) {
                    var o = {x: source.x, y: source.y};
                    return diagonal({source: o, target: o});
                })
                .remove();

            // Stash the old positions for transition.
            nodes.forEach(function (d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

// Toggle children on click.
        function click(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }

            update(d, 350);
        }
    }

    function fill_network(index) {
        $('#network').empty();
        var o,
            g = {
                nodes: [],
                edges: []
            };

        for (var k = 0; k < json_global[post].graph_snapshots[index].user_graph.length; k++) {
            var parts = json_global[post].graph_snapshots[index].user_graph[k];
            g.edges.push({
                id: 'e' + k,
                source: 'n' + parts[0],
                target: 'n' + parts[1],
                size: 1,
                type: "curve"
            });
        }

        for (var l = 0; l < json_global[post].graph_snapshots[index].user_graph_node_list.length; l++) {
            var name = json_global[post].graph_snapshots[index].user_graph_node_list[l];
            o = {
                id: 'n' + name,
                label: "OP",
                x: Math.random(),
                y: Math.random(),
                size: 1,
                color: '#5d9fd2'
            };
            g.nodes.push(o);
        }
        if (g.nodes.length === 0) {
            o = {
                id: 'n0',
                label: "OP",
                x: Math.random(),
                y: Math.random(),
                size: 1,
                color: '#5d9fd2'
            };
            g.nodes.push(o);
            g.edges.push({
                id: 'e0',
                source: 'n0',
                target: 'n0',
                size: 0,
                type: "curve",
                color: "#F8F8F8"
            });
        }
        createnet();

        function createnet() {
            if (typeof s !== 'undefined') {
                if (s.isForceAtlas2Running()) {
                    s.killForceAtlas2();
                }
            }
            sigma.renderers.def = sigma.renderers.canvas;
            s = new sigma({
                graph: g,
                renderer: {
                    container: document.getElementById('network'),
                    type: 'canvas'
                }, settings: {
                    //minNodeSize: 3,
                    //maxNodeSize: 16,
                    minEdgeSize: 0.6,
                    maxEdgeSize: 0.6,
                    enableHovering: false
                }
            });
            var arr = [];
            s.graph.nodes().forEach(function (n) {
                if (s.graph.degree(n.id) > 30) {
                    arr.push(40);
                }
                else {
                    arr.push(s.graph.degree(n.id));
                }
                n.originalColor = n.color;
            });
            s.graph.edges().forEach(function (e) {
                e.originalColor = e.color;
            });

            var max = d3.max(arr);
            var scale = d3.scale.linear().domain([0, max]).range([0, 10]);

            s.graph.nodes().forEach(function (n, index) {
                n.size = scale(arr[index]);
            });
            s.refresh();

            s.bind('clickNode', function (e) {
                var nodeId = e.data.node.id,
                    toKeep = s.graph.neighbors(nodeId);
                toKeep[nodeId] = e.data.node;

                s.graph.nodes().forEach(function (n) {
                    if (toKeep[n.id])
                        n.color = n.originalColor;
                    else
                        n.color = '#eee';
                });

                s.graph.edges().forEach(function (e) {
                    if (toKeep[e.source] && toKeep[e.target])
                        e.color = e.originalColor;
                    else
                        e.color = '#eee';
                });

                // Since the data has been modified, we need to
                // call the refresh method to make the colors
                // update effective.
                s.refresh();
            });
            s.bind('clickStage', function (e) {
                s.graph.nodes().forEach(function (n) {
                    n.color = n.originalColor;
                });

                s.graph.edges().forEach(function (e) {
                    e.color = e.originalColor;
                });

                // Same as in the previous event:
                s.refresh();
            });
            s.bind('rightClickStage', function (e) {

                s.resetZoom(e.target.camera);
            });
            s.startForceAtlas2({iterationsPerRender: 280});
            setTimeout(function () {
                s.stopForceAtlas2();
            }, 3000)
        }
    }
}
$(".post_list").on("click", ".posts", function () {
    post = $(this).index();
    window.history.replaceState('Object', 'Title', 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?post=' + post);
    get_post("click");
});

function normalize_values(value) {
    if (value % 1 != 0) {
        if (value > 1) {
            value = value.toFixed(1);
        }
        else {
            value = value.toFixed(3);
        }
    }
    return value;
}

function gup(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null) return "";
    else return results[1];
}