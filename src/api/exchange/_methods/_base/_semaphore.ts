// ============================================================
// Semaphore
// ============================================================

// TODO: Replace with @std/async/semaphore if the PR (https://github.com/denoland/std/pull/6894) will be merged

interface Node {
  res: () => void;
  next: Node | undefined;
}

export class Semaphore {
  #max: number;
  #count: number;
  #head: Node | undefined;
  #tail: Node | undefined;

  constructor(max: number = 1) {
    if (max < 1) {
      throw new TypeError(
        `Cannot create semaphore as 'max' must be at least 1: current value is ${max}`,
      );
    }
    this.#count = this.#max = max;
  }

  acquire(): Promise<void> {
    if (this.#count > 0) {
      this.#count--;
      return Promise.resolve();
    }
    return new Promise((res) => {
      const node: Node = { res, next: undefined };
      if (this.#tail) {
        this.#tail = this.#tail.next = node;
      } else {
        this.#head = this.#tail = node;
      }
    });
  }

  release(): void {
    if (this.#head) {
      this.#head.res();
      this.#head = this.#head.next;
      if (!this.#head) this.#tail = undefined;
    } else if (this.#count < this.#max) {
      this.#count++;
    }
  }
}

// ============================================================
// RefCounted Registry
// ============================================================

class RefCountedRegistry<K, V> {
  #map = new Map<K, { value: V; refs: number }>();
  #factory: () => V;

  constructor(factory: () => V) {
    this.#factory = factory;
  }

  ref(key: K): V {
    let entry = this.#map.get(key);
    if (!entry) {
      entry = { value: this.#factory(), refs: 0 };
      this.#map.set(key, entry);
    }
    entry.refs++;
    return entry.value;
  }

  unref(key: K): void {
    const entry = this.#map.get(key);
    if (!entry) return;
    if (--entry.refs === 0) {
      this.#map.delete(key);
    }
  }
}

// ============================================================
// Helper
// ============================================================

const semaphores = new RefCountedRegistry(() => new Semaphore(1));

export async function withLock<K, T>(key: K, fn: () => Promise<T>): Promise<T> {
  const semaphore = semaphores.ref(key);
  await semaphore.acquire();
  try {
    return await fn();
  } finally {
    semaphore.release();
    semaphores.unref(key);
  }
}
