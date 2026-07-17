import AppRoutes from "./routes/AppRoutes";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getCurrentUserThunk } from "./redux/auth/authThunk";
import { getToken } from "./utils/storage";
import { finishAuthCheck } from "./redux/auth/authSlice";
// yahan pe hum useEffect ka use kar rahe hain taki app ke load hone par current user ko fetch kiya ja sake aur redux store me set kiya ja sake. Ye ensure karega ki agar user already logged in hai to uska data available ho.
// ye auto login ka feature provide karega jab user app ko reload kare ya dubara open kare.
function App() {
  const dispatch = useDispatch();

  useEffect(() => {
     if (getToken()) {
    dispatch(getCurrentUserThunk());
  } else {
    dispatch(finishAuthCheck());
  }
  }, [dispatch]);
  return <AppRoutes />;
}

export default App;
