// Resets the canvas dimensions to match window
function resizeWindow(event)
{   
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    engine.setSize(canvas.width, canvas.height);
    if(!multiview)
    {
        // OBSERVER  CAMERA
        cameraPerspective.aspect = canvas.width / canvas.height;
        cameraPerspective.updateProjectionMatrix();
    }
    else
    {
        // OBSERVER CAMERA
        cameraOrtho.aspect = canvas.width / 2. / canvas.height;
        cameraOrtho.updateProjectionMatrix();

        // ACTIVE CAMERA
        cameraFirstPerson.aspect = canvas.width / 2. / canvas.height;
        cameraFirstPerson.updateProjectionMatrix();
    }
}

function keyDownEventListener(event)
{ 
	if(event.keyCode == 32)	// Space bar
	{
		multiview = !multiview;
	}
}

const updateZoomOrtho = () => {
    if ((guiControls.base <= 20 && guiControls.height <= 40) || (guiControls.height <= 20 && guiControls.base <= 40))
        cameraOrtho.zoom = 10;  
    else if ((guiControls.base > 20 && guiControls.base < 70) && (guiControls.height > 20 && guiControls.height < 70))
        cameraOrtho.zoom = 6.5; 
    else if (guiControls.base >= 120 || guiControls.height >= 120)
        cameraOrtho.zoom = 3; 
    else {
        cameraOrtho.zoom = 4; 
    }
}

const updateCubePosition = () =>{
    // Update the cube position
    cube.position.set((-guiControls.base/2) + (0.5*Math.sin(angle)), (guiControls.height/2) + (0.5*Math.cos(angle)), 0);
    cube.rotation.z = -(angle);

    // Update camera fpv (follows the cube)
    cameraFirstPerson.position.set((-guiControls.base/2) + (0.5*Math.sin(angle)), (guiControls.height/2) + (0.5*Math.cos(angle)), 0);
    cameraFirstPerson.lookAt(0,5,0); 
}

function sliderBaseListener()
{
    ramp.scale.x = guiControls.base;

    // With the height and the base, we get the angle and the distance
    angle = getAngle(guiControls.height, guiControls.base);
    
    // Update the cube 
    updateCubePosition();

    // Compute the simulation given the mass, roz coeficient and angle 
    accel = getVariables(angle);
    guiControls.angle = (180/Math.PI)*angle;

    // Update the text values in the HTML
    updateVariableTexts();

    // Update camera ortho
    updateZoomOrtho();
}

function sliderHeightListener()
{
    ramp.scale.y = guiControls.height;

    // Move the floor to match the ramp
    floor.position.y = -guiControls.height / 2 - .1;
    floorHelper.position.y = -guiControls.height / 2;

    // With the height and the base, we get the angle and the distance
    angle = getAngle(guiControls.height, guiControls.base);
    guiControls.angle = (180/Math.PI)*angle;

    // Update the cube position
    updateCubePosition();

    // Compute the simulation given the mass, roz coeficient and angle 
    accel = getVariables(angle);

    // Update the text values in the HTML
    updateVariableTexts();

    // Update camera ortho
    updateZoomOrtho();
}

function sliderAngleListener()
{
    angle = (Math.PI/180*guiControls.angle);
    var newHeight = guiControls.base * Math.tan(angle);
    ramp.scale.y = newHeight;
    guiControls.height = newHeight;
    console.log(guiControls.height);

    // Move the floor to match the ramp
    floor.position.y = -guiControls.height / 2 - .1;
    floorHelper.position.y = -guiControls.height / 2;

    // Update the cube position
    updateCubePosition();

    // Calculate the distance again, because since the height changes, so does the hipotenuse
    distance = Math.sqrt((guiControls.height*guiControls.height)+(guiControls.base*guiControls.base));

    // Compute the simulation given the mass, roz coeficient and angle 
    accel = getVariables(angle);

    // Update the text values in the HTML
    updateVariableTexts();

    // Update camera ortho
    updateZoomOrtho();
}

function sliderSpeedListener()
{
    initialSpeed = guiControls.initSpeed;

    // Compute the simulation given the mass, roz coeficient and angle 
    accel = getVariables(angle);

    // Update the text values in the HTML
    updateVariableTexts();
}

function sliderRozListener()
{
    roz = guiControls.roz;

    // Compute the simulation given the mass, roz coeficient and angle 
    accel = getVariables(angle);

    // Update the text values in the HTML
    updateVariableTexts();
}

function sliderMassListener()
{
    mass = guiControls.mass;

    // Compute the simulation given the mass, roz coeficient and angle 
    accel = getVariables(angle);

    // Update the text values in the HTML
    updateVariableTexts();
}

function startSimulation()
{
    start = true;
    pause = false;

    // Update the cube position
    updateCubePosition();

    pausedTime = 0;
    clock.start();
    positionalAudio.play();
}

function pauseSimulation()
{
    pause = !pause;
    if (pause)
        positionalAudio.pause();
    else
        positionalAudio.play();
}

function changeBg()
{
    skyboxActive = !skyboxActive;
    if (!skyboxActive)
    {
        scene.background = new THREE.Color(0.9411, 0.9411, 0.9411);
        ramp.material.envMap = null;
        cube.material.envMap = null;
    }
    else if (skyboxActive && !multiview)
    {
        scene.background = background;
        ramp.material.envMap = cubeCamera.renderTarget;
        cube.material.envMap = cubeCamera.renderTarget;
    }
}

function checkboxWireframeListener()
{
    cube.material.wireframe = guiControls.wireframe;
    ramp.material.wireframe = guiControls.wireframe;
}

function checkboxAxesListener()
{
    axesHelperLocal.visible = guiControls.axes;
}

function checkboxShadowsListener()
{
    pointLight.castShadow = guiControls.shadows;
}