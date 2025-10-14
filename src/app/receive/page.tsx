import { type TransferParams } from "@avail-project/nexus-widgets";
import { ReceiveClient } from "./_components/ReceiveClient";

interface ReceivePageProps {
  searchParams: {
    to?: string;
    chainId?: string;
    token?: string;
  };
}

export default function ReceivePage({ searchParams }: ReceivePageProps) {
  const { to, chainId, token } = searchParams;

  let prefill: Partial<TransferParams> | undefined;

  if (to && chainId && token) {
    prefill = {
      recipient: to as `0x${string}`,
      chainId: parseInt(chainId, 10) as any,
      token: token as any,
    };
  }

  return <ReceiveClient prefill={prefill} />;
}
