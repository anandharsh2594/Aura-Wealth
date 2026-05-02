import BankProfileClient from "../ui/BankProfileClient";

export default function BankProfilePage({ params }: { params: { bank: string } }) {
  return <BankProfileClient bankSlug={params.bank} />;
}

