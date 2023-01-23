var previousTime;

function loop(time) {
    if (previousTime == undefined) {
        previousTime = time;
    }
    const elapsed = time - previousTime;
    screenPos += elapsed;
    ctx.translate(elapsed, 0);
    
    ctx.clearRect(0, 0, w, h);

    for (var b of backgrounds) {
        b.draw();
    }
    requestAnimationFrame(loop);
}