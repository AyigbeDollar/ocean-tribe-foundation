import { useState } from "react";
import PaystackPop from "@paystack/inline-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Heart } from "lucide-react";

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined;

// Preset amounts in Ghana Cedis (GHS)
const PRESET_AMOUNTS = [50, 100, 250, 500];

interface DonateDialogProps {
  /** Rendered as the dialog trigger. Defaults to a "Donate" button. */
  trigger?: React.ReactNode;
}

const DonateDialog = ({ trigger }: DonateDialogProps) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<string>("100");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [processing, setProcessing] = useState(false);

  const resetForm = () => {
    setAmount("100");
    setName("");
    setEmail("");
    setProcessing(false);
  };

  const handleDonate = () => {
    const parsedAmount = Number(amount);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address for your receipt.");
      return;
    }
    if (!parsedAmount || parsedAmount < 1) {
      toast.error("Please enter a donation amount of at least GHS 1.");
      return;
    }
    if (!PAYSTACK_PUBLIC_KEY) {
      toast.error(
        "Donations are not configured yet. Please set VITE_PAYSTACK_PUBLIC_KEY."
      );
      return;
    }

    try {
      setProcessing(true);
      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: PAYSTACK_PUBLIC_KEY,
        email: email.trim(),
        // Paystack expects the amount in the currency's subunit (pesewas for GHS).
        amount: Math.round(parsedAmount * 100),
        currency: "GHS",
        metadata: {
          custom_fields: [
            {
              display_name: "Donor Name",
              variable_name: "donor_name",
              value: name.trim() || "Anonymous",
            },
            {
              display_name: "Purpose",
              variable_name: "purpose",
              value: "Ocean Tribe Foundation Donation",
            },
          ],
        },
        onSuccess: async (transaction: { reference: string }) => {
          // Confirm the payment server-side before thanking the donor. The
          // Edge Function re-checks the transaction with Paystack's secret key
          // and records it; the client alone is never trusted.
          const toastId = toast.loading("Confirming your donation…");
          try {
            const { data, error } = await supabase.functions.invoke(
              "verify-donation",
              { body: { reference: transaction.reference } }
            );
            if (error || !data?.verified) {
              toast.error(
                "We received your payment and are confirming it. If anything looks off, contact us with reference " +
                  transaction.reference,
                { id: toastId }
              );
            } else {
              toast.success(
                `Thank you for your donation! Reference: ${transaction.reference}.`,
                { id: toastId }
              );
            }
          } catch {
            toast.error(
              "Payment received. Confirmation is pending — reference " +
                transaction.reference,
              { id: toastId }
            );
          } finally {
            setProcessing(false);
            setOpen(false);
            resetForm();
          }
        },
        onCancel: () => {
          setProcessing(false);
          toast.info("Donation cancelled. You can try again anytime.");
        },
      });
    } catch (error) {
      setProcessing(false);
      console.error("Paystack error:", error);
      toast.error("Something went wrong starting your donation. Please try again.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="w-full">
            <Heart className="mr-2 h-4 w-4" />
            Donate
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Support Ocean Tribe
          </DialogTitle>
          <DialogDescription>
            Your donation directly funds ocean cleanup initiatives, community
            programs, and sustainable development projects in Ghana.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Amount (GHS)</Label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={Number(amount) === preset ? "default" : "outline"}
                  onClick={() => setAmount(String(preset))}
                >
                  {preset}
                </Button>
              ))}
            </div>
            <Input
              type="number"
              min={1}
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter a custom amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="donor-name">Name (optional)</Label>
            <Input
              id="donor-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="donor-email">Email</Label>
            <Input
              id="donor-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <Button
            className="w-full"
            onClick={handleDonate}
            disabled={processing}
          >
            {processing
              ? "Processing…"
              : `Donate GHS ${Number(amount) > 0 ? Number(amount).toLocaleString() : "0"}`}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Secured by Paystack. Cards, mobile money, and bank transfers supported.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DonateDialog;
