import select_menu from '../../../js-modules/select-menu.js';
import palette from './palette.js';
import {HL} from './state-geos.js';
import cbsa_geos from './cbsa-geos.js';
import all_data from './all-data.js';

export default function header(container){
    var wrap = d3.select(container).append("div").classed("fb-center-col",true).style("padding","0px 15px");

    var title = wrap.append("p").classed("fb-header section-title",true).style("display","none");
    var subtitle = wrap.append("p").classed("subtitle",true).style("display","none");

    var dropdown_wrap = wrap.append("div").classed("c-fix", true);

    var select_wrap = {};

    select_wrap.geo = dropdown_wrap.append("div").classed("select-wrap",true).style("display","none");
    select_wrap.geo.append("svg").attr("width","20px").attr("height","20px").style("position","absolute").style("top","45%").style("right","0px")
                .append("path").attr("d", "M0,0 L5,5 L10,0").attr("fill","none").attr("stroke", palette.green).attr("stroke-width","2px");

    select_wrap.indicator = dropdown_wrap.append("div").classed("select-wrap",true).style("display","none");
    select_wrap.indicator.append("svg").attr("width","20px").attr("height","20px").style("position","absolute").style("top","45%").style("right","0px")
                .append("path").attr("d", "M0,0 L5,5 L10,0").attr("fill","none").attr("stroke", palette.green).attr("stroke-width","2px");

    select_wrap.metric = dropdown_wrap.append("div").classed("select-wrap",true).style("display","none");
    select_wrap.metric.append("svg").attr("width","20px").attr("height","20px").style("position","absolute").style("top","45%").style("right","0px")
                .append("path").attr("d", "M0,0 L5,5 L10,0").attr("fill","none").attr("stroke", palette.green).attr("stroke-width","2px");

    select_wrap.geolevel = dropdown_wrap.append("div").classed("select-wrap",true).style("display","none");
    select_wrap.geolevel.append("svg").attr("width","20px").attr("height","20px").style("position","absolute").style("top","45%").style("right","0px")
                            .append("path").attr("d", "M0,0 L5,5 L10,0").attr("fill","none").attr("stroke", palette.green).attr("stroke-width","2px");

    var legend_wrap = dropdown_wrap.append("div").classed("c-fix",true).style("display","none").style("float","right");

    var d_triangle = "M18,4 L23,11.5 L13,11.5 Z";

    var select_swatch = legend_wrap.append("div").classed("legend-swatch",true);
    var select_swatch_svg = select_swatch.append("svg").attr("height","1rem").attr("width","28px").style("display","inline-block")
        select_swatch_svg.append("circle").attr("r", 4).attr("fill", palette.orange).attr("cx","6").attr("cy","50%").attr("fill-opacity","1");
        select_swatch_svg.append("path").attr("d",d_triangle).attr("fill", palette.orange).attr("stroke", palette.orange);
    var select_swatch_geo = select_swatch.append("p").style("display","inline-block").style("line-height","1rem").text("Selected place").style("font-weight","bold");

    var place_swatch = legend_wrap.append("div").classed("legend-swatch",true);
        place_swatch.append("svg").attr("height","1rem").attr("width","1rem").style("display","inline-block")
                    .append("circle").attr("r", 3.5).attr("fill", palette.green).attr("cx","50%").attr("cy","50%").attr("fill-opacity","0.7");
    var place_swatch_geolevel = place_swatch.append("p").style("display","inline-block").style("line-height","1rem").text("States");

    var hl_swatch = legend_wrap.append("div").classed("legend-swatch",true);
    var hl_swatch_svg = hl_swatch.append("svg").attr("height","1rem").attr("width","28px").style("display","inline-block")
        hl_swatch_svg.append("path").attr("d",d_triangle).attr("fill", "none").attr("stroke", palette.green);
    hl_swatch.append("p").style("display","inline-block").style("line-height","1rem").text("Heartland avg.");

    var nhl_swatch = legend_wrap.append("div").classed("legend-swatch",true);
    var nhl_swatch_svg = nhl_swatch.append("svg").attr("height","1rem").attr("width","28px").style("display","inline-block")
        nhl_swatch_svg.append("path").attr("d",d_triangle).attr("fill", "#aaaaaa").attr("stroke", "#aaaaaa");
    nhl_swatch.append("p").style("display","inline-block").style("line-height","1rem").text("Non-Heartland avg.");

    //methods for building menu
    var methods = {};

    methods.title = function(t){
        title.html(t).style("display","block")
    }

    methods.subtitle = function(t){
        subtitle.html(t).style("display","block")
    }

    methods.select_geo = function(callback){
        var groups = {
            metro: [],
            micro: [],
            state: [],
            rural: []
        }

        for(var met in cbsa_geos.metro){
            if(cbsa_geos.metro.hasOwnProperty(met)){
                groups.metro.push({geo:cbsa_geos.metro[met].fips, name:cbsa_geos.metro[met].name, geolevel:"metro"});
            }
        }

        for(var mic in cbsa_geos.micro){
            if(cbsa_geos.micro.hasOwnProperty(mic)){
                groups.micro.push({geo:cbsa_geos.micro[mic].fips, name:cbsa_geos.micro[mic].name, geolevel:"micro"});
            }
        }

        for(var st in HL){
            if(HL.hasOwnProperty(st)){
                groups.state.push({geo:st, name:HL[st], geolevel:"state"});
                groups.rural.push({geo:st, name:HL[st], geolevel:"rural"});
            }
        }

        var select = select_wrap.geo.style("display","block").append("select");

        select.append("option").text("Select an area").attr("disabled","yes").attr("selected","1").attr("hidden","1");

        var optgroups = select.selectAll("optgroup")
                              .data([
                                  {label:"States", options:groups.state},
                                  {label:"Metropolitan areas", options:groups.metro},
                                  {label:"Micropolitan areas", options:groups.micro},
                                  {label:"Rural portion of states", options:groups.rural}
                               ])
                               .enter().append("optgroup")
                               .attr("label", function(d){return d.label});
        
        var options = optgroups.selectAll("option").data(function(d){return d.options}).enter()
                               .append("option")
                               .attr("value", function(d){return d.geolevel + "|" + d.geo})
                               .text(function(d){return d.name});

        legend_wrap.style("display","block");



        var update_legend = function(geolevel, geo){

            var levels = {
                metro: "Metropolitan areas",
                micro: "Micropolitan areas",
                state: "States",
                rural: "Rural portion of states"
            }

            var name = "";
            try{
                if(geolevel=="metro" || geolevel=="micro"){
                    name = cbsa_geos[geolevel][geo].name;
                }
                else{
                    name = HL[geo];
                }
            }
            catch(e){
                name = "";
            }

            place_swatch_geolevel.text(levels[geolevel]);
            select_swatch_geo.text(name);
        }

        select.on("change", function(){
            var v = this.value.split("|");
            
            callback(v[0], v[1]);

            update_legend(v[0], v[1]);
        });

        return update_legend;

    }

    methods.select_metric = function(callback){        
        var select = select_wrap.metric.style("display","block").append("select");

        var options = select.selectAll("option").data(["end","change"]).enter().append("option").attr("value", function(v){return v})
                                .text(function(v){return v=="end" ? "View point in time" : "View change over time"});

        //select.append("option").text("View changes or points in time").attr("disabled","yes").attr("selected","1").attr("hidden","1").lower();

        select.on("change", function(){
            var v = this.value;
            callback(v);
        });
    }

    methods.select_indicator = function(callback){        
        var select = select_wrap.indicator.style("display","block").append("select");

        var groups = {
            end:[],
            change:[]
        }

        var outcome_codes = all_data.map.growth.concat(all_data.map.prosperity,all_data.map.inclusion);
        var driver_codes = all_data.map.trade.concat(all_data.map.human_capital,all_data.map.innovation,all_data.map.infrastructure);

        var indicators = outcome_codes.concat(driver_codes);

        indicators.forEach(function(d){
            groups.end.push({value: d+"|"+"end", label:all_data[d].vars["end"].label});
            if(d != "utt" && d != "bb"){
                groups.change.push({value: d+"|change", label:all_data[d].vars["change"].label});
            }
        });

        var optgroups = select.selectAll("optgroup")
                              .data([
                                  {label:"Point in time", options: groups.end},
                                  {label:"Change over time", options: groups.change}
                               ])
                               .enter().append("optgroup")
                               .attr("label", function(d){return d.label});
        
        var options = optgroups.selectAll("option").data(function(d){return d.options}).enter()
                               .append("option")
                               .attr("value", function(d){return d.value})
                               .text(function(d){return d.label});

        select.on("change", function(){
            var v = this.value.split("|");
            callback(v[0], v[1]);
        });


    }

    methods.select_geolevel = function(callback){        
        var select = select_wrap.geolevel.style("display","block").append("select");

        var options = select.selectAll("option")
                                .data([{id:"state", label:"States"},
                                        {id:"metro", label:"Metropolitan areas"},
                                        {id:"micro", label:"Micropolitan areas"},
                                        {id:"rural", label:"Rural portion of states"}
                                    ])
                                .enter().append("option")
                                .attr("value", function(d){return d.id})
                                .text(function(d){return d.label});

        //select.append("option").text("View data for states, metro/micro areas").attr("disabled","yes").attr("selected","1").attr("hidden","1").lower();

        select.on("change", function(){
            var v = this.value;
            callback(v);
        });
    }

    return methods;
}