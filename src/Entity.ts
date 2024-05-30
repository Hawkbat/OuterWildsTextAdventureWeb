import { OWNode } from "./Node";
import { Sector } from "./Sector";
import { Vector2 } from "./Vector2";

export class Entity
{
  position: Vector2;
  screenPosition: Vector2;

  parent: Entity | null = null;
  _children: Entity[];
  
  constructor()
  constructor(x: number, y: number)
  constructor(pos: Vector2)
  constructor(posOrX?: Vector2 | number, y?: number)
  {
    let pos: Vector2 = new Vector2()
    if (typeof posOrX === 'number' && typeof y === 'number') {
      pos = new Vector2(posOrX, y)
    } else if (posOrX instanceof Vector2) {
      pos = posOrX
    }
    this.position = new Vector2();
    this.screenPosition = new Vector2();
    this._children = [];

    this.setPosition(pos);
  }

  setPosition(newPos: Vector2): void
  setPosition(x: number, y: number): void
  setPosition(newPosOrX: Vector2 | number, y?: number): void
  {
    this.position.x = newPosOrX instanceof Vector2 ? newPosOrX.x : newPosOrX;
    this.position.y = newPosOrX instanceof Vector2 ? newPosOrX.y : y ?? 0;

    // update child screen positions
    if (this.parent != null)
    {
      this.updateScreenPosition(this.parent.screenPosition);
    }
    else 
    {
      this.updateScreenPosition(new Vector2(0, 0));
    }
  }

  updateScreenPosition(parentScreenPos: Vector2): void
  {
    this.screenPosition.assign(parentScreenPos.add(this.position));

    for (let i: number = 0; i < this._children.length; i++)
    {
      this._children[i].updateScreenPosition(this.screenPosition);
    }
  }

  setScreenPosition(newScreenPos: Vector2): void
  {
    if (this.parent == null)
    {
      this.setPosition(newScreenPos);
    }
    else 
    {
      this.setPosition(newScreenPos.sub(this.parent.screenPosition));
    }
  }

  draw(): void
  {
    // stub to override
  }

  render(): void
  {
    this.draw();
  }

  addChild(child: Entity): void
  {
    if (!this._children.includes(child))
    {
      this._children.push(child);
      child.parent = this;
      child.updateScreenPosition(this.screenPosition);
    }
  }

  removeChild(child: Entity): void
  {
    if (this._children.includes(child)) {
      this._children.splice(this._children.indexOf(child), 1);
    }
    child.parent = null;
  }
}

export class Actor extends Entity
{
  currentSector: Sector | null = null;
  lastSector: Sector | null = null;
  currentNode: OWNode | null = null;

  static SPEED: number = 10;
  
  _moveTowardsTarget: boolean = false;
  _targetScreenPos: Vector2;
  _distToTarget: number = 0;
  _offset: Vector2;
  
  constructor()
  {
    super(new Vector2(0, 0));
    this._targetScreenPos = new Vector2();
    this._offset = new Vector2(0, 0);
  }

  isDead(): boolean
  {
    return false;
  }
  
  update(): void
  {
    this._offset.y = 0;
    
    if (this.currentNode == null || !this.currentNode.gravity)
    {
      this._offset.y = Math.sin(millis() * 0.005) * 5.0;
    }

    if (this._moveTowardsTarget)
    {
      const d: Vector2 = this._targetScreenPos.sub(this.screenPosition);
      this._distToTarget = d.magnitude();
      const v: number = Math.min(this._distToTarget, Actor.SPEED);
      this.setScreenPosition(this.screenPosition.add(d.normalize().mult(v)));
    }
  }
  
  draw(): void
  {
    fill(0, 0, 100);
    ellipse(this.screenPosition.x, this.screenPosition.y, 10, 10);
  }

  setNode(node: OWNode): void
  {
    this.currentNode = node;
    this._targetScreenPos.assign(node.screenPosition);
    this.setScreenPosition(node.screenPosition);
  }

  moveToScreenPosition(screenPos: Vector2): void
  {
    this._targetScreenPos.assign(screenPos);
    this._moveTowardsTarget = true;
  }
  
  moveToNode(node: OWNode): void
  {
    this.currentNode = node;
    this._targetScreenPos.assign(node.screenPosition);
    this._moveTowardsTarget = true;
  }
}

export class Player extends Actor
{
  setNode(node: OWNode): void
  {
    super.setNode(node);
    node.visit();
  }

  moveToNode(node: OWNode): void
  {
    super.moveToNode(node);
    node.visit();
  }

  update(): void
  {
    super.update();
    //println(_targetScreenPos);
  }
  
  draw(): void
  {
    this.drawAt(this.screenPosition.x, this.screenPosition.y + this._offset.y, 1);
  }

  drawAt(xPos: number, yPos: number, s: number): void
  {
    stroke(30, 100, 100);
    fill(0, 0, 0);

    push();
      translate(xPos, yPos);
      scale(s);
      ellipse(0, 0, 10, 20);
    pop();
  }
}

export class Ship extends Actor
{
  _player: Actor;

  constructor(player: Actor)
  {
    super();
    this._player = player;
  }

  update(): void
  {
    super.update();
  }

  draw(): void
  {
    this.drawAt(this.screenPosition.x, this.screenPosition.y + this._offset.y, 1, false);
  }

  drawAt(xPos: number, yPos: number, s: number, skipFill: boolean): void
  {
    stroke(30, 100, 100);
    fill(0, 0, 0);

    if (this._player.currentNode == this.currentNode && !skipFill) 
    {
      fill(30,100,100);
    }
    
    push();
      translate(xPos, yPos);
      scale(s);
      triangle(-20, 15, 20, 15, 0, -20);
    pop();
  }
}

export class Probe extends Actor
{
  isDead(): boolean
  {
    return this._distToTarget < 0.1;
  }

  update(): void
  {
    super.update();
  }

  draw(): void
  {
    noStroke();
    fill(30, 100, 100);
    
    push();
      translate(this.screenPosition.x, this.screenPosition.y);
      ellipse(0, 0, 10, 10);
    pop();
  }
}