class MockInput {
  #returnValues;

  constructor(returnValues = []) {
    this.#returnValues = [...returnValues];
  }

  async readMoneyAsync() {
    return await this.#readLineAsync();
  }

  async readWinningNumberAndBonusAsync() {
    const winningNumbersInput = await this.#readLineAsync();
    const bonusNumberInput = await this.#readLineAsync();

    return { winningNumbersInput, bonusNumberInput };
  }

  async readRetryAsync() {
    return await this.#readLineAsync();
  }

  async #readLineAsync() {
    return new Promise((resolve) => {
      resolve(this.#returnValues.shift());
    });
  }
}

export default MockInput;
