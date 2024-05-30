import { OWNode } from "./Node";
import { locator } from "./app";
import { JSONObject } from "./compat";

export class QuantumNode extends OWNode
{
	constructor(name: string, nodeJSON: JSONObject)
	{
		super(name, nodeJSON);
	}

	updateQuantumStatus(quantumState: number): void
	{
		const visible: boolean = this._nodeJSONObj.getInt("quantum location") == quantumState;
		this.setVisible(visible);

		// hide connections
		if (!visible)
		{
			for (const connection of this._connections.values()) 
		    {
		    	connection.setVisible(visible);
		    }
		}
	}

	allowQuantumEntanglement(): boolean
	{
		return this._nodeJSONObj.getInt("quantum location") == locator.getQuantumMoonLocation() && this._nodeJSONObj.getBoolean("entanglement node", false);
	}
}