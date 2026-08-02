import useCompanyStore from '@/store/companyStore';
import { useCallback, useMemo } from 'react';

/**
 * Hook pour gérer l'état et les fonctionnalités de l'abonnement SaaS (Visept)
 */
export const useSubscription = () => {
  const { activeCompany } = useCompanyStore();

  const getStatus = () => {
    if (!activeCompany) return 'expired';
    const status = activeCompany.subscription_status;
    const endsAt = activeCompany.subscription_ends_at ? new Date(activeCompany.subscription_ends_at) : null;
    const graceEndsAt = activeCompany.grace_period_ends_at ? new Date(activeCompany.grace_period_ends_at) : null;
    const now = new Date();

    let computedStatus = status;

    if (computedStatus === 'active' && endsAt && endsAt < now) {
      computedStatus = 'past_due';
    }

    if (computedStatus === 'past_due' && graceEndsAt && graceEndsAt < now) {
      computedStatus = 'expired';
    }

    return computedStatus;
  };

  const status = getStatus();
  const isExpiredOrCanceled = status === 'expired' || status === 'canceled';

  const features = useMemo(() => {
    if (activeCompany && activeCompany.plan_features) {
      try {
        return typeof activeCompany.plan_features === 'string' 
          ? JSON.parse(activeCompany.plan_features) 
          : activeCompany.plan_features;
      } catch (e) {
        return {};
      }
    }
    return {};
  }, [activeCompany]);

  const limits = useMemo(() => ({
    max_employees: activeCompany?.max_employees ?? null,
    max_products: activeCompany?.max_products ?? null,
    max_clients: activeCompany?.max_clients ?? null,
  }), [activeCompany]);

  const hasFeature = useCallback((featureName) => {
    if (isExpiredOrCanceled) return false;
    return features[featureName] === true;
  }, [isExpiredOrCanceled, features]);

  const canAddMore = useCallback((limitName, currentCount) => {
    if (isExpiredOrCanceled) return false;
    const limit = limits[limitName];
    if (limit === null || limit === undefined) return true; // Illimité
    return currentCount < limit;
  }, [isExpiredOrCanceled, limits]);

  return {
    status,
    features,
    limits,
    hasFeature,
    canAddMore,
    isExpiredOrCanceled,
    planCode: activeCompany?.plan_code || 'FREE'
  };
};
