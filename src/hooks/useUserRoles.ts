/**
 * React Query hooks for User Roles CRUD operations
 */

import { TABLES } from '@/lib/supabase/config'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'
import { createClient } from '@/utils/supabase/client'
import { useMutation, useQuery, useQueryClient } from 'react-query'

type UserRole = Tables<'user_roles'>
type UserRoleInsert = TablesInsert<'user_roles'>
type UserRoleUpdate = TablesUpdate<'user_roles'>

// Query Keys
export const userRoleKeys = {
  all: ['user-roles'] as const,
  lists: () => [...userRoleKeys.all, 'list'] as const,
  list: (filters: any) => [...userRoleKeys.lists(), filters] as const,
  details: () => [...userRoleKeys.all, 'detail'] as const,
  detail: (userId: string) => [...userRoleKeys.details(), userId] as const
}

/**
 * Hook para buscar role do usuário atual
 */
export function useCurrentUserRole(userId?: string, enabled = true) {
  const supabase = createClient()

  return useQuery({
    queryKey: userRoleKeys.detail(userId || 'current'),
    queryFn: async () => {
      if (!userId) {
        const {
          data: { user }
        } = await supabase.auth.getUser()
        if (!user) return null
        userId = user.id
      }

      const { data, error } = await supabase
        .from(TABLES.USER_ROLES)
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = não encontrado
        throw error
      }

      return data
    },
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    retry: false // Não tentar novamente se não encontrar
  })
}

/**
 * Hook para verificar se o usuário atual é admin
 */
export function useIsAdmin(userId?: string) {
  const { data: userRole, isLoading, error } = useCurrentUserRole(userId)

  return {
    isAdmin: userRole?.role === 'admin',
    isLoading,
    error
  }
}

/**
 * Hook para buscar todos os user roles (Admin only)
 */
export function useUserRoles(enabled = true) {
  const supabase = createClient()

  return useQuery({
    queryKey: userRoleKeys.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLES.USER_ROLES)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  })
}

/**
 * Hook para buscar user role por user ID (Admin only)
 */
export function useUserRoleById(userId: string, enabled = true) {
  const supabase = createClient()

  return useQuery({
    queryKey: userRoleKeys.detail(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLES.USER_ROLES)
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return data
    },
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: false
  })
}

/**
 * Hook para criar user role (Admin only)
 */
export function useCreateUserRole() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (userRole: UserRoleInsert) => {
      const { data, error } = await supabase
        .from(TABLES.USER_ROLES)
        .insert(userRole)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidar todas as queries de user roles
      queryClient.invalidateQueries(userRoleKeys.all)
    }
  })
}

/**
 * Hook para atualizar user role (Admin only)
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      userId,
      ...updates
    }: { userId: string } & UserRoleUpdate) => {
      const { data, error } = await supabase
        .from(TABLES.USER_ROLES)
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      // Invalidar todas as queries de user roles
      queryClient.invalidateQueries(userRoleKeys.all)
      // Atualizar cache específico do user role
      if (data.user_id) {
        queryClient.setQueryData(userRoleKeys.detail(data.user_id), data)
      }
    }
  })
}

/**
 * Hook para deletar user role (Admin only)
 */
export function useDeleteUserRole() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from(TABLES.USER_ROLES)
        .delete()
        .eq('user_id', userId)

      if (error) throw error
      return userId
    },
    onSuccess: () => {
      // Invalidar todas as queries de user roles
      queryClient.invalidateQueries(userRoleKeys.all)
    }
  })
}

/**
 * Hook para promover usuário a admin (Super Admin only)
 */
export function usePromoteToAdmin() {
  const { mutate: updateUserRole, ...rest } = useUpdateUserRole()

  const promoteToAdmin = (userId: string) => {
    updateUserRole({
      userId,
      role: 'admin'
    })
  }

  return {
    promoteToAdmin,
    ...rest
  }
}

/**
 * Hook para rebaixar admin para usuário comum (Super Admin only)
 */
export function useDemoteFromAdmin() {
  const { mutate: updateUserRole, ...rest } = useUpdateUserRole()

  const demoteFromAdmin = (userId: string) => {
    updateUserRole({
      userId,
      role: 'user'
    })
  }

  return {
    demoteFromAdmin,
    ...rest
  }
}
