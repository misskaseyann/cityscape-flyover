/**
 * Created by Hans Dulimarta.
 */
let canvas
let gl;
let allObjs = [];

var projUnif;
var projMat, viewMat;

function main() {
    canvas = document.getElementById("my-canvas");

    /* setup window resize listener */
    window.addEventListener('resize', resizeWindow);

    gl = WebGLUtils.create3DContext(canvas, null);
    ShaderUtils.loadFromFile(gl, "vshader.glsl", "fshader.glsl")
        .then (prog => {

        /* put all one-time initialization logic here */
        gl.useProgram (prog);
    gl.clearColor (0, 0, 0, 1);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.cullFace(gl.BACK);

    /* the vertex shader defines TWO attribute vars and ONE uniform var */
    let posAttr = gl.getAttribLocation (prog, "vertexPos");
    let colAttr = gl.getAttribLocation (prog, "vertexCol");
    Object3D.linkShaderAttrib({
        positionAttr: posAttr,
        colorAttr: colAttr
    });
    let modelUnif = gl.getUniformLocation (prog, "modelCF");
    projUnif = gl.getUniformLocation (prog, "projection");
    viewUnif = gl.getUniformLocation (prog, "view");
    Object3D.linkShaderUniform({
        projection: projUnif,
        view: viewUnif,
        model: modelUnif
    });
    gl.enableVertexAttribArray (posAttr);
    gl.enableVertexAttribArray (colAttr);
    projMat = mat4.create();
    gl.uniformMatrix4fv (projUnif, false, projMat);
    viewMat = mat4.lookAt(mat4.create(),
        vec3.fromValues (2, 4, 2),  // eye coord
        vec3.fromValues (0, 0, 1),  // gaze point
        vec3.fromValues (0, 0, 1)   // Z is up
    );
    gl.uniformMatrix4fv (viewUnif, false, viewMat);

    /* recalculate new viewport */
    resizeWindow();

    createObject();

    /* initiate the render request */
    window.requestAnimFrame(drawScene);
});
}

function drawScene() {
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

    /* in the following three cases we rotate the coordinate frame by 1 degree */
    for (var k = 0; allObjs.length; k++)
        allObjs[k].draw(gl);

}

function createObject() {
    let obj = new PolygonalPrism(gl,
        {
            topRadius: 0.5,
            bottomRadius: 0.5,
            numSides: 8,
            height: 1,
            //topColor: vec3.fromValues(1,0,0),
            //bottomColor: vec3.fromValues(1,1,1)
        });
    let cone = new Cone(gl, {
        radius: 0.4,
        height: 1.2
    });
    mat4.translate (cone.coordFrame, cone.coordFrame, vec3.fromValues(1, 0, 0));
    allObjs.push(obj, cone);
}

function resizeWindow() {
    let w = window.innerWidth - 16;
    let h = 0.75 * window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    mat4.perspective (projMat, glMatrix.toRadian(60), w/h, 0.05, 20);
    gl.uniformMatrix4fv (projUnif, false, projMat);
    gl.viewport(0, 0, w, h);
}