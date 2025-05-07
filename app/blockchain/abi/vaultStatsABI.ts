export const VAULT_STATS_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "total",
        type: "uint256",
      },
    ],
    name: "calculateApyUser",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "total",
        type: "uint256",
      },
    ],
    name: "calculateApyVault",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountToDeposit",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "previousTotal",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalVault",
        type: "uint256",
      },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "scale",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "userStats",
    outputs: [
      {
        internalType: "uint256",
        name: "previousInterval",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "previousApy",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "lastPointDeposit",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "lastPointTimestamp",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "vaultApy",
    outputs: [
      {
        internalType: "uint256",
        name: "previousInterval",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "previousApy",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "lastPointDeposit",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "lastPointTimestamp",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountToWithdraw",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "previousTotal",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalVault",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
