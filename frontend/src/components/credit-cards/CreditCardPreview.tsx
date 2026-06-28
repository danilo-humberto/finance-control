export type CreditCardPreviewData = {
  id: string;
  name: string;
  logo: string;
  color: string;
};

type CreditCardPreviewProps = {
  card: CreditCardPreviewData;
};

const previewGradientByCardId: Record<string, string> = {
  'card-nubank':
    'linear-gradient(135deg, #7c3aed 0%, #5b21b6 46%, #2e1065 100%)',
  'card-santander':
    'linear-gradient(135deg, #ef4444 0%, #b91c1c 48%, #450a0a 100%)',
  'card-itau':
    'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 52%, #0f172a 100%)',
  'card-c6':
    'linear-gradient(135deg, #303030 0%, #171717 55%, #09090b 100%)',
};

export function CreditCardPreview({ card }: CreditCardPreviewProps) {
  return (
    <div
      className="relative h-[4.05rem] overflow-hidden rounded-xl p-2.5 text-white shadow-lg shadow-black/20"
      style={{
        background: previewGradientByCardId[card.id] ?? card.color,
      }}
      aria-label={`Cartao ${card.name}`}
    >
      <span className="block max-w-[4.1rem] truncate text-[0.9rem] font-bold leading-none">
        {card.logo}
      </span>

      <span className="absolute bottom-2.5 left-2.5 h-3.5 w-[1.15rem] rounded-[0.2rem] bg-yellow-200/90 shadow-sm shadow-black/20" />
    </div>
  );
}
