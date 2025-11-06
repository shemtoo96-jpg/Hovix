import React, { useState, FormEvent, ChangeEvent } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { User } from '../types';
import Logo from './Logo';
import Button from './ui/Button';
import Card from './ui/Card';

interface AuthCredentials extends User {
  password: string;
}

interface LoginProps {
  onLogin: (user: User) => void;
}

const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
);

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

const AppleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.228 3.472c.67.01 1.25.32 1.76.84-.5.51-.81 1.23-.79 2.04.02.84.36 1.56.9 2.08.53.51 1.22.81 2.03.83.84.02 1.58-.29 2.08-.81.18.31.28.64.31.98-.02 1.1-.31 2.14-.84 3.09-.54.98-1.23 1.78-2.09 2.42-.87.64-1.82.97-2.85.98-1.02.01-1.94-.29-2.75-.87-.79-.58-1.37-1.37-1.74-2.38-.36-1-.54-2.06-.54-3.18 0-1.16.2-2.22.6-3.18.39-.96.95-1.73 1.68-2.32.74-.59 1.58-.9 2.5-.92M14.017 1.1c-1.3.03-2.5.52-3.56 1.44-1.05.92-1.8 2.1-2.23 3.51-.59 1.96-.29 3.9.89 5.81.59.95 1.34 1.73 2.27 2.34.93.61 1.96.92 3.09.94 1.13.02 2.16-.28 3.09-.87.93-.59 1.68-1.35 2.24-2.27.56-.92.86-1.91.89-2.98.02-.75-.1-1.46-.36-2.12-1.23.06-2.29-.33-3.18-1.18-.89-.85-1.33-1.87-1.33-3.06-.01-1.2.44-2.24 1.33-3.12-.2-.02-.4-.03-.6-.03"/>
    </svg>
);


const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useLocalStorage<AuthCredentials[]>('users', []);

  const passwordMismatch = !isLoginView && confirmPassword && password !== confirmPassword;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate async operation
    setTimeout(() => {
      if (isLoginView) {
        handleLogin();
      } else {
        handleSignUp();
      }
      setIsLoading(false);
    }, 500);
  };

  const handleLogin = () => {
    const user = users.find(u => u.email === email);
    if (user && user.password === password) {
      onLogin({ name: user.name, email: user.email, photo: user.photo });
    } else {
      setError("Invalid email or password.");
    }
  };

  const handleSignUp = () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (users.some(u => u.email === email)) {
      setError("An account with this email already exists.");
      return;
    }
    if (!name.trim() || !email.trim() || !password.trim()) {
        setError("All fields are required.");
        return;
    }
    const newUser: AuthCredentials = { name, email, password, photo: photo || undefined };
    setUsers(prevUsers => [...prevUsers, newUser]);
    onLogin({ name: newUser.name, email: newUser.email, photo: newUser.photo });
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
            setPhoto(event.target?.result as string);
        };
        reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError(null);

    // Simulate the OAuth flow and receiving user data from Google
    setTimeout(() => {
      const mockGoogleUser = {
        name: 'Alex Googler',
        email: 'alex.googler@example.com',
        photo: `https://api.dicebear.com/8.x/initials/svg?seed=Alex+Googler`,
      };

      try {
        let user = users.find(u => u.email === mockGoogleUser.email);
        
        if (!user) {
          // If user doesn't exist, create a new one. OAuth users won't have a password.
          const newUser: AuthCredentials = { 
            name: mockGoogleUser.name, 
            email: mockGoogleUser.email, 
            photo: mockGoogleUser.photo,
            password: '' // Indicates OAuth user
          };
          setUsers(prevUsers => [...prevUsers, newUser]);
          user = newUser;
        }

        onLogin({ name: user.name, email: user.email, photo: user.photo });
      } catch (e) {
        console.error("Google login simulation failed:", e);
        setError("An unexpected error occurred during Google sign-in.");
      } finally {
        setIsLoading(false);
      }
    }, 1000); // Simulate network delay
  };

  const handleAppleLogin = () => {
    setIsLoading(true);
    setError(null);

    // Simulate the OAuth flow and receiving user data from Apple
    setTimeout(() => {
      const mockAppleUser = {
        name: 'Jordan Appleseed', // Apple sometimes doesn't provide a full name initially
        email: 'privaterelay@appleid.com', // Simulate a private relay email
        photo: `https://api.dicebear.com/8.x/initials/svg?seed=Jordan+Appleseed`,
      };

      try {
        let user = users.find(u => u.email === mockAppleUser.email);
        
        if (!user) {
          // If user doesn't exist, create a new one.
          const newUser: AuthCredentials = { 
            name: mockAppleUser.name, 
            email: mockAppleUser.email, 
            photo: mockAppleUser.photo,
            password: '' // Indicates OAuth user
          };
          setUsers(prevUsers => [...prevUsers, newUser]);
          user = newUser;
        }

        onLogin({ name: user.name, email: user.email, photo: user.photo });
      } catch (e) {
        console.error("Apple login simulation failed:", e);
        setError("An unexpected error occurred during Apple sign-in.");
      } finally {
        setIsLoading(false);
      }
    }, 1000); // Simulate network delay
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900 p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="h-16 w-auto inline-block"/>
          <h1 className="text-3xl font-bold text-text-light dark:text-text-dark mt-4">{isLoginView ? 'Welcome Back!' : 'Create Your Account'}</h1>
          <p className="text-gray-500 dark:text-gray-400">{isLoginView ? 'Sign in to continue your journey.' : 'Join Hovix to start reflecting.'}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginView && (
            <div className="flex flex-col items-center space-y-4">
                 <label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-400 dark:border-gray-500 hover:border-primary dark:hover:border-primary-dark transition-colors">
                        {photo ? (
                            <img src={photo} alt="Profile preview" className="w-full h-full object-cover" />
                        ) : (
                            <CameraIcon className="h-10 w-10 text-gray-500" />
                        )}
                    </div>
                </label>
                <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark outline-none transition"
              />
            </div>
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark outline-none transition"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark outline-none transition"
          />
          {!isLoginView && (
            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 border transition ${
                    passwordMismatch ? 'border-danger focus:ring-danger' : 'border-transparent focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark'
                  } outline-none`}
              />
              {passwordMismatch && (
                <p className="text-xs text-danger mt-1">Passwords do not match.</p>
              )}
            </div>
          )}
          
          {error && <p className="text-sm text-danger text-center">{error}</p>}

          <Button type="submit" className="w-full !py-3" disabled={isLoading || passwordMismatch}>
            {isLoading ? 'Processing...' : (isLoginView ? 'Login' : 'Sign Up')}
          </Button>
        </form>

        <div className="text-center mt-4">
          <button onClick={() => { setIsLoginView(!isLoginView); setError(null); }} className="text-sm text-primary dark:text-primary-dark hover:underline">
            {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">OR</span>
          </div>
        </div>

        <div className="space-y-3">
            <Button 
                type="button" 
                variant="secondary" 
                className="w-full flex items-center justify-center space-x-3 !py-3 bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700" 
                onClick={handleGoogleLogin}
                disabled={isLoading}
            >
                <GoogleIcon className="h-5 w-5" />
                <span>Continue with Google</span>
            </Button>
            <Button 
                type="button" 
                variant="secondary" 
                className="w-full flex items-center justify-center space-x-3 !py-3 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200" 
                onClick={handleAppleLogin}
                disabled={isLoading}
            >
                <AppleIcon className="h-5 w-5" />
                <span>Continue with Apple</span>
            </Button>
        </div>
      </Card>
    </div>
  );
};

export default Login;