/**
 * Created by art on 2014-09-20.
 */

// TODO: detect which base mouse is over
// TODO: draw highlight box around base - in render.js

var over_row = -1, // base coordinates of mouse-over
    over_col = -1,
    click_row = -1, // base coordinates of mouse-down event
    click_col = -1,
    selected_row_0 = -1,
    selected_col_0 = -1,
    selected_row_1 = -1,
    selected_col_1 = -1;

var selection_mode = null;
var drag_selection;

function getPos(e, canvas) {
    /** Bind this event handler to mouse-over trigger to calculate
     * the mouse coordinates relative to the Canvas.
     * @param  e {event}
     * @return  Coordinates of base under the mouse pointer, with respect to the sequence
     *  index in the alignment (row) and position in the sequence (column)
     */
    var element = canvas,
        offset_x = 0,
        offset_y = 0,
        mx, my;

    // go up hierarchy to compute total offsets
    if (typeof element.offsetParent !== 'undefined') {
        do {
            offset_x += element.offsetLeft;
            offset_y += element.offsetTop;
        } while (element = element.offsetParent);
    }

    offset_x += stylePaddingLeft + styleBorderLeft + htmlLeft;
    offset_y += stylePaddingTop + styleBorderTop + htmlTop;

    mx = e.pageX - offset_x;
    my = e.pageY - offset_y;

    return { x: mx, y: my };
}

function inSelection(r, c) {
    /**
     * Is the given row and column within the currently selected
     * range of alignment rows and columns?
     */
    if (selected_row_0 == selected_row_1 && selected_col_0 == selected_col_1) {
        // single base selection, probably a mouse-down
        return false;
    }
    if ((r >= selected_row_0 && r <= selected_row_1) || (r >= selected_row_1 && r <= selected_row_0)) {
        if ((c >= selected_col_0 && c <= selected_col_1) || (c >= selected_col_1 && c <= selected_col_0)) {
            return true;
        }
    }
    return false;
}

function doMove(e) {
    /**
     * Determine which base or amino acid is under the mouse pointer.
     * Update global variables storing row and column in alignment.
     * If there is no alignment, do nothing.
     */
    if (alignment.length == 0) {
        return;
    }

    var pos = getPos(e, aln_canvas);
    if (dragging) {
        if (drag_selection) {
            // dragging a selection - alignment operation!
        } else {
            if (selection_mode == 0) {
                // TODO: we can't reset click_row for this - add drag start variable?
                // select entire column
                selected_row_0 = 0;
                selected_row_1 = alignment.length;
            } else {
                // this sequence only
                selected_row_0 = click_row;  // remember where we clicked
                selected_row_1 = Math.floor(pos.y / base_h);
            }
            selected_col_1 = Math.floor(pos.x / base_w);
        }
    }
    over_row = Math.floor(pos.y / base_h);
    over_col = Math.floor(pos.x / base_w);

    redraw_alignment($('#alignment_slider').slider('value'), $('#vertical_slider').slider('value'));
}

function doDown(e) {
    /**
     * Event handler for mouse click
     * Is there a selection active?
     * Yes - Is the click on the selection?
     *      Yes - Activate selection for drag
     *      No - Unselect range
     * No - Create new selection
     */
    var pos = getPos(e, aln_canvas);
    dragging = true;
    click_row = Math.floor(pos.y / base_h);
    click_col = Math.floor(pos.x / base_w);
    if (inSelection(click_row, click_col)) {
        drag_selection = true;
    } else {
        // new selection
        drag_selection = false;
        selected_row_0 = click_row;
        selected_col_0 = click_col;
        selected_row_1 = click_row;
        selected_col_1 = click_col;
    }
    redraw_alignment($('#alignment_slider').slider('value'), $('#vertical_slider').slider('value'));
}


function doUp(e) {
    dragging = false;
}

function switchSelectionMode(e) {
    /*
    Capture modifier key press to change behaviour of selection.
     */
    if (e.which == 16) {
        selection_mode = 0;  // shift
    } else if (e.which == 17) {
        selection_mode = 0;  // ctrl
    } else if (e.which == 18) {
        selection_mode = 0;  // option/alt
    }
}

function releaseSelectionMode() {
    console.log('up');
    selection_mode = -1;
}
