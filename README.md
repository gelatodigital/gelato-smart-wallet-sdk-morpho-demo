# EIP 7702 Integration with AA powered by Gelato

A Next.js application demonstrating the integration of EIP 7702 (Account Abstraction) using Gelato's infrastructure. This project showcases how to use EOAs as smart contract wallets with advanced features like gasless transactions to borrow and supply loan(USDC) from/to Morpho market.

## Features

- Smart EOA's using Gelato Smart Wallet SDK
- Sponsored transactions using Gelato Bundler via 1Balance

## Prerequisites

- Node.js 18.x or later
- Yarn package manager
- A Gelato API key
- A Dynamic Environment ID
- An RPC URL for your target network (Base Sepolia)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/gelatodigital/eip7702-next-demo.git
cd eip7702-next-demo
```

2. Checkout to 7702 SDK Branch:

```bash
git checkout gelato-7702-sdk-morpho
```

3. Install dependencies:

```bash
yarn install
```

4. Set up environment variables:

   - Copy `.env.example` to `.env`
   - Fill in the required environment variables

Note:- Currently the demo is configured to base sepolia

```env
NEXT_PUBLIC_MORPHO_DYNAMIC_ENVIRONMENT_ID=your-dynamic-environment-id
NEXT_PUBLIC_MORPHO_GELATO_API_KEY="your-gelato-api-key"
NEXT_PUBLIC_MORPHO_RPC_URL="your-rpc-url"
```

## Development

Run the development server:

```bash
yarn run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── providers.tsx       # Web3 providers configuration
│   └── page.tsx           # Main application page
├── components/            # React components
├── lib/                   # Utility functions and configurations
├── public/               # Static assets
```

## Key Dependencies

- `@gelatonetwork/smartwallet-react-sdk`: Gelato's 7702 React SDK
- `viem` v2.28: Modern Ethereum library
- `ethers`: Ethereum library
