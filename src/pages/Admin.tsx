import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  LogOut,
  TrendingUp,
  Heart,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BokehBackground from "@/components/BokehBackground";
import AdminMarketsTab from "@/components/admin/AdminMarketsTab";
import AdminCharityTab from "@/components/admin/AdminCharityTab";
import type { User } from "@supabase/supabase-js";

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate("/admin-login");
        return;
      }

      setUser(session.user);

      // Check admin role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        toast({
          title: "权限不足",
          description: "您没有管理员权限",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        navigate("/admin-login");
        return;
      }

      setIsAdmin(true);
      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/admin-login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-cream">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <BokehBackground />
      <div className="min-h-screen gradient-cream relative z-10">
        {/* Header */}
        <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-earth flex items-center justify-center shadow-soft">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-serif text-lg font-semibold text-foreground">
                  Ceres 管理后台
                </h1>
                <p className="text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-muted-foreground"
              >
                返回前台
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                退出
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Tabs defaultValue="markets" className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-card/50">
                <TabsTrigger value="markets" className="gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">博弈市场</span>
                </TabsTrigger>
                <TabsTrigger value="charity" className="gap-2">
                  <Heart className="w-4 h-4" />
                  <span className="hidden sm:inline">公益资金</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="markets">
                <AdminMarketsTab />
              </TabsContent>

              <TabsContent value="charity">
                <AdminCharityTab />
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default Admin;
