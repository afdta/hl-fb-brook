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
    var wrap0 = d3.select(container).classed("number-line-plot level0", true);

    var tbox = wrap0.append("div").classed("c-fix",true).style("padding","0px 1%").style("position","relative");
    var indicator_title0 = tbox.append("p")
                              .style("margin","3px 0px 1px 0px")
                              .classed("fb-header", true)
                              .style("vertical-align","top")
                              ;

    var indicator_title = indicator_title0.append("span");

    var indicator_period = indicator_title0.append("span").classed("fb-light-header",true).style("white-space", "nowrap").style("font-size","1em");

    var indicator_na = indicator_title0.append("span").classed("fb-light-header subtitle",true);

    var more_info = indicator_title0.append("span").classed("more-info",true).html("&nbsp;");

    var def_box = tbox.append("div").style("position","absolute").style("top","100%").style("left","0%").style("width","100%").style("padding","10px 1% 0px 10px")
        .style("background-color","#e0e0e0").style("display","none").style("border-radius","5px");

    more_info.on("mouseenter", function(){
        wrap0.classed("level1",true);
        def_box.style("display","block").style("opacity","0")
            .transition().duration(400).style("opacity","1");
    }).on("mouseleave", function(){
        def_box.style("display","none").interrupt().transition(0).style("opacity","0");
        wrap0.classed("level1",false);
    })

    var svg_wrap = wrap0.append("div").style("height",height+"px").style("width","100%");
    var svg = svg_wrap.append("svg").attr("width","100%").attr("height","100%");
    
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
                            .attr("y1",0+0.5*height).attr("y2",12+(0.5*height))
                            .attr("x1",function(d){return d+"%"})
                            .attr("x2",function(d){return d+"%"})
                            ;

    //end one time
    
    var minanno = g_axis.append("text").attr("x", range[0]+"%").attr("text-anchor","start")
                        .attr("dx","-3px").attr("y","50%").attr("dy","24").style("font-size","13px").attr("fill","#666666");
    var maxanno = g_axis.append("text").attr("x", range[1]+"%").attr("text-anchor","end")
                        .attr("dx","3px").attr("y","50%").attr("dy","24").style("font-size","13px").attr("fill","#666666");
 
    //update
    var update = function(metric, geolevel, geo){
        var data = lookup(indicator, metric, geolevel);
        var annotations = [];
        console.log(data.defs);

        def_box.html('<p style="line-height:1.3em">' + data.defs.definition + '</p><p class="subtitle" style="line-height:1.3em">Source: ' + data.defs.source + '</p>' );

        var format_ = function(v){return v};
        var formatAxis_ = function(v){return v};



        indicator_title.html(data.label != null ? data.label + "&nbsp;" : "");
        indicator_period.html(data.period != null ? data.period : "");

        wrap0.style("display", data.invalid_metric ? "none" : "block");

        if(data.summary==null){
            var dot_data = [];
            indicator_na.html(" (Not&nbsp;available)");

            minanno.text("");
            maxanno.text("");

            wrap0.style("opacity","0.25");
        }
        else{
            if(data.nhl != null){
                annotations.push({id:"nhl", value: data.nhl});
            }

            if(data.hl != null){
                annotations.push({id:"hl", value: data.hl});
            }

            if(data.get(geo) != null){
                annotations.push({id:"selected", value: data.get(geo)});
                indicator_na.html("");
                wrap0.style("opacity","1");
            }
            else{
                indicator_na.html(" (Not&nbsp;available)");
                wrap0.style("opacity","0.25");
            }

            

            var dot_data = data.get();
            var domain = [data.summary.min, data.summary.max];

            scale.domain(domain).nice();

            format_ = format.fn0(data.format);
            formatAxis_ = format.fn0(data.formatAxis);
        
            minanno.text( formatAxis_(scale.domain()[0]) );
            maxanno.text( formatAxis_(scale.domain()[1]) );

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

        //console.log(indicator + " null: " + scale(null));

        var triangle_top = (height/2) - 8.5;
        var triangle_point = (height/2) - 1;

        var annos_up = g_anno.selectAll("svg.anno-symbols").data(annotations, function(d){return d.id});
        annos_up.exit().remove();
        var annos_enter = annos_up.enter().append("svg").classed("anno-symbols",true).attr("width","10px").attr("height","20px").style("overflow","visible");
        //annos_enter.append("path").attr("d", "M5,"+ triangle_point + " L10," + triangle_top + " L0," + triangle_top + " Z").attr("stroke-width","1px"); //triangle point is at 5px to compensate for 5px shift of g_anno
        annos_enter.append("path").attr("d", "M5,2 L9,12.5 L1,12.5 Z").attr("stroke-width","1px"); 
        var annos = annos_enter.merge(annos_up);

        annos.select("path").attr("fill", function(d){return d.id=="selected" ? palette.orange : (d.id=="hl" ? "none" : palette.mediumgray)})
                            .attr("stroke", function(d){return d.id=="selected" ? palette.orange : (d.id=="hl" ? palette.green : palette.mediumgray)})


        annos.transition().duration(700)
            .attr("x", function(d){return scale(d.value)+"%"})
            .on("end", function(){
                dots.filter(function(d){
                    return d.geo === geo;
                })
                .attr("fill", palette.orange)
                .attr("fill-opacity","1")
                .attr("r","5")
                .attr("stroke","#ffffff")
                .attr("stroke-width","1")
                .raise();
            });

        var anno_text_up = g_labels.selectAll("text").data(annotations);
        anno_text_up.exit().remove();
        var anno_text_enter = anno_text_up.enter().append("text");
        anno_text_enter.merge(anno_text_up)
                       .attr("y","40%").attr("dy","-7").style("font-size","13px")
                       .attr("fill", palette.orange)
                       //.attr("dy","-11px")
                       .style("font-size","13px")
                       .style("font-weight","bold")
                       .attr("text-anchor",function(d){return scale(d.value) > 50 ? "end" : "start"})
                       .text(function(d){
                           return format_(d.value);
                       })
                       .style("visibility", function(d){return d.id=="selected" ? "visible" : "hidden"})
                       .transition().duration(700)
                       .attr("x", function(d){
                            return scale(d.value)+"%";
                        })
                       .attr("dx",function(d){return scale(d.value) > 50 ? "4" : "-4"});

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