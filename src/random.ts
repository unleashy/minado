/* eslint-disable no-bitwise */
const MAX = 2 ** 32;

export class Random {
  private state = 0;

  constructor(seed?: number) {
    if (seed && !isWithinBounds(seed)) {
      throw new RangeError(`seed must be an integer between 0 and 2^32`);
    }

    this.step();
    this.state = (this.state + (seed ?? genSeed())) % MAX;
    this.step();
  }

  next(): number {
    const oldState = this.state;
    this.step();

    let result = (oldState >>> 28) % MAX;
    result = (result + 4) % MAX;
    result = (oldState >>> result) % MAX;
    result ^= oldState;
    if (result < 0) result = ~result + 1;
    result = (result * 277_803_737) % MAX;
    result ^= (result >>> 22) % MAX;
    if (result < 0) result = ~result + 1;

    if (!isWithinBounds(result)) {
      throw new Error(
        `assertion failure: random number not bounded to [0,2^32); got ${result}`
      );
    }

    return result;
  }

  between(minIncluded: number, maxExcluded: number) {
    const threshold = MAX % maxExcluded;

    let result;
    do {
      result = this.next();
    } while (result < threshold);

    return minIncluded + (result % (maxExcluded - minIncluded));
  }

  private step(): void {
    const MULTIPLIER = 747_796_405;
    const INCREMENT = 2_891_336_453;

    this.state = (this.state * MULTIPLIER) % MAX;
    this.state = (this.state + INCREMENT) % MAX;

    if (!isWithinBounds(this.state)) {
      throw new Error(
        `assertion failure: state not bounded to [0,2^32); got ${this.state}`
      );
    }
  }
}

function genSeed(): number {
  return Math.floor(Math.random() * MAX);
}

function isWithinBounds(n: number): boolean {
  return Number.isSafeInteger(n) && 0 <= n && n < MAX;
}
