import { NonAuthenticatedPageWrapper } from '../components/NonAuthenticatedPageWrapper'

export const ApplicationExternal = (): JSX.Element => {
  return (
    <NonAuthenticatedPageWrapper withLoginButton={false}>
      <h1>ApplicationAuthenticated</h1>
    </NonAuthenticatedPageWrapper>
  )
}
