module asset_manager::asset_manager {
    use sui::table::{Self, Table};
    use std::string::String;
    use sui::event;

    /// 错误代码
    const EAssetExists: u64 = 1;      // 资产已存在
    const EAssetNotFound: u64 = 3;    // 资产不存在
    const EInvalidInput: u64 = 4;     // 无效输入

    /// 用户资产管理器
    public struct AssetsManager has key {
        id: UID,
        // 资产ID到资产的映射
        assets: Table<ID, Asset>
    }

    public struct Asset has key, store {
        id: UID,
        name: String,
        description: String
    }
    
    /// 事件结构体
    public struct AssetCreated has copy, drop {
        asset_id: ID,
        name: String,
        description: String,
        creator: address
    }

    public struct AssetDeleted has copy, drop {
        asset_id: ID,
        owner: address
    }

    public struct AssetUpdated has copy, drop {
        asset_id: ID,
        name: String,
        description: String,
        owner: address
    }

    #[allow(lint(self_transfer))]
    public fun create_asset(
        assets_manager: &mut AssetsManager,
        name: String,
        description: String,
        ctx: &mut TxContext
    ) {
        // 验证输入
        assert!(std::string::length(&name) > 0, EInvalidInput);
        assert!(std::string::length(&description) > 0, EInvalidInput);

        let asset = Asset {
            id: object::new(ctx),
            name,
            description
        };
        let asset_id = object::uid_to_inner(&asset.id);
        
        // 检查资产是否已存在
        assert!(!table::contains(&assets_manager.assets, asset_id), EAssetExists);
        
        // 存储资产
        table::add(&mut assets_manager.assets, asset_id, asset);
        
        event::emit(AssetCreated {
            asset_id,
            name,
            description,
            creator: tx_context::sender(ctx)
        });
    }

    public fun delete_asset(
        assets_manager: &mut AssetsManager, 
        asset_id: ID, 
        ctx: &TxContext
    ) {
        assert!(table::contains(&assets_manager.assets, asset_id), EAssetNotFound);
        let asset = table::remove(&mut assets_manager.assets, asset_id);
        let Asset { id, name: _, description: _ } = asset;
        object::delete(id);
        
        event::emit(AssetDeleted {
            asset_id,
            owner: tx_context::sender(ctx)
        });
    }

    public fun update_asset(
        assets_manager: &mut AssetsManager,
        asset_id: ID,
        name: String,
        description: String,
        ctx: &TxContext
    ) {
        // 验证输入
        assert!(std::string::length(&name) > 0, EInvalidInput);
        assert!(std::string::length(&description) > 0, EInvalidInput);
        
        // 验证资产存在
        assert!(table::contains(&assets_manager.assets, asset_id), EAssetNotFound);
        
        // 更新资产信息
        let asset = table::borrow_mut(&mut assets_manager.assets, asset_id);
        asset.name = name;
        asset.description = description;
        
        event::emit(AssetUpdated {
            asset_id,
            name,
            description,
            owner: tx_context::sender(ctx)
        });
    }

    /// 获取用户所有资产表
    public fun get_user_assets(assets_manager: &AssetsManager): &Table<ID, Asset> {
        &assets_manager.assets
    }

    /// 获取单个资产的完整信息
    public fun get_asset(assets_manager: &AssetsManager, asset_id: ID): &Asset {
        assert!(table::contains(&assets_manager.assets, asset_id), EAssetNotFound);
        table::borrow(&assets_manager.assets, asset_id)
    }

    /// Getter 函数
    public fun get_asset_name(asset: &Asset): String {
        asset.name
    }

    public fun get_asset_description(asset: &Asset): String {
        asset.description
    }

    #[test_only]
    public fun test_init(ctx: &mut TxContext) {
        init(ctx)
    }

    fun init(ctx: &mut TxContext) {
        transfer::share_object(
            AssetsManager {
                id: object::new(ctx),
                assets: table::new(ctx)
            }
        )
    }
}
