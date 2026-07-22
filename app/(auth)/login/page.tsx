import LoginForm from "./LoginForm";

type LoginPageProps = {
  searchParams: Promise<{
    redirect?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const params = await searchParams;

  const redirectTo =
    params.redirect ||
    "/CoworkerDashboard";

  return (
    <LoginForm
      redirectTo={redirectTo}
    />
  );
}