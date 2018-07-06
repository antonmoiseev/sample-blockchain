import { sha256 } from './universal_sha256.js';

export interface Transaction {
  readonly sender: string;
  readonly recipient: string;
  readonly amount: number;
}

export class Block {
  private _nonce: number = 0;
  private _hash: string;

  get nonce(): number {
    return this._nonce;
  }

  get hash(): string {
    return this._hash;
  }

  constructor (
    readonly previousHash: string,
    readonly timestamp: number,
    readonly transactions: Transaction[]
  ) {}
  
  async mine(): Promise<void> {
    do {
      this._hash = await this.calculateHash(++this._nonce);
    } while (this._hash.startsWith('0000') === false);
  }

  private async calculateHash(nonce: number): Promise<string> {
    const data = this.previousHash + this.timestamp + JSON.stringify(this.transactions) + nonce;
    return sha256(data);
  }
}

export class Blockchain {
  private readonly chain: Block[] = [];
  private _pendingTransactions: Transaction[] = [];

  private get latestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  get pendingTransactions(): Transaction[] {
    return [ ...this._pendingTransactions ];
  }

  async createGenesisBlock(): Promise<void> {
    const genesisBlock = new Block('0', Date.now(), []);
    await genesisBlock.mine();
    this.chain.push(genesisBlock);
  }

  createTransaction(transaction: Transaction): void {
    this._pendingTransactions.push(transaction);
  }

  async minePendingTransactions(): Promise<void> {
    const block = new Block(this.latestBlock.hash, Date.now(), this._pendingTransactions);
    await block.mine();
    this.chain.push(block);
    this._pendingTransactions = [];
  }
}
