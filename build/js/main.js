import dir from "../../../js-modules/rackspace.js";
import degradation from "../../../js-modules/degradation.js";

import state_tile_map from "./state-tile-map.js";


//main function
function main(){


  //local
  dir.local("./");
  //dir.add("dirAlias", "path/to/dir");
  //dir.add("dirAlias", "path/to/dir");


  //production data
  //dir.add("dirAlias", "rackspace-slug/path/to/dir");
  //dir.add("dirAlias", "rackspace-slug/path/to/dir");
  var compat = degradation(document.getElementById("heartland1"));


  //browser degradation
  if(compat.browser()){
    //run app...
    state_tile_map(d3.select("#heartland1").node());

  }


} //close main()


document.addEventListener("DOMContentLoaded", main);
