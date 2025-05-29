
import { useNavigate } from "react-router-dom";

export const useRecipeSave = () => {
  const navigate = useNavigate();

  const handleSave = async (recipe: any, shareWithCommunity?: boolean) => {
    console.log("Saving recipe...", recipe);
    navigate("/my-recipes");
  };

  const handleCancel = () => {
    navigate("/my-recipes");
  };

  return {
    handleSave,
    handleCancel,
  };
};
