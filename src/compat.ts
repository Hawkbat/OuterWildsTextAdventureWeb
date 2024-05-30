
export function println(...args: any[]) {
    console.log(...args);
}

export function loadJSONObject(path: string): JSONObject {
    throw new Error("Method not implemented.");
}

export function saveJSONObject(obj: JSONObject, path: string): void {
    throw new Error("Method not implemented.");
}

export function exit() {
    window.location.reload();
}

export class Minim {
  loadFile(path: string): AudioPlayer {
    throw new Error("Method not implemented.");
  }
}

export class AudioPlayer {
  play() {
    throw new Error("Method not implemented.");
  }
  pause() {
    throw new Error("Method not implemented.");
  }
}

export class JSONArray {
    private _data: any[] = [];

	size(): number {
        return this._data.length;
	}
	getJSONObject(index: number): JSONObject {
        return this._data[index];
	}
	getString(index: number): string {
        return this._data[index];
	}

}

export class JSONObject {
    private _data: Record<string, any> = {};

    hasKey(key: string): boolean {
        return key in this._data;
    }
    getFloat(key: string, defaultValue?: number): number {
        return key in this._data ? this._data[key] : defaultValue;
    }
	getInt(key: string, defaultValue?: number): number {
        return key in this._data ? this._data[key] : defaultValue;
	}
    getString(key: string, defaultValue?: string): string {
        return key in this._data ? this._data[key] : defaultValue;
    }
    getBoolean(key: string, defaultValue?: boolean): boolean {
        return key in this._data ? this._data[key] : defaultValue;
    }
    getJSONArray(key: string): JSONArray {
        return key in this._data ? this._data[key] : new JSONArray();
    }
    getJSONObject(key: string): JSONObject {
        return key in this._data ? this._data[key] : new JSONObject();
    }
    setFloat(key: string, value: number): this {
        this._data[key] = value;
        return this;
    }
    setInt(key: string, value: number): this {
        this._data[key] = value;
        return this;
    }
    setString(key: string, value: string): this {
        this._data[key] = value;
        return this;
    }
    setBoolean(key: string, value: boolean): this {
        this._data[key] = value;
        return this;
    }
    setJSONArray(key: string, value: JSONArray): this {
        this._data[key] = value;
        return this;
    }
    setJSONObject(key: string, value: JSONObject): this {
        this._data[key] = value;
        return this;
    }
    keys(): string[] {
        return Object.keys(this._data);
    }
}
