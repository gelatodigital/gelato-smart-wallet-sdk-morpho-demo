# EIP 7702 Integration with AA powered by Gelato

A Next.js application demonstrating the integration of EIP 7702 (Account Abstraction) using Gelato's infrastructure. This project showcases how to use EOAs as smart contract wallets with advanced features like gasless transactions and paying gas with ERC20 tokens.

## Features

- Sponsored transactions using Gelato Bundler via 1Balance
- Paying gas with ERC20 tokens (e.g., USDC, WETH) with accurate gas estimations

## Prerequisites

- Node.js 18.x or later
- Yarn package manager
- A Gelato API key
- A Dynamic Environment ID
- A ZeroDev project ID
- An RPC URL for your target network (Sepolia)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/gelatodigital/eip7702-next-demo.git
cd eip7702-next-demo
```

2. Checkout to 7702 Branch:

```bash
git checkout gelato-7702
```

3. Install dependencies:

```bash
yarn install
```

4. Set up environment variables:

   - Copy `.env.local.example` to `.env.local`
   - Fill in the required environment variables

Note:- Currently the demo is configured to ethereum sepolia

```env
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your-dynamic-environment-id
NEXT_PUBLIC_ZERODEV_PROJECT_ID=your-zerodev-project-id
NEXT_PUBLIC_GELATO_API_KEY="your-gelato-api-key"
NEXT_PUBLIC_RPC_URL="your-rpc-url"
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

- `@dynamic-labs/sdk-react-core`: Core Dynamic SDK for Web3 authentication
- `@dynamic-labs/ethereum-aa`: Account Abstraction integration
- `@dynamic-labs/ethereum`: Ethereum wallet connectors
- `@zerodev/sdk`: ZeroDev smart contract wallet SDK
- `viem` v2.23.9: Modern Ethereum library
- `ethers`: Ethereum library
