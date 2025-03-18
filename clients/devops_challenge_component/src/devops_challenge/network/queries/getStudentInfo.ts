export const getStudentInfo = async (
    coursePhaseID: string
) => {
    const response = await fetch(`http://devops-challenge.aet.cit.tum.de/${coursePhaseID}/studentTest`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to trigger assessment');
    }

    const data = await response.json();
    return data;
};