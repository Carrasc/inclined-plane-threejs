"use strict"
var canvas;
var engine;
var scene;

// Camera variables
var cameraPerspective;
var cameraOrtho;
var cameraFirstPerson;
var multiview = false;
var controlCameraActive;
var controlPerspective;

var floor;
var floorHelper;

var ramp;

var light;
var cube;
var axesHelperLocal;
var gravity = 9.81;
var accel;
var speed;
var clock = new THREE.Clock();
var pausedTime = 0;
var delta;
var angle = 0;
var stats = new Stats();
var initialSpeed = 0;

var guiControls;
var start = false;
var pause = false;


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
        var positions = new Float32Array(   [-0.5, 0.5,  0.5,
                                            -0.5,-0.5, 0.5,
                                            0.5, -0.5, 0.5, 
                                            -0.5, 0.5, -0.5,
                                            -0.5,-0.5, -0.5,
                                            0.5, -0.5, -0.5, 
                                            ] );
        var indices = [ 0,1,2,
                        5,4,3,     
                        0,3,4,
                        0,4,1,
                        0,2,5,
                        0,5,3,
                        5,2,1,
                        5,1,4
                        ];
        var coordTexture = [0., 1.,
                            0., 0.,
                            1., 0.,
                            1., 1.];

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        this.geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
        this.geometry.computeFaceNormals();     // Normals

        this.material = new THREE.MeshBasicMaterial({color: 'gray'});
    }
}

function getVariables(mass, roz, angle)
{
    var P = mass * gravity;
    var Px = P * Math.sin(angle);
    var Py = P * Math.cos(angle);
    var N = Py;
    var Fr = roz * N;
    var sumF = Px - Fr;
    var accel = sumF / mass;
    time = Math.sqrt((2*distance) / accel);
    console.log("P=", P);
    console.log("Px=", Px);
    console.log("Py=", Py);
    console.log("Accel=", accel);
    console.log("Fr=", Fr);

    return accel;
}

function getAngle(height, base)
{
    distance = Math.sqrt((height*height)+(base*base));
    var angle = Math.asin(height / distance);
    var angle2 = Math.atan(height / base);
    console.log(angle);

    return angle;
}

class Axes extends THREE.Mesh
{
    constructor(object)
    {
        super();
        this.object = object;
        this.arrowHelperX = new THREE.ArrowHelper(new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,0), 1, "red");
        this.arrowHelperY = new THREE.ArrowHelper(new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,0), 1, "green");
        this.arrowHelperZ = new THREE.ArrowHelper(new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,0), 1, "blue");
        this.add(this.arrowHelperX);
        this.add(this.arrowHelperY);
        this.add(this.arrowHelperZ);

    }
    update()
    {
        this.matrixAutoUpdate = false;
        this.matrix.copy(this.object.matrix);
    }
}

function update()
{
    stats.begin();
    delta = clock.getDelta();
    
    // Paused time is 0 at first, but if the user pauses it adds that delta (which is the time the clock was paused) to this variable
    var elapsedTime = clock.elapsedTime - pausedTime;

    if (cube.position.x <= box.max.x && accel > 0)
    {
        //console.log("speed: ", speed, " at time: ", clock.elapsedTime)
        speed = (initialSpeed + accel)*elapsedTime;

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
        

        axesHelperLocal.update(clock.getDelta());
    }

    else 
    {
        clock.stop();
        //console.log(clock.elapsedTime)
    }

    stats.end();
}


function renderLoop() 
{
    engine.setViewport(0, 0, window.innerWidth, window.innerHeight);
    engine.clear();

    if(!multiview)
    {
        // Camera Observer
        cameraPerspective.aspect = canvas.width / canvas.height;
        cameraPerspective.updateProjectionMatrix();
        engine.setScissor(0, 0, window.innerWidth, window.innerHeight);
        engine.render(scene, cameraPerspective);
    }
    else
    {
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
    
    // CANVAS
    canvas = document.getElementById("canvas");

    stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( stats.dom );

    // RENDERER ENGINE
    engine = new THREE.WebGLRenderer({canvas: canvas});
    engine.setSize(window.innerWidth, window.innerHeight);
    engine.setClearColor(new THREE.Color(0.9411, 0.9411, 0.9411), 1.);
    engine.setScissorTest(true);
    engine.autoclear = false;     

    // FLOOR
    var planeGeometry = new THREE.PlaneBufferGeometry( 250, 250 );
    planeGeometry.rotateX( - Math.PI / 2 );
    var planeMaterial = new THREE.ShadowMaterial( { opacity: 0.2 } );

    floor = new THREE.Mesh( planeGeometry, planeMaterial );
    floor.position.y = -1;
    floor.receiveShadow = true;

    // FLOOR HELPER
    floorHelper = new THREE.GridHelper( 250, 250 );
    floorHelper.material.opacity = 0.25;
    floorHelper.material.transparent = true;

    // MODELS
    // THE RAMP
    ramp = new Triangle3D(); 
    ramp.scale.set(50, 50, 1.);

    // Create a Bounding Box for the ramp to know its height and width
    box = new THREE.Box3().setFromObject( ramp );
    triangle3dsize = new THREE.Vector3();
    box.getSize(triangle3dsize);

    // Move the floor to match the ramp
    floor.position.y = -triangle3dsize.y / 2 - 1.;
    floorHelper.position.y = -triangle3dsize.y / 2;

    // With the height and the base, we get the angle and the distance
    angle = getAngle(triangle3dsize.y, triangle3dsize.x)
    // Compute the simulation given the mass, roz coeficient and angle 
    accel = getVariables(2, 0.3, angle);


    // THE CUBE
    cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({wireframe: true, color: "black"}));
    cube.position.set(box.min.x, box.max.y + 0.7, 0);
    // Rotate the angle (negative) so it matches the ramp and it looks like its sliding down
    cube.rotation.z = -(angle);
    
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
    scene.add(axesHelper);
    scene.add(floorHelper);

    // CAMERA
    //camera = new THREE.OrthographicCamera(  );
    // OBSERVER PERSPECTIVE
    cameraPerspective = new THREE.PerspectiveCamera(60., canvas.width / canvas.height, 0.1, 10000.);  // CAMERA
    cameraPerspective.position.set(0, box.max.y, 100)
    cameraPerspective.lookAt(scene.position); 
    cameraPerspective.up.set(0., 1., 0.);  

    // OBSERVER ORTHO
    cameraOrtho = new THREE.OrthographicCamera(- 250, 250, 250, -250, 1, 1000 );  // CAMERA
    cameraOrtho.position.set(0, 0, 100)
    cameraOrtho.lookAt(scene.position); 
    cameraOrtho.zoom = 3;  
    cameraOrtho.up.set(0., 1., 0.);  

    // CAMERA FIRST PERSON
    cameraFirstPerson = new THREE.PerspectiveCamera(60., 0.5*canvas.width / canvas.height, 0.1, 1000.);  // CAMERA
    cameraFirstPerson.position.set(box.min.x + 0.1, box.max.y, 0.);  
    cameraFirstPerson.rotation.y = -(Math.PI / 180)*90;  
    
    var cameraHelper = new THREE.CameraHelper(cameraFirstPerson);
 
    controlPerspective = new THREE.OrbitControls(cameraPerspective, canvas);   
    scene.add(cameraPerspective);  
    scene.add(cameraFirstPerson);
    scene.add(cameraOrtho);
    //scene.add(cameraHelper);

    // LIGHTS
    light = new THREE.AmbientLight();  
    scene.add(light); 

    // GUI
    guiControls = { deltaThetaX: 0., 
        deltaThetaY: 0.,
        base: 0, 
        height: 0, 
        buttonStart: startSimulation, 
        buttonPause: pauseSimulation
      };
    var datGui = new dat.GUI();
    var sliderBase = datGui.add(guiControls, 'base', 2., 150., 0.01);
    var sliderHeight = datGui.add(guiControls, 'height', 2., 150., 0.01);
    var buttonStart = datGui.add(guiControls, 'buttonStart').name('Start');
    var buttonPause = datGui.add(guiControls, 'buttonPause').name('Pause/Play');
    datGui.close();
                               
    // EVENT-HANDLERS
    window.addEventListener('resize', resizeWindow, false);
    document.addEventListener("keydown", keyDownEventListener, false);
    sliderBase.onChange(sliderBaseListener);
    sliderHeight.onChange(sliderHeightListener);

    // ACTION
    requestAnimationFrame(renderLoop);           
}




