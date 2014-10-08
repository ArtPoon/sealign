/**
 * Created by art on 2014-09-18.
 */
// Event handlers.........................................

var reader = new FileReader(),
    alignment = [];

var maxlen = 0;  // maximum sequence length

var aln_canvas,
    aln_context,
    lab_canvas,
    lab_context;

var htmlTop, htmlLeft,
    stylePaddingLeft, styleBorderLeft,
    stylePaddingTop, styleBorderTop;

var dragging = false;  // are we dragging mouse on canvas?

window.onload = function() {
	// Check for the various File API support.
	if (window.File && window.FileReader && window.FileList && window.Blob) {
	  // Great success! All the File APIs are supported.
	} else {
	  alert('The File APIs are not fully supported in this browser.');
	}

    // set up canvases
    aln_canvas = document.getElementById('alignment_canvas');
    aln_context = aln_canvas.getContext('2d');
    lab_canvas = document.getElementById('label_canvas');
    lab_context = lab_canvas.getContext('2d');

    // adjust mouse coordinate system
    var html = document.body.parentNode;
    htmlTop = html.offsetTop;
    htmlLeft = html.offsetLeft;

    stylePaddingLeft = 0;
    stylePaddingTop = 0;
    styleBorderLeft = 0;
    styleBorderTop = 0;
    if (window.getComputedStyle) {
        stylePaddingLeft = parseInt(getComputedStyle(aln_canvas, null).getPropertyValue('padding-left'));
        stylePaddingTop = parseInt(getComputedStyle(aln_canvas, null).getPropertyValue('padding-top'));
        styleBorderLeft = parseInt(getComputedStyle(aln_canvas, null).getPropertyValue('border-left-width'));
        styleBorderTop = parseInt(getComputedStyle(aln_canvas, null).getPropertyValue('border-top-width'));
    }

	// bind file browser to HTML5 FileReader
	$('#id_inputFile').on('change', function (e) {
        var files = e.target.files; // FileList object
	    var f = files[0];
        // TODO: check file MIME type, should be a plain text file
        reader.onload = fileReadComplete;
        reader.readAsText(f);
    });

    // de-activate sliders until user loads alignment
    $('#alignment_slider').slider('option', 'disabled', true);
    $('#vertical_slider').slider('option', 'disabled', true)
        .slider('option', 'value', 100); // default max, so handle at top

    function initialize() {
        window.addEventListener('resize', resizeCanvas, false);
        //resizeCanvas();
    }
    initialize();

    // bind mouse-over event handlers
    aln_canvas.addEventListener('mousemove', function(e) {
        doMove(e);
    }, true);
    aln_canvas.addEventListener('mouseleave', function() {
        over_col = -1;
        over_row = -1;
    }, true);
    aln_canvas.addEventListener('mousedown', function(e) {
        doDown(e);
    }, true);
    aln_canvas.addEventListener('mouseup', function(e) {
        doUp(e);
    });
    aln_canvas.addEventListener('keydown', function(e) {
        switchSelectionMode(e);
    });
    aln_canvas.addEventListener('keyup', function() {
        releaseSelectionMode();
    });
};



function fileReadComplete (f) {
    /**
     * Parse FASTA from file contents
     */

    var contents = f.target.result,
        lines = contents.split(/\r\n|\r|\n/g),
        header = '',
        sequence = '';

    // parse FASTA file
    for (var line, i = 0; i < lines.length; i++) {
        line = lines[i];
        if (line[0] == '>') {
            if (sequence.length > 0) {
                alignment.push({'header': header, 'rawseq': sequence});
                if (sequence.length > maxlen) {
                    maxlen = sequence.length;
                }
                sequence = '';
            }
            header = line.slice(1);  // drop leading '>'
        } else {
            sequence += line.toUpperCase();
        }
    }
    // add last entry
    alignment.push({'header': header, 'rawseq': sequence});

    // activate and configure horizontal slider
    $('#alignment_slider').slider('option', 'disabled', false)
        .slider('option', 'min', 0)
        .slider('option', 'max', maxlen);
    $('#vertical_slider').slider('option', 'disabled', false)
        .slider('option', 'min', Math.floor(aln_canvas.height / base_h))
        .slider('option', 'max', alignment.length)
        .slider('option', 'value', alignment.length);

    resizeCanvas();
}
