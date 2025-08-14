import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User as Usuario } from '@/types';

interface AuthContextType {
  user: User | null;
  userData: Usuario | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, telefone?: string) => Promise<void>;
  updateUserPhone: (telefone: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔐 Auth state changed:', user?.uid);
      setUser(user);
      
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as Usuario;
            console.log('👤 User data loaded:', userData);
            setUserData(userData);
          } else {
            console.log('📝 Creating new user document...');
            const newUserData: Usuario = {
              uid: user.uid,
              email: user.email || '',
              whatsapp_comercial: ''
            };
            await setDoc(doc(db, 'usuarios', user.uid), newUserData);
            setUserData(newUserData);
          }
        } catch (error) {
          console.error('❌ Erro ao buscar dados do usuário:', error);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const validatePhone = (telefone: string): string => {
    const cleanPhone = telefone.replace(/\D/g, '');
    
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      throw new Error('Número inválido. Use DDD seguido do número (10 ou 11 dígitos).');
    }
    
    console.log('📱 Telefone validado:', cleanPhone);
    return cleanPhone;
  };

  const login = async (email: string, password: string) => {
    console.log('🔐 Tentando login para:', email);
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, telefone?: string) => {
    console.log('📝 Registrando usuário:', email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    const validatedPhone = telefone ? validatePhone(telefone) : '';
    
    const userData: Usuario = {
      uid: userCredential.user.uid,
      email: email,
      whatsapp_comercial: validatedPhone
    };

    await setDoc(doc(db, 'usuarios', userCredential.user.uid), userData);
    console.log('✅ Usuário criado com sucesso');
  };

  const updateUserPhone = async (telefone: string) => {
    if (!user) {
      throw new Error('Usuário não logado');
    }
    
    console.log('📱 Atualizando telefone do usuário:', user.uid, 'para:', telefone);
    
    try {
      const validatedPhone = validatePhone(telefone);
      
      await updateDoc(doc(db, 'usuarios', user.uid), {
        whatsapp_comercial: validatedPhone
      });
      
      if (userData) {
        const updatedUserData = { ...userData, whatsapp_comercial: validatedPhone };
        setUserData(updatedUserData);
        console.log('✅ Dados locais atualizados:', updatedUserData);
      }
      
      console.log('✅ Telefone atualizado com sucesso no Firestore');
    } catch (error) {
      console.error('❌ Erro ao atualizar telefone:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('🚪 Fazendo logout...');
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, login, register, updateUserPhone, logout }}>
      {children}
    </AuthContext.Provider>
  );
};