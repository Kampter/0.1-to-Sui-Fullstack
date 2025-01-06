import { Flex, Box, Text, Container } from "@radix-ui/themes";
import { ConnectButton } from "@mysten/dapp-kit";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Flex 
      direction="column" 
      style={{ 
        minHeight: "100vh",
        background: "var(--gray-2)" 
      }}
    >
      {/* Header */}
      <Box 
        p="4" 
        style={{ 
          borderBottom: "1px solid var(--gray-5)",
          background: "var(--gray-1)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 100
        }}
      >
        <Container size="2">
          <Flex justify="between" align="center">
            <Text size="5" weight="bold" style={{ 
              background: "linear-gradient(to right, var(--accent-11), var(--accent-9))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Asset Manager
            </Text>
            <ConnectButton />
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container size="2" p="4" style={{ flex: 1 }}>
        <Box style={{
          background: "var(--gray-1)",
          borderRadius: "24px",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.05)",
          overflow: "hidden"
        }}>
          {children}
        </Box>
      </Container>

      {/* Footer */}
      <Box p="4">
        <Container size="2">
          <Text align="center" size="2" color="gray">
            Developed by Kampter
          </Text>
        </Container>
      </Box>
    </Flex>
  );
} 