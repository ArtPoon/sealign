/**
 * Created by art on 2014-09-20.
 */

// TODO: detect which base mouse is over
// TODO: draw highlight box around base - in render.js

var over_row = -1,
    over_col = -1,
    click_row = -1, // base coordinates of mouse-down event
    click_col = -1;

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

function updateResidue(e) {
    /**
     * Determine which base or amino acid is under the mouse pointer.
     * Update global variables storing row and column in alignment.
     * If there is no alignment, do nothing.
     */
    if (alignment.length == 0) {
        return;
    }

    var pos = getPos(e, aln_canvas);
    over_row = Math.floor(pos.y / base_h);
    over_col = Math.floor(pos.x / base_w);

    redraw_alignment($('#alignment_slider').slider('value'), $('#vertical_slider').slider('value'));
}

function doClick(e) {
    /**
     * The current base is being selected.
     */
    var pos = getPos(e, aln_canvas);

    click_row = Math.floor(pos.y / base_h);
    click_col = Math.floor(pos.x / base_w);
    redraw_alignment($('#alignment_slider').slider('value'), $('#vertical_slider').slider('value'));
}

function doDown(e) {

}
