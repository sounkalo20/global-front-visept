import { useMemo } from 'react';
import useAuthStore from '@/store/authStore';
import useCompanyStore from '@/store/companyStore';
import usePermissionsStore from '@/store/permissionsStore';
import { getNavigationByType } from '@/lib/config/navigation';
import { BUSINESS_TYPE_MAP } from '@/lib/config/businessTypeMap';

export default function useNavigation() {
    const { isSuperAdmin } = useAuthStore();
    const { activeCompany } = useCompanyStore();
    const { hasPermission, isFetched: permsFetched } = usePermissionsStore();

    const navigation = useMemo(() => {
        // 1. Super admin
        if (isSuperAdmin) {
            return getNavigationByType('super_admin');
        }

        // 2. Mapping business_type_id -> code
        const typeCode = BUSINESS_TYPE_MAP[activeCompany?.business_type_id];

        let baseNav = [];
        if (typeCode) {
            baseNav = getNavigationByType(typeCode);
        } else {
            baseNav = getNavigationByType('SHOP');
        }

        // Si les permissions ne sont pas chargées, on ne montre rien
        if (!permsFetched) return [];

        return baseNav.map(section => {
            return {
                ...section,
                items: section.items.filter(item => {
                    // Si l'item a requirePermission, vérifier avec le store
                    if (item.requirePermission) {
                        return hasPermission(item.requirePermission);
                    }
                    // Compatibilité avec les anciens flags si certains n'ont pas encore requirePermission
                    if (item.requireRole === 'owner') return hasPermission('settings.manage');
                    if (item.allowCashier) return true; // Tout le monde a accès si pas de restriction explicite
                    
                    return true;
                })
            };
        }).filter(section => section.items.length > 0);
    }, [isSuperAdmin, activeCompany, hasPermission, permsFetched]);

    return navigation;
}