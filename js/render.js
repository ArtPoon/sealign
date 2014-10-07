/**
 * sealign.js
 * Combine redraw operations and raw data to render view of alignment,
 * using SVG.
 */



var palette = {
    'A': 'rgb(200,0,0)',
    'C': 'rgb(0,150,0)',
    'G': 'rgb(90,90,90)',
    'T': 'rgb(0,0,200)'
};

var invert_palette = {
    'A': 'rgb(55,255,255)',
    'C': 'rgb(255,105,255)',
    'G': 'rgb(165,165,165)',
    'T': 'rgb(255,255,55)'
};

var base_w = 16,  // width of a residue (nucleotide/amino acid)
    base_h = 20;  // height of  "  "

function resizeCanvas() {
    /**
     * Whenever window is resized, reset canvas dimensions
     * accordingly, and redraw contents.
     */

    aln_canvas.style.width = "100%";
    aln_canvas.style.height = "100%";
    aln_canvas.width = aln_canvas.offsetWidth;
    aln_canvas.height = aln_canvas.offsetHeight;

    lab_canvas.style.width = "100%";
    lab_canvas.style.height = "100%";
    lab_canvas.width = lab_canvas.offsetWidth;
    lab_canvas.height = lab_canvas.offsetHeight;

    lab_context.font = '12px Courier New, Courier, serif';
    lab_context.textBaseline = 'middle';
    lab_context.strokeStyle = 'black';

    aln_context.textAlign = 'center';
    aln_context.font = '12px Courier New, Courier, serif';
    aln_context.textBaseline = 'middle';
    aln_context.strokeStyle = 'white';
    aln_context.lineWidth = 1;

    // update slider min value
    var v_slider = $('#vertical_slider');
    v_slider.slider('option', 'min', Math.floor(aln_canvas.height / base_h));

    redraw_alignment($('#alignment_slider').slider('value'), v_slider.slider('value'));
}

function redraw_alignment (x, y) {
    /**
     * Display the alignment within the x, y boundaries of the canvas.
     * @param {number} x  An integer ranging from 1 to the maximum
     *  sequence length.
     * @param {number} y  An integer ranging from 1 to the number of
     *  sequences in the alignment.
     */
    // TODO: apply alignment operations
    if (alignment.length == 0) {
        return;
    }

    var nuc, header, seq;

    var window_width = Math.floor(aln_canvas.width / base_w),
        maxlen = $('#alignment_slider').slider('option', 'max'),
        left_bound = Math.min(x, maxlen-window_width);

    var window_height = Math.floor(aln_canvas.height / base_h),
        upper_bound = alignment.length - Math.max(y, window_height);

    // clear the canvases
    aln_context.clearRect(0, 0, aln_canvas.width, aln_canvas.height);
    lab_context.clearRect(0, 0, lab_canvas.width, lab_canvas.height);

    // redraw only bases in canvas range
    for (var r = 0; r < window_height; r++) {
        if ((upper_bound + r) >= alignment.length) {
            break;
        }
        header = alignment[upper_bound + r]['header'];
        lab_context.strokeText(header, 1, (0.5+r)*base_h);

        seq = alignment[upper_bound + r]['rawseq'];
        for (var c = 0; c < window_width; c++) {
            nuc = seq[left_bound+c];

            if (selected_col_1 >= 0) {
                if ((r >= selected_row_0 && r <= selected_row_1) || (r >= selected_row_1 && r <= selected_row_0)) {
                    if ((c >= selected_col_0 && c <= selected_col_1) || (c >= selected_col_1 && c <= selected_col_0)) {
                        aln_context.fillStyle = invert_palette[nuc];
                        aln_context.fillRect(c*base_w, r*base_h, base_w-1, base_h-1);
                        aln_context.strokeStyle = 'black';
                        aln_context.strokeText(nuc, (c+0.5)*base_w, (r+0.5)*base_h);
                        aln_context.strokeStyle = 'white';
                        continue;
                    }
                }
            }
            aln_context.fillStyle = palette[nuc];
            aln_context.fillRect(c*base_w, r*base_h, base_w-1, base_h-1);
            aln_context.strokeText(nuc, c*base_w + base_w/2, (0.5+r)*base_h);
        }
    }

    // highlight base under mouse pointer
    if (over_col >= 0) {
        aln_context.lineWidth = 3;
        aln_context.strokeRect(over_col*base_w+0.5, over_row*base_h+0.5, base_w-1, base_h-1);
        aln_context.lineWidth = 1;
    }

    // highlight base that was clicked on
    /*
    if (dragging) {
        seq = alignment[upper_bound+click_row]['rawseq'];
        nuc = seq[left_bound+click_col];

        aln_context.fillStyle = invert_palette[nuc];
        aln_context.fillRect(click_col*base_w, click_row*base_h, base_w-1, base_h-1);
        aln_context.strokeStyle = 'black';
        aln_context.strokeText(nuc, (click_col+0.5)*base_w, (click_row+0.5)*base_h);
        aln_context.strokeStyle = 'white';
    }
    */
}
