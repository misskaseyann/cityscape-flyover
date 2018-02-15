/**
 * Created by Hans Dulimarta.
 */
let canvas;
let gl;
let allObjs = [];

let projUnif;
let projMat, viewMat;

let forwards = true;

function main() {
    canvas = document.getElementById("my-canvas");
    initListener();
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
        vec3.fromValues (0, 4, 2),  // eye coord
        vec3.fromValues (0, 0, 1),  // gaze point
        vec3.fromValues (0, 0, 1)   // Z is up
    );
    gl.uniformMatrix4fv (viewUnif, false, viewMat);

    /* recalculate new viewport */
    resizeWindow();

    createObject();

    /* initiate the render request */
    window.requestAnimFrame(drawScene);
    window.requestAnimationFrame(animLoop);
});
}

function drawScene() {
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    /* in the following three cases we rotate the coordinate frame by 1 degree */
    for (let k = 0; allObjs.length; k++)
        allObjs[k].draw(gl);
}

function createObject() {
    let x = -6;
    let y = 0;
    for (let i = 0; i < 200; i++) {
        let rand = Math.random();
        if (rand < 0.5) {
            let obj = new PolygonalPrism(gl,
                {
                    topRadius: Math.random(),
                    bottomRadius: Math.random(),
                    numSides: getRandomInt(3, 10),
                    height: getRandom(2, 0.5)
                });
            mat4.translate(obj.coordFrame, obj.coordFrame, vec3.fromValues(x, -y, 0));
            allObjs.push(obj);
        } else {
            let cone = new Cone(gl, {
                radius: Math.random(),
                height: getRandom(2, 0.5)
            });
            mat4.translate(cone.coordFrame, cone.coordFrame, vec3.fromValues(x, -y, 0));
            allObjs.push(cone);
        }
        if (x !== 6) {
            x+=2;
        } else {
            x = -6;
            y+=2;
        }
    }
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

function initListener() {
    window.addEventListener('keydown', event => {
        switch (event.keyCode) {
            // W Key - Pitch: -X axis.
            case 87:
                newView = mat4.create();
                mat4.fromXRotation(newView, -.01);
                mat4.multiply(viewMat, newView, viewMat);
                gl.uniformMatrix4fv(viewUnif, false, viewMat);
                window.requestAnimFrame(drawScene);
                break;
            // S Key - Pitch: +X axis.
            case 83:
                newView = mat4.create();
                mat4.fromXRotation(newView, .01);
                mat4.multiply(viewMat, newView, viewMat);
                gl.uniformMatrix4fv(viewUnif, false, viewMat);
                window.requestAnimFrame(drawScene);
                break;
            // A Key - Yaw: -Y axis.
            case 65:
                newView = mat4.create();
                mat4.fromYRotation(newView, -.01);
                mat4.multiply(viewMat, newView, viewMat);
                gl.uniformMatrix4fv(viewUnif, false, viewMat);
                window.requestAnimFrame(drawScene);
                break;
            // D Key - Yaw: +Y axis.
            case 68:
                newView = mat4.create();
                mat4.fromYRotation(newView, .01);
                mat4.multiply(viewMat, newView, viewMat);
                gl.uniformMatrix4fv(viewUnif, false, viewMat);
                window.requestAnimFrame(drawScene);
                break;
            // Up Arrow Key - Move: forward +Z axis.
            case 38:
                forwards = true;
                break;
            // Down Arrow Key - Move: backward -Z axis.
            case 40:
                forwards = false;
                break;
            // Right Arrow Key - Roll: right +Z axis.
            case 39:
                newView = mat4.create();
                mat4.fromZRotation(newView, .01);
                mat4.multiply(viewMat, newView, viewMat);
                gl.uniformMatrix4fv(viewUnif, false, viewMat);
                window.requestAnimFrame(drawScene);
                break;
            // Left Arrow Key - Roll: left -Z axis.
            case 37:
                newView = mat4.create();
                mat4.fromZRotation(newView, -.01);
                mat4.multiply(viewMat, newView, viewMat);
                gl.uniformMatrix4fv(viewUnif, false, viewMat);
                window.requestAnimFrame(drawScene);
                break;
        }
    });
}

let lastTime = 0;
function animLoop(time) {
    if (time - lastTime > 50) {
        if (forwards === true) {
            newView = mat4.fromTranslation(mat4.create(), vec3.fromValues(0, 0, 0.05));
            mat4.multiply(viewMat, newView, viewMat);
            gl.uniformMatrix4fv(viewUnif, false, viewMat);
        } else {
            newView = mat4.fromTranslation(mat4.create(), vec3.fromValues(0, 0, -0.05));
            mat4.multiply(viewMat, newView, viewMat);
            gl.uniformMatrix4fv(viewUnif, false, viewMat);
        }
        lastTime = time;
    }
    window.requestAnimFrame(drawScene);
    window.requestAnimationFrame(animLoop);
}

function getRandom(min, max) {
    // Taken from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
    // Taken from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}