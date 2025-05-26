/**
 * Pool d'objets pour réutiliser les instances et éviter les allocations mémoire excessives
 */
export class ObjectPool {
  constructor() {
    this.pools = new Map();
  }

  static getInstance() {
    if (!ObjectPool.instance) {
      ObjectPool.instance = new ObjectPool();
    }
    return ObjectPool.instance;
  }

  // Pool pour les éléments DOM
  getElement(tagName, className = "") {
    const key = `${tagName}-${className}`;
    if (!this.pools.has(key)) {
      this.pools.set(key, []);
    }

    const pool = this.pools.get(key);
    if (pool.length > 0) {
      return pool.pop();
    }

    const element = document.createElement(tagName);
    if (className) element.className = className;
    return element;
  }

  returnElement(element, tagName, className = "") {
    const key = `${tagName}-${className}`;
    if (!this.pools.has(key)) {
      this.pools.set(key, []);
    }

    // Nettoyer l'élément avant de le remettre dans le pool
    element.innerHTML = "";
    element.removeAttribute("style");

    const pool = this.pools.get(key);
    if (pool.length < 100) {
      // Limiter la taille du pool
      pool.push(element);
    }
  }

  // Pool pour les objets de configuration
  getConfig() {
    if (!this.configPool) this.configPool = [];
    return this.configPool.length > 0 ? this.configPool.pop() : {};
  }

  returnConfig(config) {
    if (!this.configPool) this.configPool = [];

    // Nettoyer l'objet
    for (const key in config) {
      delete config[key];
    }

    if (this.configPool.length < 50) {
      this.configPool.push(config);
    }
  }

  // Nettoyer tous les pools
  clear() {
    this.pools.clear();
    if (this.configPool) this.configPool.length = 0;
  }
}
