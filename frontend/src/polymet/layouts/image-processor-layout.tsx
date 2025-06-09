import {
  BellIcon,
  HelpCircleIcon,
  MenuIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "../../AuthContext"; 

interface ImageProcessorLayoutProps {
  children: React.ReactNode;
}

export default function ImageProcessorLayout({
  children,
}: ImageProcessorLayoutProps) {
  const { logout } = useAuth(); // Get the logout function from the AuthContext

  const handleLogout = () => {
    logout(); // Call the logout function from AuthContext
  };
  return (
    <div className="min-h-screen flex flex-col bg-muted/30 dark:bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
        <div className="bg-red-500 p-2 text-white">
            Build test - {new Date().toISOString()}
          </div>
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
                  <a
                    href="/"
                    className="flex items-center gap-2 text-lg font-semibold"
                  >
                    Home
                  </a>
                  <a
                    href="/dashboard"
                    className="flex items-center gap-2 text-lg font-semibold"
                  >
                    Dashboard
                  </a>
                  <a
                    href="/history"
                    className="flex items-center gap-2 text-lg font-semibold"
                  >
                    History
                  </a>
                  <a
                    href="/settings"
                    className="flex items-center gap-2 text-lg font-semibold"
                  >
                    Settings
                  </a>
                </nav>
              </SheetContent>
            </Sheet>
            <a href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">IP</span>
              </div>
              <span className="font-bold text-xl hidden sm:inline-block">
                ImageProcessor
              </span>
            </a>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a
              href="/"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Home
            </a>
            <a
              href="/dashboard"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Dashboard
            </a>
            <a
              href="/history"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              History
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <HelpCircleIcon className="h-5 w-5" />
              <span className="sr-only">Help</span>
            </Button>
            <Button variant="ghost" size="icon">
              <BellIcon className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
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
                <DropdownMenuItem>
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Settings
                  </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <button
                    onClick={() => {
                      console.log("Logout button clicked");
                      handleLogout();
                    }}
                    className="w-full text-left"
                  >
                    Log outs
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container py-6 md:py-10">{children}</main>
      
      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-16">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Centaq. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="/terms"
              className="text-sm text-muted-foreground hover:underline"
            >
              Terms
            </a>
            <a
              href="/privacy"
              className="text-sm text-muted-foreground hover:underline"
            >
              Privacy
            </a>
            <a
              href="/contact"
              className="text-sm text-muted-foreground hover:underline"
            >
              Contact
            </a>
        
          </div>
        </div>
      </footer>
    </div>
  );
}
