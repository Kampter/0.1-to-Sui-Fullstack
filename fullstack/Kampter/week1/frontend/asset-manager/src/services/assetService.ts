import { SuiClient } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";

export interface Asset {
  id: string;
  name: string;
  description: string;
}

export class AssetService {
  constructor(
    private suiClient: SuiClient,
    private packageId: string,
    private moduleId: string = "asset_manager"
  ) {}

  async getAssetsByOwner(ownerAddress: string): Promise<Asset[]> {
    try {
      const objects = await this.suiClient.getOwnedObjects({
        owner: ownerAddress,
        filter: {
          StructType: `${this.packageId}::${this.moduleId}::Asset`
        },
        options: {
          showContent: true
        }
      });

      return objects.data
        .map(obj => {
          const content = obj.data?.content;
          if (!content || content.dataType !== 'moveObject') return null;
          
          const fields = content.fields as {
            id: string;
            name: string;
            description: string;
          };
          
          return {
            id: obj.data?.objectId || '',
            name: fields.name || '',
            description: fields.description || ''
          };
        })
        .filter((asset): asset is Asset => asset !== null);
    } catch (error) {
      console.error('Error fetching assets:', error);
      return [];
    }
  }

  async createAsset(
    signer: string,
    name: string,
    description: string
  ): Promise<string> {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${this.packageId}::${this.moduleId}::create_asset`,
      arguments: [
        tx.pure(name),
        tx.pure(description)
      ]
    });

    return tx.serialize();
  }
} 