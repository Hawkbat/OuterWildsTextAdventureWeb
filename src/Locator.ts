import { Actor } from "./Entity";
import { QuantumMoon } from "./SectorLibrary";
import { gameManager } from "./app";

export class Locator
{
	player: Actor;
	ship: Actor;

	_quantumSector: QuantumMoon;

	constructor()
	{
		this.player = gameManager._solarSystem.player;
		this.ship = gameManager._solarSystem.ship;
		this._quantumSector = gameManager._solarSystem.quantumMoon as QuantumMoon;
	}

	getQuantumMoonLocation(): number
	{
		return this._quantumSector.getQuantumLocation();
	}
}