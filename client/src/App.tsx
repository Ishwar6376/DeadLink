import Home from "./pages/Home";

import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
  SignUpButton,
  RedirectToSignIn,
} from "@clerk/clerk-react";

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Simple navbar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <h1 className="text-xl font-bold">DeadLink</h1>

        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton />
            <SignUpButton />
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      {/* Main content */}
      <main>
        {/* If logged out, show Clerk sign in */}
        <SignedOut>
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-slate-300 text-sm">Please sign in to use DeadLink</p>
            <RedirectToSignIn />
          </div>
        </SignedOut>

        {/* If logged in, show your Home page */}
        <SignedIn>
          <Home />

          {/* If you also want Dashboard, you could render it or route to it */}
          {/* <Dashboard /> */}
        </SignedIn>
      </main>
    </div>
  );
}

export default App;


