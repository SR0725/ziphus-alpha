import axiosInstance from '@/utils/axios';
import { CardGetWithAllResponseDTO } from '@repo/shared-types';
import { useQuery } from '@tanstack/react-query';

async function fetchCardList() {
  return await axiosInstance.get<CardGetWithAllResponseDTO>('/cards');
}

function useQueryCardList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['cards'],
    queryFn: fetchCardList,

  });
  const cards = data?.data.cards ?? [];

  return { cards, isLoading, error };
}

export default useQueryCardList;
