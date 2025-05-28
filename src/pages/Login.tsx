
import { LoginForm } from "@/components/auth/LoginForm";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function Login() {
  useDocumentTitle("Login | RealiMeali");
  
  return (
    <div className="container py-10">
      <LoginForm />
    </div>
  );
}
