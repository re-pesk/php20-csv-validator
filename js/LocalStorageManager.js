
export default class LocalStorageManager {
  #key = ''
  constructor(key) {
    this.#key = key;
  }

  get data() {
    const item = localStorage.getItem(this.#key);
    const data = JSON.parse(item)
    return data;
  }
  set data(data) {
    const item = JSON.stringify(data);
    localStorage.setItem(this.#key, item);
  }

  clear() {
    localStorage.removeItem(this.#key);
  }
}