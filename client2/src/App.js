import { Route, Routes, Navigate } from "react-router-dom";

import {
  About,
  Home,
  Login,
  Register,
  TrangChu,
  Rooms,
  OrderRoom,
  CaNhan,
} from "./containers/Public";

import { path } from "./utils/constant";
import DetailRoom from "./containers/Public/DetailRoom";

function App() {
  return (
    <div className=" w-full bg-primary ">
      <Routes>
        <Route path={path.HOME} element={<Home />}>
          <Route path="/" element={<Navigate replace to="/trangchu" />} />
          <Route path={path.TRANGCHU} element={<TrangChu />}></Route>
          <Route path={path.ROOMS} element={<Rooms />}></Route>
          <Route path={path.DETAILROOM} element={<DetailRoom />}></Route>

          <Route path={path.ORDERROOM} element={<OrderRoom />}></Route>
          <Route path={path.CANHAN} element={<CaNhan />}></Route>
          <Route path={path.ABOUT} element={<About />}></Route>

          <Route path={path.LOGIN} element={<Login />}></Route>
          <Route path={path.REGISTER} element={<Register />}></Route>
        </Route>
        {/* <Route path=""></Route> */}
      </Routes>
    </div>
  );
}

export default App;
