import { Color } from "p5";
import { mediumFontData, messenger, smallFontData } from "./app";
import { GlobalObserver, Message } from "./GlobalMessenger";

export class StatusFeed implements GlobalObserver
{
  static MAX_LINES: number = 3;
  
  _feed: StatusLine[];

  init(): void
  {
    this._feed = new Array<StatusLine>();
    messenger.addObserver(this);
  }

  clear(): void
  {
    this._feed.length = 0;
  }

  onReceiveGlobalMessage(message: Message): void
  {

  }

  publish(newLine: string, important: boolean = false): void
  {
    this._feed.push(new StatusLine(newLine, important));

    if (this._feed.length > StatusFeed.MAX_LINES)
    {
      this._feed.splice(0, 1);
    }
  }
  
  render(): void
  {
    for (let i: number = 0; i < this._feed.length; i++)
    {
      if (!this._feed[i].draw(20, 30 + i * 25))
      {
        break; // break if the current line hasn't finished displaying
      }
    }
  }
}

export class StatusLine
{
  _line: string;
  _initTime: number;
  _displayTriggered: boolean = false;
  _lineColor: Color = color(0, 0, 100);

  static SPEED: number = 0.08;

  constructor(newLine: string, important: boolean)
  {
    this._line = newLine;

    if (important)
    {
      this._lineColor = color(100, 100, 100);
    }
  }

  draw(x: number, y: number): boolean
  {
    if (!this._displayTriggered)
    {
      this._initTime = millis();
      this._displayTriggered = true;
    }

    textAlign(LEFT);
    textFont(mediumFontData);
    textSize(18);
    fill(this._lineColor);
    text(this._line.substring(0, min(this._line.length, this.getDisplayLength())), x, y);
    textFont(smallFontData);

    // is this line fully displayed?
    if (this._line.length <= this.getDisplayLength())
    {
      return true;
    }
    return false;
  }

  getDisplayLength(): number
  {
    return (int)((millis() - this._initTime) * StatusLine.SPEED);
  }
}