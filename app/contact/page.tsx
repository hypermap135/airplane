import SectionHeading from "@/components/SectionHeading";

export const metadata = {
  title: "Contact",
  description: "Contactez l'équipe AirplaneStore.",
};

export default function ContactPage() {
  return (
    <section className="pt-28 pb-24">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Contact"
          title="Parlons de votre projet"
          subtitle="Une question sur un modèle, une gravure, une livraison ? Écrivez-nous, nous répondons sous 24 h ouvrées."
        />
        <form className="mt-10 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Prénom" type="text" />
            <Field label="Nom" type="text" />
          </div>
          <Field label="Email" type="email" />
          <Field label="Sujet" type="text" />
          <div>
            <label className="hud text-white/60 block mb-2">Message</label>
            <textarea
              rows={6}
              className="w-full bg-ink-900 border border-ink-border rounded-xl px-4 py-3 text-sm outline-none focus:border-white/40"
            />
          </div>
          <button type="button" className="btn-chrome">
            Envoyer
          </button>
        </form>

        <div className="mt-12 text-sm text-mute space-y-1">
          <div>Email : contact@airplanestore.fr</div>
          <div>Réponse sous 24 h ouvrées</div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, type }: { label: string; type: string }) {
  return (
    <div>
      <label className="hud text-white/60 block mb-2">{label}</label>
      <input
        type={type}
        className="w-full bg-ink-900 border border-ink-border rounded-full px-4 py-2.5 text-sm outline-none focus:border-white/40"
      />
    </div>
  );
}
