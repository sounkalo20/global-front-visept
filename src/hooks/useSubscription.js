import useCompanyStore from '@/store/companyStore';

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

  let features = {};
  if (activeCompany && activeCompany.plan_features) {
    try {
      features = typeof activeCompany.plan_features === 'string' 
        ? JSON.parse(activeCompany.plan_features) 
        : activeCompany.plan_features;
    } catch (e) {
      features = {};
    }
  }

  const limits = {
    max_employees: activeCompany?.max_employees ?? null,
    max_products: activeCompany?.max_products ?? null,
    max_clients: activeCompany?.max_clients ?? null,
  };

  const hasFeature = (featureName) => {
    if (isExpiredOrCanceled) return false;
    return features[featureName] === true;
  };

  const canAddMore = (limitName, currentCount) => {
    if (isExpiredOrCanceled) return false;
    const limit = limits[limitName];
    if (limit === null || limit === undefined) return true; // Illimité
    return currentCount < limit;
  };

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
