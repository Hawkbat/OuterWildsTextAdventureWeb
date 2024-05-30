import { Color } from "p5";
import { Entity } from "./Entity";
import { Vector2 } from "./Vector2";
import { smallFontData } from "./app";

export interface ButtonObserver
{
  onButtonUp(button: Button): void;
  onButtonEnterHover(button: Button): void;
  onButtonExitHover(button: Button): void;
}

export class Button extends Entity
{
  id: string;
  hoverState: boolean = false;
  visible: boolean = true;
  enabled: boolean = true;
  
  _bounds: Vector2;  
  _observer: ButtonObserver;
    
  _buttonDown: boolean = false;
  _wasMousePressed: boolean = false;

  _buttonColor: Color = color(0, 0, 100);
  _hasDisabledPrompt: boolean = false;
  _disabledPrompt: string;
  
  constructor(buttonID: string, x: number = 0, y: number = 0, w: number = 150, h: number = 50)
  {
    super(new Vector2(x, y));
    this.id = this._disabledPrompt = buttonID;
    this._bounds = new Vector2(w, h);
  }

  setColor(newColor: Color): void {this._buttonColor = newColor;}
  setDisabledPrompt(prompt: string): void 
  {
    this._disabledPrompt = prompt;
    this._hasDisabledPrompt = true;
  }

  getWidth(): number
  {
    return this._bounds.x;
  }
  
  setObserver(observer: ButtonObserver): void
  {
    this._observer = observer;
  }
  
  update(): void
  {
    if (!this.enabled) 
    {
      this._buttonDown = false;
      this.hoverState = false;
      return;
    }
    
    if (this.isPointInBounds(mouseX, mouseY))
    {
      if (!this.hoverState)
      {
        this.hoverState = true;
        this.onButtonEnterHover();
        this._observer.onButtonEnterHover(this);
      }
      
      if (!this._wasMousePressed && this.mousePressed())
      {
        this._buttonDown = true;
      }
      // fire event on release
      if (this._buttonDown && !this.mousePressed())
      {
        this._buttonDown = false;
        this.onButtonUp();
        this._observer.onButtonUp(this);
      }
    }
    else
    {
      this._buttonDown = false;
      
      if (this.hoverState)
      {
        this.hoverState = false;
        this.onButtonExitHover();
        this._observer.onButtonExitHover(this);
      }
    }
    
    this._wasMousePressed = this.mousePressed();
  }

  onButtonExitHover(): void{}
  onButtonEnterHover(): void{}
  onButtonUp(): void{}

  mousePressed(): boolean
  {
    return mouseIsPressed;// && mouseButton == LEFT;
  }
  
  draw(): void
  {
    if (!this.visible) {return;}

    let alpha: number = 100;

    if (!this.enabled) alpha = 25;
    
    stroke(hue(this._buttonColor), saturation(this._buttonColor), brightness(this._buttonColor), alpha);
    fill(0, 0, 0);
    
    if (this.hoverState)
    {
      if (this._buttonDown)
      {
        stroke(0, 100, 100);
      }
      else
      {
        stroke(200, 100, 100);
      }
    }

    this.drawShape();
    this.drawText(alpha);
  }

  drawShape(): void
  {
    rectMode(CENTER);
    rect(this.screenPosition.x, this.screenPosition.y, this._bounds.x, this._bounds.y);
  }

  drawText(alpha: number): void
  {
    fill(0, 0, 100, alpha);
    textSize(14);
    textFont(smallFontData);
    textAlign(CENTER, CENTER);

    if (this.enabled) 
    {
      text(this.id, this.screenPosition.x, this.screenPosition.y);
    }
    else
    {
      text(this._disabledPrompt, this.screenPosition.x, this.screenPosition.y);
    }
  }
  
  isPointInBounds(x: number, y: number): boolean
  {
    if (x > this.screenPosition.x - this._bounds.x * 0.5 && x < this.screenPosition.x + this._bounds.x * 0.5)
    {
      if (y > this.screenPosition.y - this._bounds.y * 0.5 && y < this.screenPosition.y + this._bounds.y * 0.5)
      {
        return true;
      }
    }
    return false;
  }
}