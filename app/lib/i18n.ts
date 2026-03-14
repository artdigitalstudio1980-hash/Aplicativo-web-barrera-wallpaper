
export const locales = ['en', 'es'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'en';

export function getLocaleFromUrl(url: string): Locale {
  const segments = url.split('/');
  const localeSegment = segments[1];
  
  if (locales.includes(localeSegment as Locale)) {
    return localeSegment as Locale;
  }
  
  return defaultLocale;
}

export function removeLocaleFromPath(path: string): string {
  const segments = path.split('/');
  if (segments.length > 1 && locales.includes(segments[1] as Locale)) {
    return '/' + segments.slice(2).join('/');
  }
  return path;
}

export function addLocaleToPath(path: string, locale: Locale): string {
  if (locale === defaultLocale) return path;
  return `/${locale}${path}`;
}

// Translations
export const translations = {
  en: {
    // Navigation
    home: 'Home',
    about: 'About Us',
    catalog: 'Catalog',
    design: 'Design AI',
    services: 'Installation',
    shop: 'Shop',
    contact: 'Contact',
    cart: 'Cart',
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
    admin: 'Admin',
    
    // Home page
    heroTitle: 'Transform Your Space with Premium Wallpaper',
    heroSubtitle: 'Discover Oscar Barrera\'s artistic vision where design, art, and technology converge to create extraordinary wall coverings.',
    learnMore: 'Learn More',
    shopNow: 'Shop Now',
    
    // About
    aboutTitle: 'About Barrera Wallpaper',
    aboutText: 'With over a decade of experience, Oscar Barrera leads the fusion of art, design, and technology to create unique wallpaper experiences.',
    
    // Product
    addToCart: 'Add to Cart',
    price: 'Price',
    colors: 'Colors',
    styles: 'Styles',
    material: 'Material',
    dimensions: 'Dimensions',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    
    // Cart
    cartTitle: 'Shopping Cart',
    cartEmpty: 'Your cart is empty',
    continueShopping: 'Continue Shopping',
    checkout: 'Checkout',
    total: 'Total',
    quantity: 'Quantity',
    
    // Contact
    contactTitle: 'Contact Us',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    subject: 'Subject',
    message: 'Message',
    send: 'Send Message',
    
    // Installation
    installationTitle: 'Professional Installation Services',
    residentialService: 'Residential Installation',
    commercialService: 'Commercial Installation',
    getQuote: 'Get Quote',
    
    // Footer
    newsletter: 'Newsletter',
    subscribe: 'Subscribe',
    followUs: 'Follow Us',
    rights: '© 2024 Barrera Wallpaper. All rights reserved.'
  },
  es: {
    // Navigation
    home: 'Inicio',
    about: 'Sobre Nosotros',
    catalog: 'Catálogo',
    design: 'Diseñar IA',
    services: 'Instalación',
    shop: 'Tienda',
    contact: 'Contacto',
    cart: 'Carrito',
    login: 'Iniciar Sesión',
    signup: 'Registrarse',
    logout: 'Cerrar Sesión',
    admin: 'Administrador',
    
    // Home page
    heroTitle: 'Transforma Tu Espacio con Papel Tapiz Premium',
    heroSubtitle: 'Descubre la visión artística de Oscar Barrera donde el diseño, arte y tecnología convergen para crear revestimientos de pared extraordinarios.',
    learnMore: 'Conocer Más',
    shopNow: 'Comprar Ahora',
    
    // About
    aboutTitle: 'Sobre Barrera Wallpaper',
    aboutText: 'Con más de una década de experiencia, Oscar Barrera lidera la fusión de arte, diseño y tecnología para crear experiencias únicas de papel tapiz.',
    
    // Product
    addToCart: 'Agregar al Carrito',
    price: 'Precio',
    colors: 'Colores',
    styles: 'Estilos',
    material: 'Material',
    dimensions: 'Dimensiones',
    inStock: 'Disponible',
    outOfStock: 'Agotado',
    
    // Cart
    cartTitle: 'Carrito de Compras',
    cartEmpty: 'Tu carrito está vacío',
    continueShopping: 'Continuar Comprando',
    checkout: 'Finalizar Compra',
    total: 'Total',
    quantity: 'Cantidad',
    
    // Contact
    contactTitle: 'Contáctanos',
    name: 'Nombre',
    email: 'Correo',
    phone: 'Teléfono',
    subject: 'Asunto',
    message: 'Mensaje',
    send: 'Enviar Mensaje',
    
    // Installation
    installationTitle: 'Servicios de Instalación Profesional',
    residentialService: 'Instalación Residencial',
    commercialService: 'Instalación Comercial',
    getQuote: 'Obtener Cotización',
    
    // Footer
    newsletter: 'Boletín',
    subscribe: 'Suscribirse',
    followUs: 'Síguenos',
    rights: '© 2024 Barrera Wallpaper. Todos los derechos reservados.'
  }
};

export function getTranslation(locale: Locale, key: keyof typeof translations.en): string {
  return translations[locale][key] || translations[defaultLocale][key] || key;
}
