import { useTemporaryAssets } from './useTemporaryAssets';

export const useRockAnimations = (size) => {
    const { getRockAssets } = useTemporaryAssets();
    return getRockAssets(size);
}; 