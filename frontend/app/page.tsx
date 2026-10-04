import LoginForm from './components/login/LoginForm';
import RegisterForm from './components/register/RegisterForm';


function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50">
      <LoginForm />
      <RegisterForm />
    </div>
  );
}

export default HomePage;