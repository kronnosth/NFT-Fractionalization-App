# Hedera Blockchain Integration

This application integrates with the Hedera network for real NFT and fractional token management.

## Features

- **Real Hedera SDK Integration**: Uses `@hashgraph/sdk` for blockchain transactions
- **HashPack Wallet Support**: Connect with HashPack wallet for secure transaction signing
- **NFT Creation**: Create non-fungible tokens on Hedera network
- **Token Fractionalization**: Convert NFTs into fungible fractional tokens
- **Protobuf Support**: Built-in protobuf handling via `@hashgraph/proto`

## Setup Instructions

### 1. Install HashPack Wallet

Download and install the HashPack wallet extension:
- Chrome: https://chrome.google.com/webstore/detail/hashpack/gjagmgiddbbciopjhllkdnddhcglnemk
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/hashpack/
- Or visit: https://www.hashpack.app/download

### 2. Configure Hedera Credentials

For backend operations (Edge Functions), you'll need:
- Hedera Account ID (format: `0.0.xxxxx`)
- Hedera Private Key (format: `302e020100300506032b657004220420...`)

You can get testnet credentials from:
- Hedera Portal: https://portal.hedera.com/
- Or create an account through HashPack

### 3. Environment Variables

The following environment variables are used:
- `HEDERA_ACCOUNT_ID`: Your Hedera account ID
- `HEDERA_PRIVATE_KEY`: Your Hedera private key
- `HEDERA_NETWORK`: Network to use (`testnet` or `mainnet`)

## Architecture

### Frontend Components

- **WalletConnect**: Handles HashPack wallet connection
- **HederaService**: Main service for blockchain operations
- **HashPackService**: Wallet connection and transaction signing

### Backend (Edge Functions)

Create edge functions for server-side operations:

```typescript
// Example: Create NFT via Edge Function
import { Client, TokenCreateTransaction } from "@hashgraph/sdk";

const operatorId = Deno.env.get("HEDERA_ACCOUNT_ID");
const operatorKey = Deno.env.get("HEDERA_PRIVATE_KEY");

const client = Client.forTestnet();
client.setOperator(operatorId!, operatorKey!);

// Create NFT token
const transaction = await new TokenCreateTransaction()
  .setTokenName(name)
  .setTokenSymbol(symbol)
  .execute(client);
```

## API Endpoints

### Hedera Mirror Node REST API

The application uses the Hedera Mirror Node REST API for querying blockchain data:

- **Testnet**: `https://testnet.mirrornode.hedera.com/api/v1`
- **Mainnet**: `https://mainnet.mirrornode.hedera.com/api/v1`

Example endpoints:
- `/tokens/{tokenId}` - Get token information
- `/tokens/{tokenId}/nfts/{serialNumber}` - Get NFT details
- `/transactions/{transactionId}` - Get transaction details

Documentation: https://docs.hedera.com/hedera/sdks-and-apis/rest-api

## Transaction Flow

### Creating an NFT

1. User connects HashPack wallet
2. Application creates NFT token transaction
3. User signs transaction in HashPack
4. Transaction is submitted to Hedera network
5. NFT details are stored in database with token ID

### Fractionalizing an NFT

1. User selects NFT to fractionalize
2. Application creates fungible token for fractions
3. User signs fractionalization transaction
4. Fractional tokens are minted and distributed
5. Database records fractionalization details

## Smart Contracts

For advanced functionality, you can deploy smart contracts:

```solidity
// Example: NFT Fractionalization Contract
pragma solidity ^0.8.0;

contract NFTFractionalizer {
    function fractionalizeNFT(
        address nftAddress,
        uint256 tokenId,
        uint256 fractionCount
    ) external returns (address) {
        // Create fractional token
        // Transfer NFT to contract
        // Mint fractional tokens
    }
}
```

Deploy using Hedera File Service and Contract Service.

## Security Considerations

1. **Never expose private keys** in frontend code
2. **Use Edge Functions** for sensitive operations
3. **Validate all transactions** before signing
4. **Implement RLS policies** for database access
5. **Rate limit** blockchain operations

## Testing

### Testnet

- Use Hedera testnet for development
- Get free testnet HBAR from: https://portal.hedera.com/
- Test all transactions before mainnet deployment

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Resources

- Hedera SDK Documentation: https://docs.hedera.com/hedera/sdks-and-apis/sdks
- HashPack Documentation: https://docs.hashpack.app/
- Mirror Node API: https://docs.hedera.com/hedera/sdks-and-apis/rest-api
- Smart Contracts: https://docs.hedera.com/hedera/core-concepts/smart-contracts

## Troubleshooting

### HashPack Not Connecting

1. Ensure HashPack extension is installed
2. Check that wallet is unlocked
3. Verify network selection (testnet/mainnet)
4. Clear browser cache and retry

### Transaction Failures

1. Check account has sufficient HBAR
2. Verify network connectivity
3. Check transaction size limits
4. Review transaction parameters

### Token Creation Issues

1. Ensure proper key configuration
2. Verify token parameters (name, symbol, supply)
3. Check account permissions
4. Review gas limits

## Support

For issues or questions:
- Hedera Discord: https://hedera.com/discord
- HashPack Support: https://help.hashpack.app/
- GitHub Issues: [Your Repository]
