import { useTemporaryAssets } from './useTemporaryAssets';

export const useTreeAnimations = (type) => {
    const { getTreeAssets } = useTemporaryAssets();
    return getTreeAssets(type);
}; 