type Block = {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  proof: number;
  previousHash: string;
};

type Transaction = {
  sender: string;
  recipient: string;
  amount: number;
};

type BlockchainNode = {
  addTransaction(transaction: Transaction): number;
  newBlock(proof: number, previousHash?: string): Promise<Block>;
  findProof(lastProof: number): Promise<number>;

  lastBlock: Block;
};

class BlockchainBrowserNode implements BlockchainNode {
  private readonly chain: Block[] = [];
  private currentTransactions: Transaction[] = [];

  constructor() {
    this.newBlock(100, '1');
  }

  addTransaction(transaction: Transaction): number {
    // Adds a new transaction to the list of transactions.
    this.currentTransactions.push(transaction);

    return this.lastBlock.index + 1;
  }

  async newBlock(proof: number, previousHash?: string): Promise<Block> {
    // Creates a new block and adds it to the chain.
    const block: Block = {
      index: this.chain.length + 1,
      timestamp: Date.now(),
      transactions: [ ...this.currentTransactions ],
      previousHash: previousHash || await hash(this.lastBlock),
      proof
    };

    // Reset the current list of transactions
    this.currentTransactions = [];
    this.chain.push(block);
    return block;
  }

  async findProof(lastProof: number): Promise<number> {
    let proof = 0;

    while (await this.isValidProof(lastProof, proof) === false) {
      proof++;
    }

    return proof;
  }

  get lastBlock(): Block {
    // Returns the last Block in the chain.
    return this.chain[this.chain.length - 1];
  }

  private async isValidProof(lastProof: number, proof: number): Promise<boolean> {
    const guess = `${lastProof}${proof}`;
    const guessHash = await sha256(guess);
    return guessHash.startsWith('0000');
  }
}

async function hash(block: Block): Promise<string> {
  return await sha256(JSON.stringify(block));
}



(async function main() {
  const bc = new BlockchainBrowserNode();
  console.time("adding 4 blocks");
  await addBlock(bc, { sender: 'Emma', recipient: 'Fred', amount: 5 });
  await addBlock(bc, { sender: 'Fred', recipient: 'Emma', amount: 7 });
  await addBlock(bc, { sender: 'Emma', recipient: 'James', amount: 9 });
  await addBlock(bc, { sender: 'James', recipient: 'John', amount: 2 });
  console.timeEnd("adding 4 blocks");
})();

async function addBlock(bc: BlockchainBrowserNode, trx: Transaction): Promise<void> {
  console.log('Adding transaction...');
  bc.addTransaction(trx);

  console.log('Calculating proof...');
  const lastBlock = bc.lastBlock;
  const lastProof = lastBlock.proof;
  const proof = await bc.findProof(lastProof);

  console.log('Calculating hash...');
  const prevHash = await hash(lastBlock);

  console.log('Creating block...');
  const block = await bc.newBlock(proof, prevHash);

  console.log(JSON.stringify(block, null, 2));
}

async function sha256(message: string) {

  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);

  // hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  
  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string
  const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
  return hashHex;
}