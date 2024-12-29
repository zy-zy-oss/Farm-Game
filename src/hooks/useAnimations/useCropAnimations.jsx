import { useTemporaryAssets } from './useTemporaryAssets';

export const useCropAnimations = (type) => {
    const { getCropAssets } = useTemporaryAssets();
    return getCropAssets(type);
}; 