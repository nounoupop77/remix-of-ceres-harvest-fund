import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BokehBackground from "@/components/BokehBackground";

const AdminSetup = () => {
  const [email, setEmail] = useState("admin@ceres.app");
  const [password, setPassword] = useState("123456");
  const [setupKey, setSetupKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("setup-admin", {
        body: { email, password, setupKey },
      });

      if (error) {
        toast({
          title: "设置失败",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (data?.error) {
        toast({
          title: "设置失败",
          description: data.message || data.error,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      setIsComplete(true);
      toast({
        title: "设置成功",
        description: "管理员账户已创建，请使用新账户登录",
      });
    } catch (err) {
      toast({
        title: "设置失败",
        description: "发生未知错误",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isComplete) {
    return (
      <>
        <BokehBackground />
        <div className="min-h-screen flex items-center justify-center gradient-cream relative z-10 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card/80 backdrop-blur-md rounded-2xl border border-border shadow-soft p-8 text-center max-w-md"
          >
            <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
            <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
              设置完成
            </h1>
            <p className="text-muted-foreground mb-6">
              管理员账户已成功创建
              <br />
              邮箱: <span className="font-mono text-foreground">{email}</span>
            </p>
            <Button
              variant="wallet"
              onClick={() => navigate("/admin-login")}
              className="w-full"
            >
              前往登录
            </Button>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <BokehBackground />
      <div className="min-h-screen flex items-center justify-center gradient-cream relative z-10 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-card/80 backdrop-blur-md rounded-2xl border border-border shadow-soft p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl gradient-earth flex items-center justify-center mb-4 shadow-soft">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-foreground">
                初始化管理员
              </h1>
              <p className="text-sm text-muted-foreground mt-1 text-center">
                首次使用需要创建管理员账户
              </p>
            </div>

            <form onSubmit={handleSetup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="setupKey">设置密钥</Label>
                <Input
                  id="setupKey"
                  type="password"
                  placeholder="请输入设置密钥"
                  value={setupKey}
                  onChange={(e) => setSetupKey(e.target.value)}
                  required
                  className="bg-background/50"
                />
                <p className="text-xs text-muted-foreground">
                  密钥: ceres-admin-setup-2026
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">管理员邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-background/50"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                variant="wallet"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    创建中...
                  </>
                ) : (
                  "创建管理员账户"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-muted-foreground"
              >
                返回首页
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AdminSetup;
