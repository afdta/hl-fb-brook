import dir from "../../../js-modules/rackspace.js";
import degradation from "../../../js-modules/degradation.js";

import number_lines from "./number-lines.js";
import map_module from "./map-module.js";


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


  //browser degradation
  if(compat.browser()){
    //run app...

    //number lines
    var wrap_nl = d3.select("#number-lines");
    wrap_nl.selectAll("p.rm").remove();
    
    //args: container, metric [change|start|end], geolevel [state|metro|micro|rural], geocode [fips]
    var update_nl = number_lines(wrap_nl.node(), "change", "metro", "10420");


    //map module
    var wrap_mp = d3.select("#map-module");
    wrap_mp.selectAll("p.rm").remove();
    var update_mp = map_module(wrap_mp.node());

  }
  else{
    //dislay alerts in other interactive wrappers
    compat.alert(document.getElementById("heartland-fb-mp"), "browser");
  }


} //close main()


document.addEventListener("DOMContentLoaded", main);
