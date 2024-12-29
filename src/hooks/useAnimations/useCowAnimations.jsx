import { useTemporaryAssets } from './useTemporaryAssets';

export const useCowAnimations = () => {
    const { getAnimalAssets } = useTemporaryAssets();
    return getAnimalAssets('cow');
}; 