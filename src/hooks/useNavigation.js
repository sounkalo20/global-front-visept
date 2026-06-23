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

        if (typeCode) {
            return getNavigationByType(typeCode);
        }

        // 3. fallback
        return getNavigationByType('SHOP');
    }, [isSuperAdmin, activeCompany]);

    return navigation;
}