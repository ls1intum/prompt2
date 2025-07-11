import React, { Suspense } from 'react'

const Certificate = React.lazy(() => import('certificate_component/App'))

export const CertificateRoutes: React.FC = () => {
    return (
        <Suspense fallback={<div>Loading Certificate...</div>}>
            <Certificate />
        </Suspense>
    )
}
