import { PlayerData } from "./PlayerData";

export class GameSave {
  static PLAYER_DATA = "playerData";

  static saveData(data: PlayerData) {
    localStorage.setItem(this.PLAYER_DATA, JSON.stringify(data));
  }

  static loadData(): PlayerData {
    const playerData = new PlayerData();
    if (!this.hasData()) {
      return playerData;
    }

    const playerDataSave = JSON.parse(localStorage.getItem(this.PLAYER_DATA));
    Object.assign(playerData, playerDataSave);
    return playerData;
  }

  static clearData() {
    localStorage.removeItem(this.PLAYER_DATA);
  }

  static hasData(): boolean {
    return Boolean(localStorage.getItem(this.PLAYER_DATA));
  }
}
