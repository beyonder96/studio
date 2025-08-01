
'use client';

import { cn } from "@/lib/utils";
import type { BankName } from "@/contexts/finance-context";
import { Landmark } from "lucide-react";

const ItauLogo = ({ className }: { className?: string }) => (
    <svg className={cn(className)} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="10" fill="#EC7000"/>
        <path d="M50 25C63.8071 25 75 36.1929 75 50C75 63.8071 63.8071 75 50 75C36.1929 75 25 63.8071 25 50C25 36.1929 36.1929 25 50 25Z" fill="#00529B"/>
        <path d="M47 38H53V62H47V38Z" fill="white"/>
        <path d="M50 62C51.1046 62 52 62.8954 52 64V66H48V64C48 62.8954 48.8954 62 50 62Z" fill="white"/>
    </svg>
);

const BradescoLogo = ({ className }: { className?: string }) => (
    <svg className={cn(className)} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="10" fill="#CC092F"/>
        <path d="M50 25L75 50L50 75L25 50L50 25Z" stroke="white" strokeWidth="8"/>
    </svg>
);

const SantanderLogo = ({ className }: { className?: string }) => (
    <svg className={cn(className)} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="10" fill="#EC0000"/>
        <path d="M35 40H65V45H35V40Z" fill="white"/>
        <path d="M35 57H65V62H35V57Z" fill="white"/>
        <path d="M47.5 45V57H52.5V45H47.5Z" fill="white"/>
    </svg>
);

const BBLogo = ({ className }: { className?: string }) => (
    <svg className={cn(className)} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="10" fill="#0054A6"/>
        <path d="M30 30H45V45H30V30Z" fill="#FDB913"/>
        <path d="M55 30H70V45H55V30Z" fill="#FDB913"/>
        <path d="M30 55H45V70H30V55Z" fill="#FDB913"/>
        <path d="M55 55H70V70H55V55Z" fill="#FDB913"/>
    </svg>
);

const CaixaLogo = ({ className }: { className?: string }) => (
    <svg className={cn(className)} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="10" fill="#0064B1"/>
        <path d="M50 25L75 50L50 75L25 50L50 25Z" fill="white"/>
        <path d="M50 35L65 50L50 65L35 50L50 35Z" fill="#0064B1"/>
    </svg>
);

const NubankLogo = ({ className }: { className?: string }) => (
    <svg className={cn(className)} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="10" fill="#820AD1"/>
        <path d="M35 30C35 27.2386 37.2386 25 40 25H60C62.7614 25 65 27.2386 65 30V70C65 72.7614 62.7614 75 60 75H50L35 60V30Z" stroke="white" strokeWidth="8"/>
    </svg>
);

const InterLogo = ({ className }: { className?: string }) => (
    <svg className={cn(className)} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="10" fill="#FF7A00"/>
        <path d="M35 35H45V65H35V35Z" fill="white"/>
        <path d="M55 35H65V65H55V35Z" fill="white"/>
    </svg>
);


interface BankLogoProps {
  bankName?: BankName;
  className?: string;
}

export const BankLogo: React.FC<BankLogoProps> = ({ bankName, className }) => {
    switch (bankName) {
        case 'itau':
            return <ItauLogo className={className} />;
        case 'bradesco':
            return <BradescoLogo className={className} />;
        case 'santander':
            return <SantanderLogo className={className} />;
        case 'bb':
            return <BBLogo className={className} />;
        case 'caixa':
            return <CaixaLogo className={className} />;
        case 'nubank':
            return <NubankLogo className={className} />;
        case 'inter':
            return <InterLogo className={className} />;
        case 'other':
        default:
            return <Landmark className={cn("text-white", className)} />;
    }
}
