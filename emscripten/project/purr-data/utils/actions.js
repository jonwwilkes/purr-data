function minit(id, options) {
    var menu_item = document.getElementById(id);
    var key;
    for (key in options) {
        if (options.hasOwnProperty(key)) {
            menu_item[key] = "";
            menu_item[key] = options[key];
        }
    }
}

function load_menu_actions(){
    // File sub-entries
    minit("file-message",{onclick: function(){pdbundle.pdgui.menu_send()}});

    minit("file-open",{onclick: function(){
        // show sidebar
        $("#sidebar").collapse("show");
        $("#sidebar-col-icon").removeClass("rotate");
    }});

    // Edit entries
    minit("edit-copy", {
        onclick: function() {
            window.document.execCommand("copy");
        }
    });

    minit("edit-selectall", {
        onclick: function () {
            var container_id = "p1", range;
            // This should work across browsers
            if (window.document.selection) {
                range = window.document.body.createTextRange();
                range.moveToElementText(window.document.getElementById(container_id));
                range.select();
            } else if (window.getSelection) {
                range = window.document.createRange();
                range.selectNode(window.document.getElementById(container_id));
                // we need to empty the current selection to avoid a strange
                // error when trying to select all right after Pd starts:
                // "The given range and the current selection belong to two
                //  different document fragments."
                // (I guess nw.js somehow starts up with the selection being
                // somewhere outside the window...)
                window.getSelection().empty();
                window.getSelection().addRange(range);
            }
            // show sidebar
            $("#console_bottom").collapse("show");
            $("#open-icon").removeClass("rotate");
        }
    });

    minit("edit-find", {
        onclick: function() {
            var find_bar = window.document.getElementById("console_find"),
            find_bar_text = window.document.getElementById("console_find_text"),
            text_container = window.document.getElementById("console_bottom"),
            state = find_bar.style.getPropertyValue("display");
            if (state === "none") {
                text_container.style.setProperty("bottom", "1.6em");
                find_bar.style.setProperty("display", "block");
                find_bar.style.setProperty("height", "2em");
                // Don't do the following in logical time so that the
                // console_find keypress event won't receive this shortcut key
                window.setTimeout(function() {
                    find_bar_text.focus();
                    find_bar_text.select();
                }, 0);
            } else {
                // Blur focus so that the console_find keypress doesn't
                // receive our shortcut key
                find_bar.blur();
                text_container.style.setProperty("bottom", "0px");
                find_bar.style.setProperty("display", "none");
            }
             // show sidebar
            $("#console_bottom").collapse("show");
            $("#open-icon").removeClass("rotate");
        }
    });

    minit("console_find_text", {
        onkeydown: function(e) {
            console_find_keydown(e);
        },

        onkeypress: function(e) {
            console_find_keypress(e);
        }
    });

    // View entries

    minit("view-fullscreen",{onclick: 
        function(){
            if (!document.fullscreenElement &&
                !document.mozFullScreenElement && 
                !document.webkitFullscreenElement && 
                !document.msFullscreenElement ) {
              if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
              } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
              } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
              } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
              }
            } else {
              if (document.exitFullscreen) {
                document.exitFullscreen();
              } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
              } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
              } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
              }
            }
        }});

    // Media entries
    minit("media-test",{onclick: function(){pdbundle.pdgui.web_pd_doc_open("doc/7.stuff/tools", "testtone.pd")}});
    minit("media-loadmeter",{onclick: function(){pdbundle.pdgui.web_pd_doc_open("doc/7.stuff/tools", "load-meter.pd")}});

    // Help entries
    minit("help-about", {onclick:
        function(){
            pdbundle.pdgui.web_pd_doc_open("doc/about", "about.pd")
        }
    });

    minit("help-manual", {onclick:
        function(){
            pdbundle.pdgui.web_external_doc_open("https://puredata.info/docs/manuals/")
        }
    });

    minit("help-intro", {onclick:
        function(){
            pdbundle.pdgui.web_external_doc_open("http://puredata.info/docs/manuals/pdrefcards/pd-refcard-en.pdf/view")
        }
    });

    minit("help-l2ork-list", {onclick:
        function(){
            pdbundle.pdgui.web_external_doc_open("http://disis.music.vt.edu/listinfo/l2ork-dev")
        }
    });

    minit("help-pd-list", {onclick:
        function(){
            pdbundle.pdgui.web_external_doc_open("http://puredata.info/community/lists")
        }
    });

    minit("help-forums", {onclick: 
        function(){
            pdbundle.pdgui.web_external_doc_open("http://forum.pdpatchrepo.info/")
        } 
    });

    minit("help-irc", {onclick: 
        function(){
            pdbundle.pdgui.web_external_doc_open("http://puredata.info/community/IRC")
        } 
    });
}


function add_shortcuts(cid){
    if (cid === undefined) cid = "";

    document.onkeydown = function (e){
        // Check modifiers
        var shortcut = e.ctrlKey ? "Ctrl+": "";
        shortcut += e.shiftKey ? "Shift+": "";
        shortcut += e.altKey ? "Alt+": "";
        // Add key
        shortcut += e.key.toUpperCase();
        if(window.shortkeys[cid].hasOwnProperty(shortcut)){
            switch(shortcut) {
                case "Ctrl+0":
                case "Ctrl+=":
                case "Ctrl+-":
                case "F11":
                    break;
                default:
                    e.preventDefault()         
                    window.shortkeys[cid][shortcut].click();
            }
        }
    }
}

// Prevent right mouse click
window.oncontextmenu = function (){
    return false;     // cancel default menu
} 


// Dialog common functions
function remove_dialog(name){
    var dialog = document.getElementById("dialog-div");
    dialog.parentNode.removeChild(dialog);
}
