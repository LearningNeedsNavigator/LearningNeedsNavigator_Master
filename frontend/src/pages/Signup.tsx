
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupForm from '@/components/auth/SignupForm';
import { useAuth } from '@/context/AuthContext';
import Footer from '@/components/layout/Footer';

const Signup = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/assessment');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto px-4 py-8 flex-1 w-full">
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-primary">Learning Needs Navigator</h1>
            <p className="text-muted-foreground">Create an account to get started</p>
          </div>
          <SignupForm />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Signup;
