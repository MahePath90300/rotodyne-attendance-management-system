import { Routes, Route } from 'react-router-dom'
import './App.css'
import Unauthorized from './pages/Unauthorized';
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Loginpage from './pages/Loginpage';

function App() {

  return (
    <Routes>
      <Route path='/' element={<Loginpage />}/>
      <Route path='/unauthorized' element={<Unauthorized/>}/>
      <Route path='/dashboard' element={ <ProtectedRoute><Dashboard /> </ProtectedRoute>}/>
    </Routes>
  )
}

export default App
