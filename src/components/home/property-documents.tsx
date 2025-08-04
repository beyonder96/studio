
'use client';

import { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Property, useProperty } from '@/contexts/property-context';
import { PlusCircle, FileText, Download, Trash2, File, ImageIcon, FileQuestion } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return <File className="h-6 w-6 text-red-500" />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) return <ImageIcon className="h-6 w-6 text-blue-500" />;
    return <FileQuestion className="h-6 w-6 text-muted-foreground" />;
}

export function PropertyDocuments({ property }: { property: Property }) {
    const { addDocument, deleteDocument } = useProperty();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            await addDocument(property.id, file);
            // Reset input to allow uploading the same file again
            if(fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    
    const documents = property.documents || [];

    return (
        <>
            <Card className="bg-transparent">
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
                <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                           <FileText /> Cofre de Documentos
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => fileInputRef.current?.click()}>
                            <PlusCircle className="h-5 w-5" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 h-60 overflow-y-auto">
                    {documents.length > 0 ? (
                        documents.map(doc => (
                            <div key={doc.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                                <div className="flex items-center gap-3">
                                    {getFileIcon(doc.name)}
                                    <div>
                                        <p className="font-medium text-sm truncate max-w-[150px]">{doc.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {format(new Date(doc.uploadedAt), "dd/MM/yyyy", { locale: ptBR })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <a href={doc.url} download={doc.name} target="_blank" rel="noopener noreferrer">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </a>
                                     <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 hover:text-destructive" onClick={() => deleteDocument(property.id, doc.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground pt-10">Nenhum documento adicionado.</p>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
