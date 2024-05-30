import { ButtonObserver, Button } from "./Button";
import { Entity } from "./Entity";
import { ExploreData } from "./ExploreData";
import { GlobalObserver, Message } from "./GlobalMessenger";
import { NodeConnection } from "./NodeConnection";
import { Signal } from "./Telescope";
import { Vector2 } from "./Vector2";
import { messenger, EDIT_MODE, playerData, TEXT_SIZE } from "./app";
import { JSONObject, println } from "./compat";

export interface NodeButtonObserver
{
  onNodeSelected(node: OWNode): void;
  onNodeGainFocus(node: OWNode): void;
  onNodeLoseFocus(node: OWNode): void;
}

export interface NodeObserver
{
  onNodeVisited(node: OWNode): void;
}

export class OWNode extends Entity implements ButtonObserver, GlobalObserver
{
  /** NODE DATA **/
  _id: string = "";
  _name: string = "";
  
  entryPoint: boolean = false;
  shipAccess: boolean = false;
  allowTelescope: boolean = true;
  gravity: boolean = true;

  _signal: Signal | null = null;
  
  /** EXPLORE STATE **/
  _visible: boolean = false;
  _visited: boolean = false;
  _explored: boolean = false;

  _inRange: boolean = false;

  _button: Button | null = null;
  _connections: Map<OWNode, NodeConnection>;

  _observers: NodeButtonObserver[];
  _observer: NodeObserver | null = null;
  
  _nodeJSONObj: JSONObject | null = null;
  _exploreData: ExploreData | null = null;

  constructor(x: number, y: number)
  constructor(id: string, nodeJSONObj: JSONObject)
  constructor(xOrID: number | string, yOrObj: number | JSONObject)
  {
    super(typeof xOrID === 'number' ? xOrID : 0, typeof yOrObj === 'number' ? yOrObj : 0)
    this._connections = new Map<OWNode, NodeConnection>();
    this._observers = new Array<NodeButtonObserver>();
    messenger.addObserver(this);
    if (typeof xOrID === 'string' && typeof yOrObj !== 'number') {
      this._id = xOrID;
      this._name = xOrID;
  
      this.loadJSON(yOrObj);
  
      if (this.entryPoint) 
      {
        this._visible = true;
      }
      
      this._button = new Button(this._id, 0, 0, this.getSize() * 1.5, this.getSize() * 1.5);
      this._button.setObserver(this);
      this._button.visible = false;
      this.addChild(this._button);
    }
  }

  loadJSON(nodeJSONObj: JSONObject): void
  {
    this._nodeJSONObj = nodeJSONObj;

    this._name = this._nodeJSONObj.getString("name", this._id);

    if (nodeJSONObj.hasKey("explore"))
    {
      this._exploreData = new ExploreData(this, nodeJSONObj);
    }
    
    this.position.x = this._nodeJSONObj.getJSONObject("position").getFloat("x");
    this.position.y = this._nodeJSONObj.getJSONObject("position").getFloat("y");

    this._visible = this._nodeJSONObj.getBoolean("start visible", this._visible);

    if (EDIT_MODE)
    {
      this._visible = true;
    }
    
    this.entryPoint = this._nodeJSONObj.getBoolean("entry point", this.entryPoint);
    this.shipAccess = this.entryPoint || this._nodeJSONObj.getBoolean("ship access", this.shipAccess);
    this.allowTelescope = this._nodeJSONObj.getBoolean("allow telescope", this.allowTelescope);
    this.gravity = this._nodeJSONObj.getBoolean("gravity", this.gravity);
    
    if (this._nodeJSONObj.hasKey("signal"))
    {
      this._signal = new Signal(this._nodeJSONObj.getString("signal"));
    }
  }

  savePosition(): void
  {
    this._nodeJSONObj.getJSONObject("position").setFloat("x", this.position.x);
    this._nodeJSONObj.getJSONObject("position").setFloat("y", this.position.y);
    println(this._id + " position saved: " + this.position);
  }

  onReceiveGlobalMessage(message: Message): void
  {

  }

  isExplorable(): boolean {return (this._nodeJSONObj != null && this._nodeJSONObj.hasKey("explore"));}

  getExploreData(): ExploreData {return this._exploreData;}

  getProbeDescription(): string 
  {
    if (this._nodeJSONObj.hasKey("probe description"))
    {
      return this._nodeJSONObj.getString("probe description");
    }
    return this.getDescription();
  }

  getDescription(): string {return this._nodeJSONObj.getString("description", "a vast expanse of nothing");}

  hasDescription(): boolean {return (this._nodeJSONObj != null && this._nodeJSONObj.hasKey("description"));}

  isProbeable(): boolean {return (this._nodeJSONObj != null && this._nodeJSONObj.hasKey("description"));}

  isConnectedTo(node: OWNode): boolean {return this._connections.has(node);}

  inRange(): boolean
  {
    return this._inRange;
  }

  updateInRange(isPlayerInShip: boolean, playerNode: OWNode): void 
  {
    this._inRange = false;

    if (playerNode == this)
    {
      this._inRange = true;
    }

    if (this.entryPoint && isPlayerInShip)
    {
      this._inRange = true;
    }
    
    if (playerNode != null && this.isConnectedTo(playerNode))
    {
      this._inRange = true;
    }
  }
  
  getConnection(node: OWNode): NodeConnection
  getConnection(nodeID: string): NodeConnection
  getConnection(nodeOrID: OWNode | string): NodeConnection
  {
    if (nodeOrID instanceof OWNode) {
      return this._connections.get(nodeOrID);
    }
    for (const node of this._connections.keys()) 
    {
      if (node.getID() === nodeOrID)
      {
        return this.getConnection(node);
      }
    }
    return null;
  }

  allowQuantumEntanglement(): boolean // note - "quantum state" only used for Quantum Moon right now
  {
    if (this._nodeJSONObj == null) return false;
    return this._nodeJSONObj.getBoolean("entanglement node", false);
  }

  getSignal(): Signal {return this._signal;}

  getID(): string {return this._id;}

  getActualName(): string {return this._name;}
  
  getKnownName(): string
  {
    if (this._visited) return this.getActualName();
    else return "???";
  } 

  setVisible(visible: boolean): void {this._visible = visible;}
  
  visit(): void
  {
    this._visited = true;
    this.setVisible(true);

    if (this._nodeJSONObj != null && this._nodeJSONObj.hasKey("fire event"))
    {
      messenger.sendMessage(this._nodeJSONObj.getString("fire event"));
    }

    for (const connection of this._connections.values()) 
    {
      connection.reveal();
    }

    if (this._observer != null)
    {
      this._observer.onNodeVisited(this);
    }
  }

  explore(): void
  {
    this._explored = true;
    this._exploreData.explore();

    if (this._signal != null)
    {
      playerData.learnFrequency(this._signal.frequency);
    }
  }
  
  update(): void
  {
    if (!this._visible) {return;}
    this._button.enabled = this.inRange() || EDIT_MODE;
    this._button.update();
  }

  getAlpha(): number
  {
    if (!this.inRange())
    {
      return 35;
    }
    return 100;
  }

  getSize(): number
  {
    if (this.entryPoint) 
    {
      return 50;
    }
    else if (!this.isExplorable())
    {
      return 25;
    }

    return 35;
  }
  
  draw(): void
  {
    if (!this._visible) {return;}

    if (this._button.hoverState)
    {
      stroke(200, 100, 100, this.getAlpha());
    }
    else
    {
      stroke(0, 0, 100, this.getAlpha());
    }

    push();
    translate(this.screenPosition.x, this.screenPosition.y);

      if (!this.isExplorable())
      {
        fill(0, 0, 0);
        ellipse(0, 0, this.getSize(), this.getSize());
        pop();
        return;
      }
          
      if (this.entryPoint)
      {
        fill(0, 0, 0);
        ellipse(0, 0, this.getSize(), this.getSize());

        // halfWidth: number = getSize() * 0.5;
        // halfHeight: number = getSize() * 0.5;
        // offset: number = 7;

        // push();
        // rotate(PI * 0.25);
        //   line(-halfWidth, 0, -halfWidth + offset, 0);
        //   line(halfWidth - offset, 0, halfWidth, 0);
        //   line(0, -halfHeight, 0, -halfHeight + offset);
        //   line(0, halfHeight - offset, 0, halfHeight);
        // pop();
      }
      else
      {
        fill(0, 0, 0);
        rect(0, 0, this.getSize(), this.getSize());
      }

      if (!this._explored)
      {
        fill(0, 0, 100, this.getAlpha());
        textAlign(CENTER, CENTER);
        textSize(30);
        text('?', 0, 0);
      }

    pop();
  }

  drawName(): void
  {
    if (!this._visible) {return;}
    if (!this.isExplorable()) {return;}

    // draw text backdrop
    const textPos: Vector2 = new Vector2(this.screenPosition.x, this.screenPosition.y - this.getSize() / 2 - 20);
    
    noStroke();
    fill(0, 0, 0);
    textSize(TEXT_SIZE);
    rect(textPos.x, textPos.y, textWidth(this.getKnownName()), TEXT_SIZE + 4);
    
    fill(0, 0, 100, this.getAlpha());
    
    textAlign(CENTER, CENTER);
    text(this.getKnownName(), textPos.x, textPos.y);
  }

  addConnection(connection: NodeConnection): void
  {
    if ([...this._connections.values()].includes(connection))
    {
      println("These nodes are already connected!!!");
      return;
    }
        
    if (connection.node1 != this)
    {
      this._connections.set(connection.node1, connection);
    }
    else
    {
      this._connections.set(connection.node2, connection);
    }
  }

  setNodeObserver(observer: NodeObserver): void
  {
    this._observer = observer;
  }

  addObserver(observer: NodeButtonObserver): void
  {
    this._observers.push(observer);
  }
  
  removeAllObservers(): void
  {
    this._observers.length = 0;
  }
  
  onButtonUp(button: Button): void
  {
    for (let i: number = 0; i < this._observers.length; i++)
    {
      this._observers[i].onNodeSelected(this);
    }
  }
  
  onButtonEnterHover(button: Button): void
  {
    for (let i: number = 0; i < this._observers.length; i++)
    {
      this._observers[i].onNodeGainFocus(this);
    }
  }
  
  onButtonExitHover(button: Button): void
  {
    for (let i: number = 0; i < this._observers.length; i++)
    {
      this._observers[i].onNodeLoseFocus(this);
    }
  }
}