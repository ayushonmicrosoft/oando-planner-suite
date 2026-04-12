import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/error-boundary";
import { AppLayout } from "@/components/layout";
import { queryClient } from "@/lib/queryClient";

import Home from "@/pages/home";
import Landing from "@/pages/landing";
import Catalog from "@/pages/catalog";
import Plans from "@/pages/plans";
import Templates from "@/pages/templates";
import CanvasPlanner from "@/pages/planner/canvas";
import BlueprintPlanner from "@/pages/planner/blueprint";
import StudioPage from "@/pages/planner/studio";
import PlannersHub from "@/pages/planners-hub";
import Viewer3D from "@/pages/viewer/viewer-3d";
import CadDrawing from "@/pages/tools/cad-drawing";
import FloorPlanCreator from "@/pages/tools/floor-plan-creator";
import CustomShapes from "@/pages/tools/custom-shapes";
import ImportScale from "@/pages/tools/import-scale";
import SitePlan from "@/pages/tools/site-plan";
import NotFound from "@/pages/not-found";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  console.error("Missing VITE_CLERK_PUBLISHABLE_KEY environment variable");
}

function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <AppLayout>
          <ErrorBoundary fallbackTitle="Dashboard failed to load">
            <Home />
          </ErrorBoundary>
        </AppLayout>
      </Show>
      <Show when="signed-out">
        <Landing />
      </Show>
    </>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-in">
        <AppLayout>{children}</AppLayout>
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/sign-in/*?">{() => <SignInPage />}</Route>
      <Route path="/sign-up/*?">{() => <SignUpPage />}</Route>
      <Route path="/catalog">{() => <ProtectedRoute><ErrorBoundary fallbackTitle="Catalog failed to load"><Catalog /></ErrorBoundary></ProtectedRoute>}</Route>
      <Route path="/plans">{() => <ProtectedRoute><ErrorBoundary fallbackTitle="Plans failed to load"><Plans /></ErrorBoundary></ProtectedRoute>}</Route>
      <Route path="/templates">{() => <ProtectedRoute><ErrorBoundary fallbackTitle="Templates failed to load"><Templates /></ErrorBoundary></ProtectedRoute>}</Route>
      <Route path="/planners">{() => <ProtectedRoute><ErrorBoundary fallbackTitle="Planners hub failed to load"><PlannersHub /></ErrorBoundary></ProtectedRoute>}</Route>
      <Route path="/planner/studio">{() => <><Show when="signed-in"><ErrorBoundary fallbackTitle="Studio planner failed to load"><StudioPage /></ErrorBoundary></Show><Show when="signed-out"><Redirect to="/sign-in" /></Show></>}</Route>
      <Route path="/planner/canvas">{() => <ProtectedRoute><ErrorBoundary fallbackTitle="Canvas planner failed to load"><CanvasPlanner /></ErrorBoundary></ProtectedRoute>}</Route>
      <Route path="/planner/blueprint">{() => <ProtectedRoute><ErrorBoundary fallbackTitle="Blueprint wizard failed to load"><BlueprintPlanner /></ErrorBoundary></ProtectedRoute>}</Route>
      <Route path="/viewer/3d">{() => <ProtectedRoute><ErrorBoundary fallbackTitle="3D viewer failed to load"><Viewer3D /></ErrorBoundary></ProtectedRoute>}</Route>
      <Route path="/tools/cad">{() => <ProtectedRoute><ErrorBoundary fallbackTitle="CAD drawing tool failed to load"><CadDrawing /></ErrorBoundary></ProtectedRoute>}</Route>
      <Route path="/tools/floor-plan">{() => <ProtectedRoute><ErrorBoundary fallbackTitle="Floor plan creator failed to load"><FloorPlanCreator /></ErrorBoundary></ProtectedRoute>}</Route>
      <Route path="/tools/shapes">{() => <ProtectedRoute><ErrorBoundary fallbackTitle="Custom shapes tool failed to load"><CustomShapes /></ErrorBoundary></ProtectedRoute>}</Route>
      <Route path="/tools/import">{() => <ProtectedRoute><ErrorBoundary fallbackTitle="Import & scale tool failed to load"><ImportScale /></ErrorBoundary></ProtectedRoute>}</Route>
      <Route path="/tools/site-plan">{() => <ProtectedRoute><ErrorBoundary fallbackTitle="Site plan tool failed to load"><SitePlan /></ErrorBoundary></ProtectedRoute>}</Route>
      <Route>{() => <ProtectedRoute><NotFound /></ProtectedRoute>}</Route>
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ClerkQueryClientCacheInvalidator />
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function AppWithoutAuth() {
  return (
    <WouterRouter base={basePath}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Switch>
            <Route path="/" component={Landing} />
            <Route>{() => <div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold mb-2">Authentication Required</h1><p className="text-muted-foreground">This feature requires sign-in. Please configure Clerk to continue.</p></div></div>}</Route>
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </WouterRouter>
  );
}

function App() {
  if (!clerkPubKey) {
    return <AppWithoutAuth />;
  }

  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
