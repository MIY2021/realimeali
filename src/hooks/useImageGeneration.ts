
export const useImageGeneration = () => {
  const handleGenerateImage = async (
    title: string,
    setImagePreview: any,
    setRecipeImage: any,
    setIsGenerating: any,
    setProgress: any
  ) => {
    console.log("Generating image for:", title);
  };

  return {
    handleGenerateImage,
  };
};
