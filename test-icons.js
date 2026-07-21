const lucide = require('lucide-react');

const iconsToCheck = [
    'LayoutDashboard',
    'ShoppingCart',
    'Receipt',
    'DollarSign',
    'Package',
    'FolderTree',
    'Users',
    'Building2',
    'Settings',
    'CreditCard',
    'FileText',
    'Store',
    'ClipboardList',
    'Bell',
    'Shield',
    'Calendar',
    'Clock',
    'Truck',
    'CircleDollarSign',
    'Box',
    'ChefHat',
    'Coffee',
    'UtensilsCrossed'
];

iconsToCheck.forEach(icon => {
    if (!lucide[icon]) {
        console.log(`MISSING ICON: ${icon}`);
    }
});
console.log('DONE CHECKING');
