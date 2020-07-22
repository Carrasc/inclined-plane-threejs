// Resets the canvas dimensions to match window
function resizeWindow(event)
{   
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    engine.setSize(canvas.width, canvas.height);
    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();
}



