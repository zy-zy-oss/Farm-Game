import { useTemporaryAssets } from './useTemporaryAssets';

export const useChickenAnimations = () => {
    const { getAnimalAssets } = useTemporaryAssets();
    return getAnimalAssets('chicken');
}; 