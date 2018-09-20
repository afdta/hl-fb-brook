import outcome_data from './outcome-data.js';
import palette from './palette.js';

//metric is one of ["change","start","end"]
function lookup(indicator, metric, geolevel){
    var metric_object = outcome_data[indicator].vars[metric];
    var all = [];

    var d = {
        summary: metric_object.summary[geolevel],
        hl: metric_object.summary.heartland,
        nhl: metric_object.summary.non_heartland,
        label: metric_object.label,
        period: metric_object.period,
        get:function(g){
            g = g+"";
            var r;
            if(arguments.length > 0){
                try{
                    var d = metric_object.lookup[geolevel];
                    r = d[g] == null ? null : d[g];
                }
                catch(e){
                    r = null;
                }
            }
            else{
                r = all;
            }
            return r;
        },
        format: metric_object.format,
        formatAxis: metric_object.formatAxis,
        color_scale: function(d){return "#e0e0e0"}
    };

    try{
        if(d.summary != null){
            var data = metric_object.lookup[geolevel];
            for(var g in data){
                if(data.hasOwnProperty(g)){
                    if(data[g] != null){
                        all.push({value:data[g], geo:g});
                    }
                }
            }
        
            //color scales
            var min = d.summary.min;
            var max = d.summary.max;

            if(min < 0 && max > 0){
                var maxabs = Math.max(Math.abs(min), max);
                var blue_scale = d3.scaleQuantize().domain([0, maxabs]).range(palette.blues);
                var red_scale = d3.scaleQuantize().domain([0, maxabs]).range(palette.reds);
                d.color_scale = function(v){
                    if(v==null){
                        return palette.na;
                    }
                    else if(v < 0){
                        return red_scale(Math.abs(v));
                    }
                    else{
                        return blue_scale(v);
                    }
                }
            }
            else if(min >= 0){
                var blue_scale = d3.scaleQuantize().domain([min, max]).range(palette.blues);
                d.color_scale = function(v){
                    return v==null ? palette.na : blue_scale(v);
                }
            }
            else{
                var red_scale = d3.scaleQuantize().domain([max, min]).range(palette.reds);
                d.color_scale = function(v){
                    return v==null ? palette.na : red_scale(v);
                }
            }

        }
    }
    catch(e){
        //no-op
        all = [];
    }
    return d;
}

function point_lookup(indicator, metric, geolevel, geo){

}

export {lookup, point_lookup}