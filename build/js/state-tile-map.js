import map from "../../../js-modules/map.js";

export default function state_tile_map(container){
    var wrap = d3.select(container).style("width","700px").style("position","relative").style("padding","5%").style("height","5000px");
    
    var state_map = map(wrap.node());
    var states = state_map.layer().features(state_map.geos("states"));

    var max_pan = 10;
    var n_pan = 0;
    function pan(){
        state_map.translate(15,10);
        if(++n_pan <= max_pan){
            console.log(n_pan);
            setTimeout(pan, 10);
        }
        else{
            setTimeout(function(){
                state_map.zoom(2);
            },6000);
        }
    }
//setTimeout(pan, 100);

/*setTimeout(function(){
    state_map.zoom(1, [100,100]);
},3000)

setTimeout(function(){
    state_map.zoom(2, [100,100]);
},5000)*/

//    setTimeout(function(){
//        state_map.zoom(1);
//    },2000);
//    setTimeout(function(){
//        state_map.zoom(2);
//    },3000);
}