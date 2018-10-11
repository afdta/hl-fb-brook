import {lookup} from './data-lookup.js';
import {HL, HLUSPS, state_geos, state_mesh, heartland_mesh} from './state-geos';
import cbsa_geos from './cbsa-geos';
import palette from './palette.js';
import format from '../../../js-modules/formats.js';

//lookup: lookup(indicator, metric, geolevel) // metric is one of ["change","start","end"]

export default function map_module(container, init_indicator, init_metric, init_geolevel, init_geo){

    //heartland feature collection
    var HLFC = {
                type: "FeatureCollection", 
                features: state_geos.features.filter(function(d){
                    return HL.hasOwnProperty(parseInt(d.properties.geo_id)+"");
                })
            }

    //mobile state        
    var is_mobile = false;

    //selection state (and other parameters)
    var scope = {
        height:400,
        aspect:1.154,
        width:300,
        column_height:150,
        indicator:"job",
        metric:"change",
        geolevel:"state",
        geo:"1",
        geoselection:null,
        data:null,
        bars:null
    }

    var format_;
    var formatAxis_;

    //set selections, if any
    if(init_indicator != null){scope.indicator = init_indicator}
    if(init_metric != null){scope.metric = init_metric}
    if(init_geolevel != null){scope.geolevel = init_geolevel}
    if(init_geo != null){scope.geo = init_geo}
    
    //outer wrap
    var wrap0 = d3.select(container).append("div").classed("fb-center-col c-fix",true).style("padding","0px 15px");

    //map dom
    var map_wrap0 = wrap0.append("div").style("position","relative").classed("map-container green-border",true);

    //mobile map legend
    var mobile_legend = map_wrap0.append("div").style("padding","15px").classed("fb-mobile-view",true);
    var mobile_title = mobile_legend.append("p").style("margin","0px 0px 10px 0px");
    var mobile_swatches = mobile_legend.append("div").classed("c-fix",true);

    //build svg filters
    var defs = wrap0.append("div").style("height","0px").append("svg").append("defs");
    var filter = defs.append("filter").attr("id","feBlur").attr("width","150%").attr("height","150%");
    filter.append("feOffset").attr("result","offsetout").attr("in","SourceGraphic").attr("dx","6").attr("dy","6");
    filter.append("feColorMatrix").attr("result","matrixout").attr("in","offsetout").attr("type","matrix").attr("values","0.25 0 0 0 0 0 0.25 0 0 0 0 0 0.25 0 0 0 0 0 1 0");
    filter.append("feGaussianBlur").attr("result","blurout").attr("in","matrixout").attr("stdDeviation","4");
    filter.append("feBlend").attr("in","SourceGraphic").attr("in2","blurout").attr("mode","normal");
    
    //TWO MAP PANELS
    var map_panel = map_wrap0.append("div").style("position","relative"); //hold map
    
    //hold bars/legend
    var map_bars_panel = wrap0.append("div").classed("map-bars-container green-border",true).style("padding-bottom","15px");

    var tooltip = map_panel.append("div")
                           .style("position","absolute")
                           .style("min-width","200px")
                           .style("max-width","500px")
                           .style("min-height","100px")
                           .style("pointer-events","none")
                           .style("padding","0px 0px 0px 11px")
                           ;

    var tooltip_content = tooltip.append("div").style("padding","10px 15px 10px 10px").style("border","1px solid " + palette.mediumgray)
                                .style("position","relative").style("z-index","10").style("background-color","#ffffff")
                                .style("box-shadow","2px 3px 8px rgba(0,0,0,0.4)");

        tooltip.append("div").style("width","12px").style("position","absolute")
                            .style("left","0px").style("top","0px")
                            .style("height","100px").style("z-index","11")
                            .append("svg").attr("width","100%").attr("height","100%")
                            .append("path").attr("d", "M12.5,12 L1,20 L12.5,28")
                            .attr("stroke", palette.mediumgray)
                            .attr("fill","#ffffff")
                            .attr("filter","url(#feBlur)")
                            ;
    
    
    var map_svg = map_panel.append("div").style("width","100%")
                                         .style("height","100%")
                                         .style("overflow","hidden")
                                         .append("svg")
                                         .attr("width","100%")
                                         .attr("height","100%");
    
    //map <g>roups
    var g_back = map_svg.append("g"); //all states
    var g_shadow = map_svg.append("g").attr("filter", "url(#feBlur)"); //HL shadow
    
    //data layers
    var g_states = map_svg.append("g");
    var g_hl = map_svg.append("g"); //top heartland outline

    var g_metros = map_svg.append("g").style("pointer-events","none");
    var g_micros = map_svg.append("g").style("pointer-events","none");

    var g_voro = map_svg.append("g");
    
    
    var g_anno = map_svg.append("g").style("ponter-events","none");

    function obj2arr(){
        var micros = [];
        var metros = [];
        for(var micro in cbsa_geos.micro){
            if(cbsa_geos.micro.hasOwnProperty(micro)){
                micros.push(cbsa_geos.micro[micro]);
            }
        }
        for(var metro in cbsa_geos.metro){
            if(cbsa_geos.metro.hasOwnProperty(metro)){
                metros.push(cbsa_geos.metro[metro]);
            }
        }
        return {metro:metros, micro:micros}
    }

    var cbsa_geos2 = obj2arr();

    //projection and path gen
    var proj = d3.geoAlbers();
    var path = d3.geoPath(proj);

    //geo code accessor
    var state_accessor = function(d){
        try{
            var geo_id = parseInt(d.properties.geo_id)+"";
        }
        catch(e){
            var geo_id = null;
        }
        return geo_id;
    }
    var cbsa_accessor = function(d){return d.fips}
    
    //map draw/redraw fn
    function draw_map(){

    
        try{
            var box = map_panel.node().getBoundingClientRect();
            scope.width = box.right - box.left;
        }
        catch(e){
            scope.width = 400;
        }

        //aspect ratio of heartland
        var max_height = 700;
        var min_height = 300;
        var hl_height = scope.width * scope.aspect;

        //set height
        scope.height = hl_height > max_height ? max_height : 
                        hl_height < min_height ? min_height : hl_height;
        map_panel.style("height", scope.height+"px");

        proj.fitExtent([[10, 10], [scope.width - 10, scope.height-10]], HLFC);  


        //bar chart as legend
        draw_bars();

        var fill = function(geo_accessor){
            if(arguments.length==0){
                geo_accessor = function(d){return d.fips}
            }
            return function(d){
                var geo_code = geo_accessor(d);
                var v = scope.data.get(geo_code);
                return scope.data.color_scale(v);
            }
        }

        var stroke = function(geo_accessor){
            if(arguments.length==0){
                geo_accessor = function(d){return d.fips}
            }
            return function(d){
                var geo_code = geo_accessor(d);
                var v = scope.data.get(geo_code);
                return d3.color(scope.data.color_scale(v)).darker();
            }
        }

        //draw map background
        var states_back = draw_states(g_back, [state_mesh], {stroke:"#666666", "stroke-width":0.5, fill:"#ffffff", "stroke-dasharray":"3,3"});
        var state_shadow = draw_states(g_shadow, HLFC.features, {stroke:"#cccccc", "stroke-width":0.5, fill:"#cccccc"});
        var state_outline = draw_states(g_hl, [heartland_mesh], {stroke:"#666666", "stroke-width":1.5, fill:"none"});
        
        //draw geoselection
        if(scope.geolevel=="state" || scope.geolevel=="rural"){
            scope.geoselection = draw_states(g_states, HLFC.features, {stroke:"#666666", fill:fill(state_accessor), "stroke-width":"0.5" }, true);
            g_voro.selectAll("path").remove();
            g_metros.style("visibility","hidden");
            g_micros.style("visibility","hidden");
        }
        else if(scope.geolevel=="metro"){
            scope.geoselection = draw_points(g_metros, cbsa_geos2.metro, {fill:fill(), r:6, stroke:stroke()}, true);
            draw_states(g_states, HLFC.features, {stroke:"#666666", fill:"#ffffff"});
           
            g_metros.style("visibility","visible");
            g_micros.style("visibility","hidden");
        }
        else if(scope.geolevel=="micro"){
            scope.geoselection = draw_points(g_micros, cbsa_geos2.micro, {fill:fill(), r:6, stroke:stroke()}, true);
            draw_states(g_states, HLFC.features, {stroke:"#666666", fill:"#ffffff"});

            g_micros.style("visibility","visible");
            g_metros.style("visibility","hidden");
        }
        else{
            scope.geoselection = null;
        }
    }

    var hide_timer;
    function show_tooltip(geo, centroid){
        clearTimeout(hide_timer);
        tooltip_content.text("HERE")
        
        tooltip.style("left",(centroid[0]+3)+"px").style("top",(centroid[1]-20)+"px").style("display","block");

        

        if(scope.geolevel == "state" || scope.geolevel == "rural"){
            var sel = d3.select(this);
            var a = g_anno.selectAll("path").data([1]);
            a.enter().append("path").merge(a).attr("d", sel.attr("d")).attr("stroke",palette.gray).attr("stroke-width","1.5")
                        .style("pointer-events","none").attr("fill","none")
                        //.attr("filter", "url(#feBlur)")
                        ;
            var name = HL[geo];
        }
        else{
            var a = g_anno.selectAll("circle").data([1]);
            a.enter().append("circle").merge(a).attr("cx", centroid[0])
                            .attr("cy", centroid[1]).attr("r", 7).attr("stroke-width","1.5")
                            .attr("stroke", palette.gray).attr("fill","none")
                            .style("pointer-events","none")
                            ;
            var name = cbsa_geos[scope.geolevel][geo].name;
        }

        var value = format_(scope.data.get(geo));

        tooltip_content.html('<p class="fb-header" style="margin:0px 0px 5px 0px;">' + name + '</p>' + 
                             '<p style="margin:0px;">' + value + '</p>');

        scope.bars.style("opacity",function(d){return d.geo == geo ? 1 : 0.25});
    
    }

    function hide_tooltip(){
        clearTimeout(hide_timer);
        hide_timer = setTimeout(function(){
            g_anno.selectAll("path").remove();
            g_anno.selectAll("circle").remove();
            tooltip_content.html("");
            tooltip.style("left","0px").style("top","0px").style("display","none");
            scope.bars.style("opacity","1");
        }, 150);
    }

    //TODO: add tooltip functionality
    function draw_states(g, features, attrs, enable_tooltips){
        var st_ = g.selectAll("path").data(features);
        st_.exit().remove();
        var st = st_.enter().append("path").merge(st_)
                    .attr("d", path)
                    ;

        //apply attributes
        if(attrs != null){
            for(var a in attrs){
                if(attrs.hasOwnProperty(a)){
                    st.attr(a, attrs[a]);
                }
            }
        }

        if(arguments.length > 3 && !!enable_tooltips){
            st.on("mouseenter", function(d, i){
                var that = this;
                show_tooltip.call(that, state_accessor(d), path.centroid(d));
            })
            .on("mouseleave", hide_tooltip)
            ;
        }
        else{
            st.on("mouseenter", null).on("mouseleave", null);
        }
        
        return st;    
    }

    //draw the points
    function draw_points(g, features, attrs, enable_tooltips){
        var projected_features = features.map(function(d){
            var p = proj([d.lon, d.lat]);
            return {x:p[0], y:p[1], fips:d.fips}
        })

        var m_ = g.selectAll("circle").data(projected_features, function(d){return d.fips});
        m_.exit().remove();
        var m = m_.enter().append("circle").merge(m_)
                    .attr("cx", function(d){return d.x})
                    .attr("cy", function(d){return d.y})
                    ;

        //apply attributes
        if(attrs != null){
            for(var a in attrs){
                if(attrs.hasOwnProperty(a)){
                    m.attr(a, attrs[a]);
                }
            }
        }

        //run mouse events on voronoi - to do
        var voro = d3.voronoi()
                     .extent([[0,0], [scope.width, scope.height]])
                     .x(function(d){return d.x})
                     .y(function(d){return d.y})
                     .polygons(projected_features)
                     .map(function(d){
                        var path;
                        if(d!=null){
                            path = "M" + d.join("L") + "Z";
                        }
                        else{
                            path = "M0,0";
                        }
                        return {path:path, fips:d.data.fips, centroid:[d.data.x, d.data.y]}
                     })
                     ;

        var mv_u = g_voro.selectAll("path").data(voro);
        mv_u.exit().remove();
        var mv = mv_u.enter().append("path").merge(mv_u)
            .attr("d", function(d){
                return d.path;
            })
            .attr("stroke","none")
            .attr("fill","none")
            .style("pointer-events","all");

        if(arguments.length > 3 && !!enable_tooltips){
            mv.on("mouseenter", function(d, i){
                var that = this;
                show_tooltip.call(that, cbsa_accessor(d), d.centroid);
            })
            .on("mouseleave", hide_tooltip)
            ;
        }
        else{
            mv.on("mouseenter", null).on("mouseleave", null);
        }
        
        return m;
    }

    //bar chart dom
    var bars_wrap0 = map_bars_panel.append("div");
        
    var bars_title = bars_wrap0.append("p")
                    .text("")
                    .style("margin","16px 5px 16px 5%");

    var bars_wrap1 = bars_wrap0.append("div").style("min-height","300px").style("width","100%");
    var bars_svg = bars_wrap1.append("svg").attr("width","100%").attr("height","100%");
    var bars_grid = bars_svg.append("g");
    var bars_axis = bars_svg.append("g").attr("transform","translate(0,20)");
    var bars_main = bars_svg.append("g");
    var bars_front = bars_svg.append("g");

    var bars_axis_line = bars_axis.append("line").classed("x-axis",true)
             .attr("x1","5%")
             .attr("x2","95%")
             .attr("y1",3.5).attr("y2",3.5)
             .attr("stroke",palette.gray)
             .style("shape-rendering","crispEdges")
             ;

    //render axes and grid lines
    function draw_axis(scale){
        if(scale===null){
            var tickvals = [];
            var tickZero = []; //needs to be empty because scale can't be used below
            bars_axis.style("visibility","hidden");
        }
        else{
            var tickvals = scale.ticks(3);       
            var tickZero = [0];     
            bars_axis.style("visibility",null);
        }

        var ticks = bars_axis.selectAll("line.tick-mark").data(tickvals);
        ticks.exit().remove();
        ticks.enter().append("line").classed("tick-mark",true).merge(ticks)
            .attr("x1", function(d){return scale(d)+"%"})
            .attr("x2", function(d){return scale(d)+"%"})
            .attr("y1","3.5").attr("y2","10").attr("stroke",palette.gray)
            .style("shape-rendering","crispEdges");

        var tickLabels = bars_axis.selectAll("text.tick-mark").data(tickvals);
        tickLabels.exit().remove();
        tickLabels.enter().append("text").classed("tick-mark",true).merge(tickLabels)
            .attr("x", function(d){return scale(d)+"%"}).attr("text-anchor","middle")
            .attr("y","0").attr("fill",palette.gray).style("font-size","13px")
            .text(function(d){return formatAxis_(d)});

        var gridlines = bars_grid.selectAll("line.grid-line").data(tickZero);
        gridlines.exit().remove();
        gridlines.enter().append("line").classed("grid-line",true).merge(gridlines)
            .attr("x1", function(d){return scale(d)+"%"})
            .attr("x2", function(d){return scale(d)+"%"})
            .attr("y1","45").attr("y2","100%").attr("stroke","#ffffff")
            .style("shape-rendering","crispEdges");

    }

    //bar chart draw/redraw
    function draw_bars(){
        var data = scope.data.get().slice(0).sort(function(a,b){return b.value-a.value});
        
        var extent = null;

        if(data.length > 0){
            var min = d3.min(data, function(d){return d.value});
            var max = d3.max(data, function(d){return d.value});
            if(min >= 0){
                extent = [0, max];
            }
            else if(max <= 0){
                extent = [min, 0];
            }
            else{
                extent = [min, max];
            }
        }
    

        var title_html = "";

        if(extent !== null){
            var x = d3.scaleLinear().domain(extent).range([5,85]);
            var zero = x(0);
            var width = function(d){
                var v = d.value;
                var w;
                var xpos = x(v);
                if(v >= 0){
                    w = xpos - zero;
                }
                else{
                    w = zero - xpos;
                }
                return w + "%";
            }

            draw_axis(x);

            var bar_group_data = data.map(function(d){
                return {value:d.value, geo:d.geo, color:scope.data.color_scale(d.value)}
            });
            var bar_groups = d3.nest().key(function(d){return d.color}).entries(bar_group_data)
                                    .map(function(d){
                                        if(d.values.length > 1){
                                            var extent = d3.extent(d.values, function(d){return d.value});
                                            var minfmt = format_(extent[0]);
                                            var maxfmt = format_(extent[1]);
                                            var label = minfmt===maxfmt ? maxfmt : minfmt + " to " + maxfmt;
                                            var min = extent[0];
                                        }
                                        else{
                                            var min = d.values[0].value;
                                            label = format_(min);
                                        }
                                        return {
                                            label: label,
                                            n: d.values.length,
                                            min: min,
                                            bars: d.values.sort(function(a,b){
                                                return d3.descending(a.value, b.value);
                                            })
                                        }
                                    })
                                    .sort(function(a,b){return b.min - a.min});

            var prior_bars = 0;
            bar_groups.forEach(function(d){
                d.prior_bars = prior_bars;
                prior_bars = prior_bars + d.bars.length;
            });

            map_bars_panel.style("background-color","#ffffff");

            title_html = '<span class="fb-header fb-chart-title">' + scope.data.label + '</span>&nbsp;<span class="fb-light-header fb-chart-title">' + 
                         scope.data.period + '</span><span class="fb-light-header">' + scope.data.units + '</span>';

            
            
        }
        else{
            var x = function(){return 0};
            var width = 0;
            draw_axis(null);
            var bar_groups = [];
            map_bars_panel.style("background-color","#e0e0e0")

            title_html = '<p class="fb-header">Data not available</p>';
        }

        bars_title.html(title_html);
        mobile_title.html(title_html);

        //draw bar chart
        //set height to accommodate all bars -- start with scope.height set by map
        var height = scope.height > 600 ? 600 : scope.height;
        var top_pad = 30;
        var bot_pad = 10;
        var group_pad = 30;        
        var bar_height = Math.floor((height-top_pad-bot_pad-(group_pad*bar_groups.length))/data.length);
        if(bar_height < 1){bar_height = 1}
        
        //final height
        height = (bar_height * data.length) + top_pad + bot_pad + group_pad*bar_groups.length;
        bars_wrap1.style("height",height+"px");

        //bar groups
        var bars_u = bars_main.selectAll("g.bar").data(bar_groups);
        bars_u.exit().remove();
        var bars_e = bars_u.enter().append("g").classed("bar",true);
        bars_e.append("text");
        var bars = bars_e.merge(bars_u).attr("transform", function(d,i){
            return "translate(0," + (top_pad + (i+1)*group_pad + d.prior_bars*bar_height) + ")";
        });

        //actual rectangles
        var b_u = bars.selectAll("rect.bar").data(function(d){return d.bars});
        b_u.exit().remove();
        var b_e = b_u.enter().append("rect").classed("bar",true);
        var b = b_e.merge(b_u);

        scope.bars = b; //make accessible
    
        b.attr("width", width)
            .attr("height", bar_height)
            .attr("x", function(d){return d.value < 0 ? x(d.value)+"%" : zero+"%"}) 
            .attr("y",function(d,i){return i*bar_height})
            .attr("fill", function(d){return d.color})
            .attr("stroke", bar_height > 5 ? "#ffffff" : "none")
            ;

        //bar labels (states)
        var bl_u = bars.selectAll("text.bar-label").data(function(d){
            if(scope.geolevel == "state" || scope.geolevel == "rural"){
                return d.bars;
            }
            else{
                return [];
            }
        });
        bl_u.exit().remove();
        var bl_e = bl_u.enter().append("text").classed("bar-label",true);
        var bl = bl_e.merge(bl_u);
    
        bl.attr("x", function(d){return d.value > 0 ? x(d.value)+"%" : zero+"%"}) 
            .attr("y",function(d,i){return i*bar_height})
            .attr("dy", bar_height*0.8)
            .attr("dx",3)
            .attr("fill", function(d){return palette.gray})
            .text(function(d){return HLUSPS[d.geo]})
            .style("font-size","13px")
            ;

        //group labels (ranges)
        var labels_u = bars.selectAll("text.label").data(function(d,i){
            //var lab = i==0 ? d.label + " (n=" + d.n + ")" : d.label + " (" + d.n + ")";
            var lab = d.label + " (" + d.n + ")";
            return [lab, lab];
        });
        labels_u.exit().remove();
        var labels_e = labels_u.enter().append("text").classed("label",true);
        var labels = labels_e.merge(labels_u);
    
        labels.attr("x", zero+"%") 
            .attr("text-anchor", zero > 30 && zero < 60 ? "middle" : "start")
            .attr("y",function(d,i){return 0})
            .attr("dy","-5")
            .attr("dx","3")
            .text(function(d){return d})
            .attr("fill","#555555")
            .attr("stroke", function(d,i){return i==0 ? "#ffffff" : null})
            .attr("stroke-width", function(d,i){return i==0 ? 3 : null})
            .style("font-size","13px")
            .style("font-style","italic")
            ;

        //draw legend swatches

        var swatches_up = mobile_swatches.selectAll("div.legend-swatch").data(bar_groups);
        swatches_up.exit().remove();
        var swatches_enter = swatches_up.enter().append("div").classed("legend-swatch",true);
        swatches_enter.append("div");
        swatches_enter.append("p");

        var swatches = swatches_enter.merge(swatches_up);

        swatches.select("div").style("background-color", function(d){return d.bars[0].color});
        swatches.select("p").html(function(d){return d.label});



    }

    //package all drawing in an update function
    function update(indicator_, metric_, geolevel_, geo_){
        test_mobile();

        if(indicator_!=null){scope.indicator=indicator_}
        if(metric_!=null){scope.metric=metric_}
        if(geolevel_!=null){scope.geolevel=geolevel_}
        if(geo_!=null){scope.geo=geo_}

        scope.data = lookup(scope.indicator, scope.metric, scope.geolevel);

        format_ = format.fn0(scope.data.format);
        formatAxis_ = format.fn0(scope.data.formatAxis);

        var r_scale = d3.scaleQuantize().domain([0,1]).range([3,5,7]); //all cbsas on same scale?

        //define color scale -- should handle nulls

        draw_map();
        hide_tooltip();
        
    }

    function test_mobile(){
        try{
            var box = wrap0.node().getBoundingClientRect();
            var width = box.right-box.left;
            is_mobile = width < 900;
        }
        catch(e){
            is_mobile = true;
        }

        wrap0.classed("hl-mobile", is_mobile);
    }

    var resizeTimer;
    window.addEventListener("resize", function(){
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(update, 200);
    })

    setTimeout(update, 0);

    return update;
}