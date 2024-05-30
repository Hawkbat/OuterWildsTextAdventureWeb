import { Font } from "p5";
import { AudioManager } from "./AudioManager";
import { Frequency } from "./Enums";
import { GameManager } from "./GameManager";
import { GlobalMessenger } from "./GlobalMessenger";
import { Locator } from "./Locator";
import { PlayerData } from "./PlayerData";
import { StatusFeed } from "./StatusFeed";
import { TimeLoop } from "./TimeLoop";
import { Minim, println } from "./compat";

/*** GLOBALS ***/
export const TEXT_SIZE: number = 14;

export let locator: Locator;
export let gameManager: GameManager;
export let timeLoop: TimeLoop;
export let messenger: GlobalMessenger;
export let feed: StatusFeed;
export let playerData: PlayerData;
 
export let minim: Minim;
export let audioManager: AudioManager;

/*** DEBUG ***/
export const EDIT_MODE: boolean = false;
export const SKIP_TITLE: boolean = false;
export const START_WITH_LAUNCH_CODES: boolean = false;
export const START_WITH_CLUES: boolean = false;
export const START_WITH_SIGNALS: boolean = false;
export const START_WITH_COORDINATES: boolean = false;

let lastMillis: number;
let deltaMillis: number;

export let smallFontData: Font;
export let mediumFontData: Font;

(window as any).setup = function setup(): void
{
  createCanvas(960, 720);
  noSmooth();
  colorMode(HSB, 360, 100, 100, 100);
  rectMode(CENTER);
  ellipseMode(CENTER);

  smallFontData = loadFont("fonts/Inconsolata.ttf");
  mediumFontData = loadFont("fonts/Inconsolata.ttf");
  
  smallFont();
    
  minim = new Minim();

  initGame();
}

function initGame(): void
{
  const startLoadTime: number = millis();
  
  timeLoop = new TimeLoop();
  audioManager = new AudioManager();
  messenger = new GlobalMessenger();
  feed = new StatusFeed();
  gameManager = new GameManager();
  playerData = new PlayerData();
  
  gameManager.newGame();
  
  println("Load time: " + (millis() - startLoadTime));
}

(window as any).draw = function draw(): void
{
  gameManager.runGameLoop();

  // stroke(0, 0, 100);
  // fill(0, 0, 0);
  // triangle(mouseX, mouseY, mouseX, mouseY - 10, mouseX + 10, mouseY - 10);
  
  deltaMillis = millis() - lastMillis;
  lastMillis = millis();
  
  //println(deltaMillis);
}

export function frequencyToString(frequency: Frequency): string
{
  switch(frequency)
  {
    case Frequency.TRAVELER:
      return "Traveler Frequency";
    case Frequency.BEACON:
      return "Distress Beacon";
    case Frequency.QUANTUM:
      return "Quantum Fluctuations";
    default:
      return "";
  }
}

export function resetLocator(): void {
  locator = new Locator();
}

export function smallFont(): void
{
  textSize(14);
  textFont(smallFontData);
}

export function mediumFont(): void
{
  textSize(18);
  textFont(mediumFontData);
}
