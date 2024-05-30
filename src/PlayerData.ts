import { Frequency, Curiosity } from "./Enums";
import { GlobalObserver, Message } from "./GlobalMessenger";
import { START_WITH_LAUNCH_CODES, START_WITH_COORDINATES, START_WITH_SIGNALS, messenger, feed, locator, gameManager, START_WITH_CLUES, frequencyToString } from "./app";

export class PlayerData implements GlobalObserver
{
	_knowsLaunchCodes: boolean;
	_knowsSignalCoordinates: boolean;

	_clueList: Clue[];
	_knownFrequencies: Frequency[];

	_knownClueCount: number = 0;

	// resets every loop
	_isDead: boolean = false;

	constructor()
	{
		this._knowsLaunchCodes = START_WITH_LAUNCH_CODES;
		this._knowsSignalCoordinates = START_WITH_COORDINATES;

		this._clueList = new Array<Clue>();
		this._knownFrequencies = new Array<Frequency>();
		this._knownFrequencies.push(Frequency.TRAVELER);

		if (START_WITH_SIGNALS)
		{ 
			this._knownFrequencies.push(Frequency.BEACON);
			this._knownFrequencies.push(Frequency.QUANTUM);
		}

		this._clueList.push(new Clue(Curiosity.ANCIENT_PROBE_LAUNCHER, "APL_1", "Sunken Module", "The data-collection module broke off from the Nomai probe launcher and fell into the center of Giant's Deep."));
		this._clueList.push(new Clue(Curiosity.ANCIENT_PROBE_LAUNCHER, "APL_2", "Rogue Tornadoes", "While most tornadoes on Giant's Deep have upward-moving winds, the tornadoes that rotate counterclockwise have strong downward winds."));
		this._clueList.push(new Clue(Curiosity.ANCIENT_PROBE_LAUNCHER, "APL_3", "Jellyfish", "The jellyfish on Giant's Deep have a hollow body cavity just big enough to fit a person."));

		this._clueList.push(new Clue(Curiosity.QUANTUM_MOON, "QM_3", "The 5th Location", "The Quantum Moon sometimes visits a 5th location outside the Solar System."));
		this._clueList.push(new Clue(Curiosity.QUANTUM_MOON, "QM_1", "Quantum Snapshot", "Observing an image of a quantum object prevents it from moving just as effectively as directly observing the object itself."));
		this._clueList.push(new Clue(Curiosity.QUANTUM_MOON, "QM_2", "Quantum Entanglement", "Ordinary objects in close proximity to a quantum object can become 'entangled' with it and begin to exhibit quantum attributes.\n\nEven lifeforms can become entangled so long as they are unable to observe themselves or their surroundings."));

		this._clueList.push(new Clue(Curiosity.VESSEL, "D_1", "Lost Vessel", "The Nomai came to this Solar System in search of a mysterious signal they refer to as 'The Eye of the Universe'. The interstellar Vessel they traveled in is shipwrecked somewhere in Dark Bramble."));
		this._clueList.push(new Clue(Curiosity.VESSEL, "D_2", "Children's Game", "Nomai children played a game that reenacted their people's escape from Dark Bramble. According to the rules, three players (the escape pods) had to sneak past a blindfolded player (the anglerfish) without being heard."));
		this._clueList.push(new Clue(Curiosity.VESSEL, "D_3", "Tracking Device", "The Nomai Vessel crashed in the roots of Dark Bramble. The Nomai attempted to relocate the roots by inserting a tracking device into one of Dark Bramble's vines, but they were unable to penetrate the vine's tough exterior."));

		this._clueList.push(new Clue(Curiosity.TIME_LOOP_DEVICE, "TLD_1", "Time Machine", "After Nomai researchers created a small-but-functional time loop device on Giant's Deep, they made plans to construct a full-sized version on the Sandy Hourglass Twin (provided they could generate enough energy to power it)."));
		this._clueList.push(new Clue(Curiosity.TIME_LOOP_DEVICE, "TLD_2", "Warp Towers", "The Nomai created special towers that can warp anyone inside to a corresponding receiver platform. The towers only activate when you can see your destination through a slit in the top of the tower."));
		this._clueList.push(new Clue(Curiosity.TIME_LOOP_DEVICE, "TLD_3", "Construction Project", "The Nomai excavated the Sandy Hourglass Twin to construct an enormous machine designed to harness the energy from a supernova.\n\nThe control center is located inside a hollow cavity at the center of the planet, but it is completely sealed off from the surface.\n\n"));
	}

	init(): void
	{
		messenger.addObserver(this);
		this._isDead = false;
	}

	onReceiveGlobalMessage(message: Message): void
	{
		if (message.id === "learn launch codes" && !this._knowsLaunchCodes)
		{
			this._knowsLaunchCodes = true;
			feed.publish("learned launch codes", true);
			messenger.sendMessage("spawn ship");
		}
		else if (message.id === "learn signal coordinates" && !this._knowsSignalCoordinates)
		{
			this._knowsSignalCoordinates = true;
			feed.publish("learned signal coordinates", true);
		}
	}

	killPlayer(): void
	{
		this._isDead = true;
	}

	isPlayerDead(): boolean
	{
		return this._isDead;
	}

	isPlayerAtEOTU(): boolean
	{
		return ((locator.player.currentSector == gameManager._solarSystem.quantumMoon && locator.getQuantumMoonLocation() == 4) || locator.player.currentSector == gameManager._solarSystem.eyeOfTheUniverse);
	}

	knowsFrequency(frequency: Frequency): boolean
	{
		return this._knownFrequencies.includes(frequency);
	}

	knowsSignalCoordinates(): boolean
	{
		return this._knowsSignalCoordinates;
	}

	learnFrequency(frequency: Frequency): void
	{
		if (!this.knowsFrequency(frequency))
		{
			this._knownFrequencies.push(frequency);
			feed.publish("frequency identified: " + frequencyToString(frequency), true);
		}
	}

	getFrequencyCount(): number
	{
		return this._knownFrequencies.length;
	}

	knowsLaunchCodes(): boolean
	{
		return this._knowsLaunchCodes;
	}

	getClueAt(i: number): Clue
	{
		return this._clueList[i];
	}

	getClueCount(): number
	{
		return this._clueList.length;
	}

	getKnownClueCount(): number
	{
		return this._knownClueCount;
	}

	discoverClue(id: string): void
	{
		for (let i: number = 0; i < this._clueList.length; i++)
		{
			if (this._clueList[i].id === id && !this._clueList[i].discovered)
			{
				this._clueList[i].discovered = true;
				this._knownClueCount++;
				feed.publish("information added to database", true);
			}
		}
	}
}

export class Clue
{
	id: string;
	name: string;
	description: string;
	discovered: boolean;
	invoked: boolean = false;
	curiosity: Curiosity;

	constructor(curiosity: Curiosity, id: string, name: string, description: string)
	{
		this.curiosity = curiosity;
		this.id = id;
		this.name = name;
		this.description = description;
		this.discovered = false || START_WITH_CLUES;
	}
}