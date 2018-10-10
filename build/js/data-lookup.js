import all_data from './all-data.js';
import palette from './palette.js';

//missing data:
//altogether: metric_object will be null -- no data for metric -- for all geolevelss
//no valid data for selected geolevel -- summary will be null, lookup will return null or empty array
//no valid data for a place - get(geo) will return null

//metric is one of ["change","start","end"]
function lookup(indicator, metric, geolevel){
    var metric_object = all_data[indicator].vars[metric];
    var all = [];
    var d = {
        color_scale: function(d){return "#e0e0e0"}
    };
    d.defs = {label:all_data[indicator].label[0], definition:all_data[indicator].definition[0], source:all_data[indicator].source[0]}

    var flip_scale = false;
    if(indicator in {"pov":1, "hp":1, "bb":1}){
        flip_scale = true;
    }

    var report = {errors:[], warnings:[]};

    try{
        if(metric_object == null){throw new Error("No data")}

        d.summary = metric_object.summary[geolevel];
        d.invalid_metric = false;
        d.hl = metric_object.summary.heartland;
        d.nhl = metric_object.summary.non_heartland;
        d.label = metric_object.label != null ? metric_object.label : "";
        d.units = "";
        d.period = metric_object.period;
        d.format = metric_object.format;
        d.formatAxis = metric_object.formatAxis;
        d.get = function(g){
            var r;
            if(arguments.length > 0){
                try{
                    g = g+"";
                    var d = metric_object.lookup[geolevel];
                    r = d[g] == null ? null : d[g];
                }
                catch(e){
                    r = null;
                    report.warnings.push({reason: "Data not available", indicator: indicator, metric: metric, geo:g});
                }
            }
            else{
                r = all.slice(0);
            }
            return r;
        }

        //update label and units
        var ths = d.label.search(/\s*(\(thousands\)|\(\$thousands\))/);
        if(ths > -1){
            d.units = d.label.substring(ths); //.replace(/^\s/, "&nbsp;");
            d.label = d.label.substring(0,ths);
        }

    }
    catch(e){
        d.summary = null;
        d.invalid_metric = true;
        d.get = function(g){
            return arguments.length > 0 ? null : [];
        }
        d.formatAxis = null;
        d.format = null;
    }

    var universe = 0;
    var missings = 0;

    report.indicator = indicator;

    //use summary to populate "all" array and to build color scales
    try{
        if(d.summary != null){
            var data = metric_object.lookup[geolevel];
            for(var g in data){
                if(data.hasOwnProperty(g)){
                    if(data[g] != null){
                        all.push({value:data[g], geo:g});
                    }
                    else{
                        missings++;
                    }
                }
                universe++;
            }

            report.summary = "available";
            report.lookup = data == null ? "NOT available" : "available";
        
            //color scales

            var plus3 = d.summary.mean + 3*d.summary.sd;
            var minus3 = d.summary.mean - 3*d.summary.sd;

            var sliced = all.slice(0).filter(function(d){
                return d.value <= plus3 && d.value >= minus3;
            })

            var min = d3.min(sliced, function(d){return d.value});
            var max = d3.max(sliced, function(d){return d.value});

            //var min = d.summary.min;
            //var max = d.summary.max;

            var blues = geolevel=="state" || geolevel=="rural" ? palette.blues5 : palette.blues5;
            var reds = geolevel=="state" || geolevel=="rural" ? palette.reds5 : palette.reds5;

            //whether diverging must be determined based on actual min/max, not trimmed min/max (see change in poverty at state level)
            if(d.summary.min < 0 && d.summary.max > 0){
                var maxabs = Math.max(Math.abs(min), max);



                var blue_scale = d3.scaleQuantize().domain([0, maxabs]).range(flip_scale ? reds : blues);
                var red_scale = d3.scaleQuantize().domain([0, maxabs]).range(flip_scale ? blues : reds);
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
            else if(d.summary.min >= 0){

                var blue_scale = d3.scaleQuantize().domain([min, max]).range(flip_scale ? reds : blues);
                d.color_scale = function(v){
                    return v==null ? palette.na : blue_scale(v);
                }
            }
            else{

                var red_scale = d3.scaleQuantize().domain([max, min]).range(flip_scale ? blues : reds);
                d.color_scale = function(v){
                    return v==null ? palette.na : red_scale(v);
                }
            }

        }
        else{
            report.summary = "NOT available";
            report.lookup = data == null ? "NOT available" : "available";
        }
    }
    catch(e){
        report.errors.push({reason: e, indicator: indicator, metric: metric, geolevel: geolevel});
        all = [];
        d.color_scale = function(d){return "#e0e0e0"};
    }

    report.universe_size = universe;
    report.missing = missings;
    report.non_missing = all.length;

    //console.log(report);

    return d;
}


export {lookup}