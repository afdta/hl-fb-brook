import dir from "../../../js-modules/rackspace.js";
import degradation from "../../../js-modules/degradation.js";

import number_lines from "./number-lines.js";
import map_module from "./map-module.js";
import header from "./header.js";


//main function
function main(){


  //local
  dir.local("./");
  //dir.add("dirAlias", "path/to/dir");
  //dir.add("dirAlias", "path/to/dir");


  //production data
  //dir.add("dirAlias", "rackspace-slug/path/to/dir");
  //dir.add("dirAlias", "rackspace-slug/path/to/dir");
  var compat = degradation(document.getElementById("heartland-fb-nl"));


  //browser check
  if(compat.browser()){

    //number lines +++++++++++++++++++++++++++++++++++++++++
   
    var nl_state = {
      metric:"end",
      geolevel:"state",
      geo:"1"
    }

    var wrap_nl = d3.select("#number-lines");
    wrap_nl.selectAll("p.rm").remove();

    var dash_head = header(wrap_nl.node());
    dash_head.title("Heartland dashboard");
    dash_head.subtitle("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque sollicitudin quam eu efficitur mollis. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec ullamcorper fringilla tortor, id vulputate leo dictum id. Suspendisse nibh tortor, bibendum id justo sed, placerat viverra urna.");

    //args: container, metric [change|start|end], geolevel [state|metro|micro|rural], geocode [fips]
    var update_nl = number_lines(wrap_nl.node(), nl_state.metric, nl_state.geolevel, nl_state.geo);

    dash_head.select_geo(function(geolevel, geo){
      nl_state.geolevel = geolevel;
      nl_state.geo = geo;

      update_nl(nl_state.metric, nl_state.geolevel, nl_state.geo);
    });

    dash_head.select_metric(function(metric){
      nl_state.metric = metric;

      update_nl(nl_state.metric, nl_state.geolevel, nl_state.geo);
    })
    
    //end number lines ++++++++++++++++++++++++++++++++++++++


    //map module
    var wrap_mp = d3.select("#map-module");
    wrap_mp.selectAll("p.rm").remove();

    var map_head = header(wrap_mp.node());
    map_head.title("Map module");
    map_head.subtitle("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque sollicitudin quam eu efficitur mollis. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec ullamcorper fringilla tortor, id vulputate leo dictum id. Suspendisse nibh tortor, bibendum id justo sed, placerat viverra urna.");

    var update_mp = map_module(wrap_mp.node());

  }
  else{
    //dislay alerts in other interactive wrappers
    compat.alert(document.getElementById("heartland-fb-mp"), "browser");
  }


} //close main()


document.addEventListener("DOMContentLoaded", main);
