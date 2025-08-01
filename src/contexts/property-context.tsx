
'use client';

import React, { createContext, useState, ReactNode, useEffect, useCallback, useContext } from 'react';
import { getDatabase, ref, onValue, set, push, remove, update, child } from 'firebase/database';
import { useAuth } from './auth-context';
import { app as firebaseApp } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

// --- Types ---
export type PropertyType = 'house' | 'apartment' | 'construction';
export type ShoppingItemStatus = 'needed' | 'researching' | 'purchased';
export type ShoppingItemCategory = 'furniture' | 'appliances' | 'decor' | 'materials' | 'other';

export type PropertyShoppingItem = {
    id: string;
    name: string;
    category: ShoppingItemCategory;
    status: ShoppingItemStatus;
    price: number;
}

export type Property = {
    id: string;
    name: string;
    type: PropertyType;
    address: string;
    imageUrl?: string;
    purchaseDate?: string;
    shoppingItems?: PropertyShoppingItem[];
};


// --- Default Data ---
const initialProperties: Property[] = [];


// --- Context Definition ---
type PropertyContextType = {
    properties: Property[];
    addProperty: (property: Omit<Property, 'id'>) => void;
    updateProperty: (id: string, property: Partial<Omit<Property, 'id'>>) => void;
    deleteProperty: (id: string, callback: () => void) => void;
    isAddDialogOpen: boolean;
    setIsAddDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    editingProperty: Property | null;
    setEditingProperty: React.Dispatch<React.SetStateAction<Property | null>>;
    getPropertyById: (id: string) => Property | undefined;
    addShoppingItem: (propertyId: string, item: Omit<PropertyShoppingItem, 'id'>) => void;
    updateShoppingItem: (propertyId: string, itemId: string, item: Omit<PropertyShoppingItem, 'id'>) => void;
    deleteShoppingItem: (propertyId: string, itemId: string) => void;
};

export const PropertyContext = createContext<PropertyContextType>({} as PropertyContextType);


// --- Provider Hook ---
export const useProperty = () => {
    const context = useContext(PropertyContext);
    if (!context) {
        throw new Error('useProperty must be used within a PropertyProvider');
    }
    return context;
}

// --- Provider Component ---
export const PropertyProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const { toast } = useToast();

    const [properties, setProperties] = useState<Property[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);

    const getDbRef = useCallback((path: string) => {
        if (!user) throw new Error("User not authenticated to get DB ref.");
        const db = getDatabase(firebaseApp);
        return ref(db, `users/${user.uid}/${path}`);
    }, [user]);

    useEffect(() => {
        if (user) {
            const propertiesRef = getDbRef('properties');
            const unsubscribe = onValue(propertiesRef, (snapshot) => {
                const data = snapshot.val();
                 const propertiesArray = data ? Object.keys(data).map(key => {
                    const prop = { id: key, ...data[key] };
                    // Convert nested shoppingItems object to array
                    if (prop.shoppingItems && typeof prop.shoppingItems === 'object') {
                        prop.shoppingItems = Object.keys(prop.shoppingItems).map(itemKey => ({
                            id: itemKey,
                            ...prop.shoppingItems[itemKey]
                        }));
                    } else {
                        prop.shoppingItems = [];
                    }
                    return prop;
                }) : [];
                setProperties(propertiesArray);
            });
            return () => unsubscribe();
        } else {
            setProperties([]);
        }
    }, [user, getDbRef]);
    
    const addProperty = (property: Omit<Property, 'id'>) => {
        if (!user) return;
        const propertiesRef = getDbRef('properties');
        const newId = push(propertiesRef).key;
        if (newId) {
            set(child(propertiesRef, newId), property)
                .then(() => toast({ title: 'Imóvel Adicionado!', description: `"${property.name}" foi cadastrado com sucesso.` }))
                .catch((err) => toast({ variant: 'destructive', title: 'Erro', description: err.message }));
        }
    };

    const updateProperty = (id: string, propertyUpdate: Partial<Omit<Property, 'id'>>) => {
        if (!user) return;
        const propertyRef = getDbRef(`properties/${id}`);
        update(propertyRef, propertyUpdate)
            .then(() => toast({ title: 'Imóvel Atualizado!', description: `As informações foram salvas.` }))
            .catch((err) => toast({ variant: 'destructive', title: 'Erro', description: err.message }));
    };

    const deleteProperty = (id: string, callback: () => void) => {
        if (!user) return;
        const propertyRef = getDbRef(`properties/${id}`);
        remove(propertyRef)
            .then(() => {
                toast({ title: 'Imóvel Excluído!' })
                callback();
            })
            .catch((err) => toast({ variant: 'destructive', title: 'Erro', description: err.message }));
    };
    
    const getPropertyById = useCallback((id: string) => {
        return properties.find(p => p.id === id);
    }, [properties]);
    
    const addShoppingItem = (propertyId: string, item: Omit<PropertyShoppingItem, 'id'>) => {
        if(!user) return;
        const itemsRef = getDbRef(`properties/${propertyId}/shoppingItems`);
        const newItemId = push(itemsRef).key;
        if(newItemId){
            set(child(itemsRef, newItemId), item)
                .then(() => toast({ title: 'Item Adicionado!', description: `${item.name} foi adicionado à lista de compras.`}))
                .catch((err) => toast({ variant: 'destructive', title: 'Erro', description: err.message }));
        }
    };
    
    const updateShoppingItem = (propertyId: string, itemId: string, itemUpdate: Omit<PropertyShoppingItem, 'id'>) => {
        if(!user) return;
        const itemRef = getDbRef(`properties/${propertyId}/shoppingItems/${itemId}`);
        update(itemRef, itemUpdate)
            .then(() => toast({ title: 'Item Atualizado!'}))
            .catch((err) => toast({ variant: 'destructive', title: 'Erro', description: err.message }));
    };

    const deleteShoppingItem = (propertyId: string, itemId: string) => {
        if(!user) return;
        const itemRef = getDbRef(`properties/${propertyId}/shoppingItems/${itemId}`);
        remove(itemRef)
             .then(() => toast({ title: 'Item Removido!'}))
            .catch((err) => toast({ variant: 'destructive', title: 'Erro', description: err.message }));
    };

    const value = {
        properties,
        addProperty,
        updateProperty,
        deleteProperty,
        isAddDialogOpen,
        setIsAddDialogOpen,
        editingProperty,
        setEditingProperty,
        getPropertyById,
        addShoppingItem,
        updateShoppingItem,
        deleteShoppingItem,
    };

    return (
        <PropertyContext.Provider value={value}>
            {children}
        </PropertyContext.Provider>
    );
};
