var sgt = gameState.getEntityWithTag('sgt');
var sgtOffice = gameState.getRegion('office.sgt');
var desk = gameState.getEntityWithTag('desk');

var welcomeCutscene = function(){
	var pc = gameState.pc;
	var cutscene = new Cutscene(cutsceneState);
	console.log(pc, sgt);
	cutscene.addAction('entity.navigate', sgt, pc);
	cutscene.addAction('camera.wait', 2000);
	cutscene.addAction('entity.navigate', sgt, desk);
	cutscene.addAction('room.close', sgtOffice);
	return cutscene.play();
}

setTimeout(function(){
	welcomeCutscene();
}, 2000);