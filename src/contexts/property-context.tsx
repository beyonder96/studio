
'use client';

import React, { createContext, useState, ReactNode, useEffect, useCallback, useContext } from 'react';
import { getDatabase, ref, onValue, set, push, remove, update, child } from 'firebase/database';
import { useAuth } from './auth-context';
import { app as firebaseApp } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import imageCompression from 'browser-image-compression';

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

export type ConstructionPayment = {
    id: string;
    description: string;
    amount: number;
    dueDate: string;
    paid: boolean;
};

export type ConstructionProgress = {
    progressPercentage?: number;
    totalBudget?: number;
    payments?: ConstructionPayment[];
};

export type PropertyDocument = {
    id: string;
    name: string;
    url: string; // data URI
    uploadedAt: string;
};

export type Property = {
    id: string;
    name: string;
    type: PropertyType;
    address: string;
    imageUrl?: string;
    purchaseDate?: string;
    shoppingItems?: PropertyShoppingItem[];
    constructionProgress?: ConstructionProgress;
    documents?: PropertyDocument[];
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
    addConstructionPayment: (propertyId: string, payment: Omit<ConstructionPayment, 'id' | 'paid'>) => void;
    toggleConstructionPayment: (propertyId: string, paymentId: string) => void;
    updateConstructionProgress: (propertyId: string, percentage: number, budget: number) => void;
    addDocument: (propertyId: string, file: File) => Promise<void>;
    deleteDocument: (propertyId: string, documentId: string) => void;
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
                 const propertiesArray: Property[] = data ? Object.keys(data).map(key => {
                    const prop = { id: key, ...data[key] };
                    
                    const nestedToArray = (obj: any) => {
                        if (obj && typeof obj === 'object') {
                           return Object.keys(obj).map(subKey => ({ id: subKey, ...obj[subKey] }));
                        }
                        return [];
                    }

                    prop.shoppingItems = nestedToArray(prop.shoppingItems);
                    prop.documents = nestedToArray(prop.documents);
                    
                    if (prop.constructionProgress) {
                        prop.constructionProgress.payments = nestedToArray(prop.constructionProgress.payments);
                    } else {
                        prop.constructionProgress = { payments: [] };
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
            let propertyData: any = {...property};
            if(property.type === 'construction') {
                propertyData.constructionProgress = { progressPercentage: 0, totalBudget: 0, payments: [] };
            }
            set(child(propertiesRef, newId), propertyData)
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

    const addConstructionPayment = (propertyId: string, payment: Omit<ConstructionPayment, 'id' | 'paid'>) => {
        if (!user) return;
        const paymentsRef = getDbRef(`properties/${propertyId}/constructionProgress/payments`);
        const newPaymentId = push(paymentsRef).key;
        if (newPaymentId) {
            set(child(paymentsRef, newPaymentId), { ...payment, paid: false });
        }
    };

    const toggleConstructionPayment = (propertyId: string, paymentId: string) => {
        if (!user) return;
        const property = properties.find(p => p.id === propertyId);
        const payment = property?.constructionProgress?.payments?.find(p => p.id === paymentId);
        if (payment) {
            const paymentRef = getDbRef(`properties/${propertyId}/constructionProgress/payments/${paymentId}`);
            update(paymentRef, { paid: !payment.paid });
        }
    };

    const updateConstructionProgress = (propertyId: string, percentage: number, budget: number) => {
        if (!user) return;
        const progressRef = getDbRef(`properties/${propertyId}/constructionProgress`);
        update(progressRef, { progressPercentage: percentage, totalBudget: budget })
            .then(() => toast({ title: 'Progresso Atualizado!'}))
            .catch((err) => toast({ variant: 'destructive', title: 'Erro', description: err.message }));
    }

    const addDocument = async (propertyId: string, file: File) => {
        if (!user) return;
        toast({ title: 'Enviando arquivo...', description: 'Por favor, aguarde.' });

        const options = {
            maxSizeMB: 2, // Max size 2MB
            maxWidthOrHeight: 1920,
            useWebWorker: true,
        };

        try {
            // Check if file is an image to compress, otherwise just read it
            const fileToProcess = file.type.startsWith('image/') ? await imageCompression(file, options) : file;

            const reader = new FileReader();
            reader.onloadend = () => {
                const url = reader.result as string;
                const newDocumentId = push(getDbRef(`properties/${propertyId}/documents`)).key;
                if(newDocumentId) {
                    const newDocument: Omit<PropertyDocument, 'id'> = {
                        name: file.name,
                        url,
                        uploadedAt: new Date().toISOString()
                    };
                    const docRef = getDbRef(`properties/${propertyId}/documents/${newDocumentId}`);
                    set(docRef, newDocument)
                        .then(() => toast({ title: 'Documento Adicionado!', description: `"${file.name}" foi salvo com sucesso.` }))
                        .catch((err) => toast({ variant: 'destructive', title: 'Erro ao Salvar', description: err.message }));
                }
            };
            reader.readAsDataURL(fileToProcess);
        } catch (error) {
             toast({ variant: 'destructive', title: 'Erro no Upload', description: 'Não foi possível processar o arquivo.' });
        }
    };

    const deleteDocument = (propertyId: string, documentId: string) => {
        if (!user) return;
        const docRef = getDbRef(`properties/${propertyId}/documents/${documentId}`);
        remove(docRef)
            .then(() => toast({ title: 'Documento Excluído!' }))
            .catch((err) => toast({ variant: 'destructive', title: 'Erro ao Excluir', description: err.message }));
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
        addConstructionPayment,
        toggleConstructionPayment,
        updateConstructionProgress,
        addDocument,
        deleteDocument,
    };

    return (
        <PropertyContext.Provider value={value}>
            {children}
        </PropertyContext.Provider>
    );
};
