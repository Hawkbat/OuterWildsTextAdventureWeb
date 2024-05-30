import { AudioManager, SoundLibrary } from "./AudioManager";
import { Button } from "./Button";
import { SectorName } from "./Enums";
import { OWScreen } from "./Screen";
import { SKIP_TITLE, gameManager } from "./app";
import { exit } from "./compat";

export class TitleScreen extends OWScreen
{
  constructor()
  {
    super();
    this.addButton(new Button("New Game", width/2 - 110, height - 50, 200, 50));
    this.addButton(new Button("Quit", width/2 + 110, height - 50, 200, 50));
  }
  
  onEnter(): void
  {
    if (SKIP_TITLE)
    {
      gameManager.loadSector(SectorName.TIMBER_HEARTH);
      return;
    }
    
    AudioManager.play(SoundLibrary.kazooTheme);
  }
  
  onExit(): void
  {
    AudioManager.pause();
  }
  
  update(): void
  {
  }
  
  render(): void
  {
    fill(142, 90, 90);
    textAlign(CENTER, CENTER);
    textSize(100);
    text("Outer Wilds", width/2, height/2 - 50);
    
    fill(0, 0, 100);
    textSize(22);
    text("a thrilling graphical text adventure", width/2, height/2 + 50);
  }
  
  onButtonUp(button: Button): void
  {
    if (button.id == "New Game")
    {
      gameManager.loadSector(SectorName.TIMBER_HEARTH);
    }
    else if (button.id == "Quit")
    {
      exit();
    }
  }
}

export class EndScreen extends OWScreen
{
  constructor()
  {
    super();
    this.addButton(new Button("Exit", width/2, height - 50, 200, 50));
  }
  
  onEnter(): void
  {
    AudioManager.play(SoundLibrary.kazooTheme);
  }
  
  onExit(): void
  {
    AudioManager.pause();
  }
  
  update(): void
  {
  }
  
  render(): void
  {
    fill(142, 90, 90);
    textAlign(CENTER, CENTER);
    textSize(100);
    text("Outer Wilds", width/2, height/2 - 50);
    
    fill(0, 0, 100);
    textSize(22);
    text("thanks for playing!", width/2, height/2 + 50);
  }
  
  onButtonUp(button: Button): void
  {
    if (button.id == "Exit")
    {
      exit();
    }
  }
}