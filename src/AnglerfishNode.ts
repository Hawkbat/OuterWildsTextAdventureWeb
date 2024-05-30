import { OWNode } from "./Node";
import { messenger } from "./app";
import { JSONObject } from "./compat";

export class AnglerfishNode extends OWNode
{
	constructor(nodeName: string, nodeJSONObj: JSONObject)
	{
		super(nodeName, nodeJSONObj);
		this.entryPoint = true;
		this.shipAccess = true;
		this.gravity = false;

		this._visible = true;
	}

	getKnownName(): string
	{
		if (this._visited) return "Anglerfish";
		else return "???";
	} 

	getDescription(): string 
	{
		return "an enormous hungry-looking anglerfish";
	}

	getProbeDescription(): string 
	{
		return "a light shining through the fog";
	}

	hasDescription(): boolean {return true;}

	isProbeable(): boolean {return true;}

	isExplorable(): boolean {return true;} // tricks graphics into rendering question mark

	visit(): void
	{
		this._visited = true;
		this.setVisible(true);

		messenger.sendMessage("death by anglerfish");

		if (this._observer != null)
		{
			this._observer.onNodeVisited(this);
		}
	}
}