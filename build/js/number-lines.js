import palette from './palette.js';
import all_data from './all-data.js';
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

    var tbox = wrap0.append("div").classed("c-fix",true).style("padding","0px 1%");
    var indicator_title = tbox.append("p")
                              .style("margin","3px 0px 1px 0px")
                              .classed("fb-header", true)
                              .style("float","left")
                              ;

    var indicator_period = tbox.append("p")
                               .style("margin","3px 0px 1px 0px")
                               .classed("fb-light-header subtitle",true)
                               .style("float","left")
                               .style("white-space", "nowrap")
                               ;

    var svg_wrap = wrap0.append("div").style("height",height+"px").style("width","100%");
    var svg = svg_wrap.append("svg").attr("width","100%").attr("height","100%").style("overflow","visible");
    
    var g_axis = svg.append("g");
    var g_dots = svg.append("g");

    //anno symbols are shiftd left by 5px
    var g_anno = svg.append("svg").attr("width","100%").attr("height","50%").attr("x","-5px").attr("y","50%").style("overflow","visible");

    var g_labels = svg.append("g");

    //g_anno.append("rect").attr("width","100%").attr("height","100%").attr("fill","rgba(255,0,0,0.25)");

    var range = [1,99];
    var scale = d3.scaleLinear().range(range);

    var line = g_axis.append("line").attr("x1","1%").attr("x2","99%")
                                    .attr("y1","50%").attr("y2","50%")
                                    .style("shape-rendering","crispEdges")
                                    .attr("stroke",palette.green)
                                    .attr("stroke-width","1px");

    var line_ticks = g_axis.selectAll("line.tick").data(range).enter().append("line")
                            .classed("tick",true).attr("stroke",palette.green)
                            .style("shape-rendering","crispEdges")
                            .attr("y1",0.5*height).attr("y2",10+(0.5*height))
                            .attr("x1",function(d){return d+"%"})
                            .attr("x2",function(d){return d+"%"})
                            ;

    //end one time
    
    var minanno = g_axis.append("text").attr("x", range[0]+"%").attr("text-anchor","start")
                        .attr("dx","-3px").attr("y","50%").attr("dy","22").style("font-size","13px").attr("fill","#666666");
    var maxanno = g_axis.append("text").attr("x", range[1]+"%").attr("text-anchor","end")
                        .attr("dx","3px").attr("y","50%").attr("dy","22").style("font-size","13px").attr("fill","#666666");
 
    //update
    var update = function(metric, geolevel, geo){
        var data = lookup(indicator, metric, geolevel);
        var annotations = [];

        var format_ = function(v){return v};
        var formatAxis_ = function(v){return v};

        if(data.summary==null){
            var dot_data = [];
            indicator_title.html("");
            indicator_period.html("");
            wrap0.style("display","none");
        }
        else{
            wrap0.style("display","block");
            indicator_title.html(data.label + ",&nbsp;");
            indicator_period.html(data.period);

            var dot_data = data.get();
            var domain = [data.summary.min, data.summary.max];

            format_ = format.fn0(data.format);
            formatAxis_ = format.fn0(data.formatAxis);
        
            minanno.text( formatAxis_(domain[0]) );
            maxanno.text( formatAxis_(domain[1]) );

            annotations = [
                {id:"nhl", value: data.nhl==null ? null : data.nhl},
                {id:"selected", value: data.get(geo)},
                {id:"hl", value: data.hl==null ? null : data.hl}
            ];
    
            scale.domain(domain);
        }

        var dots_u = g_dots.selectAll("circle").data(dot_data);
        dots_u.exit().remove();
        var dots = dots_u.enter().append("circle").merge(dots_u);
        dots.attr("cx", function(d){return scale(d.value)+"%"})
            .attr("cy", "39%")
            .attr("r","3")
            .attr("fill",palette.green)
            .attr("fill-opacity","0.5")
            .attr("stroke","#ffffff")
            .attr("stroke-width","0")
            ; 

        dots.filter(function(d){
            return d.geo === geo;
        })
        .attr("fill", palette.orange)
        .attr("fill-opacity","1")
        .attr("r","5")
        .attr("stroke","#ffffff")
        .attr("stroke-width","1")
        .raise();

        var triangle_top = (height/2) - 8.5;
        var triangle_point = (height/2) - 1;

        var annos_up = g_anno.selectAll("svg.anno-symbols").data(annotations);
        annos_up.exit().remove();
        var annos_enter = annos_up.enter().append("svg").classed("anno-symbols",true).attr("width","10px").attr("height","20px").style("overflow","visible");
        //annos_enter.append("path").attr("d", "M5,"+ triangle_point + " L10," + triangle_top + " L0," + triangle_top + " Z").attr("stroke-width","1px"); //triangle point is at 5px to compensate for 5px shift of g_anno
        annos_enter.append("path").attr("d", "M5,2 L10,9.5 L0,9.5 Z").attr("stroke-width","1px"); 
        var annos = annos_enter.merge(annos_up).attr("x", function(d){return scale(d.value)+"%"});

        annos.select("path").attr("fill", function(d){return d.id=="selected" ? palette.orange : (d.id=="hl" ? "none" : "#aaaaaa")})
                            .attr("stroke", function(d){return d.id=="selected" ? palette.orange : (d.id=="hl" ? palette.green : "#aaaaaa")})


        var anno_text_up = g_labels.selectAll("text").data(annotations);
        anno_text_up.exit().remove();
        var anno_text_enter = anno_text_up.enter().append("text");
        anno_text_enter.merge(anno_text_up)
                       .attr("x", function(d){
                           return scale(d.value)+"%";
                       })
                       .attr("dx",function(d){return scale(d.value) > 50 ? "4" : "-4"})
                       .attr("y","40%").attr("dy","-7").style("font-size","13px")
                       .attr("fill", palette.orange)
                       //.attr("dy","-11px")
                       .style("font-size","13px")
                       .style("font-weight","bold")
                       .attr("text-anchor",function(d){return scale(d.value) > 50 ? "end" : "start"})
                       .text(function(d){
                           return format_(d.value);
                       })
                       .style("visibility", function(d){return d.id=="selected" ? "visible" : "hidden"});

    }

    //draw
    update(metric_, geolevel_, geo_);

    //and return update function for individual plot
    return update;
}

export default function number_lines(container, metric_, geolevel_, geo_){
    //one-time setup
    var wrap0 = d3.select(container).append("div").classed("c-fix two-columns fb-center-col",true);

    var wrap_outcomes = wrap0.append("div").classed("green-square-wrap",true).append("div");

    var wrap_drivers = wrap0.append("div").classed("green-square-wrap",true).append("div");

    wrap_outcomes.append("p").text("Outcomes").classed("fb-header group-title",true);
    wrap_drivers.append("p").text("Drivers").classed("fb-header group-title",true);

    
    var outcome_codes = all_data.map.growth.concat(all_data.map.prosperity,
                                                    all_data.map.inclusion);
    var driver_codes = all_data.map.trade.concat(all_data.map.human_capital,
                                                    all_data.map.innovation,
                                                    all_data.map.infrastructure);

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

    //draw all
    update(metric_, geolevel_, geo_);

    //and return update function
    return update;
}