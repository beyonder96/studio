
'use client';

import { cn } from "@/lib/utils";
import Image from 'next/image';
import { Banknote } from "lucide-react";

type CardBrand = 'visa' | 'mastercard' | 'elo' | 'amex';
type VoucherBrand = 'ticket' | 'vr' | 'alelo' | 'other';

interface CardBrandLogoProps {
  brand: CardBrand;
  className?: string;
}

interface VoucherBrandLogoProps {
    brand?: VoucherBrand;
    className?: string;
}

const VisaLogo = ({ className }: { className?: string }) => (
    <svg className={cn("text-white", className)} viewBox="0 0 750 471" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M202.822 55.8504L137.98 393.17H221.424L286.265 55.8504H202.822Z" fill="#2566AF"/>
        <path d="M473.084 153.256C473.084 113.111 487.893 78.4907 512.181 55.8504H425.048L288.081 393.17H378.114C366.49 375.492 360.814 354.912 360.814 332.613C360.814 262.883 408.84 207.243 473.084 195.91V153.256Z" fill="#2566AF"/>
        <path d="M694.013 393.17L749.155 125.158C739.02 119.986 726.611 116.89 712.518 116.89C682.029 116.89 656.745 137.47 647.327 166.427L561.462 393.17H649.184L662.083 351.916H733.5C736.89 367.149 749.3 393.17 749.3 393.17L694.013 393.17Z" fill="#2566AF"/>
        <path d="M750 125.158L749.155 127.327L694.013 393.17H750L750 125.158Z" fill="#E2B440"/>
        <path d="M129.831 393.17L65 55.8504H0L129.831 393.17Z" fill="#E2B440"/>
        <path d="M512.181 55.8504C497.372 75.4916 489.066 98.4412 489.066 123.15C489.066 179.661 530.499 226.757 586.381 237.989L596.166 168.96C556.786 160.893 526.297 125.158 526.297 81.3919C526.297 73.1873 527.47 65.3262 529.56 58.019L512.181 55.8504Z" fill="#2566AF"/>
    </svg>
);

const MastercardLogo = ({ className }: { className?: string }) => (
    <svg className={cn(className)} viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M38 12C38 5.373 33.053 0 26.6 0C20.147 0 15.2 5.373 15.2 12C15.2 18.627 20.147 24 26.6 24C33.053 24 38 18.627 38 12Z" fill="#FF5F00"/>
        <path d="M22.8 12C22.8 14.582 23.36 17.01 24.32 19.14C20.686 22.32 16.3 24 11.4 24C5.103 24 0 18.627 0 12C0 5.373 5.103 0 11.4 0C16.3 0 20.686 1.68 24.32 4.86C23.36 6.99 22.8 9.418 22.8 12Z" fill="#EB001B"/>
        <path d="M26.6002 19.14C29.7402 17.01 31.7202 14.582 31.7202 12C31.7202 9.418 29.7402 6.99 26.6002 4.86C23.4602 6.99 21.4802 9.418 21.4802 12C21.4802 14.582 23.4602 17.01 26.6002 19.14Z" fill="#F79E1B"/>
    </svg>
);

const EloLogo = ({ className }: { className?: string }) => (
    <svg className={cn("text-black dark:text-white", className)} viewBox="0 0 100 35" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.99971 34.008H16.0317L21.5757 24.792H2.99971V34.008Z" />
        <path d="M21.5755 9.76797H2.99951V19.032H21.5755L27.1195 9.76797H21.5755Z" />
        <path d="M2.99951 0.5V9.768H16.0315L21.5755 0.5H2.99951Z" />
        <path d="M51.944 34.008H35.84V0.5H51.944V34.008Z" />
        <path d="M79.8083 34.008H63.7043V0.5H79.8083V9.768H70.7363V14.352H78.5123V23.568H70.7363V28.272H79.8083V34.008Z" />
        <path d="M84.0963 0.5H100V34.008H84.0963V0.5Z" />
    </svg>
);

const AmexLogo = ({ className }: { className?: string }) => (
    <svg className={cn(className)} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="10" fill="#006FCF"/>
        <path d="M50 25C63.8071 25 75 36.1929 75 50C75 63.8071 63.8071 75 50 75C36.1929 75 25 63.8071 25 50C25 36.1929 36.1929 25 50 25Z" fill="white"/>
        <path d="M60.35 41.3H39.65V58.7H60.35V41.3Z" fill="#006FCF"/>
        <path d="M50 31C51.6569 31 53 32.3431 53 34V66C53 67.6569 51.6569 69 50 69C48.3431 69 47 67.6569 47 66V34C47 32.3431 48.3431 31 50 31Z" fill="#006FCF"/>
        <path d="M31 50C31 48.3431 32.3431 47 34 47H66C67.6569 47 69 48.3431 69 50C69 51.6569 67.6569 53 66 53H34C32.3431 53 31 51.6569 31 50Z" fill="#006FCF"/>
    </svg>
);

export const CardBrandLogo: React.FC<CardBrandLogoProps> = ({ brand, className }) => {
    switch (brand) {
        case 'visa':
            return <VisaLogo className={className} />;
        case 'mastercard':
            return <MastercardLogo className={className} />;
        case 'elo':
            return <EloLogo className={className} />;
        case 'amex':
            return <AmexLogo className={className} />;
        default:
            return null;
    }
}

export const VoucherBrandLogo: React.FC<VoucherBrandLogoProps> = ({ brand, className }) => {
    switch (brand) {
        case 'ticket':
            return <span className={cn("font-bold text-lg text-red-600", className)}>Ticket</span>;
        case 'vr':
            return <span className={cn("font-bold text-lg text-green-600", className)}>VR</span>;
        case 'alelo':
            return <span className={cn("font-bold text-lg text-teal-600", className)}>Alelo</span>;
        case 'other':
        default:
            return <Banknote className={cn("h-6 w-6 text-primary", className)} />;
    }
}
