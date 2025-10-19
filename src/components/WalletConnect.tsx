import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Wallet, LogOut, ExternalLink } from "lucide-react";
import { hashPackService } from "@/services/hashPackService";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WalletConnectProps {
  onConnect?: (accountId: string) => void;
  onDisconnect?: () => void;
}

const WalletConnect = ({ onConnect, onDisconnect }: WalletConnectProps) => {
  const [connected, setConnected] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [pairingString, setPairingString] = useState<string>("");
  const [showPairingModal, setShowPairingModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    initializeHashConnect();
  }, []);

  const initializeHashConnect = async () => {
    try {
      const initData = await hashPackService.initialize();
      setPairingString(initData.pairingString);
    } catch (error) {
      console.error("Failed to initialize HashConnect:", error);
    }
  };

  const handleConnect = async () => {
    try {
      const wallet = await hashPackService.connectWallet();
      
      if (wallet) {
        setConnected(true);
        setAccountId(wallet.accountId);
        onConnect?.(wallet.accountId);
        
        toast({
          title: "Wallet Connected",
          description: `Connected to account ${wallet.accountId}`,
        });
      }
    } catch (error: any) {
      console.error("Wallet connection error:", error);
      
      // If extension not found, show pairing modal
      if (error.message.includes("extension not found")) {
        setShowPairingModal(true);
      } else {
        toast({
          title: "Connection Failed",
          description: error.message || "Failed to connect wallet",
          variant: "destructive",
        });
      }
    }
  };

  const handleDisconnect = async () => {
    await hashPackService.disconnect();
    setConnected(false);
    setAccountId(null);
    onDisconnect?.();
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const openHashPackInstall = () => {
    window.open("https://www.hashpack.app/download", "_blank");
  };

  return (
    <>
      {connected && accountId ? (
        <div className="flex items-center gap-2">
          <Button variant="glass" size="sm" className="font-mono text-xs">
            {accountId.slice(0, 8)}...{accountId.slice(-6)}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDisconnect}
            title="Disconnect Wallet"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button variant="hero" onClick={handleConnect}>
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      )}

      <Dialog open={showPairingModal} onOpenChange={setShowPairingModal}>
        <DialogContent className="glass border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-text">
              Install HashPack Wallet
            </DialogTitle>
            <DialogDescription>
              HashPack wallet extension is required to connect
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              To connect your Hedera wallet, you need to install the HashPack browser extension.
            </p>
            
            <div className="glass p-4 rounded-lg space-y-3">
              <h4 className="font-semibold text-sm">Steps:</h4>
              <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                <li>Install HashPack extension from the official website</li>
                <li>Create or import your Hedera account</li>
                <li>Return here and click "Connect Wallet"</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <Button
                variant="glass"
                onClick={() => setShowPairingModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="hero"
                onClick={openHashPackInstall}
                className="flex-1"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Install HashPack
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletConnect;
