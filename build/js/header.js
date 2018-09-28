import select_menu from '../../../js-modules/select-menu.js';
import palette from './palette.js';
import {HL} from './state-geos.js';
import cbsa_geos from './cbsa-geos.js';

export default function header(container){
    var wrap = d3.select(container).append("div").classed("fb-center-col",true).style("padding","0px 15px");

    var title = wrap.append("p").classed("fb-header section-title",true).style("display","none");
    var subtitle = wrap.append("p").classed("subtitle",true).style("display","none");

    var dropdown_wrap = wrap.append("div").classed("c-fix", true);

    var legend_wrap = wrap.append("div").classed("c-fix",true);

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

        var select_wrap = dropdown_wrap.append("div").classed("select-wrap",true);
            select_wrap.append("svg").attr("width","20px").attr("height","20px").style("position","absolute").style("top","45%").style("right","0px")
                        .append("path").attr("d", "M0,0 L5,5 L10,0").attr("fill","none").attr("stroke", palette.green).attr("stroke-width","2px")
        
        var select = select_wrap.append("select");

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

        select.on("change", function(){
            var v = this.value.split("|");
            callback(v[0], v[1]);
        });

    }

    methods.select_metric = function(callback){
        var select_wrap = dropdown_wrap.append("div").classed("select-wrap",true);
            select_wrap.append("svg").attr("width","20px").attr("height","20px").style("position","absolute").style("top","45%").style("right","0px")
                        .append("path").attr("d", "M0,0 L5,5 L10,0").attr("fill","none").attr("stroke", palette.green).attr("stroke-width","2px")
        
        var select = select_wrap.append("select");

        var options = select.selectAll("option").data(["end","change"]).enter().append("option").attr("value", function(v){return v})
                                .text(function(v){return v=="end" ? "Point in time" : "Change over time"});

        select.append("option").text("Select change or point in time").attr("disabled","yes").attr("selected","1").attr("hidden","1").lower();

        select.on("change", function(){
            var v = this.value;
            callback(v);
        });
    }

    return methods;
}