import { Link, useNavigate } from "react-router-dom";
import { Pencil, ClockIcon, CreditCardIcon, MenuIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import CreditBadge from "@/polymet/components/credit-badge";
import { signOut } from "firebase/auth";
import { clearCredentials } from "@/redux/slices/authSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { RootState } from "@reduxjs/toolkit/query";
import { persistor } from "@/redux/store";
import { auth } from "@/firebaseConfig";

interface ImageProcessorLayoutProps {
  children: React.ReactNode;
}

export default function ImageProcessorLayout({ children }: ImageProcessorLayoutProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, userId } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(clearCredentials());
      persistor.purge();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!isAuthenticated) {
    return navigate('/login');
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30 dark:bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full flex h-16 items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <MenuIcon className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
                    <Pencil className="h-5 w-5" />
                    Editor
                  </Link>
                  <Link to="/history" className="flex items-center gap-2 text-lg font-semibold">
                    <ClockIcon className="h-5 w-5" />
                    History
                  </Link>
                  <Link to="/credits" className="flex items-center gap-2 text-lg font-semibold">
                    <CreditCardIcon className="h-5 w-5" />
                    Credits & Billing
                  </Link>
                  <Link to="/profile" className="flex items-center gap-2 text-lg font-semibold">
                    <UserIcon className="h-5 w-5" />
                    Profile
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">IP</span>
              </div>
              <span className="font-bold text-xl hidden sm:inline-block">
                ImageProcessor
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-2">
              <Link to="/" className="text-sm font-medium hover:text-primary transition-colors p-2 rounded-full hover:bg-muted" title="Editor">
                <Pencil className="h-5 w-5" />
                <span className="sr-only">Editor</span>
              </Link>
              <Link to="/history" className="text-sm font-medium hover:text-primary transition-colors p-2 rounded-full hover:bg-muted" title="History">
                <ClockIcon className="h-5 w-5" />
                <span className="sr-only">History</span>
              </Link>
              <Link to="/credits" className="text-sm font-medium hover:text-primary transition-colors p-2 rounded-full hover:bg-muted" title="Credits & Billing">
                <CreditCardIcon className="h-5 w-5" />
                <span className="sr-only">Credits & Billing</span>
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <CreditBadge compact />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <UserIcon className="h-5 w-5" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <button onClick={handleLogout} className="w-full text-left">
                      Log out
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-10">{children}</main>

      <footer className="border-t p-6 md:px-4 md:py-0">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:h-16">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Centaq. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="text-sm text-muted-foreground hover:underline">
              Terms
            </Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:underline">
              Privacy
            </Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}