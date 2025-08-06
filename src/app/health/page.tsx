
'use client';

import { useState, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Save, HeartPulse } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { app as firebaseApp } from '@/lib/firebase';
import { HealthInfo } from '@/contexts/finance-context';
import { MedicationCard } from '@/components/health/medication-card';

type ProfileData = {
  names?: string;
  healthInfo1?: HealthInfo;
  healthInfo2?: HealthInfo;
};

const defaultHealthInfo: HealthInfo = {
    bloodType: '',
    allergies: '',
    healthPlan: '',
    emergencyContact: '',
    medications: [],
};

export default function HealthPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [tempData, setTempData] = useState<ProfileData>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      const db = getDatabase(firebaseApp);
      const profileRef = ref(db, `users/${user.uid}/profile`);
      
      const unsubscribe = onValue(profileRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const fetchedData = {
              ...data,
              healthInfo1: { ...defaultHealthInfo, ...data.healthInfo1, medications: data.healthInfo1?.medications ? Object.values(data.healthInfo1.medications) : [] },
              healthInfo2: { ...defaultHealthInfo, ...data.healthInfo2, medications: data.healthInfo2?.medications ? Object.values(data.healthInfo2.medications) : [] },
          };
          setProfileData(fetchedData);
          setTempData(fetchedData);
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleEditClick = () => {
    setTempData(profileData);
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setTempData(profileData);
    setIsEditing(false);
  };
  
  const handleSaveClick = () => {
    if (!user) return;
    const db = getDatabase(firebaseApp);
    const profileRef = ref(db, `users/${user.uid}/profile`);

    // We only want to save the fields that are editable here.
    const updateData = {
        'healthInfo1/bloodType': tempData.healthInfo1?.bloodType || '',
        'healthInfo1/allergies': tempData.healthInfo1?.allergies || '',
        'healthInfo1/healthPlan': tempData.healthInfo1?.healthPlan || '',
        'healthInfo1/emergencyContact': tempData.healthInfo1?.emergencyContact || '',
        'healthInfo2/bloodType': tempData.healthInfo2?.bloodType || '',
        'healthInfo2/allergies': tempData.healthInfo2?.allergies || '',
        'healthInfo2/healthPlan': tempData.healthInfo2?.healthPlan || '',
        'healthInfo2/emergencyContact': tempData.healthInfo2?.emergencyContact || '',
    };
    
    update(profileRef, updateData).then(() => {
        setIsEditing(false);
        toast({
          title: 'Informações de Saúde Atualizadas!',
          description: 'Seus dados foram salvos com sucesso.',
        });
    });
  }

  const handleHealthInfoChange = (person: 'healthInfo1' | 'healthInfo2', field: keyof Omit<HealthInfo, 'medications'>, value: string) => {
    setTempData(prev => ({
        ...prev,
        [person]: {
            ...(prev[person] || defaultHealthInfo),
            [field]: value,
        }
    }))
  };

  const [name1, name2] = (profileData.names || 'Pessoa 1 & Pessoa 2').split(' & ').map(name => name.trim());
  const person1Name = name1 || 'Pessoa 1';
  const person2Name = name2 || 'Pessoa 2';

  return (
    <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-3xl border-white/20 dark:border-black/20 rounded-3xl shadow-2xl">
        <CardHeader>
             <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-3xl font-bold flex items-center gap-3">
                        <HeartPulse className="h-8 w-8 text-primary" />
                        Minha Saúde
                    </CardTitle>
                    <CardDescription>
                        Informações importantes de saúde, medicamentos e contatos de emergência.
                    </CardDescription>
                </div>
                {isEditing ? (
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={handleCancelClick}>Cancelar</Button>
                        <Button onClick={handleSaveClick}><Save className="mr-2 h-4 w-4"/> Salvar</Button>
                    </div>
                ) : (
                    <Button variant="outline" onClick={handleEditClick}><Edit className="mr-2 h-4 w-4"/> Editar</Button>
                )}
             </div>
        </CardHeader>
        <CardContent className="space-y-10 pt-6">
            {/* Person 1 Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-center md:text-left">{person1Name}</h3>
                    <div className="space-y-2">
                        <Label>Tipo Sanguíneo</Label>
                        {isEditing ? (
                            <Input value={tempData.healthInfo1?.bloodType || ''} onChange={e => handleHealthInfoChange('healthInfo1', 'bloodType', e.target.value)} placeholder="Ex: A+" />
                        ) : (
                            <p className="text-muted-foreground">{profileData.healthInfo1?.bloodType || 'Não informado'}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Alergias</Label>
                        {isEditing ? (
                            <Input value={tempData.healthInfo1?.allergies || ''} onChange={e => handleHealthInfoChange('healthInfo1', 'allergies', e.target.value)} placeholder="Ex: Poeira, Lactose" />
                        ) : (
                            <p className="text-muted-foreground">{profileData.healthInfo1?.allergies || 'Nenhuma'}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Plano de Saúde</Label>
                        {isEditing ? (
                            <Input value={tempData.healthInfo1?.healthPlan || ''} onChange={e => handleHealthInfoChange('healthInfo1', 'healthPlan', e.target.value)} placeholder="Ex: Plano Top (123456)" />
                        ) : (
                            <p className="text-muted-foreground">{profileData.healthInfo1?.healthPlan || 'Não informado'}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Contato de Emergência</Label>
                        {isEditing ? (
                            <Input value={tempData.healthInfo1?.emergencyContact || ''} onChange={e => handleHealthInfoChange('healthInfo1', 'emergencyContact', e.target.value)} placeholder="Ex: Mãe (11 99999-8888)" />
                        ) : (
                            <p className="text-muted-foreground">{profileData.healthInfo1?.emergencyContact || 'Não informado'}</p>
                        )}
                    </div>
                </div>
                <MedicationCard
                    title="Medicamentos de Uso Contínuo"
                    personKey="healthInfo1"
                    medications={profileData.healthInfo1?.medications || []}
                />
            </div>
            {/* Person 2 Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-center md:text-left">{person2Name}</h3>
                    <div className="space-y-2">
                        <Label>Tipo Sanguíneo</Label>
                        {isEditing ? (
                            <Input value={tempData.healthInfo2?.bloodType || ''} onChange={e => handleHealthInfoChange('healthInfo2', 'bloodType', e.target.value)} placeholder="Ex: O-" />
                        ) : (
                            <p className="text-muted-foreground">{profileData.healthInfo2?.bloodType || 'Não informado'}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Alergias</Label>
                        {isEditing ? (
                            <Input value={tempData.healthInfo2?.allergies || ''} onChange={e => handleHealthInfoChange('healthInfo2', 'allergies', e.target.value)} placeholder="Ex: Glúten" />
                        ) : (
                            <p className="text-muted-foreground">{profileData.healthInfo2?.allergies || 'Nenhuma'}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Plano de Saúde</Label>
                        {isEditing ? (
                            <Input value={tempData.healthInfo2?.healthPlan || ''} onChange={e => handleHealthInfoChange('healthInfo2', 'healthPlan', e.target.value)} placeholder="Ex: Plano Master (654321)" />
                        ) : (
                            <p className="text-muted-foreground">{profileData.healthInfo2?.healthPlan || 'Não informado'}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Contato de Emergência</Label>
                        {isEditing ? (
                            <Input value={tempData.healthInfo2?.emergencyContact || ''} onChange={e => handleHealthInfoChange('healthInfo2', 'emergencyContact', e.target.value)} placeholder="Ex: Pai (11 98888-7777)" />
                        ) : (
                            <p className="text-muted-foreground">{profileData.healthInfo2?.emergencyContact || 'Não informado'}</p>
                        )}
                    </div>
                </div>
                 <MedicationCard
                    title="Medicamentos de Uso Contínuo"
                    personKey="healthInfo2"
                    medications={profileData.healthInfo2?.medications || []}
                />
            </div>
        </CardContent>
    </Card>
  );
}
