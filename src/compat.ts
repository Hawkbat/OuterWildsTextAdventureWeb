import { SoundFile } from "p5";

const preloadCache: Record<string, any> = {};

export function println(...args: any[]) {
    console.log(...args);
}

export function preloadJSONObject(path: string): void {
    preloadCache[path] = loadJSON(path);
}

export function preloadAudio(path: string): void {
    preloadCache[path] = loadSound(path);
}

export function loadJSONObject(path: string): JSONObject {
    if (path in preloadCache) {
        return new JSONObject(preloadCache[path])
    } else {
        throw new Error(`JSON object was not preloaded! Path: ${path}`);
    }
}

export function saveJSONObject(obj: JSONObject, path: string): void {
    throw new Error("Method not implemented.");
}

export function exit() {
    window.location.reload();
}

export class Minim {
    loadFile(path: string): AudioPlayer {
        if (path in preloadCache) {
            const sound = preloadCache[path];
            return new AudioPlayer(sound);
        } else {
            throw new Error(`Audio file was not preloaded! Path: ${path}`);
        }
    }
}

export class AudioPlayer {
    private _sound: SoundFile;

    constructor(sound: SoundFile) {
        this._sound = sound;
    }

    play() {
        this._sound.play();
    }
    pause() {
        this._sound.pause();
    }
}

export class JSONArray {
    private _data: any[];

    constructor(data: any[] = []) {
        this._data = data;
    }

    size(): number {
        return this._data.length;
    }
    getJSONObject(index: number): JSONObject {
        const value = this._data[index];
        if (typeof value === 'object' && !(value instanceof JSONObject)) {
            return new JSONObject(value);
        }
        return value;
    }
    getString(index: number): string {
        return this._data[index];
    }
    toJSON(key: string): any {
        return this._data;
    }
}

export class JSONObject {
    private _data: Record<string, any>;

    constructor(data: Record<string, any> = {}) {
        this._data = data;
    }

    hasKey(key: string): boolean {
        return key in this._data;
    }
    getFloat(key: string, defaultValue?: number): number {
        const value = this._data[key];
        if (value === null || value === undefined) return defaultValue;
        if (typeof value === 'number') return value;
        return Number(value);
    }
    getInt(key: string, defaultValue?: number): number {
        const value = this._data[key];
        if (value === null || value === undefined) return defaultValue;
        if (typeof value === 'number') return value;
        return Number(value);
    }
    getString(key: string, defaultValue?: string): string {
        const value = this._data[key];
        if (value === null || value === undefined) return defaultValue;
        if (typeof value === 'string') return value;
        return JSON.stringify(value);
    }
    getBoolean(key: string, defaultValue?: boolean): boolean {
        const value = this._data[key];
        if (value === null || value === undefined) return defaultValue;
        if (typeof value === 'boolean') return value;
        return Boolean(value);
    }
    getJSONArray(key: string): JSONArray {
        const value = this._data[key];
        if (Array.isArray(value) && !(value instanceof JSONArray)) {
            return new JSONArray(value);
        }
        return key in this._data ? value : null;
    }
    getJSONObject(key: string): JSONObject {
        const value = this._data[key];
        if (typeof value === 'object' && !(value instanceof JSONObject)) {
            return new JSONObject(value);
        }
        return key in this._data ? value : null;
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
    toJSON(key: string): any {
        return this._data;
    }
}
