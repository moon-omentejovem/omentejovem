// Função legacy mantida apenas para compatibilidade temporal
// Esta função será removida quando o refator estiver completo

import { TransferFromAPI } from '@/types/legacy'

export async function fetchTransfersForToken(
  chain: string,
  contractAddress: string,
  tokenId: string
): Promise<TransferFromAPI[]> {
  // TODO: Implementar busca de transfers no novo sistema Supabase
  // Por enquanto retorna array vazio para manter compatibilidade
  console.warn(
    'fetchTransfersForToken é uma função legacy - implementar no novo sistema'
  )
  return []
}
