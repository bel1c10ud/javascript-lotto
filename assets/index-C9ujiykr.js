(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
class Input {
  async readMoneyAsync() {
    throw new Error("readMoneyAsync 메서드가 구현되지 않았습니다.");
  }
  async readWinningNumberAndBonusAsync() {
    throw new Error("readWinningNumberAndBonusAsync 메서드가 구현되지 않았습니다.");
  }
  async readRetryAsync() {
    throw new Error("readRetryAsync 메서드가 구현되지 않았습니다.");
  }
}
class Output {
  printError() {
    throw new Error("printError 메서드가 구현되지 않았습니다.");
  }
  printResult() {
    throw new Error("printResult 메서드가 구현되지 않았습니다.");
  }
  printPurchasedLottos() {
    throw new Error("printPurchasedLottos 메서드가 구현되지 않았습니다.");
  }
}
const readline = {};
const MONEY_ERROR_MESSAGE = Object.freeze({
  INPUT_NOT_NUMBER: "[ERROR] 구입 금액은 숫자만 입력할 수 있습니다.\n",
  INPUT_NOT_INTEGER: "[ERROR] 구입 금액은 양의 정수만 입력할 수 있습니다.\n",
  INPUT_NOT_THOUSAND_UNIT: "[ERROR] 금액은 1000원 단위로 입력해야 합니다.\n"
});
const LOTTO_ERROR_MESSAGE = Object.freeze({
  INPUT_NOT_SIX_NUMBERS: "[ERROR] 로또 번호는 6개 이어야합니다.\n",
  INPUT_DUPLICATE: "[ERROR] 중복된 번호는 입력할 수 없습니다.\n",
  INPUT_RANGE: "[ERROR] 로또 번호는 1에서 45 사이의 숫자여야 합니다.\n"
});
const INPUT_MESSAGE = Object.freeze({
  PURCHASE_AMOUNT: "> 구입금액을 입력해주세요. ",
  WINNING_NUMBER: "\n> 당첨 번호를 입력해주세요. ",
  BONUS_NUMBER: "\n> 보너스 번호를 입력해 주세요. ",
  ASK_RETRY: "\n> 다시 시작하시겠습니까? (y/n) "
});
const ERROR_MESSAGE = Object.freeze({
  NOT_INPUT_RETRY: "[ERROR] y 또는 n을 입력해주세요.\n",
  INVALID_INPUT: "[ERROR] 올바르지 않은 Input 인스턴스가 입력되었습니다.\n",
  INVALID_OUTPUT: "[ERROR] 올바르지 않은 Output 인스턴스가 입력되었습니다.\n",
  INVALID_RANDOM_UTIL: "[ERROR] 올바르지 않은 RandomUtil 인스턴스가 입력되었습니다.\n",
  NOT_FOUND_MOCK_DATA: "[ERROR] Mock 데이터가 없습니다.\n"
});
class ConsoleInput extends Input {
  constructor() {
    super();
  }
  async readMoneyAsync() {
    return await this.#readLineAsync(INPUT_MESSAGE.PURCHASE_AMOUNT);
  }
  async readWinningNumberAndBonusAsync() {
    const winningNumbersInput = await this.#readLineAsync(INPUT_MESSAGE.WINNING_NUMBER);
    const bonusNumberInput = await this.#readLineAsync(INPUT_MESSAGE.BONUS_NUMBER);
    return { winningNumbersInput, bonusNumberInput };
  }
  async readRetryAsync() {
    return await this.#readLineAsync(INPUT_MESSAGE.ASK_RETRY);
  }
  async #readLineAsync(message) {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      rl.question(message ?? "", (line) => {
        rl.close();
        resolve(line);
      });
    });
  }
}
const LOTTO = Object.freeze({
  COUNT: 6,
  MIN_NUMBER: 1,
  MAX_NUMBER: 45,
  PRICE: 1e3
});
const RANK = {
  FIRST: "RANK_1",
  SECOND: "RANK_2",
  THIRD: "RANK_3",
  FOURTH: "RANK_4",
  FIFTH: "RANK_5"
};
const RANK_PRIZE = {
  [RANK.FIRST]: 2e9,
  [RANK.SECOND]: 3e7,
  [RANK.THIRD]: 15e5,
  [RANK.FOURTH]: 5e4,
  [RANK.FIFTH]: 5e3
};
const RANK_CONDITION = {
  [RANK.FIRST]: { count: 6, hasBonus: false },
  [RANK.SECOND]: { count: 5, hasBonus: true },
  [RANK.THIRD]: { count: 5, hasBonus: false },
  [RANK.FOURTH]: { count: 4, hasBonus: false },
  [RANK.FIFTH]: { count: 3, hasBonus: false }
};
let ConsoleOutput$1 = class ConsoleOutput extends Output {
  constructor() {
    super();
  }
  printError(message) {
    console.log(message);
  }
  printResult(countsObject, returnOnInvestment) {
    console.log("\n당첨 통계");
    console.log("--------------------");
    Object.values(RANK).toReversed().forEach((rank) => {
      console.log(
        [
          `${RANK_CONDITION[rank].count}개 일치`,
          ...RANK_CONDITION[rank].hasBonus ? ["보너스 볼 일치"] : []
        ].join(", ") + ` (${RANK_PRIZE[rank].toLocaleString("ko-KR")}원) - ${countsObject[rank]}개`
      );
    });
    console.log(`총 수익률은 ${returnOnInvestment.toFixed(1)}%입니다.`);
  }
  printPurchasedLottos(lottos) {
    console.log(`${lottos.length}장을 구매했습니다.`);
    lottos.forEach(
      (lotto) => console.log(`[${lotto.getNumbers().join(", ")}]`)
    );
  }
};
class Lotto {
  #numbers;
  constructor(numbers) {
    this.#validate(numbers);
    this.#numbers = numbers.toSorted((a, b) => a - b);
  }
  #validate(numbers) {
    this.#validateCount(numbers);
    this.#validateUnique(numbers);
    numbers.forEach((number) => {
      this.#validateNumber(number);
      this.#validateRange(number);
    });
  }
  #validateCount(numbers) {
    if (numbers.length !== LOTTO.COUNT) {
      throw new Error(LOTTO_ERROR_MESSAGE.INPUT_NOT_SIX_NUMBERS);
    }
  }
  #validateUnique(numbers) {
    const numbersSet = new Set(numbers);
    if (numbersSet.size !== numbers.length) {
      throw new Error(LOTTO_ERROR_MESSAGE.INPUT_DUPLICATE);
    }
  }
  #validateNumber(number) {
    if (typeof number !== "number" || Number.isNaN(number)) {
      throw new Error(LOTTO_ERROR_MESSAGE.INPUT_RANGE);
    }
  }
  #validateRange(number) {
    if (number < LOTTO.MIN_NUMBER || number > LOTTO.MAX_NUMBER) {
      throw new Error(LOTTO_ERROR_MESSAGE.INPUT_RANGE);
    }
  }
  getNumbers() {
    return [...this.#numbers];
  }
}
class RandomUtil {
  pickUniqueNumbers() {
    throw new Error("pickUniqueNumbers 메서드가 구현되지 않았습니다.");
  }
}
class MissionRandomUtil extends RandomUtil {
  #randomNumberGenerator;
  constructor() {
    super();
    this.#randomNumberGenerator = () => Math.floor(
      Math.random() * (LOTTO.MAX_NUMBER - LOTTO.MIN_NUMBER) + LOTTO.MIN_NUMBER
    );
  }
  pickUniqueNumbers() {
    const lottoNumbers = /* @__PURE__ */ new Set();
    do {
      const randomNumber = this.#randomNumberGenerator();
      lottoNumbers.add(randomNumber);
    } while (lottoNumbers.size < LOTTO.COUNT);
    return [...lottoNumbers.keys()];
  }
}
class LottoStore {
  #randomUtil;
  constructor({ randomUtil } = {}) {
    if (randomUtil) this.#validateRandomUtil(randomUtil);
    this.#randomUtil = randomUtil ?? new MissionRandomUtil();
  }
  #validateRandomUtil(randomUtil) {
    if (!(randomUtil instanceof RandomUtil)) {
      throw new Error(ERROR_MESSAGE.INVALID_RANDOM_UTIL);
    }
  }
  issuedLottos(amount) {
    const count = amount / LOTTO.PRICE;
    return Array.from(
      { length: count },
      () => new Lotto(this.#randomUtil.pickUniqueNumbers())
    );
  }
}
class Money {
  #amount;
  constructor(amount) {
    this.#amount = amount;
    this.#validate(amount);
  }
  #validate(amount) {
    this.#validateNumber(amount);
    this.#validatePositiveInteger(amount);
    this.#validateThousandUnit(amount);
  }
  #validateNumber(amount) {
    if (typeof amount !== "number" || Number.isNaN(amount)) {
      throw new Error(MONEY_ERROR_MESSAGE.INPUT_NOT_NUMBER);
    }
  }
  #validatePositiveInteger(amount) {
    if (amount % 1 !== 0 || amount <= 0) {
      throw new Error(MONEY_ERROR_MESSAGE.INPUT_NOT_INTEGER);
    }
  }
  #validateThousandUnit(amount) {
    if (amount % LOTTO.PRICE !== 0) {
      throw new Error(MONEY_ERROR_MESSAGE.INPUT_NOT_THOUSAND_UNIT);
    }
  }
  getMoney() {
    return this.#amount;
  }
}
class LottoResult {
  #counts;
  constructor(counts) {
    this.#counts = { ...counts };
  }
  getCounts() {
    return { ...this.#counts };
  }
  getPrize() {
    return Object.entries(this.#counts).reduce(
      (acc, [rank, count]) => acc + RANK_PRIZE[rank] * count,
      0
    );
  }
  getReturnOnInvestment(amount) {
    if (amount === 0) throw new Error(MONEY_ERROR_MESSAGE.INPUT_NOT_INTEGER);
    return this.getPrize() / amount * 100;
  }
}
class WinningLotto {
  #lottoNumbers;
  #bonus;
  constructor(numbers, bonus) {
    this.#lottoNumbers = numbers;
    this.#validate(numbers, bonus);
    this.#bonus = bonus;
  }
  #validate(numbers, bonus) {
    this.#validateNumber(bonus);
    this.#validateUnique(numbers.getNumbers(), bonus);
    this.#validateRange(bonus);
  }
  #validateNumber(number) {
    if (typeof number !== "number" || Number.isNaN(number)) {
      throw new Error(LOTTO_ERROR_MESSAGE.INPUT_RANGE);
    }
  }
  #validateUnique(numbers, bonus) {
    const UniqueueNumbers = /* @__PURE__ */ new Set([...numbers, bonus]);
    if (UniqueueNumbers.size !== numbers.length + 1) {
      throw new Error(LOTTO_ERROR_MESSAGE.INPUT_DUPLICATE);
    }
  }
  #validateRange(bonus) {
    if (bonus < LOTTO.MIN_NUMBER || bonus > LOTTO.MAX_NUMBER) {
      throw new Error(LOTTO_ERROR_MESSAGE.INPUT_RANGE);
    }
  }
  getNumbers() {
    return this.#lottoNumbers.getNumbers();
  }
  #evaluateLotto(lotto) {
    const UniqueueNumbers = /* @__PURE__ */ new Set([
      ...lotto.getNumbers(),
      ...this.#lottoNumbers.getNumbers()
    ]);
    const matchedNumberCount = lotto.getNumbers().length * 2 - UniqueueNumbers.size;
    const hasBonusNumber = lotto.getNumbers().includes(this.#bonus);
    return Object.entries(RANK_CONDITION).find(
      ([_, condition]) => matchedNumberCount === condition.count && hasBonusNumber === condition.hasBonus
    )?.[0];
  }
  evaluateLottos(lottos) {
    const rankResults = lottos.map((lotto) => this.#evaluateLotto(lotto));
    const rankCounts = Object.values(RANK).reduce((acc, rank) => {
      acc[rank] = 0;
      return acc;
    }, {});
    rankResults.forEach((rank) => {
      if (rank) rankCounts[rank]++;
    });
    return new LottoResult(rankCounts);
  }
}
class App {
  #view;
  #lottoStore;
  constructor({ input, output, lottoStore } = {}) {
    if (input) this.validateInput(input);
    if (output) this.validateOutput(output);
    this.#view = {
      input: input ?? new ConsoleInput(),
      output: output ?? new ConsoleOutput$1()
    };
    this.#lottoStore = lottoStore ?? new LottoStore();
  }
  async run() {
    await this.playLotto();
    while (await this.#askRetry()) {
      await this.playLotto();
    }
  }
  async playLoop() {
    do {
      await this.playLotto();
    } while (await this.#askRetry());
  }
  async playLotto() {
    const money = await this.#askMoney();
    const lottos = this.#lottoStore.issuedLottos(money.getMoney());
    this.#view.output.printPurchasedLottos(lottos);
    const winningLotto = await this.#askWinningNumberAndBonus();
    const lottoGameResult = winningLotto.evaluateLottos(lottos);
    const returnOnInvestment = lottoGameResult.getReturnOnInvestment(
      money.getMoney()
    );
    this.#view.output.printResult(
      lottoGameResult.getCounts(),
      returnOnInvestment
    );
  }
  validateInput(InputClass) {
    if (!(InputClass instanceof Input)) {
      throw new Error(ERROR_MESSAGE.INVALID_INPUT);
    }
  }
  validateOutput(OutputClass) {
    if (!(OutputClass instanceof Output)) {
      throw new Error(ERROR_MESSAGE.INVALID_OUTPUT);
    }
  }
  async #askWinningNumberAndBonus() {
    return await this.#retryUntilSuccess(async () => {
      const { winningNumbersInput, bonusNumberInput } = await this.#view.input.readWinningNumberAndBonusAsync();
      const winningNumbers = winningNumbersInput.split(",").map(Number);
      const bonusNumber = Number(bonusNumberInput);
      return new WinningLotto(new Lotto(winningNumbers), bonusNumber);
    });
  }
  async #askMoney() {
    return await this.#retryUntilSuccess(async () => {
      const inputMoney = await this.#view.input.readMoneyAsync();
      const money = new Money(Number(inputMoney));
      return money;
    });
  }
  async #askRetry() {
    return await this.#retryUntilSuccess(async () => {
      const askRetry = await this.#view.input.readRetryAsync();
      if (askRetry === "y" || askRetry === "Y") return true;
      if (askRetry === "n" || askRetry === "N") return false;
      throw new Error(ERROR_MESSAGE.NOT_INPUT_RETRY);
    });
  }
  async #retryUntilSuccess(task) {
    while (true) {
      try {
        return await task();
      } catch (e) {
        this.#view.output.printError(e.message);
      }
    }
  }
}
class WebInput extends Input {
  #elements;
  constructor() {
    super();
    this.#elements = {
      mainContainerBody: document.querySelector(".main__container__body"),
      mainContainerFooter: document.querySelector(".main__container__footer"),
      modalFooter: document.querySelector(".modal__footer"),
      overlay: document.querySelector(".overlay")
    };
    if (!this.#elements.mainContainerBody) {
      throw new Error("main__container__body를 찾을 수 없습니다.");
    }
    if (!this.#elements.mainContainerFooter) {
      throw new Error("main__container__footer를 찾을 수 없습니다.");
    }
    if (!this.#elements.modalFooter) {
      throw new Error("modal__footer를 찾을 수 없습니다.");
    }
    if (!this.#elements.overlay) {
      throw new Error("overlay를 찾을 수 없습니다.");
    }
  }
  async readMoneyAsync() {
    this.removeElement(".money__container");
    const formEl = document.createElement("form");
    formEl.className = "money__container";
    this.#elements.mainContainerBody.appendChild(formEl);
    formEl.innerHTML = `
      <p>구입할 금액을 입력해주세요.</p>
      <fieldset class="money__inputs">
        <label for="money" class="hidden">금액</label>
        <input type="number" class="money__input" name="money" min="1000" step="1000" placeholder="금액" />
        <button class="money__submit">구입</button>
      </fieldset>
    `;
    return new Promise((resolve) => {
      formEl.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(formEl);
        const data = Object.fromEntries(formData.entries());
        this.diasbleElement(".money__input");
        this.diasbleElement(".money__submit");
        resolve(data.money);
      });
    });
  }
  async readWinningNumberAndBonusAsync() {
    this.removeElement(".winning-number-and-bonus__container");
    this.removeElement(".show-result__button");
    const formEl = document.createElement("form");
    formEl.className = "winning-number-and-bonus__container";
    this.#elements.mainContainerBody.appendChild(formEl);
    const orders = ["first", "second", "third", "fourth", "fifth", "sixth"];
    const inputSelectors = [
      ...orders.map((order) => `.winning-number__${order}__input`),
      ".bonus-number__input"
    ];
    formEl.innerHTML = `
      <p>지난 주 당첨번호 6개와 보너스 번호 1개를 입력해주세요.</p
      >
      <div class="winning-number-and-bonus__inputs">
        <div class="winning-number__container">
          <p>당첨 번호</p>
          <div  class="winning-number__inputs">
          ${orders.map(
      (order) => `
            <input
              type="number"
              class="winning-number__${order}__input"
              name="winning-number__${order}"
              min="${LOTTO.MIN_NUMBER}"
              max="${LOTTO.MAX_NUMBER}"
              step="1"
            />
            `
    ).join("")}
          </div>
        </div>
        <div class="bonus__container">
          <p>보너스 번호</p>
          <div class="bonus__inputs">
            <input
              type="number"
              class="bonus-number__input"
              name="bonus-number"
              min="${LOTTO.MIN_NUMBER}"
              max="${LOTTO.MAX_NUMBER}"
              step="1"
            />
          </div>
        </div>
      </div>
    `;
    const submitButtonEl = document.createElement("button");
    submitButtonEl.type = "submit";
    submitButtonEl.className = "winning-number-and-bonus__submit hidden";
    submitButtonEl.textContent = "확인";
    formEl.appendChild(submitButtonEl);
    const resultButtonEl = document.createElement("button");
    resultButtonEl.className = "show-result__button";
    resultButtonEl.textContent = "결과 확인하기";
    resultButtonEl.addEventListener("click", () => {
      submitButtonEl.click();
    });
    this.#elements.mainContainerFooter.appendChild(resultButtonEl);
    return new Promise((resolve) => {
      formEl.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        inputSelectors.forEach((selector) => {
          this.diasbleElement(selector);
        });
        resolve({
          winningNumbersInput: orders.map((order) => formData.get(`winning-number__${order}`)).join(","),
          bonusNumberInput: formData.get("bonus-number")
        });
      });
    });
  }
  async readRetryAsync() {
    this.#elements.modalFooter.innerHTML = "";
    const buttonEl = document.createElement("button");
    buttonEl.className = "retry__button";
    buttonEl.textContent = "다시 시작";
    this.#elements.modalFooter.appendChild(buttonEl);
    return new Promise((resolve) => {
      buttonEl.addEventListener("click", (e) => {
        e.preventDefault();
        resolve("y");
        this.hiddenOverlay();
        this.removeElement(".money__container");
        this.removeElement(".purchased-lottos__container");
        this.removeElement(".winning-number-and-bonus__container");
        this.removeElement(".show-result__button");
      });
    });
  }
  diasbleElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.disabled = true;
    }
  }
  removeElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.remove();
    }
  }
  hiddenOverlay() {
    this.#elements.overlay.classList.add("hidden");
  }
}
class ConsoleOutput2 extends Output {
  #elements;
  constructor() {
    super();
    this.#elements = {
      mainContainerBody: document.querySelector(".main__container__body"),
      mainContainerFooter: document.querySelector(".main__container__footer"),
      overlay: document.querySelector(".overlay"),
      modalHeader: document.querySelector(".modal__header"),
      modalBody: document.querySelector(".modal__body")
    };
    if (!this.#elements.mainContainerBody) {
      throw new Error("main__container__body를 찾을 수 없습니다.");
    }
    if (!this.#elements.mainContainerFooter) {
      throw new Error("main__container__footer를 찾을 수 없습니다.");
    }
    if (!this.#elements.overlay) {
      throw new Error("overlay를 찾을 수 없습니다.");
    }
    if (!this.#elements.modalHeader) {
      throw new Error("modal__header를 찾을 수 없습니다.");
    }
    if (!this.#elements.modalBody) {
      throw new Error("modal__body를 찾을 수 없습니다.");
    }
  }
  printError(message) {
    alert(message);
  }
  printResult(countsObject, returnOnInvestment) {
    this.#elements.modalHeader.innerHTML = `
      <button class="close__button">
        <img src="/close.svg" alt="닫기" />
      </button>
      <h2>🏆 당첨 통계 🏆</h2>
    `;
    const closeButtonEl = document.querySelector(".close__button");
    closeButtonEl?.addEventListener("click", () => {
      this.#elements.overlay.classList.add("hidden");
    });
    this.#elements.modalBody.innerHTML = `
      <table class="result__table">
        <thead>
          <tr>
            <th>일치 갯수</th>
            <th>당첨금</th>
            <th>당첨 갯수</th>
          </tr>
        </thead>
        <tbody>
          ${Object.values(RANK).toReversed().map(
      (rank) => `
              <tr>
                <td>
                ${[
        `${RANK_CONDITION[rank].count}개`,
        ...RANK_CONDITION[rank].hasBonus ? ["보너스볼"] : []
      ].join("+")}
                </td>
                <td>${RANK_PRIZE[rank].toLocaleString("ko-KR")}</td>
                <td>${countsObject[rank]}개</td>
              </tr>
            `
    ).join("")}
        </tbody>
      </table>
      <p class="return-on-investment">당신의 총 수익률은 ${returnOnInvestment.toFixed(1)}%입니다.</p>
    `;
    this.#elements.overlay.classList.remove("hidden");
    const showResultButtonEl = document.querySelector(".show-result__button");
    showResultButtonEl?.addEventListener("click", () => {
      this.#elements.overlay.classList.remove("hidden");
    });
  }
  printPurchasedLottos(lottos) {
    const containerEl = document.createElement("div");
    containerEl.className = "purchased-lottos__container";
    this.#elements.mainContainerBody.appendChild(containerEl);
    const paragraphEl = document.createElement("p");
    paragraphEl.className = "purchased-lottos-count";
    paragraphEl.textContent = `총 ${lottos.length}개를 구매하였습니다.`;
    containerEl.appendChild(paragraphEl);
    const listEl = document.createElement("ul");
    listEl.className = "purchased-lottos__list";
    containerEl.appendChild(listEl);
    listEl.innerHTML = `
      ${lottos.map(
      (lotto) => `
        <li class="purchased-lotto">
          <img src='./public/lotto.png' alt='로또' />
          <span>${lotto.getNumbers().join(", ")}</span>
        </li>
      `
    ).join("")}
    `;
  }
}
const app = new App({
  input: new WebInput(),
  output: new ConsoleOutput2()
});
app.run();
