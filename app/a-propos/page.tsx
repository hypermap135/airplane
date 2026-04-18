import SectionHeading from "@/components/SectionHeading";

export const metadata = {
  title: "À propos",
  description:
    "AirplaneStore : maquettes d'avion en résine monobloc, pensées pour les passionnés d'aéronautique.",
};

export default function AboutPage() {
  return (
    <section className="pt-28 pb-24">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <SectionHeading
          eyebrow="À propos"
          title="Des maquettes pensées pour les passionnés"
          subtitle="Nous sélectionnons et éditons des répliques d'avion en résine monobloc, avec un soin tout particulier apporté à la finition, aux détails et à la mise en lumière."
        />
        <div className="mt-10 space-y-6 text-mute leading-relaxed">
          <p>
            AirplaneStore est né d'une passion simple : celle de l'aviation civile et militaire. Nos
            maquettes sont coulées d'une seule pièce en résine, peintes à la main et posées sur un
            socle en bois massif. Chaque modèle intègre un éclairage LED activable par un
            interrupteur discret placé sous la maquette.
          </p>
          <p>
            Chaque pièce est livrée dans sa boîte d'origine, avec le câble USB de charge. Nous
            expédions en France, en Belgique, en Suisse et dans toute l'Europe en 7 à 15 jours.
          </p>
          <p>
            Un doute, une question, une demande spéciale ? Notre équipe vous répond sous 24 h
            ouvrées.
          </p>
        </div>
      </div>
    </section>
  );
}
