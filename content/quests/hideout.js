var hideoutMission = function(){
	var room = block.getRandomRoom();
	room.lockDoors();
	room.highlight(true);
	for (var i = 18 - 1; i >= 0; i--) {
		room.spawn('lawbreaker', {
			ai: {
				region: room
			}
		});
	};
}
hideoutMission();