import React, { useEffect, useState } from 'react';
import { Button } from './components/Button';
import { useToast } from './hooks/useToast';
import { Download } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from './components/Card';
import { useAuth } from './hooks/useAuth';

interface CertificateStatus {
    available: boolean;
    lastDownload: string | null;
}

const StudentCertificatePage: React.FC = () => {
    const [status, setStatus] = useState<CertificateStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();

    const fetchStatus = async () => {
        try {
            const response = await fetch('/api/certificate/status');
            const data = await response.json();
            setStatus(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch certificate status',
                variant: 'destructive',
            });
        }
    };

    const downloadCertificate = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/certificate/download');
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'certificate.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            await fetchStatus(); // Refresh status after download
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to download certificate',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    if (!status) return null;

    return (
        <div className="container mx-auto py-6">
            <Card>
                <CardHeader>
                    <CardTitle>Course Certificate</CardTitle>
                    <CardDescription>
                        Download your course completion certificate
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {status.available ? (
                        <div className="space-y-4">
                            <p>
                                Your certificate is ready to download.
                                {status.lastDownload && (
                                    <span className="text-sm text-gray-500 ml-2">
                                        Last downloaded: {new Date(status.lastDownload).toLocaleDateString()}
                                    </span>
                                )}
                            </p>
                            <Button
                                onClick={downloadCertificate}
                                disabled={isLoading}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                {isLoading ? 'Downloading...' : 'Download Certificate'}
                            </Button>
                        </div>
                    ) : (
                        <p className="text-amber-600">
                            Your certificate is not available yet. Please wait for your instructor to generate it.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default StudentCertificatePage;
