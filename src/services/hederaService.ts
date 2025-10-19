import { 
  Client, 
  TokenCreateTransaction, 
  TokenType, 
  TokenSupplyType,
  TokenMintTransaction,
  TransferTransaction,
  AccountId,
  PrivateKey,
  Hbar,
  TokenId
} from "@hashgraph/sdk";

export interface HederaConfig {
  network: "testnet" | "mainnet";
  operatorId?: string;
  operatorKey?: string;
}

export class HederaService {
  private client: Client | null = null;
  private config: HederaConfig;

  constructor(config: HederaConfig) {
    this.config = config;
  }

  initializeClient(operatorId: string, operatorKey: string) {
    try {
      this.client = this.config.network === "testnet" 
        ? Client.forTestnet() 
        : Client.forMainnet();
      
      this.client.setOperator(
        AccountId.fromString(operatorId),
        PrivateKey.fromString(operatorKey)
      );
      
      return true;
    } catch (error) {
      console.error("Failed to initialize Hedera client:", error);
      return false;
    }
  }

  async createNFT(name: string, symbol: string, metadata: string) {
    if (!this.client) {
      throw new Error("Hedera client not initialized");
    }

    try {
      // Create NFT token
      const tokenCreateTx = await new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setTokenType(TokenType.NonFungibleUnique)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(1)
        .setTreasuryAccountId(this.client.operatorAccountId!)
        .setAdminKey(this.client.operatorPublicKey!)
        .setSupplyKey(this.client.operatorPublicKey!)
        .setMaxTransactionFee(new Hbar(10))
        .freezeWith(this.client);

      const tokenCreateSign = await tokenCreateTx.sign(
        PrivateKey.fromString(this.config.operatorKey!)
      );
      const tokenCreateSubmit = await tokenCreateSign.execute(this.client);
      const tokenCreateRx = await tokenCreateSubmit.getReceipt(this.client);
      const tokenId = tokenCreateRx.tokenId;

      if (!tokenId) {
        throw new Error("Failed to create token");
      }

      // Mint the NFT with metadata
      const mintTx = await new TokenMintTransaction()
        .setTokenId(tokenId)
        .setMetadata([Buffer.from(metadata)])
        .setMaxTransactionFee(new Hbar(10))
        .freezeWith(this.client);

      const mintSign = await mintTx.sign(
        PrivateKey.fromString(this.config.operatorKey!)
      );
      const mintSubmit = await mintSign.execute(this.client);
      const mintRx = await mintSubmit.getReceipt(this.client);

      return {
        tokenId: tokenId.toString(),
        serialNumber: mintRx.serials[0].toString(),
        transactionId: mintSubmit.transactionId.toString(),
      };
    } catch (error) {
      console.error("Error creating NFT:", error);
      throw error;
    }
  }

  async createFractionalToken(
    nftTokenId: string,
    name: string,
    symbol: string,
    totalSupply: number
  ) {
    if (!this.client) {
      throw new Error("Hedera client not initialized");
    }

    try {
      // Create fungible token for fractions
      const tokenCreateTx = await new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(0)
        .setInitialSupply(totalSupply)
        .setTreasuryAccountId(this.client.operatorAccountId!)
        .setAdminKey(this.client.operatorPublicKey!)
        .setSupplyKey(this.client.operatorPublicKey!)
        .setMaxTransactionFee(new Hbar(10))
        .freezeWith(this.client);

      const tokenCreateSign = await tokenCreateTx.sign(
        PrivateKey.fromString(this.config.operatorKey!)
      );
      const tokenCreateSubmit = await tokenCreateSign.execute(this.client);
      const tokenCreateRx = await tokenCreateSubmit.getReceipt(this.client);
      const tokenId = tokenCreateRx.tokenId;

      if (!tokenId) {
        throw new Error("Failed to create fractional token");
      }

      return {
        tokenId: tokenId.toString(),
        transactionId: tokenCreateSubmit.transactionId.toString(),
      };
    } catch (error) {
      console.error("Error creating fractional token:", error);
      throw error;
    }
  }

  async transferFractionalTokens(
    tokenId: string,
    toAccountId: string,
    amount: number
  ) {
    if (!this.client) {
      throw new Error("Hedera client not initialized");
    }

    try {
      const transferTx = await new TransferTransaction()
        .addTokenTransfer(
          TokenId.fromString(tokenId),
          this.client.operatorAccountId!,
          -amount
        )
        .addTokenTransfer(
          TokenId.fromString(tokenId),
          AccountId.fromString(toAccountId),
          amount
        )
        .setMaxTransactionFee(new Hbar(5))
        .freezeWith(this.client);

      const transferSign = await transferTx.sign(
        PrivateKey.fromString(this.config.operatorKey!)
      );
      const transferSubmit = await transferSign.execute(this.client);
      const transferRx = await transferSubmit.getReceipt(this.client);

      return {
        status: transferRx.status.toString(),
        transactionId: transferSubmit.transactionId.toString(),
      };
    } catch (error) {
      console.error("Error transferring tokens:", error);
      throw error;
    }
  }

  async getTokenInfo(tokenId: string) {
    if (!this.client) {
      throw new Error("Hedera client not initialized");
    }

    try {
      const response = await fetch(
        `https://${this.config.network}.mirrornode.hedera.com/api/v1/tokens/${tokenId}`
      );
      return await response.json();
    } catch (error) {
      console.error("Error fetching token info:", error);
      throw error;
    }
  }

  async getNFTInfo(tokenId: string, serialNumber: string) {
    if (!this.client) {
      throw new Error("Hedera client not initialized");
    }

    try {
      const response = await fetch(
        `https://${this.config.network}.mirrornode.hedera.com/api/v1/tokens/${tokenId}/nfts/${serialNumber}`
      );
      return await response.json();
    } catch (error) {
      console.error("Error fetching NFT info:", error);
      throw error;
    }
  }
}

export const hederaService = new HederaService({ network: "testnet" });
