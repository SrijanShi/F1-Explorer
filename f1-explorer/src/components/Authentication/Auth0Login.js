import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import './Auth.css';

const Auth0Login = () => {
    const { loginWithRedirect } = useAuth0();
    
    const handleGoogleLogin = () => {
        loginWithRedirect({
            authorizationParams: {
                connection: 'google-oauth2',
                prompt: 'select_account'
            }
        });
    };
    
    return (
        <button 
            className="auth0-button"
            onClick={handleGoogleLogin}
        >
            Sign in with Google
        </button>
    );
};

export default Auth0Login;