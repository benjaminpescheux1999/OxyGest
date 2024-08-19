import { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';
import IUser from '../components/types/user';

interface AuthContextType {
  userActive: IUserActive | null;
  authenticateUser: (auth: {username: string, password: string}) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}
interface IUserActive {
  user: IUser | null;
  sessionToken: string | null;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [userActive, setUserActive] = useState<IUserActive | null>(() => {
    // Récupérer les données de l'utilisateur et le token de session du stockage local
    const savedSession = localStorage.getItem('userSession');
    return savedSession ? JSON.parse(savedSession) : null;
  });
  //intercepter le code status 401 avec interceptor, si il y a ce code alors setUserActive(null) sinon rien faire
  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response.status === 401) {
        setUserActive(null);
      }
      return Promise.reject(error);
    }
  );

  const authenticateUser = async (auth: {username: string, password: string}) => {
    try {
      const response = await axios.get("http://localhost:8080/glpi/apirest.php/initSession?get_full_session=true", {
        auth: {
          username: auth.username,
          password: auth.password
        }
      });
      const responseData = response.data;
      const sessionToken = responseData.session_token;
      const userData: IUser = {
        id: responseData.session.glpiID,
        name: responseData.session.glpiname,
        realname: responseData.session.glpirealname !== null ? responseData.session.glpirealname : responseData.session.glpiname,
        firstname: responseData.session.glpifirstname !== null ? responseData.session.glpifirstname : responseData.session.glpiname,
      }
      console.log(userData);
      const newUserActive = { user: userData, sessionToken };
      setUserActive(newUserActive);
      // Sauvegarder dans le stockage local
      localStorage.setItem('userSession', JSON.stringify(newUserActive));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider value={{ userActive, authenticateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};