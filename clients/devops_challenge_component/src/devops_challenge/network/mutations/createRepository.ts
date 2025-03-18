export const createRepository = async (
    githubUsername: string,
    coursePhaseID: string
) => {
    const response = await fetch(`http://devops-challenge.aet.cit.tum.de/${coursePhaseID}/repository`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ githubUsername }),
    });

    if (!response.ok) {
        throw new Error('Failed to create repository');
    }

    const data = await response.json();
    return data.repositoryUrl;
};