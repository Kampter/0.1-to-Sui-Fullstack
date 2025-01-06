import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { Box, Text, Table, Button, Flex } from "@radix-ui/themes";
import { PulseLoader } from "react-spinners";
import { useEffect, useState } from "react";
import { Asset, AssetService } from "../services/assetService";
import { CreateAssetForm } from "./CreateAssetForm";
import { CONFIG } from "../config";

export function AssetList() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAssets() {
      if (!account || !suiClient) return;
      
      try {
        setLoading(true);
        setError(null);
        const assetService = new AssetService(suiClient, CONFIG.PACKAGE_ID);
        const userAssets = await assetService.getAssetsByOwner(account.address);
        setAssets(userAssets);
      } catch (error) {
        console.error('Error loading assets:', error);
        setError('Failed to load assets. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadAssets();
  }, [account, suiClient]);

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    loadAssets();
  };

  if (!account) {
    return (
      <Box p="4">
        <Text>Please connect your wallet to view assets</Text>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box style={{ textAlign: "center" }} p="4">
        <PulseLoader color="var(--accent-9)" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p="4" style={{ textAlign: "center" }}>
        <Text color="red" size="2">{error}</Text>
        <Button 
          onClick={() => loadAssets()} 
          size="2" 
          mt="2"
          style={{ borderRadius: "12px" }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Flex justify="between" align="center" p="4" style={{
        borderBottom: "1px solid var(--gray-4)"
      }}>
        <Text size="5" weight="bold">Your Assets</Text>
        <Button 
          size="3" 
          onClick={() => setShowCreateForm(true)}
          style={{
            borderRadius: "12px"
          }}
        >
          Create New Asset
        </Button>
      </Flex>

      <Box p="4">
        <CreateAssetForm
          open={showCreateForm}
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateForm(false)}
        />

        {assets.length === 0 ? (
          <Flex 
            direction="column" 
            align="center" 
            gap="4" 
            py="8"
            style={{
              background: "var(--gray-2)",
              borderRadius: "16px",
              padding: "48px 24px"
            }}
          >
            <Text align="center" size="5" weight="bold" color="gray">
              No assets found
            </Text>
            <Text align="center" color="gray">
              Create your first asset to get started!
            </Text>
            <Button 
              size="3" 
              onClick={() => setShowCreateForm(true)}
              style={{
                borderRadius: "12px",
                marginTop: "8px"
              }}
            >
              Create Asset
            </Button>
          </Flex>
        ) : (
          <Table.Root style={{ width: "100%" }}>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {assets.map((asset) => (
                <Table.Row key={asset.id}>
                  <Table.Cell>{asset.id}</Table.Cell>
                  <Table.Cell>{asset.name}</Table.Cell>
                  <Table.Cell>{asset.description}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Box>
    </Box>
  );
} 