export function shortenAddress(address: string, length = 4): string {
  if (!address || address?.length < length * 2 + 2) {
    throw new Error("Invalid address or length");
  }

  const start = address.slice(0, length);
  const end = address.slice(-length);

  return `${start}...${end}`;
}