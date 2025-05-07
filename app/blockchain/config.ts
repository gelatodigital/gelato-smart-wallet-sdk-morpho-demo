import { baseSepolia } from "viem/chains";
import { HiOutlineCurrencyDollar } from "react-icons/hi";

export const chainConfig = baseSepolia;
export const usdcAddress = "0x87c25229AFBC30418D0144e8Dfb2bcf8eFd92c6c";

export const TOKEN_CONFIG = {
  USDC: {
    address: usdcAddress,
    symbol: "USDC",
    decimals: 6,
    icon: HiOutlineCurrencyDollar,
  },
};

export const marketParams = {
  collateralToken: "0x63cc3c2b5B5881000aC7615D3aB0551CE30C72D8",
  loanToken: "0x87c25229AFBC30418D0144e8Dfb2bcf8eFd92c6c",
  oracle: "0xA07CA1755545F5C3BC73bE889937fAa4A637D634",
  irm: "0x46415998764C29aB2a25CbeA6254146D50D22687",
  lltv: BigInt(945000000000000000), // 94.5% LLTV
};

export const morphoAddress = "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb";
export const morphoVaultAddress = "0x297E324C46309E93112610ebf35559685b4E3547";
export const vaultStatsAddress = "0xC1e75DE4Dd4d7A2cFB1d675D332cB88d3443971D";
export const deployerAddress = "0xB65540bBA534E88EB4a5062D0E6519C07063b259";
export const marketId =
  "0xebe0d9732c13a7e6b7a9377bf103a00fbca042e7389b783ad759b12ff3700cdb";
