"use strict";

window.register_canvas = function(cid){
    // Update patch id
    var patch = document.getElementById("patch")
    patch.id = patch.id + cid;
    
    // Remain elements
    var elems = document.getElementById("patch"+cid).getElementsByTagName("*");
    for (const elem of elems) {
        elem.id = elem.id + cid
    }
}