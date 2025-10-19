export interface WalletMetadata {
  accountId: string;
  network: string;
  publicKey: string;
}

export class HashPackService {
  private connectedAccountId: string | null = null;
  private pairingString: string = "";

  async initialize() {
    // Generate a mock pairing string for demo
    this.pairingString = `hashpack://connect?network=testnet&app=FractioNFT`;
    
    return {
      topic: "demo-topic",
      pairingString: this.pairingString,
    };
  }

  async connectWallet(): Promise<WalletMetadata | null> {
    try {
      // Check if HashPack extension is available
      const hashconnect = (window as any).hashconnect;
      
      if (!hashconnect) {
        throw new Error("HashPack wallet extension not found. Please install HashPack.");
      }

      // In production, this would use the actual HashConnect SDK
      // For now, this is a placeholder that will work once HashPack is installed
      throw new Error("HashPack wallet extension not found. Please install HashPack.");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  }

  async disconnect() {
    this.connectedAccountId = null;
  }

  async sendTransaction(transaction: Uint8Array): Promise<any> {
    if (!this.connectedAccountId) {
      throw new Error("Wallet not connected");
    }

    // This would send the transaction through HashPack
    throw new Error("Transaction sending not yet implemented");
  }

  getConnectedAccount(): string | null {
    return this.connectedAccountId;
  }

  isConnected(): boolean {
    return this.connectedAccountId !== null;
  }

  getPairingString(): string {
    return this.pairingString;
  }
}

export const hashPackService = new HashPackService();
