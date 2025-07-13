import AuthForm from "@/components/auth/auth-form";
import { useNavigate } from "react-router-dom";

interface LoginProps {
  onLogin: (userData: { name: string; email: string }) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const navigate = useNavigate();
  
  return <AuthForm onLogin={onLogin} />;
}