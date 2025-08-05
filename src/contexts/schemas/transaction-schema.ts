/**
 * @fileOverview Defines the schema for the Transaction object.
 */

export type Transaction = {
    id: string;
    description: string;
    amount: number;
    date: string;
    type: 'income' | 'expense' | 'transfer';
    category: string;
    account?: string;
    paid?: boolean;
    isRecurring?: boolean;
    frequency?: 'daily' | 'weekly' | 'monthly' | 'annual';
    installmentGroupId?: string;
    currentInstallment?: number;
    totalInstallments?: number;
    recurringSourceId?: string; // Link to the recurring template
    linkedGoalId?: string;
};
