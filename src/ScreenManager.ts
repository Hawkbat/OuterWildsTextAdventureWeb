import { OWScreen } from "./Screen";
import { println } from "./compat";

export abstract class ScreenManager
{
  _screenStack: OWScreen[];
  _skipRender: boolean = false;

  ScreenManager()
  {
    this._screenStack = new Array<OWScreen>();
  }

  lateUpdate(): void
  {
    // just in case gamemanager needs to do anything
  }

  runGameLoop(): void
  {
    if (this._screenStack.length > 0)
    {
      this._skipRender = false;
      
      // update active screen
      const activeScreen: OWScreen = this._screenStack[this._screenStack.length - 1];
      activeScreen.updateInput();
      activeScreen.update();
      this.lateUpdate();

      if (this._skipRender)
      {
        return;
      }

      // find which screens should get rendered
      let lowestRenderIndex: number = 0;

      for (let i: number = this._screenStack.length - 1; i >= 0; i--)
      {
        if (!this._screenStack[i].overlay)
        {
          lowestRenderIndex = i;
          break;
        }
      }

      // render screens lowest-first
      for (let i: number = lowestRenderIndex; i < this._screenStack.length; i++)
      {
        this._screenStack[i].renderBackground();
        this._screenStack[i].renderButtons();
        this._screenStack[i].render();
      }
    }
    else
    {
      println("No screens on the stack!!!");
    }
  }
  
  swapScreen(newScreen: OWScreen): void
  {
    if (this._screenStack.length > 0)
    {
      this._screenStack[this._screenStack.length - 1].onExit();
      this._screenStack[this._screenStack.length - 1].active = false;
      this._screenStack.splice(this._screenStack.length - 1, 1);
    }
    
    this._screenStack.push(newScreen);
    this._screenStack[this._screenStack.length - 1].active = true;
    this._screenStack[this._screenStack.length - 1].onEnter();

    this._skipRender = true;

    println("SWAP: " + newScreen);
  }
  
  pushScreen(nextScreen: OWScreen): void
  {
    if (this._screenStack.length > 0)
    {
      this._screenStack[this._screenStack.length - 1].onExit();
      this._screenStack[this._screenStack.length - 1].active = false;
    }
    
    this._screenStack.push(nextScreen);
    nextScreen.active = true;
    nextScreen.onEnter();

    this._skipRender = true;

    println("PUSH: " + nextScreen);
  }
  
  popScreen(): void
  {
    this._screenStack[this._screenStack.length - 1].onExit();
    this._screenStack[this._screenStack.length - 1].active = false;
    this._screenStack.splice(this._screenStack.length - 1, 1);
    
    if (this._screenStack.length > 0)
    {
      this._screenStack[this._screenStack.length - 1].active = true;
      this._screenStack[this._screenStack.length - 1].onEnter();
    }

    this._skipRender = true;

    println("POP");
  }
}