declare module '@prompt/shared-library/ui/button' {
    export const Button: React.FC<{
        onClick?: () => void;
        disabled?: boolean;
        children: React.ReactNode;
        size?: 'sm' | 'md' | 'lg';
        variant?: 'default' | 'outline' | 'ghost';
    }>;
}

declare module '@prompt/shared-library/ui/input' {
    export const Input: React.FC<{
        type?: string;
        accept?: string;
        onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
        className?: string;
    }>;
}

declare module '@prompt/shared-library/ui/use-toast' {
    export const useToast: () => {
        toast: (props: {
            title: string;
            description: string;
            variant?: 'default' | 'destructive';
        }) => void;
    };
}

declare module '@prompt/shared-library/ui/card' {
    export const Card: React.FC<{ children: React.ReactNode; className?: string }>;
    export const CardContent: React.FC<{ children: React.ReactNode }>;
    export const CardDescription: React.FC<{ children: React.ReactNode }>;
    export const CardHeader: React.FC<{ children: React.ReactNode }>;
    export const CardTitle: React.FC<{ children: React.ReactNode }>;
}

declare module '@prompt/shared-library/ui/table' {
    export const Table: React.FC<{ children: React.ReactNode }>;
    export const TableBody: React.FC<{ children: React.ReactNode }>;
    export const TableCell: React.FC<{ children: React.ReactNode }>;
    export const TableHead: React.FC<{ children: React.ReactNode }>;
    export const TableHeader: React.FC<{ children: React.ReactNode }>;
    export const TableRow: React.FC<{ children: React.ReactNode }>;
}

declare module '@prompt/shared-library' {
    export const useAuth: () => {
        user: {
            id: string;
            roles: string[];
        } | null;
    };
}
