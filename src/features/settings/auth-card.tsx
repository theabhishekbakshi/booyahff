"use client";

import { useState, useSyncExternalStore } from "react";
import {
  Eye,
  EyeOff,
  Info,
  LogOut,
  Trash2,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type Account = { name: string; email: string; hash: string; createdAt: string };
type Session = { name: string; email: string; createdAt: string };

const ACCOUNTS_KEY = "booyahff.accounts.v1";
const SESSION_KEY = "booyahff.session.v1";

const emptySubscribe = () => () => {};

/** Demo auth stored entirely in the visitor's browser (no server, no network).
 *  Passwords are hashed with SHA-256 before being written to localStorage. */
export function AuthCard() {
  // hydration-safe mount check without setState-in-effect
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const [session, setSession] = useState<Session | null>(null);
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [pending, setPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [status, setStatus] = useState<{
    tone: "error" | "success";
    message: string;
  } | null>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  if (!mounted) {
    return (
      <Card aria-busy="true">
        <CardContent className="space-y-3">
          <div className="h-10 w-40 animate-pulse rounded-lg bg-muted" />
          <div className="h-8 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-24 w-full animate-pulse rounded-lg bg-muted" />
        </CardContent>
      </Card>
    );
  }

  const fail = (message: string) => setStatus({ tone: "error", message });

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    const email = loginEmail.trim().toLowerCase();
    if (!isEmail(email)) {
      fail("Enter a valid email address.");
      return;
    }
    if (!loginPassword) {
      fail("Enter your password.");
      return;
    }
    setPending(true);
    try {
      const accounts = readJson<Account[]>(ACCOUNTS_KEY) ?? [];
      const account = accounts.find((a) => a.email.toLowerCase() === email);
      if (!account) {
        fail("No account found with this email. Create one on the Sign up tab.");
        setTab("signup");
        return;
      }
      const hash = await sha256(loginPassword);
      if (hash !== account.hash) {
        fail("Incorrect password. Try again.");
        return;
      }
      const next = {
        name: account.name,
        email: account.email,
        createdAt: account.createdAt,
      };
      writeJson(SESSION_KEY, next);
      setSession(next);
      setLoginPassword("");
      setStatus({
        tone: "success",
        message: `Welcome back, ${firstName(account.name)}!`,
      });
    } finally {
      setPending(false);
    }
  }

  async function handleSignup(event: React.FormEvent) {
    event.preventDefault();
    const name = signupName.trim();
    const email = signupEmail.trim().toLowerCase();
    if (name.length < 2) {
      fail("Enter a display name (at least 2 characters).");
      return;
    }
    if (!isEmail(email)) {
      fail("Enter a valid email address.");
      return;
    }
    if (signupPassword.length < 8) {
      fail("Use at least 8 characters for your password.");
      return;
    }
    setPending(true);
    try {
      const accounts = readJson<Account[]>(ACCOUNTS_KEY) ?? [];
      if (accounts.some((a) => a.email.toLowerCase() === email)) {
        fail("An account with this email already exists. Log in instead.");
        setTab("login");
        return;
      }
      const createdAt = new Date().toISOString();
      accounts.push({ name, email, hash: await sha256(signupPassword), createdAt });
      writeJson(ACCOUNTS_KEY, accounts);
      const next = { name, email, createdAt };
      writeJson(SESSION_KEY, next);
      setSession(next);
      setSignupPassword("");
      setStatus({ tone: "success", message: "Account created — you're signed in." });
    } finally {
      setPending(false);
    }
  }

  function handleLogout() {
    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore storage failures
    }
    setSession(null);
    setConfirmDelete(false);
    setStatus({ tone: "success", message: "Signed out." });
  }

  function handleDelete() {
    if (!session) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    try {
      const accounts = readJson<Account[]>(ACCOUNTS_KEY) ?? [];
      writeJson(
        ACCOUNTS_KEY,
        accounts.filter((a) => a.email.toLowerCase() !== session.email.toLowerCase()),
      );
      window.localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore storage failures
    }
    setSession(null);
    setConfirmDelete(false);
    setStatus({ tone: "success", message: "Local account deleted." });
  }

  if (session) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Avatar name={session.name} />
            <div className="min-w-0">
              <CardTitle className="truncate">{session.name}</CardTitle>
              <CardDescription className="truncate">{session.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="rounded-lg border bg-background/60 px-3 py-2">
              <dt className="text-xs text-muted-foreground">Member since</dt>
              <dd className="mt-0.5 font-semibold">
                {formatDate(session.createdAt)}
              </dd>
            </div>
            <div className="rounded-lg border bg-background/60 px-3 py-2">
              <dt className="text-xs text-muted-foreground">Profile type</dt>
              <dd className="mt-0.5 font-semibold">Local demo account</dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="size-3.5" aria-hidden />
              Log out
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="size-3.5" aria-hidden />
              {confirmDelete ? "Confirm delete" : "Delete account"}
            </Button>
          </div>
        </CardContent>
        <FooterNote>
          Deleting removes the account and its session from this browser only.
        </FooterNote>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-brand/30 bg-brand/15 text-brand">
            <UserRound className="size-5" aria-hidden />
          </span>
          <div>
            <CardTitle>Sign in to {siteConfig.name}</CardTitle>
            <CardDescription>
              Log in or create an account — or keep browsing without one.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          value={tab}
          onValueChange={(value) => {
            setTab(value as "login" | "signup");
            setStatus(null);
          }}
        >
          <TabsList className="w-full">
            <TabsTrigger value="login">Log in</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="mt-3 space-y-3" noValidate>
              <Field
                id="login-email"
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={loginEmail}
                onChange={setLoginEmail}
                invalid={status?.tone === "error"}
              />
              <Field
                id="login-password"
                label="Password"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                value={loginPassword}
                onChange={setLoginPassword}
                invalid={status?.tone === "error"}
                show={showLoginPassword}
                onToggleShow={() => setShowLoginPassword((v) => !v)}
              />
              <Button type="submit" size="lg" className="w-full" disabled={pending}>
                {pending ? "Signing in…" : "Log in"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="mt-3 space-y-3" noValidate>
              <Field
                id="signup-name"
                label="Display name"
                type="text"
                autoComplete="name"
                placeholder="e.g. AlokMain"
                value={signupName}
                onChange={setSignupName}
                invalid={status?.tone === "error"}
              />
              <Field
                id="signup-email"
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={signupEmail}
                onChange={setSignupEmail}
                invalid={status?.tone === "error"}
              />
              <Field
                id="signup-password"
                label="Password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={signupPassword}
                onChange={setSignupPassword}
                invalid={status?.tone === "error"}
                show={showSignupPassword}
                onToggleShow={() => setShowSignupPassword((v) => !v)}
              />
              <Button type="submit" size="lg" className="w-full" disabled={pending}>
                {pending ? "Creating account…" : "Create account"}
              </Button>
            </form>
          </TabsContent>

          {status ? (
            <p
              role="status"
              className={cn(
                "mt-3 rounded-lg border px-3 py-2 text-xs font-medium",
                status.tone === "error"
                  ? "border-destructive/40 bg-destructive/10 text-destructive"
                  : "border-brand/40 bg-brand/10 text-brand",
              )}
            >
              {status.message}
            </p>
          ) : null}
        </Tabs>
      </CardContent>
      <FooterNote>
        Demo profiles live only in this browser (localStorage) — passwords are
        hashed locally and never sent to a server.
      </FooterNote>
    </Card>
  );
}

function Avatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "B";
  return (
    <span className="flex size-11 shrink-0 select-none items-center justify-center rounded-full border border-brand/30 bg-brand/15 text-base font-bold text-brand">
      {initial}
    </span>
  );
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  invalid,
  show,
  onToggleShow,
}: {
  id: string;
  label: string;
  type: "text" | "email" | "password";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  invalid?: boolean;
  show?: boolean;
  onToggleShow?: () => void;
}) {
  const isPassword = type === "password";
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-muted-foreground">
        {label}
      </label>
      <div className={cn(isPassword && onToggleShow && "relative")}>
        <Input
          id={id}
          type={isPassword && show ? "text" : type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={invalid || undefined}
          className={cn("h-9", isPassword && onToggleShow && "pr-9")}
        />
        {isPassword && onToggleShow ? (
          <button
            type="button"
            onClick={onToggleShow}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            {show ? <EyeOff className="size-3.5" aria-hidden /> : <Eye className="size-3.5" aria-hidden />}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function FooterNote({ children }: { children: React.ReactNode }) {
  return (
    <CardFooter className="gap-2 text-xs leading-relaxed text-muted-foreground">
      <Info className="size-3.5 shrink-0" aria-hidden />
      <span>{children}</span>
    </CardFooter>
  );
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

function formatDate(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "Unknown"
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable (private mode) — auth simply won't persist
  }
}

async function sha256(text: string) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
