import React, { useState } from 'react';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { useToast } from './hooks/useToast';
import { Upload } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from './components/Card';

const SettingsPage: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('template', file);

        try {
            const response = await fetch('/api/certificate/template', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            toast({
                title: 'Success',
                description: 'Template uploaded successfully',
            });
            setFile(null);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to upload template',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">Certificate Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Template Upload</CardTitle>
                    <CardDescription>
                        Upload your Typst template file for certificates. The template should include
                        placeholders for: {'{courseName}'}, {'{studentName}'}, and {'{teamName}'}.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <Input
                            type="file"
                            accept=".typ"
                            onChange={handleFileChange}
                            className="flex-1"
                        />
                        <Button
                            onClick={handleUpload}
                            disabled={!file}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Template
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Template Requirements</CardTitle>
                    <CardDescription>
                        Your Typst template file should follow these requirements:
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>File must be a valid Typst (.typ) file</li>
                        <li>Include {'{courseName}'} placeholder for the course name</li>
                        <li>Include {'{studentName}'} placeholder for the student's name</li>
                        <li>Include {'{teamName}'} placeholder for the team name</li>
                        <li>Optional: Include {'{date}'} placeholder for the generation date</li>
                        <li>Template should be in A4 format</li>
                        <li>Ensure all used fonts are included or are system fonts</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
};

export default SettingsPage;
