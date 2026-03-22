import Lotto from "./Lotto.js";
import MissionRandomUtil from "../util/MissionRandomUtil.js";
import { LOTTO } from "../constant/index.js";

class LottoStore {
  #randomUtil;

  constructor({ randomUtil } = {}) {
    this.#randomUtil = randomUtil ?? new MissionRandomUtil();
  }

  issuedLottos(amount) {
    const count = amount / LOTTO.PRICE;

    return Array.from({ length: count }, () => 
      new Lotto(this.#randomUtil.pickUniqueNumbers())
    );
  }
}

export default LottoStore;
