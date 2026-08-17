import React from 'react';
import { Lock, Crown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSubscription } from '@/hooks/useSubscription';

/**
 * Composant à afficher par-dessus une fonctionnalité non accessible
 * selon l'abonnement en cours.
 */
export const FeatureLockedOverlay = ({
  featureName,
  title = "Fonctionnalité Premium",
  description = "Cette fonctionnalité n'est pas disponible dans votre forfait actuel. Mettez à niveau votre abonnement pour débloquer tout le potentiel de Visept.",
  children
}) => {
  const { hasFeature, isExpiredOrCanceled } = useSubscription();

  // Si expiré ou la feature est absente, on affiche l'overlay
  const isLocked = isExpiredOrCanceled || !hasFeature(featureName);

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative group min-h-[300px]">
      {/* Le contenu en-dessous est flouté et inactif */}
      <div className="filter blur-sm opacity-50 pointer-events-none select-none transition-all duration-300 group-hover:blur-md h-full">
        {children}
      </div>

      {/* L'overlay absolu */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-background/95 backdrop-blur border shadow-xl rounded-xl p-8 max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>

          <h3 className="text-xl font-semibold mb-2">{title}</h3>

          <p className="text-muted-foreground text-sm mb-6">
            {isExpiredOrCanceled
              ? "Votre abonnement est expiré. Veuillez le renouveler pour retrouver l'accès."
              : description}
          </p>

          <Link
            href="/shop/companies"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full group"
          >
            <Crown className="w-4 h-4 mr-2" />
            {isExpiredOrCanceled ? "Renouveler l'abonnement" : "Voir les forfaits"}
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};
