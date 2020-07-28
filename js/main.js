"use strict"
var canvas;
var engine;
var scene;
var skyboxActive = false;
var background;
var pointLight;

// Camera variables
var cameraPerspective;
var cameraOrtho;
var cameraFirstPerson;
var multiview = false;
var controlCameraActive;
var controlPerspective;
var cubeCamera;

var positionalAudio;

var floor;
var floorHelper;
var ramp;
var light;
var cube;
var axesHelperLocal;

// Variables to calculate the inclined plane data
var gravity = 9.81;
var accel = 0;
var speed = 0;
var angle = 0;
var initialSpeed = 0;
var P = 0;
var Px;
var Py;
var Fr;
var elapsedTime = 0;
var roz = 0.3;
var mass = 5;

var clock = new THREE.Clock();
var pausedTime = 0;
var delta;

var guiControls;
var start = false;
var pause = false;

// Variables to show the text in the HTML page
var speedText;
var accelText;
var weightText;
var weightXText;
var weightYText;
var frText;
var elapsedTimeText;
var totalTimeText;
var distanceText;
var angleText;
var initialSpeedText;

// The total time it will take the object to get to the bottom
var time;

// The total distance the object need to traverse (hipotenuse)
var distance;

// 
var triangle3dsize;

// The bounding box of the Triangle 3D
var box;

class Triangle3D extends THREE.Mesh
{
    constructor()
    {
        super();
        // GEOMETRY
        var positions = new Float32Array(   [-0.5, 0.5,  0.5,   //0 0.0
                                            -0.5, 0.5,  0.5,   //1 0.1
                                            -0.5, 0.5,  0.5,   //2 0.2
                                            -0.5,-0.5, 0.5,     //3 1.0
                                            -0.5,-0.5, 0.5,     //4 1.1
                                            -0.5,-0.5, 0.5,     //5 1.2
                                            0.5, -0.5, 0.5,     //6 2.0
                                            0.5, -0.5, 0.5,     //7 2.1
                                            0.5, -0.5, 0.5,     //8 2.2
                                            -0.5, 0.5, -0.5,    //9 3.0
                                            -0.5, 0.5, -0.5,    //10 3.1
                                            -0.5, 0.5, -0.5,    //11 3.2
                                            -0.5,-0.5, -0.5,    //12 4.0
                                            -0.5,-0.5, -0.5,    //13 4.1
                                            -0.5,-0.5, -0.5,    //14 4.2
                                            0.5, -0.5, -0.5,    //15 5.0
                                            0.5, -0.5, -0.5,    //16 5.1
                                            0.5, -0.5, -0.5,    //17 5.2

                                            -0.5, 0.5,  0.5,   //18 0.3
                                            -0.5, 0.5,  0.5,   //19 0.4

                                            0.5, -0.5, -0.5,    //20 5.3
                                            0.5, -0.5, -0.5,    //21 5.4

                                            -0.5,-0.5, 0.5,     //22 1.3
                                            -0.5,-0.5, -0.5,    //23 4.3
                                            ] );
        

        var indices = [ 0,3,6,  // Face triangle front
                        15,12,9, // Face triangle back    
                        1,10,13,  //Face left plane 1
                        2,14,4,   //Face left plane 2
                        18,7,16,    //Ramp plane 1
                        19,17,11,      //Ramp plane 2
                        20,8,5,      // Bottom plane 1
                        21,22,23       // Bottom plane 2
                        ];

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
        //this.geometry.computeFaceNormals();     // Normals
        this.geometry.computeVertexNormals(); //<-- this
        this.material = new THREE.MeshPhongMaterial({color: 'rgb(203, 203, 203)', reflectivity: 1, shininess: 100});
    }

}

class Axes extends THREE.Mesh
{
    constructor(object)
    {
        super();
        this.object = object;
        this.arrowHelperPx = new THREE.ArrowHelper(new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,0), 3, "red");
        this.arrowHelperN = new THREE.ArrowHelper(new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,0), 3, "blue");
        this.arrowHelperPy = new THREE.ArrowHelper(new THREE.Vector3(0,-1,0), new THREE.Vector3(0,0,0), 3, "green");
        this.arrowHelperW = new THREE.ArrowHelper(new THREE.Vector3((Math.sin(angle)),(-Math.cos(angle)),0).normalize(), new THREE.Vector3(0,0,0), 3, "orange");
        this.arrowHelperFr = new THREE.ArrowHelper(new THREE.Vector3(-1,0,0), new THREE.Vector3(0,0,0), 3, "purple");
        this.add(this.arrowHelperPx);
        this.add(this.arrowHelperN);
        this.add(this.arrowHelperW);
        this.add(this.arrowHelperPy);
        this.add(this.arrowHelperFr);
        this.visible = true;
    }

    update()
    {
        this.arrowHelperW.setDirection(new THREE.Vector3((Math.sin(angle)),(-Math.cos(angle)),0).normalize());
        this.arrowHelperFr.setLength(Fr/5);
        this.arrowHelperPx.setLength(Px/10);
        this.arrowHelperPy.setLength(Py/10);
        this.arrowHelperN.setLength(Py/10);
        this.arrowHelperW.setLength(P/10);
        this.matrixAutoUpdate = false;
        this.matrix.copy(this.object.matrix);
    }
}

function getVariables(angle)
{
    P = mass * gravity;
    Px = P * Math.sin(angle);
    Py = P * Math.cos(angle);
    var N = Py;
    Fr = roz * N;
    var sumF = Px - Fr;
    var accel = sumF / mass;
    var finalSpeed = Math.sqrt( (initialSpeed*initialSpeed) + (2*distance * accel));
    time = (finalSpeed - initialSpeed) / accel;

    return accel;
}

function getAngle(height, base)
{
    distance = Math.sqrt((height*height)+(base*base));
    var angle = Math.asin(height / distance);
    var angle2 = Math.atan(height / base);

    return angle;
}

function updateVariableTexts()
{
    speedText.innerHTML = speed.toFixed(3);
    accelText.innerHTML = accel.toFixed(3);
    weightText.innerHTML = P.toFixed(3);
    weightXText.innerHTML = Px.toFixed(3);
    weightYText.innerHTML = Py.toFixed(3);
    frText.innerHTML = Fr.toFixed(3);
    elapsedTimeText.innerHTML = elapsedTime.toFixed(3);
    totalTimeText.innerHTML = time.toFixed(3);
    distanceText.innerHTML = distance.toFixed(3);
    angleText.innerHTML = (180/Math.PI*angle).toFixed(3);
}

function update()
{
    delta = clock.getDelta();
    
    // Paused time is 0 at first, but if the user pauses it adds that delta (which is the time the clock was paused) to this variable
    elapsedTime = clock.elapsedTime - pausedTime;

    if (cube.position.x <= (box.max.x + 0.5) && accel > 0)
    {
        //console.log("speed: ", speed, " at time: ", clock.elapsedTime)
        speed = initialSpeed + (accel*elapsedTime);

        // If the delta is mora than 0.1 it means the user probabilly paused, in which case we add that to the pausedTime variable
        if (delta < .1)
        {
            cube.position.x += (speed*delta)*Math.cos(angle);
            cube.position.y -= (speed*delta)*Math.sin(angle);

            cameraFirstPerson.position.x += (speed*delta)*Math.cos(angle);
            cameraFirstPerson.position.y -= (speed*delta)*Math.sin(angle);
        }
        else 
        {
            pausedTime += delta;
        }
        
    }

    else 
    {
        clock.stop();
        positionalAudio.stop();
        //console.log(clock.elapsedTime)
    }

    updateVariableTexts();
}


function renderLoop() 
{
    engine.setViewport(0, 0, window.innerWidth, window.innerHeight);
    engine.clear();

    if(!multiview)
    {
        // Lower the volume when in perspective mode
        positionalAudio.setVolume( 0.3 );

        // Camera Observer
        cameraPerspective.aspect = canvas.width / canvas.height;
        cameraPerspective.updateProjectionMatrix();
        engine.setScissor(0, 0, window.innerWidth, window.innerHeight);
        engine.render(scene, cameraPerspective);

        if (skyboxActive)
        {
            cubeCamera.update( engine, scene );
        }
        
    }
    else
    {
        // Increase the volume in first person for immersion
        positionalAudio.setVolume( 0.8 );

        // Ortho camera doesnt work well with scene texture background. 
        // We need to reset the background if the user wants multiview
        scene.background = new THREE.Color(0.9411, 0.9411, 0.9411);
        skyboxActive = false;

        var w = window.innerWidth;
        var h = window.innerHeight;
        // OBSERVER CAMERA
        cameraOrtho.aspect = w/2. / h;
        cameraOrtho.updateProjectionMatrix();
       
        engine.setViewport(w/2., 0, w/2., h);
        engine.setScissor(w/2., 0, w/2., h);

        engine.render(scene, cameraOrtho);

        // ACTIVE CAMERA
        cameraFirstPerson.aspect = w/2. / h;
        cameraFirstPerson.updateProjectionMatrix();
        engine.setViewport(0, 0, w/2., h);
        engine.setScissor(0, 0, w/2., h);
        engine.render(scene, cameraFirstPerson);
    }

    axesHelperLocal.update();
    if (start && !pause)
    {
        update();
    }
    
    //console.log(clockPause.elapsedTime)
    //console.log(clockPause.oldTime);
    
    requestAnimationFrame(renderLoop);
}

function main()
{ 
    // Variables to show the user
    speedText = document.getElementById("speed");
    accelText = document.getElementById("accel");
    weightText = document.getElementById("weight");
    weightXText = document.getElementById("weightX");
    weightYText = document.getElementById("weightY");
    frText = document.getElementById("fr");
    elapsedTimeText = document.getElementById("elapsedTime");
    totalTimeText = document.getElementById("totalTime");
    distanceText = document.getElementById("distance");
    angleText = document.getElementById("angle");

    // CANVAS
    canvas = document.getElementById("canvas");

    // RENDERER ENGINE
    engine = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
    engine.setSize(window.innerWidth, window.innerHeight);
    engine.setClearColor(new THREE.Color(0.9411, 0.9411, 0.9411), 1.);
    engine.setScissorTest(true);
    engine.autoclear = false;     
    engine.shadowMap.enabled = true;
    engine.shadowMap.type = THREE.PCFShadowMap; 

    // FLOOR
    var planeGeometry = new THREE.PlaneGeometry( 250, 250 );
    planeGeometry.rotateX( - Math.PI / 2 );
    var planeMaterial = new THREE.ShadowMaterial( { opacity: 0.3 } );

    floor = new THREE.Mesh( planeGeometry, planeMaterial );
    floor.receiveShadow = true;

    // FLOOR HELPER
    floorHelper = new THREE.GridHelper( 250, 250 );
    floorHelper.material.opacity = 0.25;
    floorHelper.material.transparent = true;

    // MODELS
    // THE RAMP
    ramp = new Triangle3D(); 
    ramp.castShadow = true;
    ramp.scale.set(10, 10, 2.5);

    // Create a Bounding Box for the ramp to know its height and width
    box = new THREE.Box3().setFromObject( ramp );
    triangle3dsize = new THREE.Vector3();
    box.getSize(triangle3dsize);

    // Move the floor to match the ramp
    floor.position.y = (-triangle3dsize.y / 2) - .1;
    floorHelper.position.y = -triangle3dsize.y / 2 ;

    // With the height and the base, we get the angle and the distance
    angle = getAngle(triangle3dsize.y, triangle3dsize.x);
    // Compute the simulation given the mass, roz coeficient and angle 
    accel = getVariables(angle);
    updateVariableTexts();

    // THE CUBE
    cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({map: new THREE.TextureLoader().load("img/crate.gif")}));
    cube.castShadow = true;
    cube.position.set(box.min.x + (0.5*Math.sin(angle)), box.max.y + (0.5*Math.cos(angle)), 0);
    cube.rotation.z = -(angle); // Rotate the angle (negative) so it matches the ramp and it looks like its sliding down
    
    // THREE js Axes Helper (for global scene)
    var axesHelper = new THREE.AxesHelper(4);

    // Axes Class Object (for a specific object)
    axesHelperLocal = new Axes(cube);

    // SCENEGRAPH
    scene = new THREE.Scene();  
    scene.add(floor);
    scene.add(cube);    // CUBO   
    scene.add(ramp);
    scene.add(axesHelperLocal);
    //scene.add(axesHelper);
    scene.add(floorHelper);

    // CAMERAS
    // CAMERA PERSPECTIVE
    cameraPerspective = new THREE.PerspectiveCamera(50., canvas.width / canvas.height, 0.1, 10000.);  // CAMERA
    cameraPerspective.position.set(15, box.max.y / 2, 18)
    cameraPerspective.lookAt(scene.position); 
    cameraPerspective.up.set(0., 1., 0.);  

    // CAMERA ORTHO
    cameraOrtho = new THREE.OrthographicCamera(- 250, 250, 250, -250, 1, 1000 );  // CAMERA
    cameraOrtho.position.set(0, 0, 100)
    cameraOrtho.lookAt(scene.position); 
    cameraOrtho.up.set(0., 1., 0.);
    if ((triangle3dsize.x <= 20 && triangle3dsize.y <= 40) || (triangle3dsize.y <= 20 && triangle3dsize.x <= 40))
        cameraOrtho.zoom = 10;  
    else if ((triangle3dsize.x > 20 && triangle3dsize.x < 70) && (triangle3dsize.y > 20 && triangle3dsize.y < 70))
        cameraOrtho.zoom = 6.5; 

    else if (triangle3dsize.x >= 120 || triangle3dsize.y >= 120)
        cameraOrtho.zoom = 2; 
    else {
        cameraOrtho.zoom = 4; 
    }
    
    // CAMERA FIRST PERSON
    cameraFirstPerson = new THREE.PerspectiveCamera(103., 0.5*canvas.width / canvas.height, 0.1, 1000.);  // CAMERA
    cameraFirstPerson.position.set(box.min.x + (0.5*Math.sin(angle)), box.max.y + (0.5*Math.cos(angle)), 0); 
    cameraFirstPerson.rotation.y = -(Math.PI / 180)*90; 
    cameraFirstPerson.lookAt(0,5,0); 
    var cameraHelper = new THREE.CameraHelper(cameraFirstPerson);

    // CAMERA CUBEMAP (FOR TEXTURES)
    cubeCamera = new THREE.CubeCamera(1000, 1000, 500);
    cubeCamera.position.set(0, 200, 0);
    scene.add(cubeCamera);


    controlPerspective = new THREE.OrbitControls(cameraPerspective, canvas);   
    controlPerspective.maxDistance = 350;
    controlPerspective.minDistance = 1;
    scene.add(cameraPerspective);  
    scene.add(cameraFirstPerson);
    scene.add(cameraOrtho);
    //scene.add(cameraHelper);

    // LIGHTS
    pointLight = new THREE.PointLight();
    pointLight.castShadow = true;
    pointLight.position.set(-20, 25, 10);
    scene.add( pointLight );
    //var helper = new THREE.PointLightHelper( pointLight, 5 , "red");
    //scene.add( helper );

    var listener = new THREE.AudioListener();
    cameraFirstPerson.add( listener );

    positionalAudio = new THREE.PositionalAudio( listener );

    // load a sound and set it as the PositionalAudio object's buffer
    var audioLoader = new THREE.AudioLoader();
    audioLoader.load( 'sounds/cart_sound.mp3', function( buffer ) {
        positionalAudio.setBuffer( buffer );
        positionalAudio.setRefDistance( 20 );
        positionalAudio.playbackRate = 5;
        positionalAudio.setDirectionalCone( 230, 60, 0.1 );
        positionalAudio.setMaxDistance( 10 );
        positionalAudio.setVolume( 0.3 );
    });

    cube.add(positionalAudio);


    light = new THREE.AmbientLight("white", 0.5);  
    scene.add(light); 

    // GUI
    guiControls = { 
        base: triangle3dsize.x, 
        height: triangle3dsize.y, 
        initSpeed: initialSpeed, 
        buttonStart: startSimulation, 
        buttonPause: pauseSimulation,
        buttonBg: changeBg, 
        roz: roz, 
        mass: mass, 
        wireframe: false,
        axes: true, 
        shadows: true, 
        angle: (180/Math.PI)*angle
    };

    var datGui = new dat.GUI();
    let vars = datGui.addFolder("Simulation variables");
    let misc = datGui.addFolder("Misc");

    var sliderBase = vars.add(guiControls, 'base', 2., 150., 0.1).name('Base (m)');
    var sliderHeight = vars.add(guiControls, 'height', 2., 150., 0.1).name('Height (m)').listen(); // listen makes the variable update if it changes 
    var angleSlider = vars.add(guiControls, 'angle', 0, 80., 0.01).name('Angle (degrees)').listen();
    var sliderSpeed = vars.add(guiControls, 'initSpeed', 0, 150., 0.01).name('Initial speed (m/s)');
    var sliderRoz = vars.add(guiControls, 'roz', 0, 2., 0.01).name('Roz coeficient (resistance of the surface)');
    var massSlider = vars.add(guiControls, 'mass', 0, 200., 0.1).name('Mass (kg)');

    datGui.add(guiControls, 'buttonStart').name('Start simulation');
    datGui.add(guiControls, 'buttonPause').name('Pause/Play');
    datGui.add(guiControls, 'buttonBg').name('Show/hide skybox');
    
    var wireframeCb = misc.add(guiControls, 'wireframe').name("Enable wireframe");
    var axesCb = misc.add(guiControls, 'axes').name("Enable forces vectors");
    var shadowsCb = misc.add(guiControls, 'shadows').name("Enable shadows");

    datGui.close();
                               
    // EVENT-HANDLERS
    window.addEventListener('resize', resizeWindow, false);
    document.addEventListener("keydown", keyDownEventListener, false);
    sliderBase.onChange(sliderBaseListener);
    sliderHeight.onChange(sliderHeightListener);
    angleSlider.onChange(sliderAngleListener);
    sliderSpeed.onChange(sliderSpeedListener);
    sliderRoz.onChange(sliderRozListener);
    massSlider.onChange(sliderMassListener);
    wireframeCb.onChange(checkboxWireframeListener);
    axesCb.onChange(checkboxAxesListener);
    shadowsCb.onChange(checkboxShadowsListener);

    // Load from the start the textures for the background
    let urls = [
        'img/skybox/blizzard_ft.jpg', 'img/skybox/blizzard_bk.jpg',
        'img/skybox/blizzard_up.jpg', 'img/skybox/blizzard_dn.jpg',
        'img/skybox/blizzard_rt.jpg', 'img/skybox/blizzard_lf.jpg',
    ];

    background = new THREE.CubeTextureLoader().load(urls);

    // ACTION
    requestAnimationFrame(renderLoop);           
}