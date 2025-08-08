// src/app/health/page.tsx

'use client';

import { useState, useEffect, useContext, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Save, HeartPulse } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { getDatabase, ref, onValue, update, push, set } from 'firebase/database';
import { app as firebaseApp } from '@/lib/firebase';
import { HealthInfo, WeightRecord, FinanceContext } from '@/contexts/finance-context';
import { MedicationCard } from '@/components/health/medication-card';
import { WeightTrackerCard } from '@/components/health/weight-tracker-card';
import { GoogleFitCard } from '@/components/health/google-fit-card'; 
import { getGoogleFitData } from '@/ai/tools/health-tools';
import { format, startOfToday, endOfToday } from 'date-fns';
import { BMICard } from '@/components/health/bmi-card';

type ProfileData = {
  names?: string;
  healthInfo1?: HealthInfo;
  healthInfo2?: HealthInfo;
};

type FitData = {
    steps?: number;
    calories?: number;
    sleepSeconds?: number;
    weight?: number;
};

const defaultHealthInfo: HealthInfo = {
    height: 0,
    bloodType: '',
    allergies: '',
    healthPlan: '',
    emergencyContact: '',
    medications: [],
    weightRecords: [],
};

export default function HealthPage() {
  const { toast } = useToast();
  const { user, getAccessToken } = useAuth();
  const { addHealthRecords } = useContext(FinanceContext);
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [tempData, setTempData] = useState<ProfileData>({});
  const [isEditing, setIsEditing] = useState(false);
  
  const [fitData, setFitData] = useState<FitData | null>(null);
  const [isSyncingFit, setIsSyncingFit] = useState(false);

  const fetchProfileData = useCallback(async () => {
    if (user) {
      const db = getDatabase(firebaseApp);
      const profileRef = ref(db, `users/${user.uid}/profile`);
      onValue(profileRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const transformToArray = (obj: any) => obj ? Object.keys(obj).map(key => ({ id: key, ...obj[key] })) : [];
          const fetchedData = {
              ...data,
              healthInfo1: { ...defaultHealthInfo, ...data.healthInfo1, medications: transformToArray(data.healthInfo1?.medications), weightRecords: transformToArray(data.healthInfo1?.weightRecords) },
              healthInfo2: { ...defaultHealthInfo, ...data.healthInfo2, medications: transformToArray(data.healthInfo2?.medications), weightRecords: transformToArray(data.healthInfo2?.weightRecords) },
          };
          setProfileData(fetchedData);
          setTempData(fetchedData);
        }
      });
    }
  }, [user]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleSyncFitData = useCallback(async () => {
    if (!user) return;
    setIsSyncingFit(true);
    const accessToken = await getAccessToken();

    if (!accessToken) {
        toast({ variant: "destructive", title: "Autenticação Necessária", description: "Faça login com o Google para sincronizar." });
        setIsSyncingFit(false);
        return;
    }

    try {
        const today = new Date();
        const result = await getGoogleFitData({
            accessToken,
            startDate: format(startOfToday(), 'yyyy-MM-dd'),
            endDate: format(endOfToday(), 'yyyy-MM-dd'),
        });
        
        setFitData(result);

        if (result.weight) {
             addHealthRecords('healthInfo1', { 
                weightRecords: [{ date: format(today, 'yyyy-MM-dd'), weight: result.weight }]
            });
        }
        
        toast({ title: "Sincronização Concluída!", description: "Seus dados de hoje foram atualizados." });
    } catch (error) {
        console.error("Erro ao sincronizar com Google Fit:", error);
        toast({ variant: "destructive", title: "Erro na Sincronização" });
    } finally {
        setIsSyncingFit(false);
    }
  }, [user, getAccessToken, toast, addHealthRecords]);

  const handleAddWeight = async (personKey: 'healthInfo1' | 'healthInfo2', weightData: Omit<WeightRecord, 'id'>) => {
    if (!user) return;
    addHealthRecords(personKey, { weightRecords: [weightData] });
    toast({ title: "Peso registrado com sucesso!"});
  };

  const handleSaveClick = () => {
    if (!user) return;
    const db = getDatabase(firebaseApp);
    const profileRef = ref(db, `users/${user.uid}/profile`);

    const updateData = {
        'healthInfo1/height': tempData.healthInfo1?.height || 0,
        'healthInfo1/bloodType': tempData.healthInfo1?.bloodType || '',
        'healthInfo1/allergies': tempData.healthInfo1?.allergies || '',
        'healthInfo1/healthPlan': tempData.healthInfo1?.healthPlan || '',
        'healthInfo1/emergencyContact': tempData.healthInfo1?.emergencyContact || '',
        'healthInfo2/height': tempData.healthInfo2?.height || 0,
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
        fetchProfileData();
    });
  }

  const handleEditClick = () => setIsEditing(true);
  const handleCancelClick = () => setIsEditing(false);
  const handleHealthInfoChange = (person: 'healthInfo1' | 'healthInfo2', field: keyof Omit<HealthInfo, 'medications' | 'weightRecords'>, value: string | number) => {
    setTempData(prev => ({...prev, [person]: { ...(prev[person] || defaultHealthInfo), [field]: value }}));
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
            <GoogleFitCard
                onSync={handleSyncFitData}
                isLoading={isSyncingFit}
                data={fitData}
            />

            {/* Person 1 Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                 <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-center md:text-left">{person1Name}</h3>
                     <div className="space-y-2">
                        <Label>Altura (cm)</Label>
                        {isEditing ? (
                            <Input value={tempData.healthInfo1?.height || ''} onChange={e => handleHealthInfoChange('healthInfo1', 'height', Number(e.target.value))} placeholder="Ex: 175" type="number" />
                        ) : (
                            <p className="text-muted-foreground">{profileData.healthInfo1?.height ? `${profileData.healthInfo1.height} cm` : 'Não informado'}</p>
                        )}
                    </div>
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
                 <div className="space-y-6">
                    <BMICard
                        title={`IMC de ${person1Name}`}
                        healthInfo={profileData.healthInfo1}
                    />
                    <MedicationCard
                        title={`Medicamentos de ${person1Name}`}
                        personKey="healthInfo1"
                        medications={profileData.healthInfo1?.medications || []}
                    />
                    <WeightTrackerCard
                        title={`Peso de ${person1Name}`}
                        personKey="healthInfo1"
                        weightRecords={profileData.healthInfo1?.weightRecords || []}
                        onAddWeight={(data) => handleAddWeight('healthInfo1', data)}
                    />
                 </div>
            </div>
            {/* Person 2 Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-center md:text-left">{person2Name}</h3>
                    <div className="space-y-2">
                        <Label>Altura (cm)</Label>
                        {isEditing ? (
                            <Input value={tempData.healthInfo2?.height || ''} onChange={e => handleHealthInfoChange('healthInfo2', 'height', Number(e.target.value))} placeholder="Ex: 160" type="number" />
                        ) : (
                            <p className="text-muted-foreground">{profileData.healthInfo2?.height ? `${profileData.healthInfo2.height} cm` : 'Não informado'}</p>
                        )}
                    </div>
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
                 <div className="space-y-6">
                     <BMICard
                        title={`IMC de ${person2Name}`}
                        healthInfo={profileData.healthInfo2}
                    />
                     <MedicationCard
                        title={`Medicamentos de ${person2Name}`}
                        personKey="healthInfo2"
                        medications={profileData.healthInfo2?.medications || []}
                    />
                    <WeightTrackerCard
                        title={`Peso de ${person2Name}`}
                        personKey="healthInfo2"
                        weightRecords={profileData.healthInfo2?.weightRecords || []}
                        onAddWeight={(data) => handleAddWeight('healthInfo2', data)}
                    />
                 </div>
            </div>
        </CardContent>
    </Card>
  );
}
