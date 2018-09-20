import palette from './palette.js';
import outcome_data from './outcome-data.js';
import {lookup} from './data-lookup.js';
import format from '../../../js-modules/formats.js';

//TODO - all data should go in one import. also eases import. need to provide a mapping from
//indicator to group/category

//lookup: lookup(indicator, metric, geolevel, geo) // metric is one of ["change","start","end"]

//individual number line plot
function number_line(container, indicator, metric_, geolevel_, geo_){
    var height = 50;
    //one-time setup
    var wrap0 = d3.select(container).classed("number-line-plot", true);

    var tbox = wrap0.append("div").classed("c-fix",true);
    var indicator_title = tbox.append("p")
                              .style("margin","3px 0px")
                              .classed("fb-header", true)
                              .style("float","left")
                              ;

    var indicator_period = tbox.append("p")
                               .style("margin","3px 0em")
                               .classed("fb-light-header subtitle",true)
                               .style("float","left")
                               .style("white-space", "nowrap")
                               ;

    var svg_wrap = wrap0.append("div").style("height",height+"px").style("width","100%");
    var svg = svg_wrap.append("svg").attr("width","100%").attr("height","100%");
    var g_axis = svg.append("g");
    var g_dots = svg.append("g");
    var g_anno = svg.append("g");

    var range = [2,98];
    var scale = d3.scaleLinear().range(range);

    var line = g_axis.append("line").attr("x1","0%").attr("x2","100%")
                                    .attr("y1","50%").attr("y2","50%")
                                    .style("shape-rendering","crispEdges")
                                    .attr("stroke",palette.green);

    var line_ticks = g_axis.selectAll("line.tick").data(range).enter().append("line")
                            .classed("tick",true).attr("stroke",palette.green)
                            .style("shape-rendering","crispEdges")
                            .attr("y1",0.5*height).attr("y2",8+(0.5*height))
                            .attr("x1",function(d){return d+"%"})
                            .attr("x2",function(d){return d+"%"})
                            ;

    //end one time
    
    var minanno = g_axis.append("text").attr("x", range[0]+"%").attr("text-anchor","start")
                        .attr("dx","-3px").attr("y","50%").attr("dy","22").style("font-size","13px");
    var maxanno = g_axis.append("text").attr("x", range[1]+"%").attr("text-anchor","end")
                        .attr("dx","3px").attr("y","50%").attr("dy","22").style("font-size","13px");
 
    //update
    var update = function(metric, geolevel, geo){
        var data = lookup(indicator, metric, geolevel);
        
        var value = data.value;
        indicator_title.html(data.label + ",&nbsp;");
        indicator_period.html(data.period);

        if(data.summary==null){
            var dot_data = [];
        }
        else{
            var dot_data = data.get();
            var domain = [data.summary.min, data.summary.max];
        
            minanno.text(format[data.formatAxis](domain[0]));
            maxanno.text(format[data.formatAxis](domain[1]));
    
            scale.domain(domain);
        }

        var dots_u = g_dots.selectAll("circle").data(dot_data);
        dots_u.exit().remove();
        var dots = dots_u.enter().append("circle").merge(dots_u);
        dots.attr("cx", function(d){return scale(d.value)+"%"})
            .attr("cy", "40%")
            .attr("r","2")
            .attr("fill",palette.green)
            .attr("fill-opacity","0.5")
            ; 

        dots.filter(function(d){
            return d.geo === geo;
        })
        .attr("fill", palette.orange)
        .attr("fill-opacity","1")
        .attr("r","3")
        .raise();

        /*
        var anno_dot = g_anno.selectAll("circle").data(value===null ? [] : [value]);
        anno_dot.exit().remove();
        anno_dot.enter().append("circle").merge(anno_dot).attr("fill",palette.orange).attr("r","3")
                .attr("cx", function(d){return scale(d)+"%"})
                .attr("cy", "45%")
                .attr("stroke-width","3px")
                ;
        */
    }

    update(metric_, geolevel_, geo_);

    return update;
}

export default function number_lines(container, metric_, geolevel_, geo_){
    //one-time setup
    var wrap0 = d3.select(container).append("div").classed("c-fix two-columns fb-center-col",true);

    var wrap_outcomes = wrap0.append("div").append("div")
                            .style("margin","15px 15px 30px 15px")
                            .style("padding","25px")
                            .style("border","5px solid "+palette.green);

    var wrap_drivers = wrap0.append("div").append("div")
                            .style("margin","15px 15px 30px 15px")
                            .style("padding","25px")
                            .style("border","5px solid "+palette.green);

    wrap_outcomes.append("p").text("Outcomes").classed("fb-header group-title",true);
    wrap_drivers.append("p").text("Drivers").classed("fb-header group-title",true);

    
    var outcome_codes = outcome_data.map.growth.concat(outcome_data.map.prosperity,
                                                       outcome_data.map.inclusion);
    var driver_codes = outcome_codes;

    var number_line_updaters = [];
    var outcomes = wrap_outcomes.selectAll("div").data(outcome_codes).enter().append("div")
                                .each(function(d){
                                    number_line_updaters.push(number_line(this, d, metric_, geolevel_, geo_));
                                });

    var drivers = wrap_drivers.selectAll("div").data(driver_codes).enter().append("div")
                                .each(function(d){
                                    number_line_updaters.push(number_line(this, d, metric_, geolevel_, geo_));
                                });

    var update = function(metric, geolevel, geo){
        number_line_updaters.forEach(function(fn){
            fn(metric, geolevel, geo);
        });
    }

    update(metric_, geolevel_, geo_);

    return update;
}