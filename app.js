import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from '../../libs/utils.js';
import { length, flatten, inverse, mult, normalMatrix, perspective, lookAt, vec4, vec3, vec2, subtract, add, scale, rotate, normalize, mat4 } from '../../libs/MV.js';

import * as dat from '../../libs/dat.gui.module.js';

import * as CUBE from '../../libs/objects/cube.js';
import * as SPHERE from '../../libs/objects/sphere.js';
import * as BUNNY from '../../libs/objects/bunny.js';
import * as COW from '../../libs/objects/cow.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';
import * as PYRAMID from '../../libs/objects/pyramid.js';
import * as TORUS from '../../libs/objects/torus.js';


import * as STACK from '../../libs/stack.js';

function setup(shaders) {
    const canvas = document.getElementById('gl-canvas');
    const gl = setupWebGL(canvas);

    CUBE.init(gl);
    SPHERE.init(gl);
    BUNNY.init(gl); 
    COW.init(gl);   
    CYLINDER.init(gl);
    PYRAMID.init(gl);
    TORUS.init(gl);

    const programGouraud = buildProgramFromSources(gl, shaders['gouraud.vert'], shaders['gouraud.frag']);
    const programPhong = buildProgramFromSources(gl, shaders['phong.vert'], shaders['phong.frag']);

    let program = programGouraud;

    
    let camera = {
        eye: vec3(0, 0, 5),
        at: vec3(0, 0, 0),
        up: vec3(0, 1, 0),
        fovy: 45,
        aspect: 1, 
        near: 0.1,
        far: 20
    }

    let options = {
        name: "Bunny",
        backFaceCulling: true,
        z_buffer: true,
        seeLights: false,
        normals: false
    }

    let transform = {
        position: vec3(0, 0, 0),
        rotation: vec3(0, 0, 0),
        scale: vec3(1, 1, 1)
    }

    let material = {
        shader: "gouraud",
        Ka: [31, 66, 142],
        Kd: [50, 152, 247], 
        Ks: [255, 255, 255],
        shininess: 100
    }

    let floor = {
        Ka: [202,227,145],
        Kd: [202,227,145], 
        Ks: [255, 255, 255], 
        shininess: 100
    }

    let light1 = {
        position: vec3(1.0, 1.0, 1.0),
        posC: vec3(),
        Ka: [51, 51, 51], 
        Kd: [76, 76, 76], 
        Ks: [255, 255, 255], 
        directional: true,
        active: true
    }
    let light2 = {
        position: vec3(0.0, 0.0, 0.0),
        posC: vec3(),
        Ka: [51, 51, 51], 
        Kd: [76, 76, 76], 
        Ks: [255, 255, 255], 
        directional: true,
        active: true
    }
    let light3 = {
        position: vec3(0.0, 0.0, 0.0),
        posC: vec3(),
        Ka: [51, 51, 51], 
        Kd: [76, 76, 76], 
        Ks: [255, 255, 255], 
        directional: true,
        active: true
    }

    let currentObject = BUNNY;

    //gui do objeto
    const objectGUI = new dat.GUI();
    objectGUI.domElement.id = "object-gui";

    objectGUI.add(options, "name", ["Bunny", "Cow", "Cube", "Sphere", "Pyramid", "Cylinder", "Torus"]).name("name").onChange((value) => {
        if (value === "Bunny") {
            currentObject = BUNNY;
        } else if (value === "Cow") {
            currentObject = COW;
        } else if (value === "Cube") {
            currentObject = CUBE;
        } else if (value === "Sphere") {
            currentObject = SPHERE;
        } else if (value === "Pyramid") {
            currentObject = PYRAMID;
        } else if (value === "Cylinder") {
            currentObject = CYLINDER;
        } else if (value === "Torus") {
            currentObject = TORUS;
        }
    });

    const transformGui = objectGUI.addFolder("transform");

    const positionGui = transformGui.addFolder("position");
    positionGui.add(transform.position, 0).min(-5).max(5).step(1).listen().name("x");
    positionGui.add(transform.position, 1).step(0.05).listen().name("y").domElement.style.pointerEvents = "none";;
    positionGui.add(transform.position, 2).min(-5).max(5).step(1).listen().name("z");

    const rotationGui = transformGui.addFolder("rotation");
    rotationGui.add(transform.rotation, 0).step(0.05).listen().name("x").domElement.style.pointerEvents = "none";;
    rotationGui.add(transform.rotation, 1).min(-180).max(180).step(1).listen().name("y");
    rotationGui.add(transform.rotation, 2).step(0.05).listen().name("z").domElement.style.pointerEvents = "none";;

    const scaleGui = transformGui.addFolder("scale");
    scaleGui.add(transform.scale, 0).min(0).max(2).step(0.1).listen().name("x");
    scaleGui.add(transform.scale, 1).min(0).max(1).step(0.1).listen().name("y");
    scaleGui.add(transform.scale, 2).min(0).max(2).step(0.1).listen().name("z");

    const materialGui = objectGUI.addFolder("material");
    materialGui.add(material, "shader", ["gouraud", "phong"]).onChange((value) => {
        if (value === "gouraud") {
            program = programGouraud;
        } else if (value === "phong") {
            program = programPhong;
        }
    });
    materialGui.addColor(material, "Ka").onChange((value) => {
        gl.uniform3fv(gl.getUniformLocation(program, "u_material.Ka"), new Float32Array(value));
    });
    materialGui.addColor(material, "Kd").onChange((value) => {
        gl.uniform3fv(gl.getUniformLocation(program, "u_material.Kd"), new Float32Array(value));
    });
    materialGui.addColor(material, "Ks").onChange((value) => {
        gl.uniform3fv(gl.getUniformLocation(program, "u_material.Ks"), new Float32Array(value));
    });
    materialGui.add(material, "shininess").min(1).max(200).step(1).onChange((value) => {
        gl.uniform1f(gl.getUniformLocation(program, "u_material.shininess"), value);
    });


    //fim do gui do objeto
    //inicio do gui da direita
    const gui = new dat.GUI();

    const optionsGui = gui.addFolder("options");
    optionsGui.add(options, "backFaceCulling");
    optionsGui.add(options, "z_buffer");
    optionsGui.add(options, "seeLights");
    optionsGui.add(options, "normals");

    const cameraGui = gui.addFolder("camera");

    cameraGui.add(camera, "fovy").min(1).max(179).step(1).listen();
    cameraGui.add(camera, "aspect").min(0).max(10).step(0.01).listen().domElement.style.pointerEvents = "none";

    cameraGui.add(camera, "near").min(0.1).max(20).step(0.01).listen().onChange(function (v) {
        camera.near = Math.min(camera.far - 0.5, v);
    });

    cameraGui.add(camera, "far").min(0.1).max(20).step(0.01).listen().onChange(function (v) {
        camera.far = Math.max(camera.near + 0.5, v);
    });

    const eye = cameraGui.addFolder("eye");
    eye.add(camera.eye, 0).step(0.05).listen().domElement.style.pointerEvents = "none";;
    eye.add(camera.eye, 1).step(0.05).listen().domElement.style.pointerEvents = "none";;
    eye.add(camera.eye, 2).step(0.05).listen().domElement.style.pointerEvents = "none";;

    const at = cameraGui.addFolder("at");
    at.add(camera.at, 0).step(0.05).listen().domElement.style.pointerEvents = "none";;
    at.add(camera.at, 1).step(0.05).listen().domElement.style.pointerEvents = "none";;
    at.add(camera.at, 2).step(0.05).listen().domElement.style.pointerEvents = "none";;

    const up = cameraGui.addFolder("up");
    up.add(camera.up, 0).step(0.05).listen().domElement.style.pointerEvents = "none";;
    up.add(camera.up, 1).step(0.05).listen().domElement.style.pointerEvents = "none";;
    up.add(camera.up, 2).step(0.05).listen().domElement.style.pointerEvents = "none";;

    const lightsGui = gui.addFolder("lights");
    const light1Gui = lightsGui.addFolder("Light1");
    light1Gui.add(light1.position, 0).min(-10).max(10).step(0.05).listen().name("x").onChange((value) => {
        light1.position[0] = value;
    });
    light1Gui.add(light1.position, 1).min(-10).max(10).step(0.05).listen().name("y").onChange((value) => {
        light1.position[1] = value;
    });
    light1Gui.add(light1.position, 2).min(-10).max(10).step(0.05).listen().name("z").onChange((value) => {
        light1.position[2] = value;
    });
    light1Gui.addColor(light1, "Ka").onChange((value) => {
    });
    light1Gui.addColor(light1, "Kd").onChange((value) => {
    });
    light1Gui.addColor(light1, "Ks").onChange((value) => {
    });
    light1Gui.add(light1, "directional");
    light1Gui.add(light1, "active");

    const light2Gui = lightsGui.addFolder("Light2");
    light2Gui.add(light2.position, 0).min(-10).max(10).step(0.05).listen().name("x").onChange((value) => {
        light2.position[0] = value;
    });
    light2Gui.add(light2.position, 1).min(-10).max(10).step(0.05).listen().name("y").onChange((value) => {
        light2.position[1] = value;
    });
    light2Gui.add(light2.position, 2).min(-10).max(10).step(0.05).listen().name("z").onChange((value) => {
        light2.position[2] = value;
    });
    light2Gui.addColor(light2, "Ka").onChange((value) => {
    });
    light2Gui.addColor(light2, "Kd").onChange((value) => {
    });
    light2Gui.addColor(light2, "Ks").onChange((value) => {
    });
    light2Gui.add(light2, "directional");
    light2Gui.add(light2, "active");

    const light3Gui = lightsGui.addFolder("Light3");
    light3Gui.add(light3.position, 0).min(-10).max(10).step(0.05).listen().name("x").onChange((value) => {
        light3.position[0] = value;
    });
    light3Gui.add(light3.position, 1).min(-10).max(10).step(0.05).listen().name("y").onChange((value) => {
        light3.position[1] = value;
    });
    light3Gui.add(light3.position, 2).min(-10).max(10).step(0.05).listen().name("z").onChange((value) => {
        light3.position[2] = value;
    });
    light3Gui.addColor(light3, "Ka").onChange((value) => {
    });
    light3Gui.addColor(light3, "Kd").onChange((value) => {
    });
    light3Gui.addColor(light3, "Ks").onChange((value) => {
    });
    light3Gui.add(light3, "directional");
    light3Gui.add(light3, "active");


    
    let mView, mProjection;

    let down = false;
    let lastX, lastY;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    resizeCanvasToFullWindow();

    window.addEventListener('resize', resizeCanvasToFullWindow);

    window.addEventListener('wheel', function (event) {


        if (!event.altKey && !event.metaKey && !event.ctrlKey) { 
            const factor = 1 - event.deltaY / 1000;
            camera.fovy = Math.max(1, Math.min(100, camera.fovy * factor));
        }
        else if (event.metaKey || event.ctrlKey) {
           

            const offset = event.deltaY / 1000;

            const dir = normalize(subtract(camera.at, camera.eye));

            const ce = add(camera.eye, scale(offset, dir));
            const ca = add(camera.at, scale(offset, dir));

           
            camera.eye[0] = ce[0];
            camera.eye[1] = ce[1];
            camera.eye[2] = ce[2];

            if (event.ctrlKey) {
                camera.at[0] = ca[0];
                camera.at[1] = ca[1];
                camera.at[2] = ca[2];
            }
        }
    });

    function inCameraSpace(m) {
        const mInvView = inverse(mView);

        return mult(mInvView, mult(m, mView));
    }

    canvas.addEventListener('mousemove', function (event) {
        if (down) {
            const dx = event.offsetX - lastX;
            const dy = event.offsetY - lastY;

            if (dx != 0 || dy != 0) {
                

                const d = vec2(dx, dy);
                const axis = vec3(-dy, -dx, 0);

                const rotation = rotate(0.5 * length(d), axis);

                let eyeAt = subtract(camera.eye, camera.at);
                eyeAt = vec4(eyeAt[0], eyeAt[1], eyeAt[2], 0);
                let newUp = vec4(camera.up[0], camera.up[1], camera.up[2], 0);

                eyeAt = mult(inCameraSpace(rotation), eyeAt);
                newUp = mult(inCameraSpace(rotation), newUp);

                console.log(eyeAt, newUp);

                camera.eye[0] = camera.at[0] + eyeAt[0];
                camera.eye[1] = camera.at[1] + eyeAt[1];
                camera.eye[2] = camera.at[2] + eyeAt[2];

                camera.up[0] = newUp[0];
                camera.up[1] = newUp[1];
                camera.up[2] = newUp[2];

                lastX = event.offsetX;
                lastY = event.offsetY;
            }

        }
    });

    canvas.addEventListener('mousedown', function (event) {
        down = true;
        lastX = event.offsetX;
        lastY = event.offsetY;
        gl.clearColor(0.2, 0.0, 0.0, 1.0);
    });

    canvas.addEventListener('mouseup', function (event) {
        down = false;
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
    });

    window.requestAnimationFrame(render);

    function resizeCanvasToFullWindow() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        camera.aspect = canvas.width / canvas.height;

        gl.viewport(0, 0, canvas.width, canvas.height);
    }

     function transformLight(light, referential, matrix) {
        let position = vec4(light.position[0], light.position[1], light.position[2], 1);

        switch (referential) {
            case "camera":
                return position;
            case "object":
                if (matrix) {
                    return mult(matrix, position);
                }
                break;
            case "world":
                if (matrix) {
                    return mult(matrix, position);
                }
                break;
        }

        return position; 
    }
 
    
    function normalizeColor(color) {
        return color.map(c => c / 255);
    }

    let renderTimes = 0;

    function render(time) {
        window.requestAnimationFrame(render);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (options.z_buffer) {
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LESS);
        } else {
            gl.disable(gl.DEPTH_TEST);
        }

        if (options.backFaceCulling) {
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.BACK);
        } else {
            gl.disable(gl.CULL_FACE);
        }

        gl.useProgram(program);

        mView = lookAt(camera.eye, camera.at, camera.up);
        STACK.loadMatrix(mView);
        mProjection = perspective(camera.fovy, camera.aspect, camera.near, camera.far);

        const lightPositions = [];
        const lightsArr = [];
        if (light1.active) {
                const pTmp = transformLight(light1, "world",  mView);
                const position = [pTmp[0], pTmp[1], pTmp[2], light1.directional ? 1.0 : 0.0];
                light1.posC= position;
            
            lightPositions.push(light1.position);
            lightsArr.push(light1);
        }
        if (light2.active) {
            STACK.pushMatrix();
            STACK.multTranslation(transform.position);
            STACK.multRotationY(transform.rotation[1]);
            STACK.multScale(transform.scale);

                const pTmp = transformLight(light2, "object", STACK.modelView());
                const position = [pTmp[0], pTmp[1], pTmp[2], light2.directional ? 1.0 : 0.0];
                light2.posC= position;
            
            lightPositions.push(light2.position);
            lightsArr.push(light2);

            STACK.popMatrix();
        }
        if (light3.active) {
                const pTmp = transformLight(light3, "camera",mat4());
                const position = [pTmp[0], pTmp[1], pTmp[2], light3.directional ? 1.0 : 0.0];
             light3.posC= position;
            
            lightPositions.push(light3.position);
            lightsArr.push(light3);
        }

        gl.uniform1i(gl.getUniformLocation(program, "u_n_lights"), lightPositions.length);

        //material do objeto
        gl.uniform3fv(gl.getUniformLocation(program, "u_material.Ka"), flatten(normalizeColor(material.Ka)));
        gl.uniform3fv(gl.getUniformLocation(program, "u_material.Kd"), flatten(normalizeColor(material.Kd)));
        gl.uniform3fv(gl.getUniformLocation(program, "u_material.Ks"), flatten(normalizeColor(material.Ks)));
        gl.uniform1f(gl.getUniformLocation(program, "u_material.shininess"), material.shininess);
        TransformObject();

        //material do chao
        gl.uniform3fv(gl.getUniformLocation(program, "u_material.Ka"), flatten(normalizeColor(floor.Ka)));
        gl.uniform3fv(gl.getUniformLocation(program, "u_material.Kd"), flatten(normalizeColor(floor.Kd)));
        gl.uniform3fv(gl.getUniformLocation(program, "u_material.Ks"), flatten(normalizeColor(floor.Ks)));
        gl.uniform1f(gl.getUniformLocation(program, "u_material.shininess"), floor.shininess);
        draw_floor();

        for (let i = 0; i < lightsArr.length; i++) {
            setLightUniforms(lightsArr[i], i);
        }     

        if (options.seeLights) {
            for (let i = 0; i < lightsArr.length; i++) {
                const light = lightsArr[i];
                const color = normalizeColor(light.Kd); 
                drawLightPositionSphere(light.posC, color);
            }
        }

        renderTimes++;
    }

    function drawLightPositionSphere(position, color) {
        STACK.pushMatrix();
        STACK.multTranslation(vec3(position[0], position[1], position[2]));
        STACK.multScale(vec3(0.1, 0.1, 0.1)); 
    
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_model_view"), false, flatten(STACK.modelView()));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_normals"), false, flatten(normalMatrix(STACK.modelView())));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_projection"), false, flatten(mProjection));
    
        gl.uniform3fv(gl.getUniformLocation(program, "u_material.Ka"), flatten(color));
        gl.uniform3fv(gl.getUniformLocation(program, "u_material.Kd"), flatten(color));
        gl.uniform3fv(gl.getUniformLocation(program, "u_material.Ks"), flatten([0.0, 0.0, 0.0])); 
        gl.uniform1f(gl.getUniformLocation(program, "u_material.shininess"), 1.0);
    
        SPHERE.draw(gl, program, gl.TRIANGLES); 
        STACK.popMatrix();
    }
    
    function setLightUniforms(light, index) {
        gl.uniform4fv(gl.getUniformLocation(program, `u_light[${index}].pos`), flatten(light.posC));
        gl.uniform3fv(gl.getUniformLocation(program, `u_light[${index}].Ia`), flatten(normalizeColor(light.Ka)));
        gl.uniform3fv(gl.getUniformLocation(program, `u_light[${index}].Id`), flatten(normalizeColor(light.Kd)));
        gl.uniform3fv(gl.getUniformLocation(program, `u_light[${index}].Is`), flatten(normalizeColor(light.Ks)));
    }

    function TransformObject() {
        STACK.pushMatrix();
        STACK.multTranslation(transform.position);
        STACK.multRotationY(transform.rotation[1]);
        STACK.multScale(transform.scale);
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_model_view"), false, flatten(STACK.modelView()));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_normals"), false, flatten(normalMatrix(STACK.modelView())));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_projection"), false, flatten(mProjection));
        currentObject.draw(gl, program, options.normals ? gl.LINES : gl.TRIANGLES);
        STACK.popMatrix();
    }

    function draw_floor() {
        STACK.pushMatrix();
        STACK.multTranslation(vec3(0,-0.5,0))
        STACK.multScale(vec3(5,0.1,5));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_model_view"), false, flatten(STACK.modelView()));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_normals"), false, flatten(normalMatrix(STACK.modelView())));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_projection"), false, flatten(mProjection));
        CUBE.draw(gl, program, options.normals ? gl.LINES : gl.TRIANGLES);
        STACK.popMatrix();
    }
}

const urls = ['shader.vert', 'shader.frag', 'phong.vert', 'phong.frag', 'gouraud.vert', 'gouraud.frag'];

loadShadersFromURLS(urls).then(shaders => setup(shaders));  