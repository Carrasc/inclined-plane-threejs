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

function sliderBaseListener()
{
    ramp.scale.x = guiControls.base;
    
    box = new THREE.Box3().setFromObject( ramp );
    var test = new THREE.Vector3();
    box.getSize(test);

    // With the height and the base, we get the angle and the distance
    angle = getAngle(test.y, test.x);
    ramp.updateTextureRepeat();
    
    // Update the cube position
    cube.position.set(box.min.x + (0.5*Math.sin(angle)), box.max.y + (0.5*Math.cos(angle)), 0); 
    cube.rotation.z = -(angle);

    // Compute the simulation given the mass, roz coeficient and angle 
    accel = getVariables(angle);
    guiControls.angle = (180/Math.PI)*angle;

    // Update the text values in the HTML
    updateVariableTexts();

    // Update camera fpv
    cameraFirstPerson.position.set(box.min.x + (0.5*Math.sin(angle)), box.max.y + (0.5*Math.cos(angle)), 0); 
    cameraFirstPerson.lookAt(0,5,0);

    // Update camera ortho
    if ((test.x <= 20 && test.y <= 40) || (test.y <= 20 && test.x <= 40))
        cameraOrtho.zoom = 10;  
    else if ((test.x > 20 && test.x < 70) && (test.y > 20 && test.y < 70))
        cameraOrtho.zoom = 6.5; 
    else if (test.x >= 120 || test.y >= 120)
        cameraOrtho.zoom = 3; 
    else {
        cameraOrtho.zoom = 4; 
    }
}

function sliderHeightListener()
{
    ramp.scale.y = guiControls.height;

    box = new THREE.Box3().setFromObject( ramp );
    var test = new THREE.Vector3();
    box.getSize(test);

    // Move the floor to match the ramp
    floor.position.y = -test.y / 2 - .1;
    floorHelper.position.y = -test.y / 2;

    // With the height and the base, we get the angle and the distance
    angle = getAngle(test.y, test.x);
    guiControls.angle = (180/Math.PI)*angle;

    // Update the cube position
    cube.position.set(box.min.x + (0.5*Math.sin(angle)), box.max.y + (0.5*Math.cos(angle)), 0);
    cube.rotation.z = -(angle);

    // Compute the simulation given the mass, roz coeficient and angle 
    accel = getVariables(angle);

    // Update the text values in the HTML
    updateVariableTexts();

    // Update camera fpv
    cameraFirstPerson.position.set(box.min.x + (0.5*Math.sin(angle)), box.max.y + (0.5*Math.cos(angle)), 0);
    cameraFirstPerson.lookAt(0,5,0); 

    // Update camera ortho
    if ((test.x <= 20 && test.y <= 40) || (test.y <= 20 && test.x <= 40))
        cameraOrtho.zoom = 10;  
    else if ((test.x > 20 && test.x < 70) && (test.y > 20 && test.y < 70))
        cameraOrtho.zoom = 6.5; 
    else if (test.x >= 120 || test.y >= 120)
        cameraOrtho.zoom = 3; 
    else {
        cameraOrtho.zoom = 4; 
    }
}

function sliderAngleListener()
{
    var test = new THREE.Vector3();
    box.getSize(test);

    angle = (Math.PI/180*guiControls.angle);
    var newHeight = test.x * Math.tan(angle);
    ramp.scale.y = newHeight;
    guiControls.height = newHeight;

    box = new THREE.Box3().setFromObject( ramp );
    var test = new THREE.Vector3();
    box.getSize(test);

    // Move the floor to match the ramp
    floor.position.y = -test.y / 2 - .1;
    floorHelper.position.y = -test.y / 2;

    // Update the cube position
    cube.position.set(box.min.x + (0.5*Math.sin(angle)), box.max.y + (0.5*Math.cos(angle)), 0);
    cube.rotation.z = -(angle);

    // Compute the simulation given the mass, roz coeficient and angle 
    accel = getVariables(angle);

    // Update the text values in the HTML
    updateVariableTexts();

    // Update camera fpv
    cameraFirstPerson.position.set(box.min.x + (0.5*Math.sin(angle)), box.max.y + (0.5*Math.cos(angle)), 0);
    cameraFirstPerson.lookAt(0,5,0); 

    // Update camera ortho
    if ((test.x <= 20 && test.y <= 40) || (test.y <= 20 && test.x <= 40))
        cameraOrtho.zoom = 10;  
    else if ((test.x > 20 && test.x < 70) && (test.y > 20 && test.y < 70))
        cameraOrtho.zoom = 6.5; 
    else if (test.x >= 120 || test.y >= 120)
        cameraOrtho.zoom = 3; 
    else {
        cameraOrtho.zoom = 4; 
    }
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
    cube.position.set(box.min.x + (0.5*Math.sin(angle)), box.max.y + (0.5*Math.cos(angle)), 0);
    cube.rotation.z = -(angle);

    // Update camera fpv
    cameraFirstPerson.position.set(box.min.x + (0.5*Math.sin(angle)), box.max.y + (0.5*Math.cos(angle)), 0); 
    cameraFirstPerson.lookAt(0,5,0);

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