import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UtensilsCrossed, RotateCcw, Home, Mail, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ErrorPageProps {
  error: Error;
  errorInfo?: React.ErrorInfo | null;
  onReset?: () => void;
}

const ErrorPage = ({ error, errorInfo, onReset }: ErrorPageProps) => {
  const navigate = useNavigate();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const errorDetails = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    errorName: error.name,
    errorMessage: error.message,
    errorStack: error.stack || "No stack trace available",
    componentStack: errorInfo?.componentStack || "No component stack available",
  };

  const handleRefresh = () => {
    if (onReset) {
      onReset();
    }
    window.location.reload();
  };

  const handleGoHome = () => {
    if (onReset) {
      onReset();
    }
    navigate("/");
  };

  const handleCopyError = async () => {
    const errorReport = `
Error Report
============
Time: ${errorDetails.timestamp}
URL: ${errorDetails.url}

Error Type: ${errorDetails.errorName}
Error Message: ${errorDetails.errorMessage}

Stack Trace:
${errorDetails.errorStack}

Component Stack:
${errorDetails.componentStack}

Browser Info:
${errorDetails.userAgent}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorReport);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy error details:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-2xl w-full p-8 space-y-6">
        {/* Icon and Title */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <UtensilsCrossed className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-muted-foreground">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>
          </div>
        </div>

        <Separator />

        {/* Error Summary */}
        <div className="bg-destructive/5 rounded-lg p-4 border border-destructive/20">
          <p className="text-sm font-medium text-destructive mb-1">
            {errorDetails.errorName}
          </p>
          <p className="text-sm text-muted-foreground">
            {errorDetails.errorMessage}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleRefresh}
            className="flex-1 gap-2"
            variant="default"
          >
            <RotateCcw className="h-4 w-4" />
            Refresh Page
          </Button>
          <Button
            onClick={handleGoHome}
            className="flex-1 gap-2"
            variant="outline"
          >
            <Home className="h-4 w-4" />
            Go to Home
          </Button>
          <Button
            onClick={() => navigate("/contact")}
            className="flex-1 gap-2"
            variant="outline"
          >
            <Mail className="h-4 w-4" />
            Contact Support
          </Button>
        </div>

        <Separator />

        {/* Technical Details (Collapsible) */}
        <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Technical Details
              </h3>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  {isDetailsOpen ? (
                    <>
                      Hide Details
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show Details
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="space-y-3">
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Timestamp
                  </p>
                  <p className="text-sm font-mono text-foreground">
                    {new Date(errorDetails.timestamp).toLocaleString()}
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    URL
                  </p>
                  <p className="text-sm font-mono text-foreground break-all">
                    {errorDetails.url}
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Stack Trace
                  </p>
                  <pre className="text-xs font-mono text-foreground bg-background rounded p-3 overflow-x-auto max-h-40 overflow-y-auto">
                    {errorDetails.errorStack}
                  </pre>
                </div>

                {errorDetails.componentStack !== "No component stack available" && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Component Stack
                      </p>
                      <pre className="text-xs font-mono text-foreground bg-background rounded p-3 overflow-x-auto max-h-40 overflow-y-auto">
                        {errorDetails.componentStack}
                      </pre>
                    </div>
                  </>
                )}
              </div>

              <Button
                onClick={handleCopyError}
                variant="outline"
                className="w-full gap-2"
                disabled={isCopied}
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Error Details
                  </>
                )}
              </Button>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            If this error persists, please contact support with the error details above.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ErrorPage;
