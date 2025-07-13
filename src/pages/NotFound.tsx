import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="space-y-6 max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-semibold">Page Not Found</h2>
        <p className="text-lg text-muted-foreground">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={() => navigate("/")}
          >
            Return to Calculator
          </Button>
        </div>
      </div>
    </div>
  );
}