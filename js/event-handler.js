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

    // Update the cube position
    cube.position.set(box.min.x, box.max.y + 0.7, 0);
    cube.rotation.z = -(angle);

    // With the height and the base, we get the angle and the distance
    angle = getAngle(test.y, test.x)

    // Update camera fpv
    cameraFirstPerson.position.set(box.min.x, box.max.y + 1, 0.); 
}

function sliderHeightListener()
{
    ramp.scale.y = guiControls.height;

    box = new THREE.Box3().setFromObject( ramp );
    var test = new THREE.Vector3();
    box.getSize(test);

    // Move the floor to match the ramp
    floor.position.y = -test.y / 2 - 1.;
    floorHelper.position.y = -test.y / 2;

    // Update the cube position
    cube.position.set(box.min.x, box.max.y + 0.7, 0);
    cube.rotation.z = -(angle);

    // With the height and the base, we get the angle and the distance
    angle = getAngle(test.y, test.x)

    // Update camera fpv
    cameraFirstPerson.position.set(box.min.x + 0.1, box.max.y, 0.);  
}

function startSimulation()
{
    start = true;
    pause = false;

    // Update the cube position
    cube.position.set(box.min.x, box.max.y + 0.7, 0);
    cube.rotation.z = -(angle);

    // Update camera fpv
    cameraFirstPerson.position.set(box.min.x + 0.1, box.max.y, 0.);  

    // Compute the simulation given the mass, roz coeficient and angle 
    accel = getVariables(2, 0.3, angle);

    pausedTime = 0;
    clock.start();
}

function pauseSimulation()
{
    pause = !pause;
}



