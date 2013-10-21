var cutsceneState = block.state.game._states['cutscene'];

//Get Quest Room
var room = block.getRandomRoom();
room.lockDoors();

console.log('Room:', room)

var pc = block.state.pc;

var victim = room.spawn("citizen", {
	'interact' : {
		'priority' : true
	}
});

var thief = block.market.spawn("lawbreaker", {
	ai: {
		region: block.market
	}
})

//Get citizen entity, initialize for interaction.
var citizen = megablock.state.getEntitiesWithTag('shopper')[0];
citizen.addComponent('interact',{}).register(megablock.state);

//Intro Cutscene with choice to continue.
var introCutscene = function(){
	var pc     = megablock.state.pc;
	var cutscene = new Cutscene(megablock.state.game._states['cutscene']);
	
	cutscene.addAction('entity.dialog',  {
            topic: '',
            dialog: [{
            			entity:'npc',
            			text: "Hey there. Are you new to dreddrl? Would you like a tutorial?",
            }],
            choices: [{
				topic: "Yes.",
				dialog: {entity:'npc', text: "Alright then here we go..."},
				postAction: "cutscene.result(true)",
				choices: [{
					dialog:[{entity: 'npc', text:"Right now we are standing on the first floor of this Megablock. Each megablock is over 150 stories tall and occupy an entire city block.\nCrime is rampent in these megablocks, and it is your responsibility to bring judgement to the people and cleanup the streets.\nLet me introduce you to some people who could use your help.\nGo to the marked room and we will get started. (Use the [Arrow Keys] to navigate.)"}]
				}]
			},{
				topic: "No.",
				dialog: {entity: 'npc', text: "Goodbye."},
				postAction: "cutscene.end(false)"
			}]			
    });
    cutscene.addAction('entity.set', citizen, 'interact.priority', false);
    cutscene.addAction('camera.pan', room.doors[0]);
    cutscene.addAction('room.highlight', room, true);
    cutscene.addAction('camera.wait', 1000);
    cutscene.addAction('camera.pan', pc);
    cutscene.addAction('entity.set',citizen,'ai.behaviour', 'follow', pc);
    cutscene.addAction('entity.set', citizen, 'interact.enabled', false);
    console.log('PC:', pc)
    return cutscene.play();
}

var interactionCutscene = function(){
	var cutscene = new Cutscene(cutsceneState);
	cutscene.addAction('entity.dialog', {
		topic: '',
		dialog: [{
			entity: 'npc',
			text: "So as you may have noticed by now. When an object is highlighted in green, you can interact with it using the arrow keys.\nHowever this door has a red highlight, that's because it's locked. If you have a key you can unlock the door using [X]. Go ahead and open the door."
		}]
	});
	return cutscene.play();
}

var meetVictimCutscene = function(){
	var cutscene = new Cutscene(cutsceneState);
	cutscene.addAction('entity.dialog', {
		topic: '',
		dialog: [{
			entity: 'npc',
			text: "Great. Follow me inside, and we can meet the victims."
		}]
	})
	cutscene.addAction('entity.navigate', citizen, room);
	cutscene.addAction('entity.navigate', pc, room);
	cutscene.addAction('entity.dialog', {
		topic: '',
		dialog: [{
			entity: 'Victim',
			text: "Judge. I need your help. A spacer stole my purse earlier, he's somewhere in the market. Can you get back my stolen money?"
		},{
			entity: 'Judge',
			text: "Justice must be served."
		},{
			entity: 'Victim',
			text: "Thank you. Thank you so much."
		},{
			entity: 'Tutor',
			text: "Judge let's go to the market to find the perp."
		}]
	});
	return cutscene.play();
}

var arriveMarketCutscene = function(){
	var pc = block.state.pc;
	var cutscene = new Cutscene(cutsceneState);
	cutscene.addAction('entity.set', thief, 'highlight.color', 'red');
	cutscene.addAction('entity.event', thief, 'highlight.on');
	cutscene.addAction('entity.dialog', {
		topic: '',
		dialog: [{
			entity: 'Tutor',
			text: "I've marked the theif in red.\nYou can use your lawgiver to kill him, and recover the stolen goods.\nPress [Space Bar] to fire your sidearm."
		}]
	});
	return cutscene.play();
}

var recoverCutscene = function(){
	var pc = block.state.pc;
	var cutscene = new Cutscene(cutsceneState);
	cutscene.addAction('entity.dialog', {
		topic: '',
		dialog: [{
			entity: 'Tutor',
			text: "Great let's go return this stuff to the victim and you'll be all set."
		}]
	});
	cutscene.addAction('entity.set', victim, 'interact.enabled', true);
	return cutscene.play();
}

var completeCutscene = function(){
	var pc = block.state.pc;
	var cutscene = new Cutscene(cutsceneState);
	cutscene.addAction('entity.dialog', {
		topic: '',
		dialog: [{
			entity: 'Victim',
			text: "Thank you so much for returning my things. It's nice to know there is a judge around for protection around."
		},{
			entity: 'Tutor',
			text: "After completing a mission. You will receive something for your trouble.\nYou will always get XP, and usually get some money and health. Sometimes you will even get new items.\nNow go dispense justice.\nAnd don't worry you will see more of me as the you unlock new features."
		}]
	});
	cutscene.addAction('entity.set', citizen, 'interact.enabled', false);
	cutscene.addAction('entity.set', victim, 'interact.enabled', false);
	cutscene.addAction('entity.set', citizen, 'ai.behaviour', 'idle');
	return cutscene.play();
}

//First interaction.
var createMission = function(){
	var pc = block.state.pc;
	citizen.set('interact.priority', true);
	
	var interaction = whenEntityEvent(citizen, 'interact')().
						then(introCutscene).
						then(whenEntityEvent(room.doors[0],'focus.gain')).
						then(interactionCutscene).
						then(whenEntityEvent(room.doors[0],'open')).
						then(meetVictimCutscene).
						then(whenRegionEnter(pc, block.market)).
						then(arriveMarketCutscene).
						then(whenEntityEvent(thief, 'entity.kill')).
						then(recoverCutscene).
						then(whenEntityEvent(victim, 'interact')).
						then(completeCutscene);
}
createMission();
