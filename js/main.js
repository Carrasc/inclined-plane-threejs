"use strict"
var canvas;
var engine;
var scene;
var camera;
var light;
var cube;
var axesHelperLocal;
var gravity = 9.81;
var accel;
var speed;
var clock = new THREE.Clock();
var delta;
var angle = 0;
var stats = new Stats();


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
    
    
}

function renderLoop() 
{
    stats.begin();
    delta = clock.getDelta();
    engine.render(scene, camera);
    if (cube.position.x <= box.max.x && accel > 0)
    {
        //console.log("speed: ", speed, " at time: ", clock.elapsedTime)
        speed = (0 + accel)*clock.elapsedTime;

        cube.position.x += (speed*delta)*Math.cos(angle);
        cube.position.y -= (speed*delta)*Math.sin(angle);

        axesHelperLocal.update(clock.getDelta());
        //cube.rotation.y = cube.rotation.y + 0.01;
    }
    else 
    {
        clock.stop();
        console.log(clock.elapsedTime)
    }
    update();
    stats.end();
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

    // FLOOR
    var planeGeometry = new THREE.PlaneBufferGeometry( 250, 250 );
    planeGeometry.rotateX( - Math.PI / 2 );
    var planeMaterial = new THREE.ShadowMaterial( { opacity: 0.2 } );

    var floor = new THREE.Mesh( planeGeometry, planeMaterial );
    floor.position.y = -1;
    floor.receiveShadow = true;

    // FLOOR HELPER
    var helper = new THREE.GridHelper( 250, 250 );
    helper.material.opacity = 0.25;
    helper.material.transparent = true;

    // MODELS
    // THE RAMP
    var mesh = new Triangle3D(); 
    mesh.scale.set(100, 50, 1.);

    box = new THREE.Box3().setFromObject( mesh );
    triangle3dsize = new THREE.Vector3();
    box.getSize(triangle3dsize);
    //mesh.position.y = size.y / 2.;
    angle = getAngle(triangle3dsize.y, triangle3dsize.x)
    accel = getVariables(2, 0.3, angle);
    console.log(box)


    // CUBE
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({wireframe: true, color: "black"});
    cube = new THREE.Mesh(geometry, material);
    cube.position.set(box.min.x, box.max.y + 0.7, 0);
    cube.rotation.z = -(angle);
    
    // THREE js Axes Helper (for global scene)
    var axesHelper = new THREE.AxesHelper(4);

    // Axes Class Object (for a specific object)
    axesHelperLocal = new Axes(cube);

    // SCENEGRAPH
    scene = new THREE.Scene();  
    scene.add(floor);
    scene.add(cube);    // CUBO   
    scene.add(mesh);
    scene.add(axesHelperLocal);
    scene.add(axesHelper);
    scene.add( helper );

    // CAMERA
    //camera = new THREE.OrthographicCamera(  );
    camera = new THREE.PerspectiveCamera(60., canvas.width / canvas.height, 0.01, 10000.);  // CAMERA
    camera.position.set(0., 0, 80.);         
 
    var controls = new THREE.OrbitControls(camera, canvas);   
    scene.add(camera);  

    // LIGHTS
    light = new THREE.AmbientLight();  
    scene.add(light); 
                               
    // EVENT-HANDLERS
    window.addEventListener('resize', resizeWindow, false);

    clock.start();
    // ACTION
    requestAnimationFrame(renderLoop);           
}




