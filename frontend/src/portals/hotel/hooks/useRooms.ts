import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hotelApi } from '../../../shared/api/hotel'
import { useToast } from '../../../shared/hooks/useToast'

export function useRooms() {
  const qc = useQueryClient()
  const toast = useToast()

  const query = useQuery({ queryKey: ['hotel-rooms'], queryFn: hotelApi.getRooms })

  const addMutation = useMutation({
    mutationFn: (data: any) => hotelApi.addRoom(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['hotel-rooms'] }); toast.success('Room added') },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? 'Failed to add room'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => hotelApi.updateRoom(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['hotel-rooms'] }); toast.success('Room updated') },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? 'Failed to update room'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => hotelApi.deleteRoom(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['hotel-rooms'] }); toast.success('Room deleted') },
    onError: () => toast.error('Failed to delete room'),
  })

  const toggleMutation = useMutation({
    mutationFn: (room: any) => hotelApi.updateRoom(room.id, { is_available: !room.is_available }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hotel-rooms'] }),
  })

  return {
    rooms:     query.data ?? [],
    isLoading: query.isLoading,
    add:       addMutation.mutate,
    update:    updateMutation.mutate,
    remove:    deleteMutation.mutate,
    toggle:    toggleMutation.mutate,
    saving:    addMutation.isPending || updateMutation.isPending,
    deleting:  deleteMutation.isPending,
  }
}