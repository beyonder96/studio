
'use client';

import React, { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { getDatabase, ref, onValue, set, push, remove, update } from 'firebase/database';
import { useAuth } from './auth-context';
import { app as firebaseApp } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

// --- Types ---
export type PropertyType = 'house' | 'apartment' | 'construction';

export type Property = {
    id: string;
    name: string;
    type: PropertyType;
    address: string;
    imageUrl?: string;
    purchaseDate?: string;
};


// --- Default Data ---
const initialProperties: Property[] = [];


// --- Context Definition ---
type PropertyContextType = {
    properties: Property[];
    addProperty: (property: Omit<Property, 'id'>) => void;
    updateProperty: (id: string, property: Partial<Omit<Property, 'id'>>) => void;
    deleteProperty: (id: string) => void;
    isAddDialogOpen: boolean;
    setIsAddDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    editingProperty: Property | null;
    setEditingProperty: React.Dispatch<React.SetStateAction<Property | null>>;
};

export const PropertyContext = createContext<PropertyContextType>({} as PropertyContextType);


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
                const propertiesArray = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
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

    const deleteProperty = (id: string) => {
        if (!user) return;
        const propertyRef = getDbRef(`properties/${id}`);
        remove(propertyRef)
            .then(() => toast({ title: 'Imóvel Excluído!' }))
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
    };

    return (
        <PropertyContext.Provider value={value}>
            {children}
        </PropertyContext.Provider>
    );
};
