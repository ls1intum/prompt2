export const triggerAssessment = async (
    coursePhaseID: string,
    githubUsername: string
) => {
    const response = await fetch(`http://devops-challenge.aet.cit.tum.de/${coursePhaseID}/studentTest`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ githubUsername }),
    });

    if (!response.ok) {
        throw new Error('Failed to trigger assessment');
    }

    const data = await response.json();
    return data.message;
};