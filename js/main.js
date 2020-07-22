"use strict"
var canvas;
var engine;
var scene;
var camera;
var light;
var cube;
var axesHelperLocal;
var gravity = 9.8;
var accel;
var speed;
var clock = new THREE.Clock();
var delta;

function getVariables(mass, roz, angle)
{
    var P = mass * gravity;
    var Px = P * Math.sin(angle);
    var Py = P * Math.cos(angle);
    var N = Py;
    var Fr = roz * N;
    var sumF = Px - Fr;
    var accel = sumF / mass;

    return accel;
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
    delta = clock.getDelta();
    engine.render(scene, camera);
    if (clock.elapsedTime <= 4.79)
    {
        console.log();
        console.log("speed: ", speed, " at time: ", clock.elapsedTime)
        speed = (0 + accel)*clock.elapsedTime;

        cube.position.x += (speed*delta)*Math.cos(0.628319);
        cube.position.y -= (speed*delta)*Math.sin(0.628319);

        axesHelperLocal.update(clock.getDelta());
        //cube.rotation.y = cube.rotation.y + 0.01;
    }
    else 
    {
        clock.stop();
        console.log(clock.elapsedTime)
        console.log(cube.position)
    }
    update();
    requestAnimationFrame(renderLoop);
}

function main()
{ 
    
    accel = getVariables(0.27, 0.21, 0.628319);
    // CANVAS
    canvas = document.getElementById("canvas");

    // RENDERER ENGINE
    engine = new THREE.WebGLRenderer({canvas: canvas});
    engine.setSize(window.innerWidth, window.innerHeight);
    engine.setClearColor(new THREE.Color(0.2, 0.2, 0.35), 1.);   

    // FLOOR
    var floor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 100, 100), new THREE.MeshBasicMaterial({wireframe: true, color: "gray"})); 
    floor.rotation.set(-Math.PI / 2., 0., 0.);    

    // MODELS
    // CUBE
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({wireframe: true, color: "white"});
    cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, cube.geometry.parameters.height/2, 0);
    cube.rotateZ(0.628319);

    // PYRAMID
    var geometry = new THREE.ConeGeometry( 1, 1, 4 );
    var material = new THREE.MeshBasicMaterial({wireframe: true, color: "white"});
    var cone = new THREE.Mesh( geometry, material );
    cone.position.set(4, cone.geometry.parameters.height/2, 0);
    cone.geometry.rotateY(45 * Math.PI/180);
    cone.geometry.rotateZ(-90 * Math.PI/180);

    var pts = [
        //
        new THREE.Vector3(0, 0.5, 1),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(1, 0, 1),
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 0.5, 0),
    ];
    
    var geom = new THREE.BufferGeometry().setFromPoints(pts);
    geom.setIndex([
        0, 1, 2,
      0, 2, 3, 
      0, 3, 4,
      0, 4, 1,
      1, 3, 2,
      1, 4, 3,
      5, 1, 4,
      5, 0, 4,
      5, 2, 1
    ]);
    geom.computeVertexNormals();
    
    var mat = new THREE.MeshStandardMaterial({color: "white", wireframe: true});
    
    var mesh = new THREE.Mesh(geom, mat);

    // ArrowHelper
    var direction = new THREE.Vector3(0.5, 0.5, 0.5);
    var lenght = direction.length();
    var uDirection = direction.normalize(); // Gets the unitary vector 
    var origin = new THREE.Vector3(0,0,0);
    var color = "yellow";

    var ArrowHelper = new THREE.ArrowHelper(uDirection, origin, lenght, color);

    // THREE js Axes Helper (for global scene)
    var axesHelper = new THREE.AxesHelper(4);

    // Axes Class Object (for a specific object)
    axesHelperLocal = new Axes(cube);

    // SCENEGRAPH
    scene = new THREE.Scene();  
    scene.add(floor);
    scene.add(cube);    // CUBO   
    scene.add(mesh);
    scene.add(ArrowHelper); 
    scene.add(axesHelperLocal);
    scene.add(axesHelper);

    // CAMERA
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




