import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const DELIVERY_ZONES: Record<string, number> = {
    'Almadies': 1500, 'Ngor': 1500, 'Ouakam': 1500, 'Mermoz': 1500,
    'Sacré Coeur': 1500, 'Point E': 1500, 'Fann': 1500, 'Plateau': 1500,
    'Médina': 1500, 'Fass': 1500, 'Gueule Tapée': 1500, 'Colobane': 1500,
    'Grand Dakar': 1500, 'Sicap Baobab': 1500, 'Liberté 1-6': 1500,
    'Dieuppeul': 1500, 'Castors': 1500, 'Derklé': 1500, 'Khar Yalla': 1500,
    'Grand Yoff': 2000, 'Patte dOie': 2000, 'Parcelles Assainies': 2000,
    'Yoff': 2000, 'Ouest Foire': 2000, 'Nord Foire': 2000, 'Sud Foire': 2000,
    'Maristes': 2000, 'Hann Bel-Air': 2000, 'Guediawaye': 2500, 'Pikine': 2500,
    'Thiaroye': 2500, 'Yeumbeul': 2500, 'Malika': 2500, 'Keur Massar': 3000,
    'Rufisque': 3000, 'Bargny': 3000, 'Diamniadio': 3500, 'Sébikotane': 3500
};

export const QUARTIERS = Object.keys(DELIVERY_ZONES).sort();

export interface CartItem {
    id: string | number;
    nom: string;
    quantity: number;
    finalPrice?: number;
    prix_premium?: number;
    prix_standard?: number;
    image?: string;
    image_url?: string;
    tenant_id?: string;
    [key: string]: any;
}

export interface PromoData {
    id: number;
    code: string;
    discount_pct: number;
    min_xp?: number;
    active: boolean;
    [key: string]: any;
}

interface CartState {
    shopCart: CartItem[];
    deliveryZone: string;
    deliveryAddress: string;
    deliveryCost: number;
    isShopPromoApplied: boolean;
    appliedPromoData: PromoData | null;
    shopPromoCode: string;
    savedShopProducts: any[];
    globalShopProducts: any[];

    // Actions
    addToCart: (product: any, quantity?: number) => void;
    removeFromCart: (productId: string | number) => void;
    updateQuantity: (productId: string | number, quantity: number) => void;
    clearCart: () => void;

    setDeliveryZone: (zone: string) => void;
    setDeliveryAddress: (address: string) => void;
    setDeliveryCost: (cost: number) => void;

    applyPromo: (code: string, data: PromoData) => void;
    removePromo: () => void;
    setShopPromoCode: (code: string) => void;

    toggleSavedProduct: (product: any) => void;
    setSavedShopProducts: (products: any[]) => void;
    setGlobalShopProducts: (products: any[]) => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            shopCart: [],
            deliveryZone: '',
            deliveryAddress: '',
            deliveryCost: 0,
            isShopPromoApplied: false,
            appliedPromoData: null,
            shopPromoCode: '',
            savedShopProducts: [],
            globalShopProducts: [],

            addToCart: (product, quantity = 1) => set((state) => {
                const existing = state.shopCart.find(p => p.id === product.id);
                if (existing) {
                    return {
                        shopCart: state.shopCart.map(p =>
                            p.id === product.id
                                ? { ...p, quantity: (p.quantity || 1) + quantity }
                                : p
                        )
                    };
                }
                const finalPrice = product.finalPrice;
                return {
                    shopCart: [...state.shopCart, { ...product, quantity, finalPrice }]
                };
            }),

            removeFromCart: (productId) => set((state) => ({
                shopCart: state.shopCart.filter(p => p.id !== productId)
            })),

            updateQuantity: (productId, quantity) => set((state) => ({
                shopCart: state.shopCart.map(p =>
                    p.id === productId ? { ...p, quantity: Math.max(1, quantity) } : p
                )
            })),

            clearCart: () => set({
                shopCart: [],
                isShopPromoApplied: false,
                appliedPromoData: null,
                shopPromoCode: ''
            }),

            setDeliveryZone: (zone) => set({ deliveryZone: zone }),
            setDeliveryAddress: (address) => set({ deliveryAddress: address }),
            setDeliveryCost: (cost) => set({ deliveryCost: cost }),

            applyPromo: (code, data) => set({
                shopPromoCode: code,
                isShopPromoApplied: true,
                appliedPromoData: data
            }),

            removePromo: () => set({
                shopPromoCode: '',
                isShopPromoApplied: false,
                appliedPromoData: null
            }),

            setShopPromoCode: (code) => set({ shopPromoCode: code }),

            toggleSavedProduct: (product) => set((state) => {
                const exists = state.savedShopProducts.some(p => p.id === product.id);
                return {
                    savedShopProducts: exists
                        ? state.savedShopProducts.filter(p => p.id !== product.id)
                        : [...state.savedShopProducts, product]
                };
            }),

            setSavedShopProducts: (products) => set({ savedShopProducts: products }),
            setGlobalShopProducts: (products) => set({ globalShopProducts: products })
        }),
        {
            name: 'onyx-cart-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                shopCart: state.shopCart,
                deliveryZone: state.deliveryZone,
                deliveryAddress: state.deliveryAddress,
                deliveryCost: state.deliveryCost,
                savedShopProducts: state.savedShopProducts
            }),
        }
    )
);
