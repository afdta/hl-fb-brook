import {lookup} from './data-lookup.js';
import state_geos from './state-geos';
import cbsa_geos from './cbsa-geos';
import palette from './palette.js';

//lookup: lookup(indicator, metric, geolevel) // metric is one of ["change","start","end"]

export default function map_module(container){
    //19 heartland states, keys==numeric fips
    var HL = {"1":"Alabama","5":"Arkansas","17":"Illinois","18":"Indiana","19":"Iowa","20":"Kansas","21":"Kentucky","22":"Louisiana","26":"Michigan","27":"Minnesota","28":"Mississippi","29":"Missouri","31":"Nebraska","38":"North Dakota","39":"Ohio","40":"Oklahoma","46":"South Dakota","47":"Tennessee","55":"Wisconsin"};    
    var HLFC = {
                type: "FeatureCollection", 
                features: state_geos.features.filter(function(d){
                    return HL.hasOwnProperty(parseInt(d.properties.geo_id)+"");
                })
            }

    //mobile state        
    var is_mobile = false;

    //selection state
    var scope = {
        height:400,
        indicator:"job",
        metric:"change",
        geolevel:"state",
        geo:"1",
        data:null
    }

    //styles
    var styles = {
        chart_title_margin: "0px"
    }
    
    //outer wrap
    var wrap0 = d3.select(container).classed("fb-center-col",true);

    var main_title = wrap0.append("p").text("Main title").classed("fb-header section-title",true);
    var wrap1 = wrap0.append("div").classed("hl-map-split c-fix",true);

    //bar chart dom
    var wrap_bars0 = wrap1.append("div").append("div").style("border-color",palette.green);
    
    var bars_title = wrap_bars0.append("p").text("Bar chart title").classed("fb-header chart-title", true)
                                .style("margin",styles.chart_title_margin);

    //map draw/redraw fn
    function draw_bars(){

    }

    //map dom
    var wrap_map0 = wrap1.append("div").append("div").style("border-color",palette.green);
    var map_title = wrap_map0.append("p").text("Map title").classed("fb-header chart-title", true).style("margin",styles.chart_title_margin);
    var wrap_map1 = wrap_map0.append("div").style("min-height","300px").style("width","100%");
    var map_svg = wrap_map1.append("svg").attr("width","100%").attr("height","100%");
    
    //map <g>roups
    var g_back = map_svg.append("g");
    var g_states = map_svg.append("g");
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
        var width;
        var aspect = 0.7; //width x aspect = height;
        try{
            var box = wrap_map1.node().getBoundingClientRect();
            width = box.right - box.left;
        }
        catch(e){
            width = 400;
        }

        scope.height = width * aspect;
        wrap_map1.style("height", scope.height+"px");

        proj.fitExtent([[10,10], [width-10, scope.height-10]], HLFC);

        var state_accessor = function(d){return parseInt(d.properties.geo_id)+"";}

        var fill = function(geo_accessor){
            if(arguments.length==0){
                geo_accessor = function(d){return d.fips}
            }
            return function(d){
                var geo_code = geo_accessor(d);
                var v = scope.data.get(geo_code);
                console.log(geo_code);
                return scope.data.color_scale(v);
            }
        }

        //draw map background
        var states_back = draw_states(g_back, [state_geos], {stroke:"#ffffff", "stroke-width":1, fill:"#e8e8e8"});
        
        if(scope.geolevel=="state" || scope.geolevel=="rural"){
            var states = draw_states(g_states, HLFC.features, {stroke:"#666666", fill:fill(state_accessor) });
            
            g_metros.style("visibility","hidden").style("pointer-events","none");
            g_micros.style("visibility","hidden").style("pointer-events","none");
        }
        else if(scope.geolevel=="metro"){
            var metros = draw_points(g_metros, cbsa_geos2.metro, {fill:fill(), r:5});
            var states = draw_states(g_states, HLFC.features, {stroke:"#666666", fill:"#e0e0e0"});
           
            g_metros.style("visibility","visible").style("pointer-events","all");
            g_micros.style("visibility","hidden").style("pointer-events","none");
        }
        else if(scope.geolevel=="micro"){
            var micros = draw_points(g_micros, cbsa_geos2.micro, {fill:fill(), r:5});

            g_micros.style("visibility","visible").style("pointer-events","all");
            g_metros.style("visibility","hidden").style("pointer-events","none");
        }
        else{

        }
        
        //draw metros
        
        
        //draw micros
        

        console.log(scope);


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

    //package all drawing in an update function
    function update(indicator_, metric_, geolevel_, geo_){
        if(indicator_!=null){scope.indicator=indicator_}
        if(metric_!=null){scope.metric=metric_}
        if(geolevel_!=null){scope.geolevel=geolevel_}
        if(geo_!=null){scope.geo=geo_}

        scope.data = lookup(scope.indicator, scope.metric, scope.geolevel);

        var r_scale = d3.scaleQuantize().domain([0,1]).range([3,5,7]); //all cbsas on same scale?

        //define color scale -- should handle nulls


        draw_map();
        draw_bars(); //always draw bars after map
    }

    var resizeTimer;
    window.addEventListener("resize", function(){
        clearTimeout(resizeTimer);

        try{
            var box = wrap1.node().getBoundingClientRect();
            var width = box.right-box.left;
            is_mobile = width < 900;
        }
        catch(e){
            is_mobile = true;
        }

        wrap1.classed("hl-mobile", is_mobile);
        resizeTimer = setTimeout(update, 200);
    })

    setTimeout(update, 10);

    setTimeout(function(){
        scope.indciator = "awg";
        scope.metric = "end";
        scope.geolevel = "metro";
        scope.geo = "10420";   
        update();    
    }, 2500)

    setTimeout(function(){
        scope.indciator = "gdp";
        scope.metric = "change";
        scope.geolevel = "micro";
        scope.geo = "10100";    
        update();   
    }, 5000);
}