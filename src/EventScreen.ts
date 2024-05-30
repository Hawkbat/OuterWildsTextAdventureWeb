import { Button } from "./Button";
import { DatabaseObserver } from "./DatabaseScreen";
import { Message } from "./GlobalMessenger";
import { Clue } from "./PlayerData";
import { OWScreen } from "./Screen";
import { EndScreen } from "./TitleScreen";
import { feed, timeLoop, gameManager, playerData, messenger, locator, mediumFontData } from "./app";

export abstract class EventScreen extends OWScreen implements DatabaseObserver
{
	static BOX_WIDTH: number = 700;
	static BOX_HEIGHT: number = 400;

	_nextButton: Button;
	_databaseButton: Button;

	constructor()
	{
		super()
		this.overlay = true; // continue to render BG
		this.initButtons();
	}

	initButtons(): void
	{
		this.addButtonToToolbar(this._nextButton = new Button("Continue", 0, 0, 150, 50));
	}

	addDatabaseButton(): void
	{
		this.addButtonToToolbar(this._databaseButton = new Button("Use Database", 0, 0, 150, 50));
	}

	addContinueButton(): void
	{
		this.addButtonToToolbar(this._nextButton = new Button("Continue", 0, 0, 150, 50));
	}

	update(): void{}

	renderBackground(): void {}

	render(): void
	{
		push();
		translate(width/2 - EventScreen.BOX_WIDTH/2, height/2 - EventScreen.BOX_HEIGHT/2);

			stroke(0, 0, 100);
			fill(0, 0, 0);
			rectMode(CORNER);
			rect(0, 0, EventScreen.BOX_WIDTH, EventScreen.BOX_HEIGHT);

			fill(0, 0, 100);

		    textFont(mediumFontData);
		    textSize(18);
			textAlign(LEFT, TOP);
			text(this.getDisplayText(), 10, 10, EventScreen.BOX_WIDTH - 20, EventScreen.BOX_HEIGHT - 20);

		pop();

		feed.render();
		timeLoop.renderTimer();
	}

	onButtonUp(button: Button): void
	{
	    if (button == this._nextButton)
	    {
	    	this.onContinue();
	    }
	    else if (button == this._databaseButton)
	    {
			gameManager.pushScreen(gameManager.databaseScreen);
			gameManager.databaseScreen.setObserver(this);
	    }
	}

	onInvokeClue(clue: Clue): void {}

	abstract getDisplayText(): string;

	abstract onContinue(): void;

	onEnter(): void{}

	onExit(): void{}
}

export class DeathByAnglerfishScreen extends EventScreen
{
	onEnter(): void
	{
		feed.clear();
		feed.publish("you are eaten by an anglerfish", true);
	}

	getDisplayText(): string
	{
		return "As you fly towards the shining light, you realize it's actually the lure of a huge anglerfish!\n\nYou try to turn around, but it's too late - the anglerfish devours you in a single bite.\n\nThe world goes black...";
	}

	onContinue(): void
	{
		playerData.killPlayer();
	}
}

export class DiveAttemptScreen extends EventScreen
{
	onEnter(): void
	{
		feed.clear();
		feed.publish("you try to dive underwater", true);
	}

	getDisplayText(): string
	{
		return "You try to dive underwater, but a strong surface current prevents you from submerging more than a few hundred meters.";
	}

	onContinue(): void
	{
		gameManager.popScreen();
	}
}

export class TeleportScreen extends EventScreen
{
	_text: string;
	_destination: string;

	constructor(teleportText: string, destination: string)
	{
		super()
		this._text = teleportText;
		this._destination = destination;
	}

	onExit(): void
	{
		feed.clear();
		feed.publish("you are teleported to a new location", true);
	}

	getDisplayText(): string
	{
		return this._text;
	}

	onContinue(): void
	{
		gameManager.popScreen();
		messenger.sendMessage(new Message("teleport to", this._destination));
	}
}

export class MoveToScreen extends EventScreen
{
	_text: string;
	_destination: string;

	constructor(moveText: string, destination: string)
	{
		super()
		this._text = moveText;
		this._destination = destination;
	}

	getDisplayText(): string
	{
		return this._text;
	}

	onContinue(): void
	{
		gameManager.popScreen();
		messenger.sendMessage(new Message("move to", this._destination));
	}
}

export class SectorArrivalScreen extends EventScreen
{
	_arrivalText: string;
	_sectorName: string;

	constructor(arrivalText: string, sectorName: string)
	{
		super()
		this._arrivalText = arrivalText;
		this._sectorName = sectorName;
	}

	onEnter(): void
	{
		feed.clear();
		feed.publish("you arrive at " + this._sectorName);
	}

	getDisplayText(): string
	{
		return this._arrivalText;
	}

	onContinue(): void
	{
		gameManager.popScreen();
	}
}

export class QuantumArrivalScreen extends EventScreen
{
	_screenIndex: number = 0;
	_photoTaken: boolean = false;

	initButtons(): void
	{
		this.addDatabaseButton();
		this.addContinueButton();
	}

	getDisplayText(): string
	{
		if (this._screenIndex == 0)
		{
			if (!this._photoTaken)
			{
				return "As you approach the Quantum Moon, a strange mist starts to obscure your vision...";
			}
			else
			{
				return "You use your probe to take a snapshot of the moon mere moments before it's utterly obscured by the encroaching mist.";
			}
		}
		else if (this._screenIndex == 1)
		{
			if (!this._photoTaken)
			{
				return "The mist completely engulfs your ship, then dissipates as suddenly as it appeared.\n\nYou scan your surroundings, but the Quantum Moon has mysteriously vanished.";
			}
			else
			{
				return "You plunge into the mist, making sure to keep an eye on the photo you took just moments before.\n\nSuddenly a huge shape materializes out of the mist...you've made it to the surface of the Quantum Moon!";
			}
		}
		return "";
	}

	onInvokeClue(clue: Clue): void
	{
		if (clue.id === "QM_1")
		{
			gameManager.popScreen();
			this._photoTaken = true;
			this._databaseButton.enabled = false;
		}
		else
		{
			feed.publish("that doesn't help you right now", true);
		}
	}

	onContinue(): void
	{
		this._screenIndex++;

		this._databaseButton.enabled = false;

		if (this._screenIndex > 1)
		{
			if (!this._photoTaken)
			{
				gameManager.popScreen();
				messenger.sendMessage("quantum moon vanished");
			}
			else
			{
				gameManager.popScreen();
			}
		}
	}
}

export class QuantumEntanglementScreen extends EventScreen
{
	_displayText: string;

	constructor()
	{
		super()
		if (locator.player.currentSector.getName() === "Quantum Moon")
		{
			this._displayText = "You turn off your flashlight and the world becomes pitch black.\n\nWhen you turn the flashlight back on, your surroundings have changed...";
		}
		else
		{
			this._displayText = "You climb on top of the quantum rock and turn off your flashlight. It's so dark you can't even see your hand in front of your face.\n\nWhen you turn the flashlight back on, you're still standing on top of the quantum rock, but your surrounding have changed...";
		}
	}

	onEnter(): void
	{
		feed.clear();
		feed.publish("you become entangled with the quantum object");
	}

	getDisplayText(): string
	{
		return this._displayText;
	}

	onContinue(): void
	{
		gameManager.popScreen();
	}
}

export class FollowTheVineScreen extends EventScreen
{
	_screenIndex: number = 0;
	_silentRunning: boolean = false;

	initButtons(): void
	{
		this.addDatabaseButton();
		this.addContinueButton();
	}

	getDisplayText(): string
	{
		if (this._screenIndex == 0)
		{
			return "You launch your probe at one of the strangely-bluish flowers and it is promptly ingested. You follow your probe's tracking signal as the vine's vascular system carries it deep into the heart of Dark Bramble.\n\nYou're so focused on following the probe's signal, you don't notice the glowing lures until it's too late. You've flown straight into a nest of anglerfish!";
		}
		else if (this._screenIndex == 1)
		{
			if (!this._silentRunning)
			{
				return "You reverse your thrusters, but it's too late. The anglerfish lunge with terrifying speed and devour your spacecraft whole.";
			}
			else
			{
				return "Suddenly remembering the rules to an ancient children's game, you switch off your engines and silently drift into the nest.\n\nNone of the anglerfish seem to notice, and you safely reach the other side. You resume following the probe's signal, and it's not long before you reach an ancient derelict tangled in the roots of Dark Bramble.";
			}
		}
		return "";
	}

	onButtonUp(button: Button): void
	{
	    if (button == this._nextButton)
	    {
	    	this.onContinue();
	    }
	    else if (button == this._databaseButton)
	    {
			gameManager.pushScreen(gameManager.databaseScreen);
			gameManager.databaseScreen.setObserver(this);
	    }
	}

	onInvokeClue(clue: Clue): void
	{
		if (clue.id === "D_2")
		{
			gameManager.popScreen();
			this._silentRunning = true;
			this._screenIndex++;
			this._databaseButton.enabled = false;
		}
		else
		{
			feed.publish("that doesn't help you right now", true);
		}
	}

	onContinue(): void
	{
		this._screenIndex++;
		this._databaseButton.enabled = false;

		if (this._screenIndex > 1)
		{
			if (!this._silentRunning)
			{
				gameManager.popScreen();
				playerData.killPlayer();
			}
			else
			{
				gameManager.popScreen();
				messenger.sendMessage(new Message("move to", "Ancient Vessel"));
			}
		}
	}
}

export class AncientVesselScreen extends EventScreen
{
	_warpButton: Button;
	_displayText: string;

	constructor()
	{
		super();
		this._displayText = "You explore the derelict and eventually find the bridge. Although the ship's life support systems are dead, a few computer terminals are still running on some sort of auxiliary power. You find records of the original signal the Nomai received from the Eye of the Universe. According to their analysis, whatever the signal came from must be older than the Universe itself!\n\nYou poke around a bit more and discover that the ship's warp drive finished recharging a few hundred years ago.";
	}

	initButtons(): void
	{
		this.addButtonToToolbar(this._warpButton = new Button("Use Warp Drive", 0, 0, 150, 50));
		super.initButtons();
	}

	getDisplayText(): string
	{
		return this._displayText;
	}

	onButtonUp(button: Button): void
	{
	    if (button == this._warpButton)
	    {
	    	if (playerData.knowsSignalCoordinates())
	    	{
	    		if (!timeLoop.getEnabled())
	    		{
	    			gameManager.popScreen();
	    			messenger.sendMessage(new Message("teleport to", "Ancient Vessel 2"));
	    			feed.clear();
	    			feed.publish("the ancient vessel warps to the coordinates of the Eye of the Universe");
	    		}
	    		else
	    		{
	    			this._displayText = "You input the coordinates to the Eye of the Universe and try to use the warp drive, but it refuses to activate due to the presence of a 'massive temporal distortion'.";
	    		}
	    	}
	    	else
	    	{
	    		this._displayText = "You try to use the warp drive, but apparently it won't activate without destination coordinates.";
	    	}
	    }
	    else if (button == this._nextButton)
	    {
			this.onContinue();
	    }
	}

	onContinue(): void
	{
		gameManager.popScreen();
	}
}

export class TimeLoopCentralScreen extends EventScreen
{
	_screenIndex: number = 0;
	_yes: Button;
	_no: Button;

	initButtons(): void
	{
		this.addContinueButton();
	}

	getDisplayText(): string
	{
		if (this._screenIndex == 0)
		{
			return "You're inside a huge spherical chamber at the center of the sandy Hourglass Twin. The two giant antennae you saw outside extend below the surface and converge within an elaborate coil-like piece of Nomai technology at the center of the chamber. This must be the source of the time loop!\n\nYou discover a transmitter that automatically tells the Nomai space station in orbit around Giant's Deep to launch a probe at the start of each loop.\n\nThe time loop machine requires the energy from a supernova to alter the flow of time. The Nomai tried to artificially make the sun go supernova thousands of years ago, but their attempts were unsuccessful.";
		}

		return "You eventually find a way to the center of the chamber and find what looks like the interface to the Time Loop Machine.\n\nDo you want to disable the time loop?";
	}

	onButtonUp(button: Button): void
	{
		super.onButtonUp(button);
		
		if (button == this._yes)
		{
			messenger.sendMessage("disable time loop");
			gameManager.popScreen();
		}
		else if (button == this._no)
		{
			gameManager.popScreen();
		}
	}

	onContinue(): void
	{
		this._screenIndex++;
		this.removeButtonFromToolbar(this._nextButton);
		this.addButtonToToolbar(this._yes = new Button("Yes"));
		this.addButtonToToolbar(this._no = new Button("No"));
	}
}

export class EyeOfTheUniverseScreen extends EventScreen
{
	_screenIndex: number = 0;

	getDisplayText(): string
	{
		if (this._screenIndex == 0)
		{
			return "As you apprach the strange energy cloud surrounding the Eye of the Universe, you see the last few stars die in the distance. The Universe has become a pitch black of: void nothingness.\n\nThe cloud dissipates as you reach its center, revealing a strange spherical object floating in space. Beneath its shimmering surface you see billions of tiny lights. As you get closer, you realize these lights resemble clusters of stars and galaxies. Every time you look away from the sphere and back again, the configuration of stars and galaxies changes.\n\nYou fire your jetpack thrusters and move into the sphere itself...";
		}

		return "For the briefest moment you find yourself floating in a sea of stars and galaxies. Suddenly all of the stars collapse into a single point of light directly in front of you. Nothing happens for several seconds, then the point of light explodes outwards in a spectacular burst of energy. The shockwave slams into you and sends you careening away into space.\n\nYour life-support systems are failing, but you watch as energy and matter are spewed into space in all directions.\n\nAfter a while, your vision fades to black.";
	}

	onContinue(): void
	{
		this._screenIndex++;

		if (this._screenIndex == 2)
		{
			gameManager._solarSystem.player.currentSector = null;
			gameManager.pushScreen(new EndScreen());
		}
	}
}

export class BrambleOutskirtsScreen extends EventScreen
{
	_screenIndex: number = 0;
	_yes: Button;
	_no: Button;

	initButtons(): void
	{
		this.addDatabaseButton();
		this.addButtonToToolbar(this._yes = new Button("Yes"));
		this.addButtonToToolbar(this._no = new Button("No"));
	}

	getDisplayText(): string
	{
		if (this._screenIndex == 0)
		{
			return "You explore the outer perimeter of Dark Bramble, where the tips of its thorny vines end in massive alien-looking white flowers (along with a few bluish ones).\n\nYou notice a small opening near the center of each flower...do you want to move in for a closer look?";
		}

		return "As you approach, the flower opens and a strange force starts to pull you in. You desperately try to escape, but it's no use.\n\nYou are unceremoniously devoured by a giant space flower. You can hear yourself being digested as the world goes black...";
	}

	onButtonUp(button: Button): void
	{
		super.onButtonUp(button);
		
		if (button == this._yes)
		{
			this._screenIndex++;
			this.removeButtonFromToolbar(this._yes);
			this.removeButtonFromToolbar(this._no);
			this.removeButtonFromToolbar(this._databaseButton);
			this.addContinueButton();
		}
		else if (button == this._no)
		{
			gameManager.popScreen();
		}
	}

	onInvokeClue(clue: Clue): void
	{
		if (clue.id === "D_3")
		{
			gameManager.popScreen();
			messenger.sendMessage("follow the vine");
		}
		else
		{
			feed.publish("that doesn't help you right now", true);
		}
	}

	onContinue(): void
	{
		playerData.killPlayer();
	}
}