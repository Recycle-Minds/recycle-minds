export interface DasAsset {
  id: string
  interface: string
  content?: {
    schema: string
    json_uri?: string
    files?: Array<{
      uri?: string
      mime?: string
    }>
    metadata?: {
      name?: string
      symbol?: string
      description?: string
      image?: string
      attributes?: Array<{
        trait_type: string
        value: string
      }>
    }
  }
  authorities?: Array<{
    address: string
    scopes: string[]
  }>
  compression?: {
    eligible: boolean
    compressed: boolean
    data_hash?: string
    creator_hash?: string
    asset_hash?: string
    tree?: string
    seq?: number
    leaf_id?: number
  }
  grouping?: Array<{
    group_key: string
    group_value: string
  }>
  royalty?: {
    royalty_model: string
    target?: string
    percent: number
    basis_points: number
    primary_sale_happened: boolean
    locked: boolean
  }
  ownership: {
    frozen: boolean
    delegated: boolean
    delegate?: string
    ownership_model: string
    owner: string
  }
  supply?: {
    print_max_supply?: number
    print_current_supply?: number
    edition_nonce?: number
  }
  mutable: boolean
  burnt: boolean
}

export interface GetAssetsByOwnerResponse {
  total: number
  limit: number
  page: number
  items: DasAsset[]
}

export interface GetAssetResponse {
  interface: string
  id: string
  content?: {
    schema: string
    json_uri?: string
    files?: Array<{
      uri?: string
      mime?: string
    }>
    metadata?: {
      name?: string
      symbol?: string
      description?: string
      image?: string
      attributes?: Array<{
        trait_type: string
        value: string
      }>
    }
  }
  authorities?: Array<{
    address: string
    scopes: string[]
  }>
  compression?: {
    eligible: boolean
    compressed: boolean
    data_hash?: string
    creator_hash?: string
    asset_hash?: string
    tree?: string
    seq?: number
    leaf_id?: number
  }
  grouping?: Array<{
    group_key: string
    group_value: string
  }>
  royalty?: {
    royalty_model: string
    target?: string
    percent: number
    basis_points: number
    primary_sale_happened: boolean
    locked: boolean
  }
  ownership: {
    frozen: boolean
    delegated: boolean
    delegate?: string
    ownership_model: string
    owner: string
  }
  supply?: {
    print_max_supply?: number
    print_current_supply?: number
    edition_nonce?: number
  }
  mutable: boolean
  burnt: boolean
}

export async function getAssetsByOwner(
  rpcUrl: string,
  owner: string,
  page: number = 1,
  limit: number = 50,
  forceRefresh: boolean = false
): Promise<DasAsset[]> {
  try {
    // Use secure server-side API route
    const response = await fetch(`/api/nfts?owner=${encodeURIComponent(owner)}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.error) {
      throw new Error(`API error: ${data.error}`)
    }

    return data.nfts || []
  } catch (error) {
    console.error('Error fetching assets by owner:', error)
    throw error
  }
}

export async function getAsset(rpcUrl: string, assetId: string): Promise<DasAsset | null> {
  try {
    // Use secure server-side API route
    const response = await fetch(`/api/asset?id=${encodeURIComponent(assetId)}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.error) {
      throw new Error(`API error: ${data.error}`)
    }

    return data.asset || null
  } catch (error) {
    console.error('Error fetching asset:', error)
    throw error
  }
}

export async function getAssetsByIds(rpcUrl: string, assetIds: string[]): Promise<DasAsset[]> {
  try {
    // For now, fetch each asset individually using the secure API route
    // This could be optimized with a batch endpoint later
    const promises = assetIds.map(id => getAsset(rpcUrl, id))
    const results = await Promise.all(promises)
    return results.filter(asset => asset !== null) as DasAsset[]
  } catch (error) {
    console.error('Error fetching assets by ids:', error)
    throw error
  }
}

export async function getAssetsByGroup(
  rpcUrl: string,
  groupKey: string,
  groupValue: string,
  page: number = 1,
  limit: number = 50
): Promise<DasAsset[]> {
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'my-id',
        method: 'getAssetsByGroup',
        params: {
          groupKey,
          groupValue,
          page,
          limit,
          sortBy: {
            sortBy: 'created',
            sortDirection: 'desc'
          }
        }
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.error) {
      throw new Error(`RPC error: ${data.error.message}`)
    }

    return data.result?.items || []
  } catch (error) {
    console.error('Error fetching assets by group:', error)
    throw error
  }
}
