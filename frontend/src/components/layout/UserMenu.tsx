import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";

const UserMenu = () => {
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link to="/login">
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </Link>
        <Link to="/signup">
          <Button size="sm">Sign Up</Button>
        </Link>
      </div>
    );
  }

  const fullName = (user.user_metadata as any)?.display_name || (user.user_metadata as any)?.full_name || user.email;

  const displayName = fullName.split(" ")[0];

  console.log("USER:", user);
  console.log("USER METADATA:", user?.user_metadata);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
          <User className="w-4 h-4 text-primary" />
        </div>
        <div className="text-sm">
          <span className="font-medium">{displayName}</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={signOut}
        title="Sign Out"
        aria-label="Sign Out"
        className="hover:bg-destructive/10"
      >
        <LogOut className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default UserMenu;
