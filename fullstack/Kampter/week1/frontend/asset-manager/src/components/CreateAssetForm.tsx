import { useState } from "react";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { Box, Button, TextField, Flex, Text } from "@radix-ui/themes";
import { CONFIG } from "../config";
import { TransactionBlock } from "@mysten/sui.js/transactions";

type CreateAssetFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function CreateAssetForm(props: CreateAssetFormProps) {
  const { onSuccess, onCancel } = props;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const tx = new TransactionBlock();
      tx.moveCall({
        target: `${CONFIG.PACKAGE_ID}::${CONFIG.MODULE_NAME}::create_asset`,
        arguments: [
          tx.pure(name),
          tx.pure(description)
        ]
      });

      const result = await suiClient.executeTransactionBlock({
        transactionBlock: tx,
        requestType: 'WaitForEffectsCert',
        options: {
          showEffects: true,
          showEvents: true
        }
      });

      if (result.effects?.status?.status === "success") {
        console.log("Asset created successfully:", result);
        onSuccess?.();
        setName("");
        setDescription("");
      } else {
        console.error("Transaction failed:", result.effects?.status);
        setError("Transaction failed. Please try again.");
      }
    } catch (err) {
      console.error("Error creating asset:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create asset. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box style={{
      background: "var(--gray-2)",
      borderRadius: "16px",
      padding: "24px"
    }}>
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap="4">
          <Text size="5" weight="bold">
            Create New Asset
          </Text>

          <TextField.Root>
            <TextField.Input
              placeholder="Asset Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </TextField.Root>

          <TextField.Root>
            <TextField.Input
              placeholder="Asset Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </TextField.Root>

          {error && (
            <Text color="red" size="2">
              {error}
            </Text>
          )}

          <Flex gap="3" mt="2">
            <Button 
              type="submit" 
              disabled={loading}
              style={{ borderRadius: "12px", flex: 1 }}
            >
              {loading ? "Creating..." : "Create Asset"}
            </Button>
            <Button 
              type="button" 
              variant="soft" 
              onClick={onCancel}
              style={{ borderRadius: "12px" }}
            >
              Cancel
            </Button>
          </Flex>
        </Flex>
      </form>
    </Box>
  );
} 