/*
    Code sample for CSCI 2408 Computer Graphics Fall 2022 
    (c)2022 by Araz Yusubov 
    DISCLAIMER: All code examples we will look at are quick hacks intended to present working prototypes.
    Hence they do not follow best practice of programming or software engineering.    
*/
var canvas;
var context;
var fileopen;
// An Object instance to load and display a 3D model
var model;

window.onload = init;
window.onkeydown = onKeyDown;

// Object class to load and display a 3D model
class Object {
    // Tranformation parameters
    scaleFactor;
    rotateY;
    // Arrays to store vertices and faces
    vertices;
    faces;
    // Array to store transformed vertices
    #vertices;
    // File reader to read OBJ files
    filereader;
    // Callback function to be called after loading ended
    onloadend;

    #onFileLoadEnd(e) {
        console.log("onLoadEnd... Begin");
        // Read object specifications from the file
        var lines = e.target.result.split('\n');
        // Clear all the previous vertex and face data
        this.vertices = [];
        this.#vertices = [];
        this.faces = [];
        // Fetch the  and face data from the file
        for (var i = 0; i < lines.length; i++) {
            var parts = lines[i].split(' ');
            switch (parts[0]) {
                case 'v': // Add a new vertex
                    // this would lose context here and point at the filereader if bind not used
                    this.vertices.push([Number(parts[1]), Number(parts[2]), Number(parts[3])]);
                    break;
                case 'f': // Add a new 
                    var face = [];
                    for (var j = 1; j < parts.length; j++) {
                        face.push(Number(parts[j]-1));
                    }
                    this.faces.push(face);
                    break;
            } 
        }
        console.log("onLoadEnd... End");
        // Call the callback function
        if (typeof this.onloadend == "function") {
            this.onloadend();
        }
    }

    constructor() {
        this.vertices = new Array();
        this.faces = new Array();
        this.#vertices = new Array();
        this.filereader = new FileReader();
        this.scaleFactor = 1;
        this.rotateY = 0;
        // Once the OBJ file is loaded draw it on the canvas
        this.filereader.onloadend = this.#onFileLoadEnd.bind(this);
    }

    LoadFromFile(filename) {
        this.filereader.readAsText(filename);
    }

    DrawOnCanvas(context) {
        // Clear the canvas related to the provided context
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        // Make all vertex transformations
        this.#vertices = [];
        var xcenter = context.canvas.width / 2;
        var ycenter = context.canvas.height / 2;
        for (var i = 0; i < this.vertices.length; i++) {
            // Read the next vertex
            var x = this.vertices[i][0];
            var y = this.vertices[i][1];
            var z = this.vertices[i][2];
            // Transform the vertex and save
            // ...rotate it around y-axis;
            x = x * Math.cos(this.rotateY) - z * Math.sin(this.rotateY);
            z = x * Math.sin(this.rotateY) + z * Math.cos(this.rotateY);
            // ...scale it uniformly
            x = x*this.scaleFactor;
            y = y*this.scaleFactor;
            z = z*this.scaleFactor;
            // ...move it to the center of canvas
            x = x + xcenter;
            y = y + ycenter;
            this.#vertices.push([x, y, z])
            // Drawing a pixel for each vertex
            //context.fillRect(x, y, 1, 1); 
        }
        // Draw the faces on the canvas
        for (var i = 0; i < this.faces.length; i++) {
            var face = this.faces[i];
            // Draw a polygon instead of a face
            context.beginPath();
            var v = this.#vertices[face[0]];
            context.moveTo(v[0], v[1]);
            for (var j = 1; j < face.length; j++) {
                v = this.#vertices[face[j]];
                context.lineTo(v[0], v[1]);
            }
            context.stroke();
        }
    }
    
}

// Main program section

function init() {
    console.log("init... Begin");
    // Get reference to the file input
    fileopen = document.getElementById("file-open");
    if (fileopen) {
        //Set a listener for the selected file change event
        fileopen.onchange = onChange;
        console.log("init... Okay");
    }
    // Get reference to the button
    button = document.getElementById("proc-button");
    button.onclick = processImage;
    // Create an object to load 3D models
    model = new Object();
    model.onloadend = onLoadEnd;
    // Get reference to the 2D context of the canvas
    canvas = document.getElementById("gl-canvas");
    context = canvas.getContext("2d");
    console.log("init... End");
}

function onChange(e) {
    console.log("onChange... Begin");
    // Get the name of the selected file
    const files = fileopen.files;
    // Get the file name extension (pop removes the last element in the array)
    fileext = files[0].name.split('.').pop().toLowerCase();
    if (fileext == "obj") {
        model.LoadFromFile(files[0]);
    }
    console.log("onChange... End");
}

function onLoadEnd() {
    model.DrawOnCanvas(context);
}

function onKeyDown(e) {
    console.log("onKeyDown..." + e.key);
    switch (e.key) {
        // Uniformly scale the model up/down
        case '+': 
            model.scaleFactor *= 1.1;
            model.DrawOnCanvas(context);
            break;
        case '-': 
            model.scaleFactor /= 1.1;
            model.DrawOnCanvas(context);
            break;
        case 'ArrowRight':
            model.rotateY += 0.1;
            model.DrawOnCanvas(context);
            break;
        case 'ArrowLeft':
            model.rotateY -= 0.1;
            model.DrawOnCanvas(context);
            break;
    }
}

function processImage() {
    console.log("Processing... Begin")
    // Get image data for all the canvas
    const imgdata = context.getImageData(0, 0, canvas.width, canvas.height);
    // Get the array containing the pixel data in the RGBA order
    const data = imgdata.data;
    for (var i = 0; i < data.length; i += 4) {
        // Manipulating colors (inverting)
        data[i] = 255 - data[i];
        data[i+1] = 255 - data[i+1];
        data[i+2] = 255 - data[i+2];
    }
    context.putImageData(imgdata, 0, 0);
    console.log("Processing... End")
}

// Draw a pixel using the canvas coordinates
function drawPixel(x, y) {
    context.fillRect(x, y, 1, 1);
}

// Draw a line using the canvas coordinates
function drawLine(x0, y0, x1, y1) {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
}