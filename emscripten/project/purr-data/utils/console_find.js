// Console find helpers
function console_unwrap_tag(console_elem, tag_name) {
    var b = console_elem.getElementsByTagName(tag_name),
        parent_elem;
    while (b.length) {
        parent_elem = b[0].parentNode;
        while(b[0].firstChild) {
            parent_elem.insertBefore(b[0].firstChild, b[0]);
        }
        parent_elem.removeChild(b[0]);
        parent_elem.normalize();
    }
}


// We need to use a regular expression to search without regard to case
function escapeRegExp(string){
    // $& means the whole matched string
    return string.replace(/[.*+?^${}()|\[\]\\]/g, "\\$&");
}

// Console find
function console_find_text(evt, callback) {
    var console_text = document.getElementById("p1"),
        wrap_tag = "mark",
        wrapper_count,
        elem = evt.target;
    window.setTimeout(function () {
        var find_text = new RegExp(escapeRegExp(elem.value), "gi");
        console_unwrap_tag(console_text, wrap_tag);
        // Check after the event if the value is empty
        if (elem.value === undefined || elem.value === "") {
            // Todo: use class instead of style here
            elem.style.setProperty("background", "white");
        } else {
            window.findAndReplaceDOMText(console_text, {
                //preset: "prose",
                find: find_text,
                wrap: wrap_tag
            });
            // The searchAndReplace API is so bad you can't even know how
            // many matches there were without traversing the DOM and
            // counting the wrappers!
            wrapper_count = console_text.getElementsByTagName(wrap_tag).length;
            // Todo: use class instead of style here...
            if (wrapper_count < 1) {
                elem.style.setProperty("background", "red");
            } else {
                elem.style.setProperty("background", "white");
            }
        }
        if (callback) {
            callback();
        }
    }, 0);
}

// start at top and highlight the first result after a search
function console_find_callback() {
    var highlight_checkbox = document.getElementById("console_find_highlight");
    console_find_highlight_all(highlight_checkbox);
    console_find_traverse.set_index(0);
    console_find_traverse.next();
}

function console_find_keypress(e) {
    console_find_text(e, console_find_callback);
}

function console_find_highlight_all(elem) {
    var matches,
        highlight_tag = "console_find_highlighted",
        state = elem.checked,
        i;
    matches = document.getElementById("p1")
        .getElementsByClassName(highlight_tag);
    // remember-- matches is a _live_ collection, not an array.
    // If you remove the highlight_tag from an element, it is
    // automatically removed from the collection. I cannot yet
    // see a single benefit to this behavior-- here, it means
    // we must decrement i to keep from skipping over every
    // other element... :(
    for (i = matches.length - 1; i >= 0; i--) {
        matches[i].classList.remove(highlight_tag);
    }
    if (state) {
        matches = document.getElementById("p1").getElementsByTagName("mark");
        for (i = 0; i < matches.length; i++) {
            matches[i].classList.add(highlight_tag);
        }
    }
}

var console_find_traverse = (function () {
    var count = 0,
        console_text = document.getElementById("p1"),
        wrap_tag = "mark";
    return {
        next: function () {
            var i, last, next,
                elements = console_text.getElementsByTagName(wrap_tag);
            if (elements.length > 0) {
                i = count % elements.length;
                elements[i].classList.add("console_find_current");
                if (elements.length > 1) {
                    last = i === 0 ? elements.length - 1 : i - 1;
                    next = (i + 1) % elements.length;
                    elements[last].classList.remove("console_find_current");
                    elements[next].classList.remove("console_find_current");
                }
                // adjust the scrollbar to make sure the element is visible,
                // but only if necessary.
                // I don't think this is available on all browsers...
                var isFirefox = typeof InstallTrigger !== 'undefined'; // checks if browser is Firefox or not
                if (isFirefox) {
                    elements[i].scrollIntoView();
                } else {
                    elements[i].scrollIntoViewIfNeeded();
                }
                count++;
            }
        },
        set_index: function(c) {
            count = c;
        }
    };
}());

function console_find_keydown(evt) {    
    if (evt.keyCode === 13) {
        console_find_traverse.next();
        evt.stopPropagation();
        evt.preventDefault();
        return false;
    } else if (evt.keyCode === 27) { // escape

    } else if (evt.keyCode === 8 || // backspace or delete
               evt.keyCode === 46) {
        console_find_text(evt, console_find_callback);
    }
}

