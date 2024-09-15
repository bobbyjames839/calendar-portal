import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './components/pages/Home.js'
import { Login } from './components/pages/Login.js'
import { Manage } from './components/pages/Manage.js';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='/main' element={<Home/>}/>
          <Route path='/manage' element={<Manage/>}/>
          <Route path='/' element={<Login/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
