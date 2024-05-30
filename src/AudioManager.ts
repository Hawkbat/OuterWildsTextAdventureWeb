import { minim } from "./app";
import { AudioPlayer, println } from "./compat";

export class SoundLibrary
{
  static kazooTheme: AudioPlayer;
  
  static loadSounds(): void
  {
    println("Sounds loading...");
    SoundLibrary.kazooTheme = minim.loadFile("data/audio/ow_kazoo_theme.mp3");
  }
}

export class AudioManager
{
  static currentSound: AudioPlayer;
  
  constructor()
  {
    SoundLibrary.loadSounds();
  }
  
  static play(sound: AudioPlayer): void
  {
    AudioManager.currentSound = sound;
    AudioManager.currentSound.play();
  }
  
  static pause(): void
  {
    if (AudioManager.currentSound != null)
    {
      AudioManager.currentSound.pause();
    }
    else
    {
      println("Current sound is NULL!!!");
    }
  }
}