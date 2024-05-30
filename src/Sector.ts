import { Actor, Entity } from "./Entity";
import { SectorArrivalScreen, QuantumEntanglementScreen } from "./EventScreen";
import { GlobalObserver, Message } from "./GlobalMessenger";
import { NodeObserver, OWNode, NodeButtonObserver } from "./Node";
import { NodeConnection } from "./NodeConnection";
import { Clue } from "./PlayerData";
import { SignalSource, Signal } from "./Telescope";
import { Vector2 } from "./Vector2";
import { messenger, gameManager, locator } from "./app";
import { JSONObject, loadJSONObject, JSONArray, saveJSONObject, println } from "./compat";

export class Sector implements NodeObserver, GlobalObserver
{
  _sectorRoot: Entity;

  _actors: Actor[];
  _nodes: OWNode[];
  _nodeConnections: NodeConnection[];
  
  _name: string = "unnamed";
  _JSONFilename: string;
  _sectorJSON: JSONObject;

  _skipArrivalScreen: boolean = false;
  
  orbitNode: OWNode;
  defaultActorPosition: Vector2 = new Vector2(width - 100, height - 100);
      
  constructor()
  {
    this._sectorRoot = new Entity(width/2, height/2);
    this._actors = new Array<Actor>();
    this._nodes = new Array<OWNode>();
    this._nodeConnections = new Array<NodeConnection>();

    this.orbitNode = new OWNode(80, 170); // screen space
    this.orbitNode.gravity = false;

    messenger.addObserver(this);
  }

  setAnchorOffset(offsetX: number, offsetY: number): void
  {
    this._sectorRoot.setPosition(width/2 + offsetX, height/2 + offsetY);
  }
  
  loadFromJSON(filename: string): void
  {
    this._JSONFilename = filename;
    this._sectorJSON = loadJSONObject(filename);
    
    /** LOAD NODES **/
    const nodes: JSONObject = this._sectorJSON.getJSONObject("Nodes");
    
    for (const nodeName of nodes.keys()) {
      this.addNode(this.createNode(nodeName, nodes.getJSONObject(nodeName)));
    }
    
    /** LOAD CONNECTIONS **/
    const connectionJSONArray: JSONArray = this._sectorJSON.getJSONArray("Connections");
    
    for (let i: number = 0; i < connectionJSONArray.size(); i++)
    {
      const connection: JSONObject = connectionJSONArray.getJSONObject(i);
      
      const node1: OWNode = this.getNode(connection.getString("Node 1"));
      const node2: OWNode = this.getNode(connection.getString("Node 2"));

      this._nodeConnections.push(new NodeConnection(node1, node2, connection));
    }
  }

  createNode(name: string, nodeObj: JSONObject): OWNode
  {
    return new OWNode(name, nodeObj);
  }

  saveSectorJSON(): void
  {
    saveJSONObject(this._sectorJSON, "data/" + this._JSONFilename);
    println("Sector JSON saved");
  }
  
  load(): void
  {
    // stub to override
  }
  
  drawSectorBackdrop(): void
  {
    // stub to override
  }

  onReceiveGlobalMessage(message: Message): void
  {
    if (message.id === "quantum entanglement")
    {
      this.onQuantumEntanglement();
    }
  }

  onNodeVisited(node: OWNode): void
  {
    this.updateNodeRanges(gameManager._solarSystem.isPlayerInShip(), node);
  }

  onArrival(): void
  {
    if (!this._skipArrivalScreen && this._sectorJSON.hasKey("Sector Arrival"))
    {
      this._skipArrivalScreen = true;
      gameManager.pushScreen(new SectorArrivalScreen(this._sectorJSON.getJSONObject("Sector Arrival").getString("text"), this.getName()));
    }
  }

  onQuantumEntanglement(): void
  {
    if (locator.player.currentSector == this)
    {
      gameManager.pushScreen(new QuantumEntanglementScreen());

      // teleport player
      for (let i: number = 0; i < this._nodes.length; i++)
      {
        if (this._nodes[i].allowQuantumEntanglement() && this._nodes[i] != locator.player.currentNode)
        {
          locator.player.setNode(this._nodes[i]);
          break;
        }
      }
    }
  }

  canClueBeInvoked(clue: Clue): boolean
  {
    return false;
  }

  // called from SectorScreen
  invokeClue(clue: Clue): void
  {
    // override in derrived class
  }

  // update whether each node is "in range" (i.e. selectable)
  updateNodeRanges(isPlayerInShip: boolean, playerNode: OWNode): void
  {
    for (let i: number = 0; i < this._nodes.length; i++)
    {
      this._nodes[i].updateInRange(isPlayerInShip, playerNode);
    }

    for (let i: number = 0; i < this._nodeConnections.length; i++)
    {
      this._nodeConnections[i].updateAdjacentToPlayer(playerNode);
    }
  }

  allowTelescope(): boolean {return true;}

  getName(): string
  {
    return this._name;
  }
  
  getNode(index: number): OWNode
  getNode(nodeID: string): OWNode
  getNode(indexOrID: number | string): OWNode
  {
    if (typeof indexOrID === 'number') {
      if (this._nodes[indexOrID])
      {
        return this._nodes[indexOrID];
      }
      println("No nodes at index " + indexOrID);
      return null;
    } else {
      for (let i: number = 0; i < this._nodes.length; i++)
      {
        if (this._nodes[i].getID() === indexOrID)
        {
          return this._nodes[i];
        }
      }
      return null;
    }
  }

  getSectorSignalSources(): SignalSource[]
  {
    const signalSources: SignalSource[] = new Array<SignalSource>();

    for (let i: number = 0; i < this._nodes.length; i++)
    {
      if (this._nodes[i].getSignal() != null)
      {
        signalSources.push(new SignalSource(this._nodes[i]));
      }
    }
    return signalSources;
  }

  getSectorSignals(): Signal[]
  {
    const nodeSignals: Signal[] = new Array<Signal>();

    for (let i: number = 0; i < this._nodes.length; i++)
    {
      if (this._nodes[i].getSignal() != null)
      {
        nodeSignals.push(this._nodes[i].getSignal());
      }
    }
    return nodeSignals;
  }
  
  addNodeButtonObserver(observer: NodeButtonObserver): void
  {
    for (let i: number = 0; i < this._nodes.length; i++)
    {
      this._nodes[i].addObserver(observer);
    }
  }
  
  removeAllNodeButtonObservers(): void
  {
    for (let i: number = 0; i < this._nodes.length; i++)
    {
      this._nodes[i].removeAllObservers();
    }
  }
  
  update(): void
  {
    for (let i: number = 0; i < this._nodes.length; i++)
    {
      this._nodes[i].update();
    }
    
    for (let i: number = 0; i < this._actors.length; i++)
    {
      this._actors[i].update();

      if (this._actors[i].isDead())
      {
        this.removeActor(this._actors[i]);
      }
    }
  }

  renderBackground(): void
  {
    push();
      translate(this._sectorRoot.position.x, this._sectorRoot.position.y);
      this.drawSectorBackdrop();
    pop();

    // draw letterbox
    fill(0, 0, 0);
    noStroke();
    rectMode(CORNER);
    rect(0, 0, width, 90);
    rect(0, height - 90, width, 90);
    rectMode(CENTER);
  }
  
  render(): void
  {
    for (let i: number = 0; i < this._nodeConnections.length; i++)
    {
      this._nodeConnections[i].render();
    }
    
    for (let i: number = 0; i < this._nodes.length; i++)
    {
      this._nodes[i].render();
    }
    
    for (let i: number = 0; i < this._actors.length; i++)
    {
      this._actors[i].render();
    }

    for (let i: number = 0; i < this._nodes.length; i++)
    {
      this._nodes[i].drawName();
    }
  }
  
  addNode(node: OWNode): void
  {
    if (!this._nodes.includes(node))
    {
      this._nodes.push(node);
      node.setNodeObserver(this);
      this._sectorRoot.addChild(node);
    }
    else
    {
      println("Node is already in this Sector!!!");
    }
  }
  
  removeNode(node: OWNode): void
  {
    if (this._nodes.includes(node))
    {
      this._nodes.splice(this._nodes.indexOf(node), 1);
      node.setNodeObserver(null);
      this._sectorRoot.removeChild(node);
    }
    else
    {
      println("Node is not in this Sector!!!");
    }
  }
  
  addActor(actor: Actor): void
  addActor(actor: Actor, nodeName: string): void
  addActor(actor: Actor, atNode: OWNode): void
  addActor(actor: Actor, nodeOrName?: OWNode | string): void
  {
    const atNode: OWNode | null = (nodeOrName instanceof OWNode ? nodeOrName : this.getNode(nodeOrName)) ?? null
    if (!this._actors.includes(actor))
    {
      actor.currentSector = this;

      this._actors.push(actor);
      this._sectorRoot.addChild(actor);
      
      if (atNode != null)
      {
        actor.setNode(atNode);
      }
      else
      {
        // spawn actor off-screen
        actor.setScreenPosition(this.orbitNode.screenPosition.sub(new Vector2(200, 0)));
        actor.moveToNode(this.orbitNode);
      }
    }
    else
    {
      println("Actor is already in this Sector!!!");
    }
  }
  
  removeActor(actor: Actor): void
  {
    if (this._actors.includes(actor))
    {
      actor.currentNode = null;
      actor.currentSector = null;
      actor.lastSector = this;
      this._actors.splice(this._actors.indexOf(actor), 1);
      this._sectorRoot.removeChild(actor);
    }
    else
    {
      println("Actor is not in this Sector!!!");
    }
  }
}