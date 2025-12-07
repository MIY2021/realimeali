
import { LoginForm } from "@/components/auth/LoginForm";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function Login() {
  useDocumentTitle("Create an account | RealiMeali");
  
  return <LoginForm />;
}
