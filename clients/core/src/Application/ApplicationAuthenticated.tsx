import { AuthenticatedPageWrapper } from '../components/AuthenticatedPageWrapper'

export const ApplicationAuthenticated = (): JSX.Element => {
  return (
    <AuthenticatedPageWrapper withLoginButton={false}>
      <h1>ApplicationAuthenticated</h1>
    </AuthenticatedPageWrapper>
  )
}
