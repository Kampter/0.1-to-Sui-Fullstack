import { Layout } from "./components/Layout";
import { AssetList } from "./components/AssetList";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Box, Text } from "@radix-ui/themes";

export default function App() {
  const account = useCurrentAccount();

  return (
    <Layout>
      <Box mb="4">
        <Text size="8" weight="bold">
          Your Assets
        </Text>
      </Box>
      <AssetList />
    </Layout>
  );
}
