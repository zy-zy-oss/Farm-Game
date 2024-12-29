import { useTemporaryAssets } from './useTemporaryAssets';

export const useFruitTreeAnimations = (type) => {
    const { getFruitTreeAssets } = useTemporaryAssets();
    return getFruitTreeAssets(type);
}; 