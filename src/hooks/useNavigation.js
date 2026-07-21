import { useMemo } from 'react';
import useAuthStore from '@/store/authStore';
import useCompanyStore from '@/store/companyStore';
import { getNavigationByType } from '@/lib/config/navigation';
import { BUSINESS_TYPE_MAP } from '@/lib/config/businessTypeMap';

export default function useNavigation() {
    const { isSuperAdmin } = useAuthStore();
    const { activeCompany } = useCompanyStore();

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

        // Filter out items that require a role the user doesn't have
        const isOwner = activeCompany?.my_role === 'owner';
        return baseNav.map(section => {
            return {
                ...section,
                items: section.items.filter(item => {
                    if (item.requireRole === 'owner' && !isOwner) return false;
                    return true;
                })
            };
        }).filter(section => section.items.length > 0);
    }, [isSuperAdmin, activeCompany]);

    return navigation;
}