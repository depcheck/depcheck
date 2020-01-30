/* eslint-disable no-unused-vars */
import { observable, computed } from 'mobx';

class OrderLine {
  @observable price = 0;

  @observable amount = 1;

  @computed get total() {
    return this.price * this.amount;
  }
}
