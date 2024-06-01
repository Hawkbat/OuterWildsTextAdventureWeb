import { AudioManager, SoundLibrary } from "./AudioManager";
import { Button } from "./Button";
import { SectorName } from "./Enums";
import { GameSave } from "./GameSave";
import { OWScreen } from "./Screen";
import { SKIP_TITLE, gameManager } from "./app";
import { exit } from "./compat";

export class TitleScreen extends OWScreen
{
  constructor()
  {
    super();
    
    const hasSave = GameSave.hasData();
    
    if (hasSave) {
      this.addTitleButton("Continue", 110);
      this.addTitleButton("Reset Progress", -110);
    } else {
      this.addTitleButton("New Game", 0);
    }
  }

  addTitleButton(text: string, xOffset: number) {
    this.addButton(new Button(text, width/2 + xOffset, height - 50, 200, 50));
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
    if (button.id == "New Game" || button.id == "Continue")
    {
      gameManager.loadSector(SectorName.TIMBER_HEARTH);
    }
    else if (button.id == "Reset Progress")
    {
      GameSave.clearData();
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
