import dir from "../../../js-modules/rackspace.js";
import degradation from "../../../js-modules/degradation.js";

import number_lines from "./number-lines.js";


//main function
function main(){


  //local
  dir.local("./");
  //dir.add("dirAlias", "path/to/dir");
  //dir.add("dirAlias", "path/to/dir");


  //production data
  //dir.add("dirAlias", "rackspace-slug/path/to/dir");
  //dir.add("dirAlias", "rackspace-slug/path/to/dir");
  var compat = degradation(document.getElementById("heartland-fb0"));


  //browser degradation
  if(compat.browser()){
    //run app...

    //number lines
    var wrap_nl = d3.select("#number-lines");
    wrap_nl.selectAll("p.rm").remove();
    
    //args: container, metric [change|start|end], geolevel [state|metro|micro|rural], geocode [fips]
    var update_nl = number_lines(wrap_nl.node(), "change", "micro", "10100");

  }
  else{
    //dislay alerts in other interactive wrappers
    compat.alert(document.getElementById("heartland-fb1"), "browser")
          .alert(document.getElementById("heartland-fb2"), "browser")
          ;
  }


} //close main()


document.addEventListener("DOMContentLoaded", main);
