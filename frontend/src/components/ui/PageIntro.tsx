type PageIntroProps = {
  title: string;
  description: string;
};

export function PageIntro({ title, description }: PageIntroProps) {
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-normal text-slate-50">
        {title}
      </h1>
      <p className="text-sm leading-6 text-slate-400">{description}</p>
    </section>
  );
}
