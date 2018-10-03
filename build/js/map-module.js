import {lookup} from './data-lookup.js';
import {HL, state_geos, state_mesh, heartland_mesh} from './state-geos';
import cbsa_geos from './cbsa-geos';
import palette from './palette.js';

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
        data:null
    }

    //set selections, if any
    if(init_indicator != null){scope.indicator = init_indicator}
    if(init_metric != null){scope.metric = init_metric}
    if(init_geolevel != null){scope.geolevel = init_geolevel}
    if(init_geo != null){scope.geo = init_geo}

    //styles
    var styles = {
        chart_title_margin: "0px"
    }
    
    //outer wrap
    var wrap0 = d3.select(container).append("div").classed("fb-center-col",true);

    //var main_title = wrap0.append("p").text("Main title").classed("fb-header section-title",true);
    
    var wrap1 = wrap0.append("div").classed("green-square-wrap",true)
                            .append("div").classed("c-fix", true).style("padding","0px");

    //map dom
    var map_wrap0 = wrap1.append("div");
    
    var map_wrap1 = map_wrap0.append("div").style("position","relative");

    //build svg filters
    var defs = wrap1.append("div").style("height","0px").append("svg").append("defs");
    var filter = defs.append("filter").attr("id","feBlur").attr("width","150%").attr("height","150%");
    filter.append("feOffset").attr("result","offsetout").attr("in","SourceGraphic").attr("dx","6").attr("dy","6");
    filter.append("feColorMatrix").attr("result","matrixout").attr("in","offsetout").attr("type","matrix").attr("values","0.25 0 0 0 0 0 0.25 0 0 0 0 0 0.25 0 0 0 0 0 1 0");
    filter.append("feGaussianBlur").attr("result","blurout").attr("in","matrixout").attr("stdDeviation","4");
    filter.append("feBlend").attr("in","SourceGraphic").attr("in2","blurout").attr("mode","normal");
    
    //TWO MAP PANELS
    var map_panel = map_wrap1.append("div"); //hold map
    
    //hold bars/legend
    var map_bars_panel = map_wrap1.append("div")
                            .style("position","absolute")
                            .style("bottom","20px")
                            .style("right","20px")
                            .style("width","150px")
                            .style("background-color","rgba(255,255,2552,0.7)")
                            .style("border","1px solid " + palette.green)
                            .style("border-width","1px 0px 0px 1px")
                            ; 
    

    
    var map_svg = map_panel.append("svg").attr("width","100%").attr("height","100%");
    
    //map <g>roups
    var g_back = map_svg.append("g"); //all states
    var g_shadow = map_svg.append("g").attr("filter", "url(#feBlur)"); //HL shadow
    
    //data layers
    var g_states = map_svg.append("g");
    var g_hl = map_svg.append("g"); //top heartland outline

    var g_metros = map_svg.append("g");
    var g_micros = map_svg.append("g");
    
    
    var g_anno = map_svg.append("g");

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
        var max_height = 800;
        var min_height = 400;
        var hl_height = scope.width * scope.aspect;

        //set height
        scope.height = hl_height > max_height ? max_height : 
                        hl_height < min_height ? min_height : hl_height;
        map_panel.style("height", scope.height+"px");

        //draw bars
        if(false){
            //option for mobile layout
            map_bars_panel.style("height",scope.column_height+"px").style("width","100%");
            proj.fitExtent([[10,10], [scope.width-10, scope.height-160]], HLFC);
        }
        else{
            var bars_width = scope.width*(scope.width > 1200 ? 0.3 : 0.2);
            map_bars_panel.style("width", bars_width+"px").style("height","100%");

            //amount of horizontal space on either side of heartland
            //var bars_width_available = ((scope.width - (scope.height/scope.aspect))/2) - 10;
            //console.log(bars_width_available);

            proj.fitExtent([[10, 10], 
                            [scope.width-bars_width - 40, scope.height-10]], HLFC);            

            //proj.fitExtent([[(bars_width_available > bars_width ? 10 : bars_width - bars_width_available + 40), 10], 
            //                [scope.width-10, scope.height-10]], HLFC);
        }
        
        

        //bar chart as legend
        draw_bars();
        
        

        

        var state_accessor = function(d){return parseInt(d.properties.geo_id)+"";}

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

        //draw map background
        var states_back = draw_states(g_back, [state_mesh], {stroke:"#666666", "stroke-width":0.5, fill:"#ffffff", "stroke-dasharray":"3,3"});
        var state_shadow = draw_states(g_shadow, HLFC.features, {stroke:"#cccccc", "stroke-width":0.5, fill:"#cccccc"});
        var state_outline = draw_states(g_hl, [heartland_mesh], {stroke:"#666666", "stroke-width":1.5, fill:"none"});
        
        if(scope.geolevel=="state" || scope.geolevel=="rural"){
            var states = draw_states(g_states, HLFC.features, {stroke:"#666666", fill:fill(state_accessor), "stroke-width":"0.5" });
            
            g_metros.style("visibility","hidden").style("pointer-events","none");
            g_micros.style("visibility","hidden").style("pointer-events","none");
        }
        else if(scope.geolevel=="metro"){
            var metros = draw_points(g_metros, cbsa_geos2.metro, {fill:fill(), r:5});
            var states = draw_states(g_states, HLFC.features, {stroke:"#666666", fill:"#ffffff"});
           
            g_metros.style("visibility","visible").style("pointer-events","all");
            g_micros.style("visibility","hidden").style("pointer-events","none");
        }
        else if(scope.geolevel=="micro"){
            var micros = draw_points(g_micros, cbsa_geos2.micro, {fill:fill(), r:5});
            var states = draw_states(g_states, HLFC.features, {stroke:"#666666", fill:"#ffffff"});

            g_micros.style("visibility","visible").style("pointer-events","all");
            g_metros.style("visibility","hidden").style("pointer-events","none");
        }
        else{

        }


    }

    //TODO: add tooltip functionality
    function draw_states(g, features, attrs){
        var st_ = g.selectAll("path").data(features, function(d){return d.fips});
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
        
        return st;    
    }

    function draw_points(g, features, attrs){
        var m_ = g.selectAll("circle").data(features, function(d){return d.fips});
        m_.exit().remove();
        var m = m_.enter().append("circle").merge(m_)
                    .attr("cx", function(d){return proj([d.lon, d.lat])[0]})
                    .attr("cy", function(d){return proj([d.lon, d.lat])[1]})
                    ;

        //apply attributes
        if(attrs != null){
            for(var a in attrs){
                if(attrs.hasOwnProperty(a)){
                    m.attr(a, attrs[a]);
                }
            }
        }
        
        return m;
    }

    //bar chart dom
    var bars_wrap0 = map_bars_panel.append("div").style("height","100%");
        
    //var bars_title = bars_wrap0.append("p").text("Bar chart title").classed("subtitle", true);

    var bars_wrap1 = bars_wrap0.append("div").style("min-height","360px").style("width","100%").style("height","100%");
    var bars_svg = bars_wrap1.append("svg").attr("width","100%").attr("height","100%");

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
        

        if(false){
            //optional horizonal layout - TK
            if(extent !== null){
                var y = d3.scaleLinear().domain(extent).range([90,10]);
                var zero = y(0);
                var height = function(d){
                    var v = d.value;
                    var h;
                    var ypos = y(v);
                    if(v < 0){
                        h = ypos - zero;
                    }
                    else{
                        h = zero - ypos;
                    }
                    return h + "%";
                }
            }
            else{
                var y = function(){return 0};
                var height = 0;
            }
            
        
        }
        else{
            if(extent !== null){
                var x = d3.scaleLinear().domain(extent).range([10,90]);
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
            }
            else{
                var x = function(){return 0};
                var width = 0;
            }

            //set height to accommodate all bars -- start with scope.height set by map
            var height = scope.height > 600 ? 600 : scope.height;
            var top_pad = 30;
            var bot_pad = 30;
            var bar_height = Math.floor((height-top_pad-bot_pad)/data.length);
            if(bar_height < 1){bar_height = 1}
            
            //final height
            height = (bar_height * data.length) + top_pad + bot_pad;
            
            map_bars_panel.style("height", height+"px"); //.style("top", ((scope.height - height)/2)+"px");

            var bars_u = bars_svg.selectAll("g.bar").data(data, function(d){return d.geo});
            bars_u.exit().remove();
            var bars_e = bars_u.enter().append("g").classed("bar",true);
            bars_e.append("rect");
            bars_e.append("text");

            var bars = bars_e.merge(bars_u);
        
            bars.select("rect")
                .attr("width", width)
                .attr("height", bar_height)
                .attr("x", function(d){return d.value < 0 ? x(d.value)+"%" : zero+"%"}) 
                .attr("y","0")
                .attr("fill", function(d){return scope.data.color_scale(d.value)})

            bars.interrupt().transition().attr("transform", function(d,i){
                return "translate(0," + ((i*bar_height) + top_pad) + ")";
            });
        }
    }

    //package all drawing in an update function
    function update(indicator_, metric_, geolevel_, geo_){
        test_mobile();

        if(indicator_!=null){scope.indicator=indicator_}
        if(metric_!=null){scope.metric=metric_}
        if(geolevel_!=null){scope.geolevel=geolevel_}
        if(geo_!=null){scope.geo=geo_}

        scope.data = lookup(scope.indicator, scope.metric, scope.geolevel);

        var r_scale = d3.scaleQuantize().domain([0,1]).range([3,5,7]); //all cbsas on same scale?

        //define color scale -- should handle nulls

        draw_map();
        
    }

    function test_mobile(){
        try{
            var box = wrap1.node().getBoundingClientRect();
            var width = box.right-box.left;
            is_mobile = width < 900;
        }
        catch(e){
            is_mobile = true;
        }

        map_wrap1.classed("hl-mobile", is_mobile);
    }

    var resizeTimer;
    window.addEventListener("resize", function(){
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(update, 200);
    })

    setTimeout(update, 0);

    return update;
}