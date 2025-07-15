import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from './components/Table';
import { Button } from './components/Button';
import { useToast } from './hooks/useToast';
import { Download, RefreshCw } from 'lucide-react';

interface Student {
    id: string;
    name: string;
    team: string;
    certificateGenerated: boolean;
    lastDownload: string | null;
}

const OverviewPage: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const fetchStudents = async () => {
        try {
            const response = await fetch('/api/certificate/students');
            const data = await response.json();
            setStudents(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch student data',
                variant: 'destructive',
            });
        }
    };

    const generateCertificates = async () => {
        setIsGenerating(true);
        try {
            await fetch('/api/certificate/generate', { method: 'POST' });
            toast({
                title: 'Success',
                description: 'Certificates generation started',
            });
            await fetchStudents();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to generate certificates',
                variant: 'destructive',
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadCertificate = async (studentId: string) => {
        try {
            const response = await fetch(`/api/certificate/download/${studentId}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'certificate.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to download certificate',
                variant: 'destructive',
            });
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Certificates Overview</h1>
                <Button
                    onClick={generateCertificates}
                    disabled={isGenerating}
                >
                    {isGenerating ? (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        'Generate Certificates'
                    )}
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Download</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map((student) => (
                        <TableRow key={student.id}>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{student.team}</TableCell>
                            <TableCell>
                                {student.certificateGenerated ? 'Generated' : 'Pending'}
                            </TableCell>
                            <TableCell>
                                {student.lastDownload
                                    ? new Date(student.lastDownload).toLocaleDateString()
                                    : 'Never'}
                            </TableCell>
                            <TableCell>
                                {student.certificateGenerated && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => downloadCertificate(student.id)}
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Download
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default OverviewPage;
